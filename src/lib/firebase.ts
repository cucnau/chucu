import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  User,
  getAdditionalUserInfo
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Thiết lập LocalStorage để duy trì phiên đăng nhập bền vững trong môi trường iframe, loại bỏ lỗi đóng IndexedDB
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Không thể cấu hình LocalStorage cho Auth:', err);
});

// Khởi tạo Firestore với chế độ tự động Long-Polling để khắc phục lỗi chặn WebChannel/gRPC stream trong iframe và môi trường sandbox
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const additionalInfo = getAdditionalUserInfo(result);
    return {
      user: result.user,
      isNewUser: additionalInfo ? additionalInfo.isNewUser : false
    };
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error('Lỗi đăng nhập Email:', error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, name: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user && name) {
      await updateProfile(result.user, { displayName: name });
    }
    return result.user;
  } catch (error) {
    console.error('Lỗi đăng ký Email:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    throw error;
  }
}

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Vui lòng kiểm tra cấu hình Firebase.");
    }
  }
}
testConnection();
