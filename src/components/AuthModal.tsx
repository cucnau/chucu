import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, auth } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { LogIn, UserPlus, X, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // States for setting password on first Google Sign-In
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [googlePassword, setGooglePassword] = useState('');
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.isNewUser) {
        setShowSetPassword(true);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể đăng nhập bằng Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetGooglePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googlePassword) {
      setErrorMsg('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (googlePassword.length < 6) {
      setErrorMsg('Mật khẩu phải dài ít nhất 6 ký tự.');
      return;
    }
    if (googlePassword !== googleConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, googlePassword);
        // Clear inputs
        setGooglePassword('');
        setGoogleConfirmPassword('');
        setShowSetPassword(false);
        onClose();
      } else {
        throw new Error('Không tìm thấy phiên đăng nhập hiện tại.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi thiết lập mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!displayName) {
          setErrorMsg('Vui lòng nhập tên hiển thị.');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Sai email hoặc mật khẩu.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email này đã được sử dụng.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Mật khẩu phải từ 6 ký tự trở lên.');
      } else {
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#11090c] border border-[#3d202e] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative space-y-5 font-mono-code text-[#e0d0d5] shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setShowSetPassword(false);
            onClose();
          }}
          className="absolute top-4 right-4 text-[#8a717a] hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {showSetPassword ? (
          <>
            {/* Password Setup View for Google First-time login */}
            <div className="border-b border-[#2d1822] pb-3">
              <div className="flex items-center gap-2 text-[#ffd6e2]">
                <Lock className="w-4 h-4 text-[#ffd6e2]" />
                <h2 className="text-sm font-bold font-mono-code uppercase tracking-[0.15em]">
                  Thiết lập mật khẩu
                </h2>
              </div>
              <p className="text-xs text-[#8a717a] mt-1.5 leading-relaxed font-mono-code">
                Chào mừng thành viên mới! Hãy thiết lập mật khẩu riêng cho tài khoản Google của bạn để có thể sử dụng tính năng đăng nhập bằng email & mật khẩu bất cứ lúc nào.
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="bg-[#2a131f] border border-[#59283f] p-2.5 text-xs text-[#f2c0ce] font-mono-code">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSetGooglePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#8a717a]">Mật khẩu mới (ít nhất 6 ký tự):</label>
                <input
                  type="password"
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a]">Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  value={googleConfirmPassword}
                  onChange={(e) => setGoogleConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#5e2f46] hover:bg-[#733351] border border-[#8a4264] text-white text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Đang lưu...' : 'Lưu mật khẩu & Bắt đầu'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSetPassword(false);
                    onClose();
                  }}
                  className="w-full py-2 text-center text-xs text-[#8a717a] hover:text-[#d0a0b0] hover:underline transition"
                >
                  Bỏ qua thiết lập mật khẩu
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Modal Title */}
            <div className="border-b border-[#2d1822] pb-3">
              <h2 className="text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#ffd6e2]">
                {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập vào CHOCO HOUSE'}
              </h2>
              <p className="text-xs text-[#8a717a] mt-0.5 font-mono-code">
                Đăng nhập để đồng bộ dữ liệu, bài đăng và bình luận.
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="bg-[#2a131f] border border-[#59283f] p-2.5 text-xs text-[#f2c0ce] font-mono-code">
                {errorMsg}
              </div>
            )}

            {/* Quick Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1a0e14] hover:bg-[#2b1620] border border-[#5e2f46] text-white text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#d0a0b0]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>Đăng nhập nhanh bằng Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#8a717a] font-mono-code">
              <div className="flex-1 h-px bg-[#2d1822]"></div>
              <span>hoặc dùng Email</span>
              <div className="flex-1 h-px bg-[#2d1822]"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEmail} className="space-y-3 font-mono-code">
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-xs text-[#8a717a]">Tên hiển thị:</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Nam..."
                    className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a]">Địa chỉ Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a]">Mật khẩu:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-white text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
              >
                {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</span>
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center pt-2 border-t border-[#2d1822]">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-xs text-[#d0a0b0] hover:underline"
              >
                {isRegister
                  ? 'Đã có tài khoản? Đăng nhập ngay'
                  : 'Chưa có tài khoản? Đăng ký ngay'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
