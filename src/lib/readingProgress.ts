import { ReadingProgress } from '../types';

const STORAGE_KEY_PREFIX = 'chucu_reading_pos_';

/**
 * Lưu vị trí đọc dở của người dùng vào localStorage.
 */
export function saveReadingProgress(
  storyId: string,
  chapterId: string,
  chapterTitle: string,
  chapterNumber: number,
  scrollY: number,
  progressPercent: number
): void {
  if (!storyId || !chapterId) return;

  const progress: ReadingProgress = {
    storyId,
    chapterId,
    chapterTitle,
    chapterNumber,
    scrollY,
    progressPercent,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${storyId}`, JSON.stringify(progress));
  } catch (err) {
    console.warn('Không thể lưu tiến trình đọc dở:', err);
  }
}

/**
 * Lấy vị trí đọc dở của một bộ truyện từ localStorage.
 */
export function getReadingProgress(storyId: string): ReadingProgress | null {
  if (!storyId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storyId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ReadingProgress;
  } catch (err) {
    return null;
  }
}

/**
 * Lấy tất cả tiến trình đọc dở của các truyện.
 */
export function getAllReadingProgress(): Record<string, ReadingProgress> {
  const result: Record<string, ReadingProgress> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const storyId = key.replace(STORAGE_KEY_PREFIX, '');
        const raw = localStorage.getItem(key);
        if (raw) {
          result[storyId] = JSON.parse(raw);
        }
      }
    }
  } catch (err) {
    console.warn('Lỗi khi đọc toàn bộ tiến trình đọc:', err);
  }
  return result;
}
