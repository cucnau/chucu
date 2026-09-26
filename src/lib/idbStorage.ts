/**
 * IndexedDB & Safe LocalStorage Storage Engine for Choco House
 * Giải quyết triệt để lỗi QuotaExceededError (5MB limit của LocalStorage)
 * Cho phép lưu trữ không giới hạn Font chữ tùy chỉnh và hàng nghìn chương truyện lớn.
 */

const DB_NAME = 'ChocoHouse_IDB';
const DB_VERSION = 1;

export interface StoredUserFont {
  value: string;
  label: string;
  styleId: string;
  fontData: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('fonts')) {
          db.createObjectStore('fonts', { keyPath: 'value' });
        }
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kv_store')) {
          db.createObjectStore('kv_store');
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

// ---------------------- FONT STORAGE (INDEXEDDB) ----------------------

export async function getIdbFonts(): Promise<StoredUserFont[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction('fonts', 'readonly');
      const store = tx.objectStore('fonts');
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('[IDB] Không thể đọc fonts từ IndexedDB:', err);
    return [];
  }
}

export async function saveIdbFonts(fonts: StoredUserFont[]): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('fonts', 'readwrite');
      const store = tx.objectStore('fonts');
      store.clear();
      fonts.forEach((f) => store.put(f));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Không thể lưu fonts vào IndexedDB:', err);
  }
}

export async function deleteIdbFont(fontValue: string): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction('fonts', 'readwrite');
      const store = tx.objectStore('fonts');
      store.delete(fontValue);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

/**
 * Tự động di chuyển fonts từ localStorage sang IndexedDB để giải phóng 5MB bộ nhớ localStorage
 */
export async function migrateLocalStorageFonts(): Promise<StoredUserFont[]> {
  if (typeof window === 'undefined') return [];

  try {
    // 1. Đọc font từ IndexedDB trước
    const idbFonts = await getIdbFonts();

    // 2. Kiểm tra xem localStorage có font cũ không
    const rawLocal = localStorage.getItem('user_uploaded_fonts');
    if (rawLocal) {
      try {
        const localFonts: StoredUserFont[] = JSON.parse(rawLocal);
        if (Array.isArray(localFonts) && localFonts.length > 0) {
          const merged = [...idbFonts];
          localFonts.forEach((lf) => {
            if (lf.value && lf.fontData && !merged.some((m) => m.value === lf.value)) {
              merged.push(lf);
            }
          });
          // Lưu vào IndexedDB
          await saveIdbFonts(merged);
          // XÓA NGAY KHỎI LOCALSTORAGE ĐỂ TRÁNH QUOTAEXCEEDEDERROR
          localStorage.removeItem('user_uploaded_fonts');
          console.log('[IDB] Đã dọn dẹp và di chuyển fonts sang IndexedDB thành công!');
          return merged;
        }
      } catch {}
      // Xóa nếu parse lỗi hoặc đã xử lý xong
      localStorage.removeItem('user_uploaded_fonts');
    }

    return idbFonts;
  } catch (err) {
    console.warn('[IDB] Lỗi khi di chuyển fonts:', err);
    return [];
  }
}

// ---------------------- SAFE LOCALSTORAGE WRAPPER ----------------------

/**
 * Ghi an toàn vào LocalStorage, tự động bắt QuotaExceededError mà không làm gián đoạn chương trình.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] LocalStorage bị đầy khi lưu "${key}" (QuotaExceededError). Đang tối ưu dọn dẹp...`, err);

    // Bước 1: Dọn dẹp các key nặng không cần thiết trong localStorage nếu còn sót
    try {
      localStorage.removeItem('user_uploaded_fonts');
      localStorage.removeItem('user_custom_fonts');
      // Thử lưu lại
      localStorage.setItem(key, value);
      return true;
    } catch {
      // Nếu vẫn đầy
      if (key === 'wp_chapters_v4') {
        try {
          // Lưu phiên bản tóm tắt (rút gọn nội dung) vào localStorage để làm index
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            // Giữ lại 30 chương gần nhất hoặc rút gọn text dài
            const trimmed = parsed.map((c: any) => ({
              ...c,
              content: typeof c.content === 'string' && c.content.length > 1000 ? c.content.substring(0, 1000) + '...' : c.content
            }));
            localStorage.setItem(key, JSON.stringify(trimmed));
            return true;
          }
        } catch {}
      }
      console.warn(`[SafeStorage] Bỏ qua ghi LocalStorage cho key "${key}" để không crash ứng dụng.`);
      return false;
    }
  }
}

export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
