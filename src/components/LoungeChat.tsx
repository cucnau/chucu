import React, { useState, useRef, useEffect } from 'react';
import { LoungeMessage } from '../types';
import { sendLoungeMessage } from '../lib/storage';
import { MessageSquare, Send, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface LoungeChatProps {
  messages: LoungeMessage[];
  currentUser: FirebaseUser | null;
  onOpenAuthModal: () => void;
  userProfile: { displayName: string; photoURL: string } | null;
}

const renderContentWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="lounge-link forum-link text-[#c026d3] dark:text-[#e879f9] hover:underline hover:text-[#9333ea] dark:hover:text-[#fbcfe8] transition duration-150 break-all inline font-bold"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export const LoungeChat: React.FC<LoungeChatProps> = ({
  messages,
  currentUser,
  onOpenAuthModal,
  userProfile,
}) => {
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !inputContent.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendLoungeMessage(
        inputContent.trim(),
        userProfile?.displayName,
        userProfile?.photoURL
      );
      setInputContent('');
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#11090c] border border-[#2d1822] flex flex-col h-[420px] font-mono-code shadow-lg">
      {/* Lounge Header */}
      <div className="p-3 bg-[#170d12] border-b border-[#2d1822] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8a4260] animate-pulse"></div>
          <h2 className="font-mono-code font-bold text-[#e0c0cc] text-xs uppercase tracking-[0.15em] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#d0a0b0]" />
            <span>Trò chuyện</span>
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#8a717a] font-mono-code uppercase tracking-wider">
          <span>{messages.length} tin nhắn</span>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-[#3d1e2c]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#8a717a] font-mono-code">
            Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = currentUser && msg.userUid === currentUser.uid;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start text-xs ${
                  isMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {msg.userPhoto ? (
                    <img
                      src={msg.userPhoto}
                      alt={msg.userName}
                      className="w-7 h-7 rounded-full object-cover border border-[#3d1e2c]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#2b1620] border border-[#5e2f46] flex items-center justify-center text-[#ffd6e2] font-bold text-[11px] uppercase font-mono-code">
                      {msg.userName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-[80%] space-y-0.5 ${
                    isMe ? 'text-right' : 'text-left'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-[#8a717a] px-1">
                    <span className="font-bold text-[#d0a0b0] font-mono-code">
                      {msg.userName}
                    </span>
                    <span>•</span>
                    <span className="text-[10px]">{msg.createdAt}</span>
                  </div>

                  <div
                    className={`p-2.5 text-xs font-mono-code leading-relaxed ${
                      isMe
                        ? 'bg-[#3d1e2c] text-[#ffd6e2] border border-[#5e2f46]'
                        : 'bg-[#180e14] text-[#e0d0d5] border border-[#2d1822]'
                    }`}
                  >
                    {renderContentWithLinks(msg.content)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Form */}
      {currentUser ? (
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-[#170d12] border-t border-[#2d1822] space-y-2 shrink-0"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-[#10080c] border border-[#2d1822] px-3 py-2 text-xs font-mono-code text-[#e0c0cc] placeholder-[#6e5860] focus:outline-none focus:border-[#522d3d]"
            />
            <button
              type="submit"
              disabled={!inputContent.trim() || isSending}
              className="px-4 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] disabled:opacity-50 border border-[#5e2f46] text-[#e0c0cc] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-[#170d12] border-t border-[#2d1822] flex items-center justify-between gap-3 text-xs text-[#8a717a] shrink-0 font-mono-code">
          <span>Bạn cần đăng nhập để tham gia trò chuyện</span>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] font-bold transition flex items-center gap-1 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
        </div>
      )}
    </div>
  );
};
