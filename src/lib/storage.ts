import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { safeLocalStorageSet, safeLocalStorageGet, migrateLocalStorageFonts } from './idbStorage';
import { Story, Chapter, Comment, BookmarkItem, ReadingProgress, LoungeMessage, EditorRequest, UserProfile, Notification } from '../types';

export const INITIAL_STORIES: Story[] = [];
export const INITIAL_CHAPTERS: Chapter[] = [];
export const INITIAL_COMMENTS: Comment[] = [];
const INITIAL_LOUNGE_MESSAGES: LoungeMessage[] = [];


export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/**
 * Hàm loại bỏ triệt để các trường undefined trước khi ghi dữ liệu lên Firestore.
 * Firestore sẽ báo lỗi 'Unsupported field value: undefined' nếu object chứa key có value undefined.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        res[key] = cleanForFirestore(value);
      }
    }
    return res as T;
  }
  return data;
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const STORAGE_KEYS = {
  STORIES: 'wp_stories_v4',
  CHAPTERS: 'wp_chapters_v4',
  COMMENTS: 'wp_comments_v4',
  BOOKMARKS: 'wp_bookmarks_v4',
  READING_HISTORY: 'wp_history_v4',
  LOUNGE: 'wp_lounge_v4',
  DELETED_STORIES: 'wp_deleted_stories_v4',
};

export function getDeletedStoryIds(): Set<string> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DELETED_STORIES);
    return new Set(data ? JSON.parse(data) : []);
  } catch {
    return new Set();
  }
}

export function markStoryAsDeleted(storyId: string) {
  const ids = getDeletedStoryIds();
  ids.add(storyId);
  safeLocalStorageSet(STORAGE_KEYS.DELETED_STORIES, JSON.stringify(Array.from(ids)));
}

// Initialize Local Backup
export function initStorage(): void {
  // Dọn dẹp fonts nặng khỏi localStorage để giải phóng 5MB
  migrateLocalStorageFonts().catch(() => {});

  const deletedIds = getDeletedStoryIds();

  if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
    const initialFiltered = INITIAL_STORIES.filter(s => !deletedIds.has(s.id));
    safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(initialFiltered));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
    const initialChaptersFiltered = INITIAL_CHAPTERS.filter(c => !deletedIds.has(c.storyId));
    safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(initialChaptersFiltered));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
    safeLocalStorageSet(STORAGE_KEYS.BOOKMARKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.READING_HISTORY)) {
    safeLocalStorageSet(STORAGE_KEYS.READING_HISTORY, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOUNGE)) {
    safeLocalStorageSet(STORAGE_KEYS.LOUNGE, JSON.stringify([]));
  } else {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOUNGE) || '[]');
      const filtered = existing.filter((m: LoungeMessage) => m.id !== 'lounge-1' && m.id !== 'lounge-2' && !m.id.startsWith('lounge-'));
      if (filtered.length !== existing.length) {
        safeLocalStorageSet(STORAGE_KEYS.LOUNGE, JSON.stringify(filtered));
      }
    } catch {}
  }
}


// ------------------- REALTIME SUBSCRIPTIONS -------------------

export function subscribeStories(callback: (stories: Story[]) => void, onError?: (error: any) => void) {
  initStorage();
  try {
    const colRef = collection(db, 'stories');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const deletedIds = getDeletedStoryIds();
        if (!snapshot.empty) {
          const list: Story[] = [];
          snapshot.forEach((doc) => {
            const story = doc.data() as Story;
            if (!deletedIds.has(story.id)) {
              list.push(story);
            }
          });
          safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(list));
          callback(list);
        } else {
          callback(getStoriesLocal());
        }
      },
      (error) => {
        console.warn('Fallback to local stories due to firestore error:', error);
        callback(getStoriesLocal());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    callback(getStoriesLocal());
    if (onError) onError(err);
    return () => {};
  }
}

export function subscribeChapters(callback: (chapters: Chapter[]) => void, onError?: (error: any) => void) {
  initStorage();
  try {
    const colRef = collection(db, 'chapters');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Chapter[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Chapter);
          });
          safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(list));
          callback(list);
        } else {
          INITIAL_CHAPTERS.forEach((chap) => {
            setDoc(doc(db, 'chapters', chap.id), chap).catch(() => {});
          });
          callback(getChaptersLocal());
        }
      },
      (error) => {
        console.warn('Fallback to local chapters:', error);
        callback(getChaptersLocal());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    callback(getChaptersLocal());
    if (onError) onError(err);
    return () => {};
  }
}

export function subscribeComments(callback: (comments: Comment[]) => void, onError?: (error: any) => void) {
  initStorage();
  try {
    const colRef = collection(db, 'comments');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Comment[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Comment);
        });
        if (list.length > 0) {
          safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(list));
          callback(list);
        } else {
          INITIAL_COMMENTS.forEach((c) => {
            setDoc(doc(db, 'comments', c.id), c).catch(() => {});
          });
          callback(getCommentsLocal());
        }
      },
      (error) => {
        console.warn('Fallback to local comments:', error);
        callback(getCommentsLocal());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    callback(getCommentsLocal());
    if (onError) onError(err);
    return () => {};
  }
}

// ------------------- LOCAL GETTERS -------------------

export function getStoriesLocal(): Story[] {
  initStorage();
  try {
    const deletedIds = getDeletedStoryIds();
    const data = localStorage.getItem(STORAGE_KEYS.STORIES);
    const stories: Story[] = data ? JSON.parse(data) : INITIAL_STORIES;
    return stories.filter((s) => !deletedIds.has(s.id));
  } catch {
    const deletedIds = getDeletedStoryIds();
    return INITIAL_STORIES.filter((s) => !deletedIds.has(s.id));
  }
}

export function getStories(): Story[] {
  return getStoriesLocal();
}

export function getChaptersLocal(storyId?: string): Chapter[] {
  initStorage();
  try {
    const deletedIds = getDeletedStoryIds();
    const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    const all: Chapter[] = data ? JSON.parse(data) : INITIAL_CHAPTERS;
    const filtered = all.filter((c) => !deletedIds.has(c.storyId));
    if (storyId) {
      return filtered
        .filter((c) => c.storyId === storyId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
    }
    return filtered;
  } catch {
    const deletedIds = getDeletedStoryIds();
    return INITIAL_CHAPTERS.filter((c) => !deletedIds.has(c.storyId));
  }
}

export function getChapters(storyId?: string): Chapter[] {
  return getChaptersLocal(storyId);
}

export function getCommentsLocal(storyId?: string, chapterId?: string): Comment[] {
  initStorage();
  try {
    const deletedIds = getDeletedStoryIds();
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const all: Comment[] = data ? JSON.parse(data) : INITIAL_COMMENTS;
    return all.filter((c) => {
      if (deletedIds.has(c.storyId)) return false;
      if (storyId && c.storyId !== storyId) return false;
      if (chapterId && c.chapterId !== chapterId) return false;
      return true;
    });
  } catch {
    return INITIAL_COMMENTS;
  }
}

export function getComments(storyId?: string, chapterId?: string): Comment[] {
  return getCommentsLocal(storyId, chapterId);
}

// ------------------- ACTIONS (WRITE / UPDATE / DELETE) -------------------

export async function saveStory(story: Story): Promise<Story[]> {
  const stories = getStoriesLocal();
  const index = stories.findIndex((s) => s.id === story.id);
  let updated: Story[];
  const today = new Date().toISOString().split('T')[0];

  // Quét và nén tất cả ảnh base64 trong truyện + dọn dẹp thuộc tính dư thừa
  const finalStory = await sanitizeAndCompressStory(story);
  finalStory.updatedAt = today;
  if (index < 0) {
    finalStory.createdAt = finalStory.createdAt || today;
  }

  if (index >= 0) {
    updated = [...stories];
    updated[index] = finalStory;
  } else {
    updated = [finalStory, ...stories];
  }

  safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'stories', finalStory.id), cleanForFirestore(finalStory));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `stories/${finalStory.id}`);
  }

  return updated;
}

export async function deleteStory(storyId: string): Promise<Story[]> {
  // Đánh dấu ID đã xóa để không bao giờ bị nạp lại từ sample stories hoặc sync ngược
  markStoryAsDeleted(storyId);

  // 1. Cập nhật danh sách truyện local
  const stories = getStoriesLocal().filter((s) => s.id !== storyId);
  safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(stories));

  // 2. Xóa các chương thuộc truyện khỏi local
  const remainingChapters = getChaptersLocal().filter((c) => c.storyId !== storyId);
  safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(remainingChapters));

  // 3. Xóa các bình luận thuộc truyện khỏi local
  const remainingComments = getCommentsLocal().filter((c) => c.storyId !== storyId);
  safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(remainingComments));

  // 4. Xóa bookmark và lịch sử đọc
  const remainingBookmarks = getBookmarks().filter((b) => b.storyId !== storyId);
  safeLocalStorageSet(STORAGE_KEYS.BOOKMARKS, JSON.stringify(remainingBookmarks));
  const remainingHistory = getReadingHistory().filter((h) => h.storyId !== storyId);
  safeLocalStorageSet(STORAGE_KEYS.READING_HISTORY, JSON.stringify(remainingHistory));

  // 5. Xóa khỏi Firestore
  try {
    // Xóa document truyện
    await deleteDoc(doc(db, 'stories', storyId));

    // Xóa các chapters của truyện trên Firestore
    const chapsQuery = query(collection(db, 'chapters'), where('storyId', '==', storyId));
    const chapsSnap = await getDocs(chapsQuery);
    await Promise.all(chapsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)));

    // Xóa các comments của truyện trên Firestore
    const commsQuery = query(collection(db, 'comments'), where('storyId', '==', storyId));
    const commsSnap = await getDocs(commsQuery);
    await Promise.all(commsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)));

    // Ghi nhận vào collection deleted_stories trên Firestore
    await setDoc(doc(db, 'deleted_stories', storyId), {
      storyId,
      deletedAt: new Date().toISOString(),
    }).catch(() => {});
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `stories/${storyId}`);
  }

  return stories;
}

export async function incrementStoryViews(storyId: string): Promise<void> {
  const stories = getStoriesLocal();
  const updated = stories.map((s) => {
    if (s.id === storyId) {
      const newViews = (s.viewsCount || 0) + 1;
      const newStory = { ...s, viewsCount: newViews };
      setDoc(doc(db, 'stories', storyId), { viewsCount: newViews }, { merge: true }).catch(() => {});
      return newStory;
    }
    return s;
  });
  safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(updated));
}

export async function saveChapter(chapter: Chapter): Promise<Chapter[]> {
  const allChapters = getChaptersLocal();
  const index = allChapters.findIndex((c) => c.id === chapter.id);
  let updated: Chapter[];
  const today = new Date().toISOString().split('T')[0];

  const finalChapter: Chapter = index >= 0
    ? { ...chapter, updatedAt: today }
    : { ...chapter, createdAt: chapter.createdAt || today, updatedAt: today };

  if (index >= 0) {
    updated = [...allChapters];
    updated[index] = finalChapter;
  } else {
    updated = [...allChapters, finalChapter];
  }

  safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'chapters', finalChapter.id), cleanForFirestore(finalChapter));
    if (index < 0) {
      notifyNewChapter(finalChapter.storyId, finalChapter.title, finalChapter.id, finalChapter.chapterNumber).catch(() => {});
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chapters/${finalChapter.id}`);
  }

  return updated;
}

export async function saveMultipleChapters(newChapters: Chapter[]): Promise<Chapter[]> {
  const allChapters = getChaptersLocal();
  const today = new Date().toISOString().split('T')[0];

  const preparedChapters = newChapters.map((c) => ({
    ...c,
    createdAt: c.createdAt || today,
    updatedAt: today,
  }));

  const existingMap = new Map<string, Chapter>();
  allChapters.forEach((c) => existingMap.set(c.id, c));

  const brandNewChapters: Chapter[] = [];
  preparedChapters.forEach((c) => {
    if (!existingMap.has(c.id)) {
      brandNewChapters.push(c);
    }
    existingMap.set(c.id, c);
  });

  const updated = Array.from(existingMap.values());
  safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(updated));

  try {
    // Lưu theo chunk 20 chương lên Firestore để đảm bảo an toàn kết nối
    const chunkSize = 20;
    for (let i = 0; i < preparedChapters.length; i += chunkSize) {
      const chunk = preparedChapters.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((c) => setDoc(doc(db, 'chapters', c.id), cleanForFirestore(c)))
      );
    }

    brandNewChapters.forEach((c) => {
      notifyNewChapter(c.storyId, c.title, c.id, c.chapterNumber).catch(() => {});
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chapters/batch`);
  }

  return updated;
}

export async function deleteChapter(chapterId: string, storyId?: string): Promise<Chapter[]> {
  const allChapters = getChaptersLocal();
  const targetChapter = allChapters.find((c) => c.id === chapterId);
  const effectiveStoryId = storyId || targetChapter?.storyId || '';

  const updated = allChapters.filter((c) => c.id !== chapterId);
  safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(updated));

  // Xóa bình luận của chương này
  const remainingComments = getCommentsLocal().filter((c) => c.chapterId !== chapterId);
  safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(remainingComments));

  // Cập nhật lại chapterCount của truyện
  if (effectiveStoryId) {
    const stories = getStoriesLocal();
    const targetStory = stories.find((s) => s.id === effectiveStoryId);
    if (targetStory) {
      const remainingCount = updated.filter((c) => c.storyId === effectiveStoryId).length;
      targetStory.chapterCount = remainingCount;
      safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      setDoc(doc(db, 'stories', effectiveStoryId), { chapterCount: remainingCount }, { merge: true }).catch(() => {});
    }
  }

  try {
    await deleteDoc(doc(db, 'chapters', chapterId));

    const commsQuery = query(collection(db, 'comments'), where('chapterId', '==', chapterId));
    const commsSnap = await getDocs(commsQuery);
    await Promise.all(commsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `chapters/${chapterId}`);
  }

  return updated;
}

export async function incrementChapterViews(chapterId: string, storyId: string): Promise<void> {
  const chapters = getChaptersLocal();
  const updatedChapters = chapters.map((c) => {
    if (c.id === chapterId) {
      const newChap = { ...c, views: (c.views || 0) + 1 };
      setDoc(doc(db, 'chapters', chapterId), newChap).catch(() => {});
      return newChap;
    }
    return c;
  });
  safeLocalStorageSet(STORAGE_KEYS.CHAPTERS, JSON.stringify(updatedChapters));
  incrementStoryViews(storyId);
}

// Bookmarks
export function getBookmarks(): BookmarkItem[] {
  initStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(storyId: string): Promise<boolean> {
  const list = getBookmarks();
  const index = list.findIndex((b) => b.storyId === storyId);
  let isBookmarked = false;
  let newList: BookmarkItem[];

  if (index >= 0) {
    newList = list.filter((b) => b.storyId !== storyId);
    isBookmarked = false;
    if (auth.currentUser) {
      deleteDoc(doc(db, 'bookmarks', `${auth.currentUser.uid}_${storyId}`)).catch(() => {});
    }
  } else {
    newList = [{ storyId, createdAt: new Date().toISOString() }, ...list];
    isBookmarked = true;
    if (auth.currentUser) {
      setDoc(doc(db, 'bookmarks', `${auth.currentUser.uid}_${storyId}`), {
        id: `${auth.currentUser.uid}_${storyId}`,
        storyId,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  safeLocalStorageSet(STORAGE_KEYS.BOOKMARKS, JSON.stringify(newList));
  return isBookmarked;
}

// Reading History
export function getReadingHistory(): ReadingProgress[] {
  initStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.READING_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveReadingProgress(storyId: string, chapterId: string, chapterNumber: number): Promise<void> {
  const history = getReadingHistory();
  const filtered = history.filter((h) => h.storyId !== storyId);
  const updated: ReadingProgress[] = [
    {
      storyId,
      chapterId,
      chapterNumber,
      updatedAt: new Date().toISOString(),
    },
    ...filtered,
  ];
  safeLocalStorageSet(STORAGE_KEYS.READING_HISTORY, JSON.stringify(updated));

  if (auth.currentUser) {
    setDoc(doc(db, 'reading_history', `${auth.currentUser.uid}_${storyId}`), {
      id: `${auth.currentUser.uid}_${storyId}`,
      storyId,
      chapterId,
      chapterNumber,
      userId: auth.currentUser.uid,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  }
}

// Comments
export async function toggleCommentReaction(commentId: string, emojiId: string, userUid?: string): Promise<Comment | null> {
  const effectiveUid = userUid || auth.currentUser?.uid || 'anonymous_guest';
  const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const all: Comment[] = data ? JSON.parse(data) : INITIAL_COMMENTS;

  const targetIdx = all.findIndex((c) => c.id === commentId);
  if (targetIdx === -1) return null;

  const target = { ...all[targetIdx] };
  const reactions: Record<string, string[]> = { ...(target.reactions || {}) };
  const currentUids: string[] = Array.isArray(reactions[emojiId]) ? [...reactions[emojiId]] : [];

  if (currentUids.includes(effectiveUid)) {
    const updatedUids = currentUids.filter((uid) => uid !== effectiveUid);
    if (updatedUids.length > 0) {
      reactions[emojiId] = updatedUids;
    } else {
      delete reactions[emojiId];
    }
  } else {
    reactions[emojiId] = [...currentUids, effectiveUid];
  }

  target.reactions = reactions;
  all[targetIdx] = target;
  safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(all));

  try {
    await updateDoc(doc(db, 'comments', commentId), {
      reactions: reactions,
    });
  } catch (err) {
    // Ignore error if document doesn't exist yet in cloud
  }

  return target;
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  const user = auth.currentUser;
  const newComment: Comment = {
    ...comment,
    id: 'comm-' + Date.now(),
    userName: user?.displayName || comment.userName || 'Độc giả',
    userUid: user?.uid || comment.userUid,
    userPhoto: user?.photoURL || comment.userPhoto,
    createdAt: new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
  };

  // Remove undefined keys before writing to Firestore
  const firestoreData: Record<string, any> = {};
  Object.entries(newComment).forEach(([key, value]) => {
    if (value !== undefined) {
      firestoreData[key] = value;
    }
  });

  const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const all: Comment[] = data ? JSON.parse(data) : INITIAL_COMMENTS;
  const updated = [newComment, ...all];
  safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'comments', newComment.id), firestoreData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `comments/${newComment.id}`);
  }

  // --- TẠO THÔNG BÁO CHO EDITOR HOẶC CHỦ CM CHA ---
  try {
    const stories = getStoriesLocal();
    const targetStory = stories.find(s => s.id === comment.storyId);
    if (targetStory) {
      const chaps = getChaptersLocal();
      const targetChap = comment.chapterId ? chaps.find(c => c.id === comment.chapterId) : null;
      const chapterTitle = targetChap ? `chương ${targetChap.chapterNumber}` : 'truyện';

      // 1. Nếu đây là một Reply (có bình luận cha) và người trả lời khác với chủ bình luận cha
      if (comment.parentCommentId && comment.parentCommentAuthorUid && comment.parentCommentAuthorUid !== newComment.userUid) {
        createNotification({
          userId: comment.parentCommentAuthorUid,
          title: 'Có phản hồi mới!',
          content: `${newComment.userName} đã trả lời bình luận của bạn tại ${chapterTitle} bộ "${targetStory.title}": "${newComment.content.substring(0, 50)}${newComment.content.length > 50 ? '...' : ''}"`,
          type: 'reply_comment',
          storyId: comment.storyId,
          chapterId: comment.chapterId,
          paragraphIndex: comment.paragraphIndex,
          commentId: newComment.id,
          senderName: newComment.userName,
          senderPhoto: newComment.userPhoto
        }).catch(() => {});
      }

      // 2. Thông báo cho Editor/Tác giả (nếu người cmt không phải là tác giả)
      const authorUid = targetStory.authorUid;
      if (authorUid && authorUid !== newComment.userUid) {
        const isReplyToAuthor = comment.parentCommentAuthorUid === authorUid;
        if (!isReplyToAuthor) {
          const locationText = comment.paragraphIndex !== undefined 
            ? `đoạn #${comment.paragraphIndex + 1} ${chapterTitle}`
            : chapterTitle;

          createNotification({
            userId: authorUid,
            title: 'Bình luận mới trên truyện!',
            content: `${newComment.userName} đã bình luận tại ${locationText} bộ "${targetStory.title}": "${newComment.content.substring(0, 50)}${newComment.content.length > 50 ? '...' : ''}"`,
            type: 'new_comment',
            storyId: comment.storyId,
            chapterId: comment.chapterId,
            paragraphIndex: comment.paragraphIndex,
            commentId: newComment.id,
            senderName: newComment.userName,
            senderPhoto: newComment.userPhoto
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn('Lỗi xử lý gửi thông báo bình luận:', err);
  }

  // Mỗi khi editor/reader comment sẽ được nhận 1 Chucu
  const targetUid = user?.uid || comment.userUid;
  if (targetUid) {
    try {
      const userRef = doc(db, 'users', targetUid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const uData = snap.data();
        const curChucu = typeof uData.chucu === 'number' ? uData.chucu : 0;
        await setDoc(userRef, {
          chucu: curChucu + 1,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          chucu: 1,
          displayName: user?.displayName || comment.userName || 'Độc giả',
          photoURL: user?.photoURL || comment.userPhoto || '',
          email: user?.email || '',
          streak: 0,
          totalCheckIns: 0,
          unlockedChapters: [],
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Không thể cộng 1 Chucu khi bình luận:', err);
    }
  }

  return newComment;
}

export async function deleteComment(commentId: string): Promise<void> {
  const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const all: Comment[] = data ? JSON.parse(data) : INITIAL_COMMENTS;
  const updated = all.filter((c) => c.id !== commentId);
  safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));

  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `comments/${commentId}`);
  }
}

// ------------------- THÔNG BÁO (NOTIFICATIONS) -------------------

export function getNotificationsLocal(): Notification[] {
  try {
    const data = localStorage.getItem('wp_notifications_v4');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function subscribeNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  callback(getNotificationsLocal().filter(n => n.userId === userId));

  try {
    const colRef = collection(db, 'notifications');
    const q = query(
      colRef,
      where('userId', '==', userId)
    );
    
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Notification[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Notification);
        });
        
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const allLocal = getNotificationsLocal().filter(n => n.userId !== userId);
        safeLocalStorageSet('wp_notifications_v4', JSON.stringify([...list, ...allLocal]));
        callback(list);
      },
      (error) => {
        console.warn('Fallback thông báo local do lỗi Firestore:', error);
        callback(getNotificationsLocal().filter(n => n.userId === userId));
      }
    );
  } catch (err) {
    console.warn('Lỗi kết nối thông báo:', err);
    callback(getNotificationsLocal().filter(n => n.userId === userId));
    return () => {};
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
  const newNotif: Notification = {
    ...notification,
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const local = getNotificationsLocal();
  safeLocalStorageSet('wp_notifications_v4', JSON.stringify([newNotif, ...local]));

  try {
    await setDoc(doc(db, 'notifications', newNotif.id), cleanForFirestore(newNotif));
  } catch (err) {
    console.warn('Lỗi gửi thông báo lên Firestore:', err);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const local = getNotificationsLocal();
  const updated = local.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
  safeLocalStorageSet('wp_notifications_v4', JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'notifications', notificationId), { isRead: true }, { merge: true });
  } catch (err) {
    console.warn('Lỗi cập nhật trạng thái đã đọc thông báo:', err);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const local = getNotificationsLocal();
  const updated = local.map(n => n.userId === userId ? { ...n, isRead: true } : n);
  safeLocalStorageSet('wp_notifications_v4', JSON.stringify(updated));

  try {
    const colRef = collection(db, 'notifications');
    const q = query(colRef, where('userId', '==', userId), where('isRead', '==', false));
    const snapshot = await getDocs(q);
    const batchPromises = snapshot.docs.map(docSnap => 
      setDoc(doc(db, 'notifications', docSnap.id), { isRead: true }, { merge: true })
    );
    await Promise.all(batchPromises);
  } catch (err) {
    console.warn('Lỗi đọc hết thông báo:', err);
  }
}

export async function notifyNewChapter(storyId: string, chapterTitle: string, chapterId: string, chapterNumber: number) {
  const stories = getStoriesLocal();
  const story = stories.find(s => s.id === storyId);
  if (!story) return;

  try {
    const colRef = collection(db, 'bookmarks');
    const q = query(colRef, where('storyId', '==', storyId));
    const snap = await getDocs(q);
    
    const promises = snap.docs.map(docSnap => {
      const bData = docSnap.data();
      const readerUid = bData.userId;
      if (readerUid && readerUid !== auth.currentUser?.uid) {
        return createNotification({
          userId: readerUid,
          title: 'Chương mới xuất bản!',
          content: `Truyện "${story.title}" vừa ra chương mới: ${chapterTitle}`,
          type: 'new_chapter',
          storyId: storyId,
          chapterId: chapterId,
          chapterNumber: chapterNumber,
          senderName: story.editorName || story.author || 'Hệ thống'
        });
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  } catch (err) {
    console.warn('Lỗi khi gửi thông báo chương mới cho độc giả:', err);
  }
}

// ------------------- LOUNGE CHAT -------------------

export function subscribeLoungeMessages(callback: (messages: LoungeMessage[]) => void, onError?: (error: any) => void) {
  initStorage();
  try {
    const colRef = collection(db, 'lounge_messages');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: LoungeMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LoungeMessage;
          if (data.id === 'lounge-1' || data.id === 'lounge-2' || data.id.startsWith('lounge-')) {
            deleteDoc(doc(db, 'lounge_messages', data.id)).catch(() => {});
          } else {
            list.push(data);
          }
        });
        // Sort by timestamp
        list.sort((a, b) => (a.id > b.id ? 1 : -1));
        safeLocalStorageSet(STORAGE_KEYS.LOUNGE, JSON.stringify(list));
        callback(list);
      },
      (error) => {
        console.warn('Fallback to local lounge messages:', error);
        callback(getLoungeMessagesLocal());
        if (onError) onError(error);
      }
    );
  } catch (err) {
    callback(getLoungeMessagesLocal());
    if (onError) onError(err);
    return () => {};
  }
}

export function getLoungeMessagesLocal(): LoungeMessage[] {
  initStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOUNGE);
    if (!data) return [];
    const list: LoungeMessage[] = JSON.parse(data);
    const filtered = list.filter((m) => m.id !== 'lounge-1' && m.id !== 'lounge-2' && !m.id.startsWith('lounge-'));
    if (filtered.length !== list.length) {
      safeLocalStorageSet(STORAGE_KEYS.LOUNGE, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export async function sendLoungeMessage(content: string, customName?: string, customPhoto?: string): Promise<LoungeMessage> {
  const user = auth.currentUser;
  const newMsg: LoungeMessage = {
    id: 'msg-' + Date.now(),
    userName: customName || user?.displayName || (user ? user.email?.split('@')[0] : 'Độc giả'),
    userUid: user?.uid,
    userPhoto: customPhoto || user?.photoURL || undefined,
    content,
    createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };

  const list = getLoungeMessagesLocal();
  const updated = [...list, newMsg];
  safeLocalStorageSet(STORAGE_KEYS.LOUNGE, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'lounge_messages', newMsg.id), newMsg);
  } catch (err) {
    console.warn('Could not sync lounge message to firestore:', err);
  }

  return newMsg;
}

export async function submitEditorRequest(
  userId: string,
  email: string,
  displayName: string,
  experience: string,
  contact: string
): Promise<void> {
  const newRequest: EditorRequest = {
    id: userId,
    userId,
    email,
    displayName: displayName || email.split('@')[0],
    experience,
    contact,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };

  try {
    await setDoc(doc(db, 'editor_requests', userId), newRequest);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `editor_requests/${userId}`);
  }
}

export function subscribeMyEditorRequest(userId: string, callback: (request: EditorRequest | null) => void) {
  try {
    const docRef = doc(db, 'editor_requests', userId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as EditorRequest);
        } else {
          callback(null);
        }
      },
      () => {
        callback(null);
      }
    );
  } catch {
    callback(null);
    return () => {};
  }
}

export function subscribeAllEditorRequests(callback: (requests: EditorRequest[]) => void) {
  try {
    const colRef = collection(db, 'editor_requests');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: EditorRequest[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as EditorRequest);
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        callback(list);
      },
      () => {
        callback([]);
      }
    );
  } catch {
    callback([]);
    return () => {};
  }
}

export async function approveEditorRequest(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'editor_requests', userId);
    await setDoc(docRef, { status: 'approved', updatedAt: new Date().toISOString().split('T')[0] }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `editor_requests/${userId}`);
  }
}

export async function rejectEditorRequest(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'editor_requests', userId);
    await setDoc(docRef, { status: 'rejected', updatedAt: new Date().toISOString().split('T')[0] }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `editor_requests/${userId}`);
  }
}

// Tự động đồng bộ hóa dữ liệu offline từ LocalStorage lên đám mây Firestore khi mạng thông suốt và dán Rules thành công
export async function syncLocalToCloud(): Promise<void> {
  initStorage();
  try {
    const deletedIds = getDeletedStoryIds();

    // Lấy danh sách đã xóa từ cloud nếu có
    try {
      const deletedSnap = await getDocs(collection(db, 'deleted_stories'));
      deletedSnap.docs.forEach(docSnap => {
        deletedIds.add(docSnap.id);
        markStoryAsDeleted(docSnap.id);
      });
    } catch {}

    // 1. Đồng bộ Stories
    const storiesCol = collection(db, 'stories');
    const storiesSnap = await getDocs(storiesCol);
    const cloudStoryIds = new Set(storiesSnap.docs.map(doc => doc.id));
    const localStories = getStoriesLocal().filter(s => !deletedIds.has(s.id));
    let localStoriesUpdated = false;
    const syncedLocalStories = [...localStories];

    for (let i = 0; i < syncedLocalStories.length; i++) {
      const story = syncedLocalStories[i];
      if (deletedIds.has(story.id)) continue;
      if (!cloudStoryIds.has(story.id)) {
        try {
          console.log(`[Sync] Đang xử lý làm sạch và nén dữ liệu cho truyện: ${story.title}...`);
          const finalStory = await sanitizeAndCompressStory(story);
          syncedLocalStories[i] = finalStory;
          localStoriesUpdated = true;
          
          await setDoc(doc(db, 'stories', finalStory.id), cleanForFirestore(finalStory));
          console.log(`[Sync] Đã đồng bộ truyện: ${finalStory.title} (${finalStory.id}) lên Firestore thành công!`);
        } catch (syncErr) {
          console.warn(`[Sync] Lỗi khi đồng bộ truyện ${story.id}:`, syncErr);
        }
      }
    }

    if (localStoriesUpdated) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(syncedLocalStories));
    }

    // 2. Đồng bộ Chapters
    const chapsCol = collection(db, 'chapters');
    const chapsSnap = await getDocs(chapsCol);
    const cloudChapIds = new Set(chapsSnap.docs.map(doc => doc.id));
    const localChapters = getChaptersLocal().filter(c => !deletedIds.has(c.storyId));
    for (const chap of localChapters) {
      if (deletedIds.has(chap.storyId)) continue;
      if (!cloudChapIds.has(chap.id)) {
        await setDoc(doc(db, 'chapters', chap.id), cleanForFirestore(chap));
        console.log(`[Sync] Đã đồng bộ chương: ${chap.title} (${chap.id}) lên Firestore`);
      }
    }

    // 3. Đồng bộ Comments
    const commentsCol = collection(db, 'comments');
    const commentsSnap = await getDocs(commentsCol);
    const cloudCommentIds = new Set(commentsSnap.docs.map(doc => doc.id));
    const localComments = getCommentsLocal().filter(c => !deletedIds.has(c.storyId));
    for (const comment of localComments) {
      if (deletedIds.has(comment.storyId)) continue;
      if (!cloudCommentIds.has(comment.id)) {
        await setDoc(doc(db, 'comments', comment.id), cleanForFirestore(comment));
        console.log(`[Sync] Đã đồng bộ bình luận: ${comment.id} lên Firestore`);
      }
    }
  } catch (err) {
    console.warn('[Sync] Chưa thể đồng bộ lên Firestore (có thể do chưa đăng nhập hoặc Rules chặn):', err);
  }
}

// Hàm bổ trợ nén ảnh Base64 gọn nhẹ dưới 50KB để vượt qua giới hạn 1MB tài liệu của Firestore
export async function compressBase64(
  base64: string, 
  maxWidth = 500, 
  maxHeight = 700, 
  quality = 0.75
): Promise<string> {
  if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) return base64;
  if (base64.length < 35000) return base64;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = Math.max(10, width);
      canvas.height = Math.max(10, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = () => {
      resolve(base64);
    };
  });
}

/**
 * Tự động quét và nén TOÀN BỘ ảnh Base64 bên trong đối tượng Story
 * (bìa truyện, ảnh nhân vật, gallery widget, sticker element, theme...)
 * và loại bỏ các mảng thừa như chapters/comments nếu lỡ dính vào,
 * đảm bảo document truyện KHÔNG BAO GIỜ vượt quá giới hạn 1MB (1,048,576 bytes) của Firestore.
 */
export async function sanitizeAndCompressStory(story: Story): Promise<Story> {
  if (!story) return story;
  const cloned: Story = JSON.parse(JSON.stringify(story));

  // 1. Loại bỏ các mảng không thuộc document story
  delete (cloned as any).chapters;
  delete (cloned as any).comments;

  // 2. Nén bìa truyện chính
  if (cloned.coverUrl && cloned.coverUrl.startsWith('data:image')) {
    cloned.coverUrl = await compressBase64(cloned.coverUrl, 500, 700, 0.75);
  }

  // 3. Nén ảnh đại diện Editor
  if (cloned.editorPhoto && cloned.editorPhoto.startsWith('data:image')) {
    cloned.editorPhoto = await compressBase64(cloned.editorPhoto, 200, 200, 0.75);
  }

  // 4. Nén ảnh Nhân vật
  if (Array.isArray(cloned.characters)) {
    for (let i = 0; i < cloned.characters.length; i++) {
      if (cloned.characters[i]?.avatarUrl?.startsWith('data:image')) {
        cloned.characters[i].avatarUrl = await compressBase64(cloned.characters[i].avatarUrl, 300, 400, 0.75);
      }
    }
  }

  // 5. Nén ảnh Gallery Widgets
  if (Array.isArray(cloned.galleryWidgets)) {
    for (let i = 0; i < cloned.galleryWidgets.length; i++) {
      const widget = cloned.galleryWidgets[i];
      if (widget) {
        if (widget.singleImageUrl?.startsWith('data:image')) {
          widget.singleImageUrl = await compressBase64(widget.singleImageUrl, 500, 700, 0.75);
        }
        if (Array.isArray(widget.images)) {
          for (let j = 0; j < widget.images.length; j++) {
            if (widget.images[j]?.url?.startsWith('data:image')) {
              widget.images[j].url = await compressBase64(widget.images[j].url, 500, 700, 0.75);
            }
          }
        }
      }
    }
  }

  // 6. Nén ảnh Story Themes
  if (Array.isArray(cloned.storyThemes)) {
    for (let i = 0; i < cloned.storyThemes.length; i++) {
      const theme = cloned.storyThemes[i];
      if (theme) {
        if (theme.coverUrl?.startsWith('data:image')) {
          theme.coverUrl = await compressBase64(theme.coverUrl, 500, 700, 0.75);
        }
        if (Array.isArray(theme.storyElements)) {
          for (let j = 0; j < theme.storyElements.length; j++) {
            if (theme.storyElements[j]?.imageUrl?.startsWith('data:image')) {
              theme.storyElements[j].imageUrl = await compressBase64(theme.storyElements[j].imageUrl, 350, 350, 0.75);
            }
          }
        }
      }
    }
  }

  // 7. Nén ảnh Story Elements
  if (Array.isArray(cloned.storyElements)) {
    for (let i = 0; i < cloned.storyElements.length; i++) {
      if (cloned.storyElements[i]?.imageUrl?.startsWith('data:image')) {
        cloned.storyElements[i].imageUrl = await compressBase64(cloned.storyElements[i].imageUrl, 350, 350, 0.75);
      }
    }
  }

  // Kiểm tra kích thước chuỗi JSON và nén cường độ cao hơn nếu vẫn > 750KB
  let jsonString = JSON.stringify(cleanForFirestore(cloned));
  if (jsonString.length > 750000) {
    if (cloned.coverUrl?.startsWith('data:image')) {
      cloned.coverUrl = await compressBase64(cloned.coverUrl, 300, 400, 0.6);
    }
    if (Array.isArray(cloned.characters)) {
      for (let i = 0; i < cloned.characters.length; i++) {
        if (cloned.characters[i]?.avatarUrl?.startsWith('data:image')) {
          cloned.characters[i].avatarUrl = await compressBase64(cloned.characters[i].avatarUrl, 200, 250, 0.6);
        }
      }
    }
    if (Array.isArray(cloned.galleryWidgets)) {
      for (let i = 0; i < cloned.galleryWidgets.length; i++) {
        const widget = cloned.galleryWidgets[i];
        if (widget) {
          if (widget.singleImageUrl?.startsWith('data:image')) {
            widget.singleImageUrl = await compressBase64(widget.singleImageUrl, 300, 400, 0.6);
          }
          if (Array.isArray(widget.images)) {
            for (let j = 0; j < widget.images.length; j++) {
              if (widget.images[j]?.url?.startsWith('data:image')) {
                widget.images[j].url = await compressBase64(widget.images[j].url, 300, 400, 0.6);
              }
            }
          }
        }
      }
    }
  }

  return cloned;
}

// ------------------- TÍNH NĂNG ĐỒNG TIỀN ẢO CHUCU & ĐIỂM DANH THEO STREAK -------------------

/**
 * Công thức tính số Chucu nhận được theo chuỗi ngày điểm danh liên tiếp (Streak):
 * - Ngày 1 (streak 1): nhận 1 Chucu
 * - Ngày 2, 3 (streak 2..3): nhận 2 Chucu
 * - Ngày 4, 5, 6 (streak 4..6): nhận 3 Chucu
 * - Ngày 7, 8, 9, 10 (streak 7..10): nhận 4 Chucu
 * - Cứ thế tiếp tục tăng dần lên!
 */
export function calculateStreakReward(streak: number): number {
  if (streak <= 0) return 0;
  let k = 1;
  while ((k * (k + 1)) / 2 < streak) {
    k++;
  }
  return k;
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export async function checkInDaily(
  uid: string,
  fallbackProfile?: Partial<UserProfile>
): Promise<{ success: boolean; reward: number; streak: number; message: string; newBalance: number }> {
  try {
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    let currentChucu = 0;
    let currentStreak = 0;
    let lastDate = '';
    let totalCheckIns = 0;
    let displayName = fallbackProfile?.displayName || auth.currentUser?.displayName || 'Độc giả';
    let photoURL = fallbackProfile?.photoURL || auth.currentUser?.photoURL || '';

    if (snap.exists()) {
      const data = snap.data();
      currentChucu = typeof data.chucu === 'number' ? data.chucu : 0;
      currentStreak = typeof data.streak === 'number' ? data.streak : 0;
      lastDate = data.lastCheckInDate || '';
      totalCheckIns = typeof data.totalCheckIns === 'number' ? data.totalCheckIns : 0;
      if (data.displayName) displayName = data.displayName;
      if (data.photoURL) photoURL = data.photoURL;
    }

    if (lastDate === today) {
      return {
        success: false,
        reward: 0,
        streak: currentStreak,
        newBalance: currentChucu,
        message: 'Bạn đã điểm danh hôm nay rồi! Hãy quay lại vào ngày mai nhé.',
      };
    }

    // Tính streak mới
    let newStreak = 1;
    if (lastDate === yesterday) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1; // Bị ngắt chuỗi nếu không điểm danh ngày hôm qua
    }

    const reward = calculateStreakReward(newStreak);
    const newBalance = currentChucu + reward;
    const newTotalCheckIns = totalCheckIns + 1;

    const updatedData = {
      chucu: newBalance,
      streak: newStreak,
      lastCheckInDate: today,
      totalCheckIns: newTotalCheckIns,
      displayName,
      photoURL,
      email: auth.currentUser?.email || '',
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, cleanForFirestore(updatedData), { merge: true });

    return {
      success: true,
      reward,
      streak: newStreak,
      newBalance,
      message: `Điểm danh thành công! Bạn duy trì chuỗi ${newStreak} ngày liên tiếp và nhận được +${reward} Chucu!`,
    };
  } catch (err) {
    console.error('Lỗi khi điểm danh:', err);
    throw err;
  }
}

// ------------------- TÍNH NĂNG MỞ KHÓA CHƯƠNG BẰNG CHUCU -------------------

const UNLOCKED_STORAGE_KEY_PREFIX = 'wp_unlocked_chapters_';

export function getUserUnlockedChaptersLocal(uid: string): string[] {
  try {
    const raw = localStorage.getItem(`${UNLOCKED_STORAGE_KEY_PREFIX}${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function subscribeUserUnlockedChapters(
  uid: string,
  callback: (chapterIds: string[]) => void
) {
  if (!uid) {
    callback([]);
    return () => {};
  }
  const local = getUserUnlockedChaptersLocal(uid);
  callback(local);

  try {
    const userDocRef = doc(db, 'users', uid);
    return onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const unlocked = Array.isArray(data.unlockedChapters) ? data.unlockedChapters : [];
          // Merge local & cloud
          const merged = Array.from(new Set([...local, ...unlocked]));
          safeLocalStorageSet(`${UNLOCKED_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(merged));
          callback(merged);
        } else {
          callback(local);
        }
      },
      () => {
        callback(local);
      }
    );
  } catch {
    callback(local);
    return () => {};
  }
}

export async function unlockChapterWithChucu(
  userUid: string,
  chapterId: string,
  price: number,
  authorUid?: string
): Promise<{ success: boolean; message: string; newBalance: number }> {
  try {
    const userDocRef = doc(db, 'users', userUid);
    const snap = await getDoc(userDocRef);

    let currentChucu = 0;
    let unlockedChapters: string[] = getUserUnlockedChaptersLocal(userUid);

    if (snap.exists()) {
      const data = snap.data();
      currentChucu = typeof data.chucu === 'number' ? data.chucu : 0;
      if (Array.isArray(data.unlockedChapters)) {
        unlockedChapters = Array.from(new Set([...unlockedChapters, ...data.unlockedChapters]));
      }
    }

    // Nếu đã mở khóa từ trước
    if (unlockedChapters.includes(chapterId)) {
      return {
        success: true,
        message: 'Bạn đã mở khóa chương này rồi!',
        newBalance: currentChucu,
      };
    }

    if (currentChucu < price) {
      return {
        success: false,
        message: `Bạn không đủ Chucu! Cần ${price} Chucu nhưng bạn chỉ có ${currentChucu} Chucu. Hãy điểm danh mỗi ngày để nhận thêm Chucu nhé!`,
        newBalance: currentChucu,
      };
    }

    const newBalance = currentChucu - price;
    const newUnlocked = [...unlockedChapters, chapterId];

    // Cập nhật người mua
    await setDoc(
      userDocRef,
      cleanForFirestore({
        chucu: newBalance,
        unlockedChapters: newUnlocked,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );

    // Lưu local
    safeLocalStorageSet(`${UNLOCKED_STORAGE_KEY_PREFIX}${userUid}`, JSON.stringify(newUnlocked));

    // Nếu tác giả/Editor có UID khác người mua, cộng thưởng Chucu cho Editor
    if (authorUid && authorUid !== userUid) {
      try {
        const authorDocRef = doc(db, 'users', authorUid);
        const authorSnap = await getDoc(authorDocRef);
        if (authorSnap.exists()) {
          const authorData = authorSnap.data();
          const authorChucu = typeof authorData.chucu === 'number' ? authorData.chucu : 0;
          await setDoc(
            authorDocRef,
            cleanForFirestore({
              chucu: authorChucu + price,
              updatedAt: new Date().toISOString(),
            }),
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('Không thể cộng Chucu cho tác giả:', err);
      }
    }

    return {
      success: true,
      message: `Mở khóa chương thành công! Đã trừ ${price} Chucu (Số dư còn lại: ${newBalance} Chucu).`,
      newBalance,
    };
  } catch (err) {
    console.error('Lỗi khi mở khóa chương:', err);
    throw err;
  }
}

// ------------------- TÍNH NĂNG MỞ KHÓA CHƯƠNG BẰNG MẬT KHẨU (PASSWORD) -------------------

const UNLOCKED_PASS_STORAGE_KEY_PREFIX = 'wp_unlocked_pass_chapters_';

export function getUserUnlockedPasswordChaptersLocal(uid?: string): string[] {
  try {
    const key = `${UNLOCKED_PASS_STORAGE_KEY_PREFIX}${uid || 'guest'}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUserUnlockedPasswordChapter(chapterId: string, uid?: string): Promise<void> {
  const current = getUserUnlockedPasswordChaptersLocal(uid);
  if (!current.includes(chapterId)) {
    const updated = [...current, chapterId];
    const key = `${UNLOCKED_PASS_STORAGE_KEY_PREFIX}${uid || 'guest'}`;
    safeLocalStorageSet(key, JSON.stringify(updated));

    if (uid) {
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(
          userDocRef,
          cleanForFirestore({
            unlockedPasswordChapters: updated,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      } catch (err) {
        console.warn('Lỗi khi lưu unlockedPasswordChapters lên Firestore:', err);
      }
    }
  }
}

export async function unlockChapterWithPassword(
  chapterId: string,
  inputPass: string,
  correctPass?: string,
  uid?: string
): Promise<{ success: boolean; message: string }> {
  if (!correctPass || !correctPass.trim()) {
    // Nếu chương không có pass hoặc pass trống
    await saveUserUnlockedPasswordChapter(chapterId, uid);
    return { success: true, message: 'Mở khóa chương thành công!' };
  }

  const cleanInput = inputPass.trim();
  const cleanCorrect = correctPass.trim();

  if (cleanInput === cleanCorrect) {
    await saveUserUnlockedPasswordChapter(chapterId, uid);
    return { success: true, message: 'Mật khẩu chính xác! Đã mở khóa chương.' };
  } else {
    return {
      success: false,
      message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại gợi ý hoặc nhập lại!',
    };
  }
}

// ------------------- GÁN / NHẬN QUYỀN TRUYỆN CŨ (CLAIM STORY) -------------------
export async function claimStoryOwnership(
  storyId: string,
  userUid: string,
  userEmail: string,
  displayName?: string
): Promise<Story[]> {
  const stories = getStoriesLocal();
  const index = stories.findIndex((s) => s.id === storyId);
  if (index === -1) return stories;

  const targetStory = stories[index];
  const updatedStory = await sanitizeAndCompressStory({
    ...targetStory,
    authorUid: userUid,
    authorEmail: userEmail,
    author: targetStory.author || displayName || userEmail.split('@')[0] || 'Tác giả',
    updatedAt: new Date().toISOString().split('T')[0],
  });

  const updated = [...stories];
  updated[index] = updatedStory;
  safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(updated));

  try {
    await setDoc(doc(db, 'stories', storyId), cleanForFirestore(updatedStory), { merge: true });
  } catch (err) {
    console.warn('Không thể cập nhật quyền sở hữu lên Firestore:', err);
  }

  return updated;
}

// ------------------- CẬP NHẬT TÊN NGƯỜI DÙNG VÀ AVATAR Ở MỌI NƠI -------------------
export async function updateUserDataEverywhere(
  uid: string,
  newDisplayName: string,
  newPhotoURL?: string,
  userEmail?: string
): Promise<void> {
  const trimmedName = newDisplayName.trim();
  if (!trimmedName || !uid) return;

  // 1. Cập nhật document users/{uid}
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      cleanForFirestore({
        displayName: trimmedName,
        photoURL: newPhotoURL || '',
        email: userEmail || auth.currentUser?.email || '',
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Lỗi khi cập nhật users collection:', err);
  }

  // 2. Cập nhật tên Editor và ảnh đại diện Editor trong tất cả các truyện (stories) do user này sở hữu
  try {
    const storiesCol = collection(db, 'stories');
    const storiesSnap = await getDocs(storiesCol);
    const localStories = getStoriesLocal();
    let localStoriesUpdated = false;

    const emailToMatch = userEmail || auth.currentUser?.email;

    for (const docSnap of storiesSnap.docs) {
      const storyData = docSnap.data() as Story;
      const isOwner =
        storyData.authorUid === uid ||
        (emailToMatch && storyData.authorEmail && storyData.authorEmail.toLowerCase() === emailToMatch.toLowerCase());

      if (isOwner) {
        await setDoc(
          doc(db, 'stories', storyData.id),
          cleanForFirestore({
            editorName: trimmedName,
            editorPhoto: newPhotoURL !== undefined ? newPhotoURL : storyData.editorPhoto,
            authorUid: uid,
            authorEmail: emailToMatch || storyData.authorEmail,
            updatedAt: new Date().toISOString().split('T')[0],
          }),
          { merge: true }
        );
      }
    }

    const updatedLocalStories = localStories.map((s) => {
      const isOwner =
        s.authorUid === uid ||
        (emailToMatch && s.authorEmail && s.authorEmail.toLowerCase() === emailToMatch.toLowerCase());
      if (isOwner) {
        localStoriesUpdated = true;
        return {
          ...s,
          editorName: trimmedName,
          editorPhoto: newPhotoURL !== undefined ? newPhotoURL : s.editorPhoto,
          authorUid: uid,
          authorEmail: emailToMatch || s.authorEmail,
        };
      }
      return s;
    });

    if (localStoriesUpdated) {
      safeLocalStorageSet(STORAGE_KEYS.STORIES, JSON.stringify(updatedLocalStories));
    }
  } catch (err) {
    console.warn('Lỗi khi cập nhật thông tin editor trong stories:', err);
  }

  // 3. Cập nhật tên người bình luận trong tất cả các comment (comments)
  try {
    const commentsCol = collection(db, 'comments');
    const commentsSnap = await getDocs(commentsCol);
    const localComments = getCommentsLocal();
    let localCommentsUpdated = false;

    for (const docSnap of commentsSnap.docs) {
      const commData = docSnap.data() as Comment;
      if (commData.userUid === uid) {
        await setDoc(
          doc(db, 'comments', commData.id),
          cleanForFirestore({
            ...commData,
            userName: trimmedName,
            userPhoto: newPhotoURL !== undefined ? newPhotoURL : commData.userPhoto,
          }),
          { merge: true }
        );
      }
    }

    const updatedLocalComments = localComments.map((c) => {
      if (c.userUid === uid) {
        localCommentsUpdated = true;
        return {
          ...c,
          userName: trimmedName,
          userPhoto: newPhotoURL !== undefined ? newPhotoURL : c.userPhoto,
        };
      }
      return c;
    });

    if (localCommentsUpdated) {
      safeLocalStorageSet(STORAGE_KEYS.COMMENTS, JSON.stringify(updatedLocalComments));
    }
  } catch (err) {
    console.warn('Lỗi khi cập nhật tên trong comments:', err);
  }

  // 4. Cập nhật tên trong phòng chat (lounge_messages)
  try {
    const loungeCol = collection(db, 'lounge_messages');
    const loungeSnap = await getDocs(loungeCol);
    const localLounge = getLoungeMessagesLocal();
    let localLoungeUpdated = false;

    for (const docSnap of loungeSnap.docs) {
      const msgData = docSnap.data() as LoungeMessage;
      if (msgData.userUid === uid) {
        await setDoc(
          doc(db, 'lounge_messages', msgData.id),
          cleanForFirestore({
            ...msgData,
            userName: trimmedName,
            userPhoto: newPhotoURL !== undefined ? newPhotoURL : msgData.userPhoto,
          }),
          { merge: true }
        );
      }
    }

    const updatedLocalLounge = localLounge.map((m) => {
      if (m.userUid === uid) {
        localLoungeUpdated = true;
        return {
          ...m,
          userName: trimmedName,
          userPhoto: newPhotoURL !== undefined ? newPhotoURL : m.userPhoto,
        };
      }
      return m;
    });

    if (localLoungeUpdated) {
      safeLocalStorageSet(STORAGE_KEYS.LOUNGE, JSON.stringify(updatedLocalLounge));
    }
  } catch (err) {
    console.warn('Lỗi khi cập nhật tên trong lounge messages:', err);
  }

  // 5. Cập nhật tên trong đơn xin quyền editor (editor_requests)
  try {
    const reqDocRef = doc(db, 'editor_requests', uid);
    const reqSnap = await getDoc(reqDocRef);
    if (reqSnap.exists()) {
      await setDoc(
        reqDocRef,
        cleanForFirestore({
          displayName: trimmedName,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Lỗi khi cập nhật tên trong editor_requests:', err);
  }

  // 6. Cập nhật tên trong bảng xếp hạng game Block (block_leaderboard)
  try {
    const lbDocRef = doc(db, 'block_leaderboard', uid);
    const lbSnap = await getDoc(lbDocRef);
    if (lbSnap.exists()) {
      await setDoc(
        lbDocRef,
        cleanForFirestore({
          displayName: trimmedName,
          photoURL: newPhotoURL !== undefined ? newPhotoURL : lbSnap.data()?.photoURL,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Lỗi khi cập nhật tên trong block_leaderboard:', err);
  }

  // 7. Cập nhật tên trong bảng xếp hạng game 2048 Vô Tận (game_2048_leaderboard)
  try {
    const lb2048DocRef = doc(db, 'game_2048_leaderboard', uid);
    const lb2048Snap = await getDoc(lb2048DocRef);
    if (lb2048Snap.exists()) {
      await setDoc(
        lb2048DocRef,
        cleanForFirestore({
          displayName: trimmedName,
          photoURL: newPhotoURL !== undefined ? newPhotoURL : lb2048Snap.data()?.photoURL,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Lỗi khi cập nhật tên trong game_2048_leaderboard:', err);
  }
}

/**
 * LƯU HOẶC CẬP NHẬT KỶ LỤC ĐIỂM GAME BLOCK BLAST
 */
export async function saveBlockBlastHighScore(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  newScore: number
): Promise<void> {
  if (!user?.uid || newScore <= 0) return;

  try {
    const docRef = doc(db, 'block_leaderboard', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentHighScore = docSnap.data().highScore || 0;
      if (newScore > currentHighScore) {
        await setDoc(
          docRef,
          cleanForFirestore({
            uid: user.uid,
            displayName: user.displayName || 'Vô danh',
            photoURL: user.photoURL || '',
            highScore: newScore,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      }
    } else {
      await setDoc(
        docRef,
        cleanForFirestore({
          uid: user.uid,
          displayName: user.displayName || 'Vô danh',
          photoURL: user.photoURL || '',
          highScore: newScore,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  } catch (err) {
    console.warn('Lỗi khi lưu kỷ lục Block lên Firestore:', err);
  }
}

/**
 * LẤY DANH SÁCH BẢNG XẾP HẠNG KỶ LỤC GAME BLOCK
 */
export async function getBlockBlastLeaderboard(): Promise<import('../types').BlockLeaderboardEntry[]> {
  try {
    const colRef = collection(db, 'block_leaderboard');
    const snap = await getDocs(colRef);

    const list: import('../types').BlockLeaderboardEntry[] = [];
    snap.forEach((d) => {
      const data = d.data() as import('../types').BlockLeaderboardEntry;
      list.push(data);
    });

    // Sắp xếp điểm giảm dần
    list.sort((a, b) => (b.highScore || 0) - (a.highScore || 0));
    return list;
  } catch (err) {
    console.warn('Lỗi khi lấy bảng xếp hạng Block từ Firestore:', err);
    return [];
  }
}

/**
 * LƯU HOẶC CẬP NHẬT KỶ LỤC ĐIỂM GAME 2048 VÔ TẬN
 */
export async function save2048HighScore(
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  newScore: number,
  maxTile: number
): Promise<void> {
  if (!user?.uid || newScore <= 0) return;

  try {
    const docRef = doc(db, 'game_2048_leaderboard', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentHighScore = data.highScore || 0;
      const currentMaxTile = data.maxTile || 0;
      const shouldUpdate = newScore > currentHighScore || maxTile > currentMaxTile;

      if (shouldUpdate) {
        await setDoc(
          docRef,
          cleanForFirestore({
            uid: user.uid,
            displayName: user.displayName || 'Vô danh',
            photoURL: user.photoURL || '',
            highScore: Math.max(newScore, currentHighScore),
            maxTile: Math.max(maxTile, currentMaxTile),
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      }
    } else {
      await setDoc(
        docRef,
        cleanForFirestore({
          uid: user.uid,
          displayName: user.displayName || 'Vô danh',
          photoURL: user.photoURL || '',
          highScore: newScore,
          maxTile: maxTile || 2,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  } catch (err) {
    console.warn('Lỗi khi lưu kỷ lục 2048 lên Firestore:', err);
  }
}

/**
 * LẤY DANH SÁCH BẢNG XẾP HẠNG KỶ LỤC GAME 2048 VÔ TẬN
 */
export async function get2048Leaderboard(): Promise<import('../types').Game2048LeaderboardEntry[]> {
  try {
    const colRef = collection(db, 'game_2048_leaderboard');
    const snap = await getDocs(colRef);

    const list: import('../types').Game2048LeaderboardEntry[] = [];
    snap.forEach((d) => {
      const data = d.data() as import('../types').Game2048LeaderboardEntry;
      list.push(data);
    });

    // Sắp xếp điểm giảm dần, nếu bằng điểm thì ưu tiên maxTile lớn hơn
    list.sort((a, b) => {
      const scoreDiff = (b.highScore || 0) - (a.highScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (b.maxTile || 0) - (a.maxTile || 0);
    });
    return list;
  } catch (err) {
    console.warn('Lỗi khi lấy bảng xếp hạng 2048 từ Firestore:', err);
    return [];
  }
}

/**
 * LƯU FONT CHỮ CÁ NHÂN LÊN CLOUD FIRESTORE
 */
export async function saveUserFontToCloud(
  userId: string,
  name: string,
  value: string,
  fileData: string
): Promise<void> {
  if (!userId || !value || !fileData) return;
  try {
    const docId = `${userId}_${value}`;
    const fontDocRef = doc(db, 'user_fonts', docId);
    await setDoc(fontDocRef, cleanForFirestore({
      id: docId,
      userId,
      name,
      value,
      fileData,
      createdAt: new Date().toISOString()
    }));
    console.log(`[Font Cloud] Đã lưu font chữ "${name}" lên Firestore thành công.`);
  } catch (err) {
    console.warn(`[Font Cloud] Không thể lưu font lên Firestore:`, err);
  }
}

/**
 * XÓA FONT CHỮ CÁ NHÂN KHỎI CLOUD FIRESTORE
 */
export async function deleteUserFontFromCloud(userId: string, value: string): Promise<void> {
  if (!userId || !value) return;
  try {
    const docId = `${userId}_${value}`;
    await deleteDoc(doc(db, 'user_fonts', docId));
    console.log(`[Font Cloud] Đã xóa font chữ "${value}" khỏi Firestore.`);
  } catch (err) {
    console.warn(`[Font Cloud] Không thể xóa font khỏi Firestore:`, err);
  }
}

/**
 * LẤY TẤT CẢ FONT CHỮ CÁ NHÂN TỪ CLOUD FIRESTORE CỦA USER
 */
export async function getUserFontsFromCloud(userId: string): Promise<{ name: string; value: string; fileData: string }[]> {
  if (!userId) return [];
  try {
    const colRef = collection(db, 'user_fonts');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: { name: string; value: string; fileData: string }[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.name && data.value && data.fileData) {
        list.push({
          name: data.name,
          value: data.value,
          fileData: data.fileData
        });
      }
    });
    return list;
  } catch (err) {
    console.warn(`[Font Cloud] Không thể tải font từ Firestore:`, err);
    return [];
  }
}

/**
 * LẤY TẤT CẢ FONT TẢI LÊN TRÊN HỆ THỐNG ĐỂ NGƯỜI KHÁC CŨNG ĐỌC ĐƯỢC
 */
export async function getAllUserFontsFromCloud(): Promise<{ name: string; value: string; fileData: string }[]> {
  try {
    const colRef = collection(db, 'user_fonts');
    const snap = await getDocs(colRef);
    const list: { name: string; value: string; fileData: string }[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.name && data.value && data.fileData) {
        list.push({
          name: data.name,
          value: data.value,
          fileData: data.fileData
        });
      }
    });
    return list;
  } catch (err) {
    console.warn(`[Font Cloud] Không thể tải toàn bộ font từ Firestore:`, err);
    return [];
  }
}



