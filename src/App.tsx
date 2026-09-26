import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, logout, db } from './lib/firebase';
import { slugify } from './lib/slug';
import { Story, Chapter, Comment, BookmarkItem, ReadingProgress, LoungeMessage, EditorRequest, UserProfile, Notification } from './types';
import { 
  getStoriesLocal, 
  getChaptersLocal, 
  getBookmarks, 
  getReadingHistory, 
  getCommentsLocal, 
  getLoungeMessagesLocal,
  saveStory, 
  deleteStory, 
  saveChapter, 
  saveMultipleChapters,
  deleteChapter, 
  toggleBookmark, 
  saveReadingProgress, 
  incrementChapterViews, 
  addComment,
  deleteComment,
  toggleCommentReaction,
  subscribeStories,
  subscribeChapters,
  subscribeComments,
  subscribeLoungeMessages,
  submitEditorRequest,
  subscribeMyEditorRequest,
  subscribeAllEditorRequests,
  approveEditorRequest,
  rejectEditorRequest,
  syncLocalToCloud,
  unlockChapterWithChucu,
  subscribeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserFontsFromCloud,
  getAllUserFontsFromCloud
} from './lib/storage';

import { Header } from './components/Header';
import { NewsHub } from './components/NewsHub';
import { migrateLocalStorageFonts, getIdbFonts, saveIdbFonts, StoredUserFont } from './lib/idbStorage';
import { PRESET_THEME_COLORS } from './lib/themeConstants';
import { getEffectiveStory } from './lib/storyUtils';
import { StoryCard } from './components/StoryCard';
import { StoryDetail } from './components/StoryDetail';
import { ChapterReader } from './components/ChapterReader';
import { StudioManager } from './components/StudioManager';
import { LibraryView } from './components/LibraryView';
import { HomeView } from './components/HomeView';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { GamesHub } from './components/GamesHub';
import { JjwxcRankingsHub } from './components/JjwxcRankingsHub';
import { initAntiCopyProtection } from './lib/antiCopyProtection';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'browse' | 'news' | 'library' | 'studio' | 'games' | 'rankings'>('browse');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Editor Request States
  const [myRequest, setMyRequest] = useState<EditorRequest | null>(null);
  const [allRequests, setAllRequests] = useState<EditorRequest[]>([]);
  const [requestExperience, setRequestExperience] = useState('');
  const [requestContact, setRequestContact] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState('');
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Main Data States
  const [stories, setStories] = useState<Story[]>(getStoriesLocal());
  const [chapters, setChapters] = useState<Chapter[]>(getChaptersLocal());
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(getBookmarks());
  const [readingHistory, setReadingHistory] = useState<ReadingProgress[]>(getReadingHistory());
  const [comments, setComments] = useState<Comment[]>(getCommentsLocal());
  const [loungeMessages, setLoungeMessages] = useState<LoungeMessage[]>(getLoungeMessagesLocal());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Site Theme State ('choco-dark' | 'choco-light')
  const [siteTheme, setSiteTheme] = useState<'choco-dark' | 'choco-light'>(() => {
    return (localStorage.getItem('choco_site_theme') as 'choco-dark' | 'choco-light') || 'choco-dark';
  });

  useEffect(() => {
    localStorage.setItem('choco_site_theme', siteTheme);
    if (siteTheme === 'choco-light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
    }
  }, [siteTheme]);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Global Font Loading and Injection
  useEffect(() => {
    const injectFontFace = (font: { value: string; fontData: string }) => {
      const styleId = `style-${font.value}`;
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @font-face {
          font-family: '${font.value}';
          src: url('${font.fontData}');
        }
        .${font.value} {
          font-family: '${font.value}', sans-serif !important;
        }
      `;
      document.head.appendChild(style);
    };

    // 1. Tự động di chuyển font cũ từ localStorage sang IndexedDB và nạp fonts
    migrateLocalStorageFonts().then((fonts) => {
      fonts.forEach(font => {
        if (font.value && font.fontData) {
          injectFontFace(font);
        }
      });
    }).catch(e => {
      console.warn('[Global Fonts] Error loading IDB fonts:', e);
    });

    // 2. Load and sync ALL custom fonts from cloud for every reader/visitor
    getAllUserFontsFromCloud().then(async (cloudFonts) => {
      if (!cloudFonts || cloudFonts.length === 0) return;

      try {
        const currentIdbFonts = await getIdbFonts();
        const merged: StoredUserFont[] = [...currentIdbFonts];
        let updated = false;

        cloudFonts.forEach(cf => {
          const exists = merged.some(lf => lf.value === cf.value);
          if (!exists) {
            merged.push({
              value: cf.value,
              label: cf.name,
              styleId: `style-${cf.value}`,
              fontData: cf.fileData
            });
            updated = true;
          }
        });

        if (updated) {
          await saveIdbFonts(merged);
        }

        // Inject all merged fonts into document @font-face
        merged.forEach(font => {
          if (font.value && font.fontData) {
            injectFontFace(font);
          }
        });
      } catch (e) {
        console.warn('[Global Fonts] Error syncing cloud fonts:', e);
      }
    });
  }, []);

  // Global Anti-Enable-Copy & Chaotic Clipboard Scrambler Engine
  useEffect(() => {
    const cleanup = initAntiCopyProtection();
    return cleanup;
  }, []);

  // Listen to User Profile changes in Firestore
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null);
      return;
    }

    // Set default values from auth object
    setUserProfile({
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Độc giả',
      photoURL: currentUser.photoURL || '',
      chucu: 0,
      streak: 0,
    });

    // Realtime subscription to users/{uid} document
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: data.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Độc giả',
          photoURL: data.photoURL || currentUser.photoURL || '',
          chucu: typeof data.chucu === 'number' ? data.chucu : 0,
          streak: typeof data.streak === 'number' ? data.streak : 0,
          lastCheckInDate: data.lastCheckInDate || undefined,
          totalCheckIns: typeof data.totalCheckIns === 'number' ? data.totalCheckIns : 0,
          unlockedChapters: Array.isArray(data.unlockedChapters) ? data.unlockedChapters : [],
        });
      }
    }, (err) => {
      console.warn('Error fetching Firestore user profile:', err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to single user request or all requests (if admin)
  useEffect(() => {
    if (!currentUser) {
      setMyRequest(null);
      setAllRequests([]);
      return;
    }

    const unsubMyReq = subscribeMyEditorRequest(currentUser.uid, (req) => {
      setMyRequest(req);
    });

    const AUTHOR_EMAILS = ['askerhater21@gmail.com'];
    const isAdmin = currentUser.email && AUTHOR_EMAILS.some((e) => currentUser.email?.toLowerCase() === e.toLowerCase());
    let unsubAllReq = () => {};
    if (isAdmin) {
      unsubAllReq = subscribeAllEditorRequests((reqs) => {
        setAllRequests(reqs);
      });
    }

    return () => {
      unsubMyReq();
      unsubAllReq();
    };
  }, [currentUser]);

  // Tự động đồng bộ hóa dữ liệu từ LocalStorage lên Firestore khi đăng nhập thành công
  useEffect(() => {
    if (currentUser) {
      syncLocalToCloud();
    }
  }, [currentUser]);

  // Realtime Notifications subscription
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }
    const unsub = subscribeNotifications(currentUser.uid, (updatedNotifs) => {
      setNotifications(updatedNotifs);
    });
    return () => unsub();
  }, [currentUser]);

  // Realtime Firestore Subscriptions
  useEffect(() => {
    const handleError = (error: any) => {
      // Chỉ báo lỗi nếu là lỗi nghiêm trọng như chặn quyền
      if (error && error.message && (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions'))) {
        setCloudError('Quyền đọc/ghi dữ liệu bị chặn (Permission Denied). Hãy đảm bảo bạn đã dán quy tắc bảo mật từ file firestore.rules vào tab Rules của Firestore Database trên Firebase Console và nhấn Publish.');
      } else if (error && error.message) {
        setCloudError(`Lỗi kết nối Firebase: ${error.message}`);
      }
    };

    const unsubStories = subscribeStories((updatedStories) => {
      setStories(updatedStories);
    }, handleError);
    const unsubChapters = subscribeChapters((updatedChapters) => {
      setChapters(updatedChapters);
    }, handleError);
    const unsubComments = subscribeComments((updatedComments) => {
      setComments(updatedComments);
    }, handleError);
    const unsubLounge = subscribeLoungeMessages((updatedLounge) => {
      setLoungeMessages(updatedLounge);
    }, handleError);

    return () => {
      unsubStories();
      unsubChapters();
      unsubComments();
      unsubLounge();
    };
  }, []);

  // Lấy đường dẫn gốc (base path) nếu chạy trên GitHub Pages subfolder (ví dụ: /choco)
  const getBasePath = () => {
    if (typeof window === 'undefined') return '';
    if (window.location.hostname.includes('github.io')) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const appRoutes = ['home', 'browse', 'library', 'studio', 'games', 'truyen', 'story', 'tu-sach', 'xuong-viet', 'tro-choi', 'news', 'thong-bao'];
      if (parts.length > 0 && !appRoutes.includes(parts[0])) {
        return '/' + parts[0];
      }
    }
    return '';
  };

  // Hàm điều hướng URL sạch (Path routing, tương thích cả domain gốc lẫn GitHub Pages subfolder)
  const navigateTo = (path: string) => {
    const basePath = getBasePath();
    let target = path.startsWith('/') ? path : `/${path}`;
    if (basePath && !target.startsWith(basePath)) {
      target = `${basePath}${target}`;
    }
    if (window.location.pathname !== target || window.location.hash) {
      window.history.pushState(null, '', target);
      // Kích hoạt sự kiện popstate để cập nhật state ngay lập tức
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Điều hướng bằng URL sạch chuẩn HTML5 History (ví dụ: /home, /studio, /truyen/dem-dong-song-lai/chuong-1)
  useEffect(() => {
    const handleLocationChange = () => {
      const basePath = getBasePath();

      // Xử lý chuyển hướng từ 404.html của GitHub Pages (ví dụ: ?/studio hoặc ?%2Fstudio)
      if (window.location.search && (window.location.search.startsWith('?/') || window.location.search.startsWith('?%2F'))) {
        const rawSearch = decodeURIComponent(window.location.search.slice(1));
        const newCleanPath = (basePath ? `${basePath}` : '') + (rawSearch.startsWith('/') ? rawSearch : `/${rawSearch}`);
        window.history.replaceState(null, '', newCleanPath);
      }

      let rawHash = window.location.hash;

      // Nếu URL cũ đang có dấu # (do bookmark hoặc session cũ), tự động chuyển đổi sang URL sạch không có #
      if (rawHash) {
        let cleanFromHash = rawHash.replace(/^#\/?/, '');
        if (cleanFromHash === 'trang-chu' || cleanFromHash === 'browse') cleanFromHash = 'home';
        else if (cleanFromHash === 'tu-sach' || cleanFromHash === 'da-luu') cleanFromHash = 'library';
        else if (cleanFromHash === 'xuong-viet' || cleanFromHash === 'sang-tac') cleanFromHash = 'studio';
        else if (cleanFromHash === 'tro-choi') cleanFromHash = 'games';
        else if (cleanFromHash.startsWith('tro-choi/')) cleanFromHash = cleanFromHash.replace('tro-choi/', 'games/');

        const newCleanPath = (basePath ? `${basePath}` : '') + (cleanFromHash ? `/${cleanFromHash}` : '/home');
        window.history.replaceState(null, '', newCleanPath);
      }

      // Hỗ trợ trường hợp mở từ query params ?story=123 hoặc ?chapter=456
      if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('chapter')) {
          const chapId = params.get('chapter');
          window.history.replaceState(null, '', (basePath ? `${basePath}` : '') + `/truyen/chapter/${chapId}`);
        } else if (params.get('story')) {
          const storyId = params.get('story');
          window.history.replaceState(null, '', (basePath ? `${basePath}` : '') + `/truyen/${storyId}`);
        } else if (params.get('tab')) {
          const tabName = params.get('tab');
          window.history.replaceState(null, '', (basePath ? `${basePath}` : '') + `/${tabName}`);
        }
      }

      // Đọc đường dẫn từ pathname (loại bỏ basePath nếu có và dấu / ở đầu/cuối)
      let currentPath = window.location.pathname;
      if (basePath && currentPath.startsWith(basePath)) {
        currentPath = currentPath.slice(basePath.length);
      }
      let cleanRoute = currentPath.replace(/^\/+|\/+$/g, '');

      try {
        cleanRoute = decodeURIComponent(cleanRoute);
      } catch {
        // ignore
      }

      if (!cleanRoute || cleanRoute === 'browse' || cleanRoute === 'home' || cleanRoute === 'trang-chu') {
        setActiveTab('browse');
        setSelectedStory(null);
        setSelectedChapter(null);
        setSelectedGameId(null);
        return;
      }

      if (cleanRoute === 'library' || cleanRoute === 'tu-sach' || cleanRoute === 'da-luu') {
        setActiveTab('library');
        setSelectedStory(null);
        setSelectedChapter(null);
        setSelectedGameId(null);
        return;
      }

      if (cleanRoute === 'studio' || cleanRoute === 'xuong-viet' || cleanRoute === 'sang-tac') {
        setActiveTab('studio');
        setSelectedStory(null);
        setSelectedChapter(null);
        setSelectedGameId(null);
        return;
      }

      if (cleanRoute === 'news' || cleanRoute === 'thong-bao') {
        setActiveTab('news');
        setSelectedStory(null);
        setSelectedChapter(null);
        setSelectedGameId(null);
        return;
      }

      if (cleanRoute === 'rankings' || cleanRoute === 'bxh' || cleanRoute === 'bang-xep-hang' || cleanRoute === 'jjwxc') {
        setActiveTab('rankings');
        setSelectedStory(null);
        setSelectedChapter(null);
        setSelectedGameId(null);
        return;
      }

      if (cleanRoute.startsWith('games') || cleanRoute.startsWith('tro-choi')) {
        setActiveTab('games');
        setSelectedStory(null);
        setSelectedChapter(null);
        const parts = cleanRoute.split('/');
        if (parts.length > 1 && parts[1]) {
          const rawGame = parts[1];
          if (rawGame === 'block' || rawGame === 'block_blast' || rawGame === 'xep-gach') {
            setSelectedGameId('block');
          } else {
            setSelectedGameId(rawGame);
          }
        } else {
          setSelectedGameId(null);
        }
        return;
      }

      // Xử lý route truyện / đọc chương (ví dụ: truyen/dem-dong-song-lai, truyen/dem-dong-song-lai/chuong-1, story/123/chapter/456)
      if (cleanRoute.startsWith('truyen/') || cleanRoute.startsWith('story/') || cleanRoute.includes('chapter/')) {
        const parts = cleanRoute.split('/');
        let storyParam = '';
        let chapterParam = '';

        if (cleanRoute.startsWith('truyen/') || cleanRoute.startsWith('story/')) {
          storyParam = parts[1] || '';
          if (parts[2] === 'chapter') {
            chapterParam = parts[3] || '';
          } else if (parts[2]) {
            chapterParam = parts[2];
          }
        } else if (cleanRoute.includes('chapter/')) {
          const cIdx = parts.indexOf('chapter') + 1;
          chapterParam = parts[cIdx] || '';
        }

        let foundStory = (stories || []).find(s => s && s.title && (slugify(s.title) === storyParam || s.id === storyParam));

        // Nếu có thông tin chương
        if (chapterParam) {
          // Thử trích xuất số chương (ví dụ chuong-1 -> 1, chapter-2 -> 2)
          const matchNum = chapterParam.match(/(?:chuong|chapter)?-?(\d+)/i);
          const chapNum = matchNum ? parseInt(matchNum[1], 10) : null;

          let foundChap: Chapter | undefined;

          if (foundStory) {
            foundChap = (chapters || []).find(c => c && c.storyId === foundStory?.id && (
              (chapNum !== null && c.chapterNumber === chapNum) ||
              c.id === chapterParam ||
              (c.title && slugify(c.title) === chapterParam)
            ));
          } else {
            // Nếu chưa khớp truyện, tìm chương theo id hoặc slug toàn bộ
            foundChap = (chapters || []).find(c => c && (
              c.id === chapterParam || 
              (chapNum !== null && c.chapterNumber === chapNum) ||
              (c.title && slugify(c.title) === chapterParam)
            ));
            if (foundChap) {
              foundStory = (stories || []).find(s => s && s.id === foundChap?.storyId);
            }
          }

          if (foundChap && foundStory) {
            setSelectedStory(foundStory);
            setSelectedChapter(foundChap);
            setSelectedGameId(null);
            return;
          }
        }

        if (foundStory) {
          setSelectedStory(foundStory);
          setSelectedChapter(null);
          setSelectedGameId(null);
          return;
        }
      }

      // Mặc định về trang chủ nếu route không khớp
      setActiveTab('browse');
      setSelectedStory(null);
      setSelectedChapter(null);
      setSelectedGameId(null);
    };

    handleLocationChange();

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [stories, chapters]);

  // Đồng bộ selectedStory và selectedChapter khi danh sách dữ liệu cập nhật thời gian thực
  useEffect(() => {
    if (selectedStory) {
      const updated = stories.find(s => s.id === selectedStory.id);
      if (updated) {
        setSelectedStory(updated);
      }
    }
  }, [stories]);

  useEffect(() => {
    if (selectedChapter) {
      const updated = chapters.find(c => c.id === selectedChapter.id);
      if (updated) {
        setSelectedChapter(updated);
      }
    }
  }, [chapters]);

  const refreshData = () => {
    setStories(getStoriesLocal());
    setChapters(getChaptersLocal());
    setBookmarks(getBookmarks());
    setReadingHistory(getReadingHistory());
    setComments(getCommentsLocal());
    setLoungeMessages(getLoungeMessagesLocal());
  };


  // Story Selection Handler
  const handleSelectStory = (story: Story) => {
    if (!story) return;
    setSelectedStory(story);
    setSelectedChapter(null);
    setSelectedGameId(null);
    if (story.title) {
      navigateTo(`/truyen/${slugify(story.title)}`);
    } else {
      navigateTo(`/truyen/${story.id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chapter Selection Handler
  const handleSelectChapter = (chapter: Chapter) => {
    if (!chapter) return;
    const story = (stories || []).find(s => s && s.id === chapter.storyId);
    if (story) {
      setSelectedStory(story);
      setSelectedChapter(chapter);
      setSelectedGameId(null);
      incrementChapterViews(chapter.id, story.id);
      saveReadingProgress(story.id, chapter.id, chapter.chapterNumber);
      refreshData();
      if (story.title) {
        navigateTo(`/truyen/${slugify(story.title)}/chuong-${chapter.chapterNumber}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Bookmark Toggle Handler
  const handleToggleBookmark = async (e: React.MouseEvent | string, storyIdParam?: string) => {
    const targetStoryId = typeof e === 'string' ? e : storyIdParam;
    if (typeof e !== 'string') {
      e.stopPropagation();
    }
    if (!targetStoryId) return;

    await toggleBookmark(targetStoryId);
    refreshData();
  };

  // Save Story (Studio)
  const handleSaveStory = async (story: Story) => {
    try {
      await saveStory(story);
      if (selectedStory && selectedStory.id === story.id) {
        setSelectedStory(story);
      }
      setCloudError(null);
    } catch (err: any) {
      console.error(err);
      setCloudError('Không thể lưu câu chuyện lên Firestore. Hãy chắc chắn bạn đã kích hoạt Firestore Database và dán Rules. Chi tiết: ' + err.message);
    }
    refreshData();
  };

  // Delete Story (Studio)
  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      setCloudError(null);
      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
        setSelectedChapter(null);
      }
    } catch (err: any) {
      console.error(err);
      setCloudError('Không thể xóa câu chuyện trên Firestore. Chi tiết: ' + err.message);
    }
    refreshData();
  };

  // Save Chapter (Studio)
  const handleSaveChapter = async (chapter: Chapter) => {
    try {
      await saveChapter(chapter);
      setCloudError(null);
    } catch (err: any) {
      console.error(err);
      setCloudError('Không thể lưu chương lên Firestore. Hãy chắc chắn bạn đã kích hoạt Firestore Database và dán Rules. Chi tiết: ' + err.message);
    }
    refreshData();
  };

  // Save Batch Chapters (Bulk Upload)
  const handleSaveBatchChapters = async (batchChapters: Chapter[]) => {
    try {
      await saveMultipleChapters(batchChapters);
      setCloudError(null);
    } catch (err: any) {
      console.error(err);
      setCloudError('Không thể lưu hàng loạt chương lên Firestore. Chi tiết: ' + err.message);
    }
    refreshData();
  };

  // Delete Chapter (Studio)
  const handleDeleteChapter = async (chapterId: string, storyId: string) => {
    try {
      await deleteChapter(chapterId, storyId);
      setCloudError(null);
    } catch (err: any) {
      console.error(err);
      setCloudError('Không thể xóa chương trên Firestore. Chi tiết: ' + err.message);
    }
    refreshData();
  };

  // Add Comment Handler
  const handleAddComment = async (
    content: string, 
    chapterId?: string, 
    paragraphIndex?: number, 
    paragraphSnippet?: string,
    parentCommentId?: string,
    parentCommentAuthorUid?: string,
    reactions?: Record<string, string[]>
  ) => {
    if (!selectedStory) return;
    await addComment({
      storyId: selectedStory.id,
      chapterId,
      paragraphIndex,
      paragraphSnippet,
      parentCommentId,
      parentCommentAuthorUid,
      userName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Độc giả',
      userUid: currentUser?.uid,
      content,
      reactions,
    });
    refreshData();
  };

  const handleToggleCommentReaction = async (commentId: string, emojiId: string) => {
    await toggleCommentReaction(commentId, emojiId, currentUser?.uid);
    refreshData();
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    refreshData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    if (currentUser?.uid) {
      await markAllNotificationsAsRead(currentUser.uid);
    }
  };

  const handleNavigateNotification = (notif: Notification) => {
    const targetStory = stories.find(s => s.id === notif.storyId);
    if (!targetStory) return;

    setSelectedStory(targetStory);

    if (notif.chapterId) {
      const targetChap = chapters.find(c => c.id === notif.chapterId);
      if (targetChap) {
        setSelectedChapter(targetChap);
        incrementChapterViews(targetChap.id, targetStory.id);
        saveReadingProgress(targetStory.id, targetChap.id, targetChap.chapterNumber);
        refreshData();

        // Nếu có vị trí bình luận cụ thể, cuộn đến đó
        if (notif.paragraphIndex !== undefined) {
          setTimeout(() => {
            const element = document.getElementById(`para-${notif.paragraphIndex}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlight-flash');
              setTimeout(() => element.classList.remove('highlight-flash'), 3000);
            }
          }, 800);
        } else if (notif.commentId) {
          // Cuộn tới mục bình luận chung cuối chương
          setTimeout(() => {
            const element = document.getElementById('comments-section');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 800);
        }
      }
    } else {
      setSelectedChapter(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  const handleProfileUpdated = () => {
    if (auth.currentUser) {
      setCurrentUser({ ...auth.currentUser } as FirebaseUser);
    }
    refreshData();
  };

  const handleApplyEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingRequest(true);
    try {
      await submitEditorRequest(
        currentUser.uid, 
        currentUser.email || '', 
        currentUser.displayName || '', 
        requestExperience,
        requestContact
      );
      setRequestSuccessMessage('Yêu cầu xin quyền Editor của bạn đã được gửi thành công!');
      setRequestExperience('');
      setRequestContact('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Danh sách email Editor/Admin mặc định có quyền không cần xin
  const AUTHOR_EMAILS = ['askerhater21@gmail.com'];

  // Quyền đăng truyện: Phải là Admin HOẶC đã gửi yêu cầu xin quyền và được duyệt (approved)
  const canPost = Boolean(
    currentUser && (
      (currentUser.email && AUTHOR_EMAILS.some((e) => currentUser.email?.toLowerCase() === e.toLowerCase())) ||
      myRequest?.status === 'approved'
    )
  );

  const isAdmin = Boolean(
    currentUser &&
    currentUser.email &&
    AUTHOR_EMAILS.some((e) => currentUser.email?.toLowerCase() === e.toLowerCase())
  );

  // Filtered Stories Logic
  const filteredStories = (stories || []).filter(s => {
    if (!s) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title ? s.title.toLowerCase().includes(q) : false;
      const matchAuthor = s.author ? s.author.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchAuthor) return false;
    }
    return true;
  });

  const bookmarkedSet = new Set((bookmarks || []).map(b => b && b.storyId));

  const getStoryThemeClass = (story: Story | null) => {
    if (!story) {
      return siteTheme === 'choco-light'
        ? 'bg-[#fcf8f5] text-[#3d2314] selection:bg-[#f0e2d8] selection:text-[#3d2314]'
        : 'bg-[#080406] text-[#e0d0d5] selection:bg-[#3d1e2c] selection:text-white';
    }
    // Khi đang xem hoặc đọc truyện, màu nền và màu chữ được quản lý tuyệt đối theo theme của truyện qua style
    return '';
  };

  const getStoryBgStyle = (story: Story | null) => {
    if (!story) return undefined;
    const effective = getEffectiveStory(story);
    const hasSeparateTheme = !!(effective.useSeparateChapterTheme && selectedChapter);
    const toneKey = hasSeparateTheme
      ? (effective.chapterThemeTone || 'dark-rose')
      : (effective.themeTone || 'dark-rose');

    if (toneKey === 'custom') {
      const bg = hasSeparateTheme ? (effective.chapterCustomBgColor || '#080406') : (effective.customBgColor || '#080406');
      const text = hasSeparateTheme ? (effective.chapterCustomTextColor || '#f2e6ea') : (effective.customTextColor || '#f2e6ea');
      return { background: bg, color: text };
    }

    const presetGradients: Record<string, string> = {
      'gradient-choco-light': 'linear-gradient(135deg, #fffcfa 0%, #f7ebe1 50%, #ebd7c8 100%)',
      'gradient-rose': 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
      'gradient-midnight': 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
      'gradient-ocean': 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
      'gradient-emerald': 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
      'gradient-sunset': 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
      'gradient-cyber': 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
      'gradient-gold': 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #180801 100%)',
      'gradient-cherry': 'linear-gradient(135deg, #831843 0%, #500724 50%, #1f020d 100%)',
    };

    const activePreset = PRESET_THEME_COLORS[toneKey] || PRESET_THEME_COLORS['dark-rose'];
    const bg = presetGradients[toneKey] || activePreset?.bg || '#080406';
    const text = activePreset?.text || '#f2e6ea';
    return { background: bg, color: text };
  };

  return (
    <div 
      className={`min-h-screen font-['Alegreya',serif] text-base flex flex-col transition-colors duration-300 ${selectedStory ? 'preserve-story-theme' : ''} ${getStoryThemeClass(selectedStory)}`}
      style={getStoryBgStyle(selectedStory)}
    >
      {/* Header */}
      {!selectedChapter && (
        <Header
          siteTheme={siteTheme}
          onToggleSiteTheme={() => setSiteTheme(prev => prev === 'choco-dark' ? 'choco-light' : 'choco-dark')}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedStory(null);
            setSelectedChapter(null);
            setSelectedGameId(null);
            if (tab === 'browse') navigateTo('/home');
            else if (tab === 'library') navigateTo('/library');
            else if (tab === 'news') navigateTo('/news');
            else if (tab === 'studio') navigateTo('/studio');
            else if (tab === 'games') navigateTo('/games');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          bookmarkCount={bookmarks.length}
          currentUser={currentUser}
          canPost={canPost}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onLogout={handleLogout}
          onCheckInSuccess={(reward, newStreak, newBalance) => {
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                chucu: newBalance,
                streak: newStreak,
                lastCheckInDate: new Date().toISOString().split('T')[0],
                totalCheckIns: (userProfile.totalCheckIns || 0) + 1,
              });
            }
          }}
          userProfile={userProfile}
          currentStory={selectedStory}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onNavigateNotification={handleNavigateNotification}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {cloudError && (
          <div className="max-w-6xl mx-auto px-4 mt-4">
            <div className="bg-[#3e141a] border border-[#a2202f] p-4 text-xs font-mono-code text-[#ffccd1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider text-[#ff9aa6]">Lỗi đồng bộ đám mây (Firestore):</p>
                <p className="opacity-95 leading-relaxed">{cloudError}</p>
                <p className="text-[11px] text-[#ffccd1]/75 leading-relaxed mt-1">
                  <strong>Hướng dẫn sửa nhanh:</strong> Do bạn sử dụng dự án Firebase riêng (qua config thủ công), hệ thống không thể tự động đẩy mã bảo mật (Rules) lên cho bạn. Hãy copy toàn bộ nội dung tệp <code>firestore.rules</code> trong mã nguồn dự án này, sau đó truy cập <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-white">Firebase Console</a> của bạn → chọn mục <strong>Firestore Database</strong> → chọn tab <strong>Rules</strong> → dán đè nội dung vào và ấn nút <strong>Publish (Xuất bản)</strong> là kết nối sẽ thông suốt ngay lập tức!
                </p>
              </div>
              <button 
                onClick={() => setCloudError(null)}
                className="px-3 py-1 border border-[#a2202f] bg-[#230a0d] hover:bg-[#3e141a] transition text-[#ffccd1] text-[10px] uppercase font-bold whitespace-nowrap self-end sm:self-center"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {selectedChapter && selectedStory ? (
          /* Chapter Reader View */
          <ChapterReader
            story={getEffectiveStory(selectedStory)}
            chapter={selectedChapter}
            allChapters={(chapters || []).filter(c => c && c.storyId === selectedStory.id)}
            comments={(comments || []).filter(c => c && c.chapterId === selectedChapter.id)}
            currentUser={currentUser}
            userProfile={userProfile}
            isAdmin={isAdmin}
            isEditor={canPost}
            onSelectChapter={handleSelectChapter}
            onBackToStory={() => {
              setSelectedChapter(null);
              if (selectedStory) {
                if (selectedStory.title) {
                  navigateTo(`/truyen/${slugify(selectedStory.title)}`);
                } else {
                  navigateTo(`/truyen/${selectedStory.id}`);
                }
              } else {
                navigateTo('/home');
              }
            }}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onToggleCommentReaction={handleToggleCommentReaction}
            onUnlockChapter={async (chapterId, price, authorUid) => {
              if (!currentUser) return { success: false, error: 'Chưa đăng nhập' };
              try {
                const res = await unlockChapterWithChucu(currentUser.uid, chapterId, price, authorUid);
                if (res.success && userProfile) {
                  setUserProfile({
                    ...userProfile,
                    chucu: res.newBalance,
                    unlockedChapters: [...(userProfile.unlockedChapters || []), chapterId],
                  });
                }
                return {
                  success: res.success,
                  error: res.success ? undefined : res.message,
                  remainingChucu: res.newBalance,
                };
              } catch (err: any) {
                return { success: false, error: err.message || 'Lỗi hệ thống khi mở khóa chương.' };
              }
            }}
            onOpenRechargeModal={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setSelectedChapter(null);
                setSelectedStory(null);
                setActiveTab('home');
              }
            }}
          />
        ) : selectedStory ? (
          /* Story Detail View */
          <div 
            className={`w-full min-h-screen transition-colors duration-300 ${getStoryThemeClass(selectedStory)}`}
            style={getStoryBgStyle(selectedStory)}
          >
            <StoryDetail
              story={selectedStory}
              chapters={(chapters || []).filter(c => c && c.storyId === selectedStory.id)}
              comments={(comments || []).filter(c => c && c.storyId === selectedStory.id && !c.chapterId)}
              isBookmarked={bookmarkedSet.has(selectedStory.id)}
              userProfile={userProfile}
              currentUser={currentUser}
              isAdmin={isAdmin}
              isEditor={canPost}
              onToggleBookmark={(id) => handleToggleBookmark(id)}
              onSelectChapter={handleSelectChapter}
              onBack={() => {
                setSelectedStory(null);
                setSelectedChapter(null);
                if (activeTab === 'library') navigateTo('/library');
                else if (activeTab === 'studio') navigateTo('/studio');
                else if (activeTab === 'news') navigateTo('/news');
                else if (activeTab === 'games') navigateTo('/games');
                else if (activeTab === 'rankings') navigateTo('/bxh');
                else navigateTo('/home');
              }}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onToggleCommentReaction={handleToggleCommentReaction}
            />
          </div>
        ) : activeTab === 'library' ? (
          /* Saved Library View */
          <LibraryView
            stories={stories}
            chapters={chapters}
            bookmarks={bookmarks}
            readingHistory={readingHistory}
            onSelectStory={handleSelectStory}
            onSelectChapter={handleSelectChapter}
            onToggleBookmark={(e, id) => handleToggleBookmark(e, id)}
          />
        ) : activeTab === 'studio' ? (
          /* WordPress Post Editor / Studio */
          !currentUser ? (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 font-mono-code">
              <div className="bg-[#11090c] border border-[#2d1822] p-8 space-y-4">
                <h2 className="text-xl font-bold font-mono-code text-[#e0c0cc]">
                  Khu vực dành riêng cho Editor
                </h2>
                <p className="text-sm text-[#8a717a] font-mono-code">
                  Bạn cần đăng nhập bằng tài khoản Editor được cấp quyền để đăng truyện và quản lý.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-sm font-mono-code font-bold transition"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          ) : canPost ? (
            <div className="space-y-6">
              <StudioManager
                stories={stories}
                chapters={chapters}
                currentUser={currentUser}
                userProfile={userProfile}
                isAdmin={isAdmin}
                onSaveStory={handleSaveStory}
                onDeleteStory={handleDeleteStory}
                onSaveChapter={handleSaveChapter}
                onSaveBatchChapters={handleSaveBatchChapters}
                onDeleteChapter={handleDeleteChapter}
                onSelectStoryForDetail={handleSelectStory}
              />
              {isAdmin && (
                <div className="max-w-6xl mx-auto px-4 pb-12 font-mono-code text-[#e0d0d5] space-y-4">
                  <div className="bg-[#11090c] border border-[#2d1822] p-6 space-y-4">
                    <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc] border-b border-[#23151b] pb-2">
                      Hệ thống phê duyệt Editor ({(allRequests || []).filter(r => r && r.status === 'pending').length} đang chờ)
                    </h2>
                    {allRequests.length === 0 ? (
                      <div className="text-xs text-[#8a717a] py-4 text-center">
                        Chưa có yêu cầu xin quyền Editor nào được ghi nhận.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[#2d1822] text-[#8a717a]">
                              <th className="py-2 px-3">Tên người dùng</th>
                              <th className="py-2 px-3">Email</th>
                              <th className="py-2 px-3">Kinh nghiệm & Liên hệ</th>
                              <th className="py-2 px-3">Trạng thái</th>
                              <th className="py-2 px-3 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allRequests.map((req) => (
                              <tr key={req.id} className="border-b border-[#1b0d14] hover:bg-[#150a0f] transition">
                                <td className="py-2 px-3 font-semibold text-[#e0c0cc]">{req.displayName}</td>
                                <td className="py-2 px-3 text-[#8a717a]">{req.email}</td>
                                <td className="py-2 px-3 text-[#8a717a] max-w-xs">
                                  {req.experience ? (
                                    <div className="space-y-1">
                                      <div>
                                        <span className="text-[#8a717a] text-[10px] uppercase font-bold">Kinh nghiệm:</span>{' '}
                                        <span className="text-[#ffd6e2] font-semibold">{req.experience}</span>
                                      </div>
                                      {req.contact && (
                                        <div>
                                          <span className="text-[#8a717a] text-[10px] uppercase font-bold">Liên hệ:</span>{' '}
                                          <span className="text-[#e0c0cc] bg-[#221019] px-1 py-0.5 border border-[#3e1b2b] select-all">{req.contact}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-[#8a717a] text-[10px] uppercase font-bold">Lý do cũ:</span>{' '}
                                      <span className="italic text-[#8a717a]">{req.reason || 'Không có'}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                                    req.status === 'approved' 
                                      ? 'bg-[#152e20]/40 border-[#285e42] text-[#5eead4]'
                                      : req.status === 'rejected'
                                      ? 'bg-[#3b1219]/40 border-[#74222a] text-[#fca5a5]'
                                      : 'bg-[#2b1b10]/40 border-[#633a10] text-[#fdba74]'
                                  }`}>
                                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right space-x-2">
                                  {req.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => approveEditorRequest(req.userId)}
                                        className="px-2.5 py-1 bg-[#1c3b2b] border border-[#2d6648] hover:bg-[#254f3a] text-[#a7f3d0] transition font-bold text-[10px] uppercase tracking-wider"
                                      >
                                        Duyệt
                                      </button>
                                      <button
                                        onClick={() => rejectEditorRequest(req.userId)}
                                        className="px-2.5 py-1 bg-[#471b20] border border-[#7a2e36] hover:bg-[#5a2329] text-[#fecaca] transition font-bold text-[10px] uppercase tracking-wider"
                                      >
                                        Từ chối
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-xl mx-auto px-4 py-12 font-mono-code text-[#e0d0d5]">
              <div className="bg-[#11090c] border border-[#2d1822] p-8 space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-mono-code text-[#e0c0cc] uppercase tracking-wider">
                    Đăng ký làm Editor
                  </h2>
                  <p className="text-xs text-[#8a717a] mt-1">
                    Tài khoản của bạn hiện là độc giả bình thường và chưa có quyền đăng truyện. Hãy gửi yêu cầu làm Editor dưới đây.
                  </p>
                </div>

                {requestSuccessMessage && (
                  <div className="bg-[#152e20]/40 border border-[#285e42] p-3 text-xs text-[#a7f3d0]">
                    {requestSuccessMessage}
                  </div>
                )}

                {myRequest ? (
                  <div className="space-y-4 border-t border-[#1f1017] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8a717a]">Trạng thái yêu cầu:</span>
                      <span className={`px-2.5 py-0.5 border text-[10px] uppercase font-bold ${
                        myRequest.status === 'approved'
                          ? 'bg-[#152e20]/40 border-[#285e42] text-[#5eead4]'
                          : myRequest.status === 'rejected'
                          ? 'bg-[#3b1219]/40 border-[#74222a] text-[#fca5a5]'
                          : 'bg-[#2b1b10]/40 border-[#633a10] text-[#fdba74]'
                      }`}>
                        {myRequest.status === 'approved' ? 'Đã duyệt' : myRequest.status === 'rejected' ? 'Bị từ chối' : 'Đang chờ duyệt'}
                      </span>
                    </div>

                    <div className="bg-[#170d12] p-3 border border-[#2d1822] text-xs space-y-2">
                      <div>
                        <span className="text-[#8a717a]">Tài khoản:</span> <span className="text-[#e0c0cc]">{myRequest.displayName} ({myRequest.email})</span>
                      </div>
                      {myRequest.experience ? (
                        <>
                          <div>
                            <span className="text-[#8a717a]">Kinh nghiệm:</span> <span className="text-[#ffd6e2] font-semibold">{myRequest.experience}</span>
                          </div>
                          {myRequest.contact && (
                            <div>
                              <span className="text-[#8a717a]">Liên hệ:</span> <span className="text-[#e0c0cc] bg-[#221019] px-1 py-0.5 border border-[#3e1b2b]">{myRequest.contact}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        myRequest.reason && (
                          <div>
                            <span className="text-[#8a717a]">Lý do gửi cũ:</span> <span className="text-[#e0c0cc]">{myRequest.reason}</span>
                          </div>
                        )
                      )}
                      <div>
                        <span className="text-[#8a717a]">Ngày gửi:</span> <span className="text-[#e0c0cc]">{myRequest.createdAt}</span>
                      </div>
                    </div>

                    {myRequest.status === 'pending' && (
                      <p className="text-[11px] text-[#8a717a] italic text-center leading-relaxed">
                        Yêu cầu của bạn đang được Choco House xem xét. Vui lòng quay lại sau hoặc liên hệ Admin qua email để được duyệt nhanh.
                      </p>
                    )}

                    {myRequest.status === 'rejected' && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[11px] text-[#fca5a5] italic leading-relaxed">
                          Yêu cầu của bạn đã bị từ chối. Bạn có thể cập nhật thông tin và gửi lại yêu cầu mới bất kỳ lúc nào.
                        </p>
                        <form onSubmit={handleApplyEditor} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-[#8a717a] uppercase font-bold tracking-wider">Thông tin liên hệ (Discord/Facebook...):</label>
                            <input
                              type="text"
                              value={requestContact}
                              onChange={(e) => setRequestContact(e.target.value)}
                              placeholder="Nhập link Facebook hoặc ID Discord của bạn..."
                              className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingRequest}
                            className="w-full py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-xs font-bold uppercase tracking-wider transition font-mono-code"
                          >
                            {isSubmittingRequest ? 'Đang gửi...' : 'Gửi lại yêu cầu xin quyền'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleApplyEditor} className="space-y-4 border-t border-[#1f1017] pt-4">
                    <div className="space-y-1">
                      <span className="text-xs text-[#8a717a] block">Tài khoản ứng tuyển:</span>
                      <span className="text-xs text-[#e0c0cc] font-bold block bg-[#170d12] border border-[#2d1822] p-2">
                        {currentUser.displayName || currentUser.email?.split('@')[0]} ({currentUser.email})
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-[#8a717a] block font-mono-code font-bold">Thông tin liên hệ (Discord/Facebook...):</label>
                      <input
                        type="text"
                        value={requestContact}
                        onChange={(e) => setRequestContact(e.target.value)}
                        placeholder="Ví dụ: Discord: myusername#1234, FB: facebook.com/myprofile..."
                        className="w-full bg-[#170d12] border border-[#2d1822] p-2.5 text-xs text-[#e0c0cc] placeholder-[#6e5860] focus:outline-none focus:border-[#522d3d] font-mono-code"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="w-full py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-xs font-bold uppercase tracking-wider transition font-mono-code"
                    >
                      {isSubmittingRequest ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu xin quyền Editor'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        ) : activeTab === 'news' ? (
          <NewsHub currentUser={currentUser} userProfile={userProfile} isEditor={canPost} />
        ) : activeTab === 'games' ? (
          <GamesHub
            currentUser={currentUser}
            userProfile={userProfile}
            selectedGameId={selectedGameId}
            onSelectGame={(gameId) => {
              setSelectedGameId(gameId);
              if (gameId) {
                navigateTo(`/games/${gameId}`);
              } else {
                navigateTo('/games');
              }
            }}
          />
        ) : activeTab === 'rankings' ? (
          <JjwxcRankingsHub
            stories={stories}
            onSelectStory={handleSelectStory}
            onNavigateHome={() => {
              setActiveTab('browse');
              navigateTo('/home');
            }}
          />
        ) : (
          /* Home Browse View with 4 Sections: Lounge, Ranking, Comments, All Stories */
          <HomeView
            stories={stories}
            chapters={chapters}
            comments={comments}
            loungeMessages={loungeMessages}
            searchQuery={searchQuery}
            bookmarkedSet={bookmarkedSet}
            currentUser={currentUser}
            canPost={canPost}
            onSelectStory={handleSelectStory}
            onSelectChapter={handleSelectChapter}
            onToggleBookmark={(e, id) => handleToggleBookmark(e, id)}
            onNavigateStudio={() => {
              setActiveTab('studio');
              setSelectedStory(null);
              setSelectedChapter(null);
              setSelectedGameId(null);
              navigateTo('/studio');
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onCheckInSuccess={(reward, newStreak, newBalance) => {
              if (userProfile) {
                setUserProfile({
                  ...userProfile,
                  chucu: newBalance,
                  streak: newStreak,
                  lastCheckInDate: new Date().toISOString().split('T')[0],
                  totalCheckIns: (userProfile.totalCheckIns || 0) + 1,
                });
              }
            }}
            userProfile={userProfile}
          />
        )}
      </div>


      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
        userProfile={userProfile}
      />

      {/* Footer */}
      {!selectedChapter && <Footer />}
    </div>
  );
}
