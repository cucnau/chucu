import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { X, User, Lock, Upload, Save, Flame, Calendar } from 'lucide-react';
import { UserProfile } from '../types';
import { updateUserDataEverywhere } from '../lib/storage';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
  userProfile: UserProfile | null;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  userProfile,
}) => {
  const currentUser = auth.currentUser;
  
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state when modal is opened and userProfile is available
  useEffect(() => {
    if (isOpen && userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoURL(userProfile.photoURL || '');
    } else if (isOpen && currentUser) {
      setDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
      setPhotoURL('');
    }
  }, [isOpen, userProfile, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for firestore/auth base64 size safety
        setErrorMsg('Kích thước ảnh đại diện không được vượt quá 1MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const trimmedName = displayName.trim();

      // 1. Cập nhật đồng bộ tên người dùng & avatar ở mọi nơi (users, stories, comments, lounge_messages, editor_requests)
      await updateUserDataEverywhere(
        currentUser.uid,
        trimmedName,
        photoURL,
        currentUser.email || ''
      );

      // 2. Cập nhật Display Name trong Firebase Auth
      await updateProfile(currentUser, {
        displayName: trimmedName,
      });

      // 3. Update Password if specified
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error('Mật khẩu mới phải dài ít nhất 6 ký tự.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp.');
        }
        await updatePassword(currentUser, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      // Reload auth state
      await currentUser.reload();
      setSuccessMsg('Cập nhật tài khoản và đồng bộ tên ở mọi nơi thành công!');
      onProfileUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setErrorMsg('Để đổi mật khẩu, vui lòng đăng xuất và đăng nhập lại trước khi thực hiện.');
      } else {
        setErrorMsg(err.message || 'Có lỗi xảy ra khi cập nhật tài khoản.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#11090c] border border-[#3d202e] w-full max-w-md max-h-[90vh] flex flex-col relative font-mono-code text-[#e0d0d5] shadow-2xl my-auto">
        
        {/* Sticky Header with Close Button */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2d1822] bg-[#150a0f] shrink-0">
          <div>
            <h2 className="text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#ffd6e2]">
              Cài đặt tài khoản
            </h2>
            <p className="text-[11px] text-[#8a717a] mt-0.5 font-mono-code">
              Thay đổi ảnh đại diện, tên hiển thị và mật khẩu.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a717a] hover:text-white p-1 transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* Chucu & Streak Overview Box */}
          <div className="grid grid-cols-2 gap-3 bg-[#180c12] border border-[#2d1822] p-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8a717a] uppercase">
                <span>Ví Chucu</span>
              </span>
              <p className="text-base font-bold text-[#e0c0cc]">
                {(userProfile?.chucu || 0).toLocaleString('vi-VN')} Chucu
              </p>
            </div>

            <div className="space-y-1 border-l border-[#2d1822] pl-3">
              <span className="text-[10px] text-[#8a717a] uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#c89666]" />
                <span>Chuỗi Streak</span>
              </span>
              <p className="text-base font-bold text-[#c89666]">
                {userProfile?.streak || 0} ngày
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div className="bg-[#2a131f] border border-[#59283f] p-2.5 text-xs text-[#f2c0ce] font-mono-code">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-[#152e20]/40 border border-[#285e42] p-2.5 text-xs text-[#a7f3d0] font-mono-code">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 font-mono-code text-xs">
            {/* Avatar Settings */}
            <div className="space-y-2">
              <label className="text-[#8a717a] block font-mono-code font-bold uppercase tracking-wider text-[10px]">
                Ảnh đại diện (Avatar):
              </label>
              <div className="flex items-center gap-4 bg-[#170d12] border border-[#2d1822] p-3">
                <div className="shrink-0 border border-[#3d202e] w-14 h-14 bg-black rounded-full overflow-hidden flex items-center justify-center">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#6e5860]" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-xs text-[#8a717a]
                      file:mr-3 file:py-1 file:px-2
                      file:border file:border-[#5e2f46]
                      file:text-[10px] file:font-semibold file:uppercase
                      file:bg-[#2b1620] file:text-[#e0c0cc]
                      hover:file:bg-[#3d1e2c] file:cursor-pointer"
                  />
                  <p className="text-[9px] text-[#6e5860]">Dung lượng tối đa 1MB.</p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-[#8a717a] block font-mono-code font-bold uppercase tracking-wider text-[10px]">
                Tên hiển thị:
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị mới..."
                className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                required
              />
            </div>

            <div className="border-t border-[#2d1822] my-2 pt-2">
              <p className="text-[10px] text-[#8a717a] uppercase font-bold tracking-wider mb-2">Thay đổi mật khẩu (Để trống nếu không đổi):</p>
            </div>

            {/* New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#8a717a] block text-[10px]">Mật khẩu mới:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#8a717a] block text-[10px]">Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#f2e6ea] focus:outline-none focus:border-[#522d3d] font-mono-code choco-input"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-white text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 mt-2"
            >
              {isLoading ? (
                <span>Đang lưu cài đặt...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
