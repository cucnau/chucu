import React, { useState } from 'react';
import { CUSTOM_EMOJIS, getEmojiById } from '../config/emojis';
import { Comment } from '../types';
import { Smile, Plus } from 'lucide-react';

export const resolveEmojiSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;

  // Lấy base path tuyệt đối động dựa trên hostname giống như App.tsx để tránh lỗi 404 khi truy cập đường dẫn sâu (deep routing)
  let basePath = '';
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('github.io')) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const appRoutes = [
        'home', 'browse', 'library', 'studio', 'games', 'truyen', 'story', 
        'tu-sach', 'xuong-viet', 'tro-choi', 'news', 'thong-bao'
      ];
      if (parts.length > 0 && !appRoutes.includes(parts[0])) {
        basePath = '/' + parts[0];
      }
    }
  }

  return `${basePath}/${cleanSrc}`;
};

interface EmojiImageProps {
  id: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const EmojiImage: React.FC<EmojiImageProps> = ({ id, size = 'md', className = '', alt }) => {
  const [hasError, setHasError] = useState(false);
  const emoji = getEmojiById(id);

  const dimensions = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-10 h-10 text-2xl',
    xl: 'w-14 h-14 text-4xl',
  }[size];

  if (hasError) {
    return (
      <span className={`inline-block align-middle select-none ${dimensions} ${className}`} title={alt || emoji.name}>
        {emoji.fallbackIcon}
      </span>
    );
  }

  return (
    <img
      src={resolveEmojiSrc(emoji.src)}
      alt={alt || emoji.name}
      title={alt || emoji.name}
      onError={() => setHasError(true)}
      className={`inline-block align-middle object-contain ${dimensions} ${className}`}
    />
  );
};

interface FormattedCommentContentProps {
  content: string;
  className?: string;
}

export const FormattedCommentContent: React.FC<FormattedCommentContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Regex phát hiện cả link (http/https/www) lẫn cú pháp emoji (:emoji_id:)
  const urlAndEmojiRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|:[a-zA-Z0-9_-]+:)/g;
  const parts = content.split(urlAndEmojiRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(/^(https?:\/\/[^\s]+|www\.[^\s]+)$/)) {
          const href = part.startsWith('www.') ? `https://${part}` : part;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="comment-link forum-link text-[#c026d3] dark:text-[#e879f9] font-bold underline underline-offset-2 hover:text-[#9333ea] dark:hover:text-[#fbcfe8] transition duration-150 break-all inline"
            >
              {part}
            </a>
          );
        } else if (part.startsWith(':') && part.endsWith(':')) {
          const emojiId = part.slice(1, -1);
          return <EmojiImage key={index} id={emojiId} className="mx-0.5 inline-block align-middle" />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

interface EmojiPickerProps {
  onSelectEmoji: (emojiId: string) => void;
  onClose?: () => void;
  className?: string;
  buttonStyle?: React.CSSProperties;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose, className = '', buttonStyle }) => {
  return (
    <div
      className={`p-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl z-50 grid grid-cols-6 gap-1.5 w-[260px] max-h-[220px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${className}`}
      style={buttonStyle}
    >
      {CUSTOM_EMOJIS.map((emoji) => (
        <button
          key={emoji.id}
          type="button"
          onClick={() => {
            onSelectEmoji(emoji.id);
            if (onClose) onClose();
          }}
          className="p-1 rounded-lg hover:bg-slate-700/60 active:scale-95 transition flex items-center justify-center cursor-pointer group"
          title={emoji.name}
        >
          <EmojiImage id={emoji.id} size="lg" className="group-hover:scale-110 transition-transform" />
        </button>
      ))}
    </div>
  );
};

interface QuickEmojiBarProps {
  onReact: (emojiId: string) => void;
  className?: string;
  label?: string;
  styleMuted?: React.CSSProperties;
  currentUserUid?: string;
  activeReactions?: Record<string, string[]>;
}

export const QuickEmojiBar: React.FC<QuickEmojiBarProps> = ({
  onReact,
  className = '',
  label = 'Thả cảm xúc nhanh:',
  styleMuted,
  currentUserUid,
  activeReactions = {},
}) => {
  const effectiveUid = currentUserUid || 'anonymous_guest';

  return (
    <div className={`py-1.5 space-y-1.5 ${className}`}>
      {label && (
        <span className="text-[11px] font-semibold opacity-85 block tracking-wide select-none" style={styleMuted}>
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {CUSTOM_EMOJIS.map((emoji) => {
          const uids: string[] = Array.isArray(activeReactions[emoji.id]) ? activeReactions[emoji.id] : [];
          const count = uids.length;
          const hasReacted = uids.includes(effectiveUid);

          return (
            <button
              key={emoji.id}
              type="button"
              onClick={() => onReact(emoji.id)}
              className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs transition-all cursor-pointer select-none border active:scale-95 ${
                hasReacted
                  ? 'bg-amber-500/25 border-amber-500/70 text-amber-300 font-bold shadow-xs scale-105'
                  : count > 0
                  ? 'bg-black/15 hover:bg-black/30 border-slate-600/60 text-slate-200'
                  : 'bg-black/5 hover:bg-black/20 border-slate-600/30 opacity-80 hover:opacity-100 hover:border-slate-400/60'
              }`}
              title={`${emoji.name}${count > 0 ? ` (${count} lượt)` : ''}`}
            >
              <EmojiImage id={emoji.id} size="sm" />
              {count > 0 && <span className="text-[10px] font-mono font-bold">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface EmojiPickerButtonProps {
  onSelectEmoji: (emojiId: string) => void;
  buttonClassName?: string;
  iconClassName?: string;
}

export const EmojiPickerButton: React.FC<EmojiPickerButtonProps> = ({ onSelectEmoji, buttonClassName = '', iconClassName = 'w-4 h-4' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded hover:bg-black/10 transition cursor-pointer flex items-center justify-center ${buttonClassName}`}
        title="Chèn Emoji cá nhân"
      >
        <Smile className={iconClassName} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker
              onSelectEmoji={(emojiId) => {
                onSelectEmoji(emojiId);
                setIsOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

interface CommentReactionsProps {
  comment: Comment;
  currentUserUid?: string;
  onToggleReaction?: (commentId: string, emojiId: string) => void;
  styleMuted?: React.CSSProperties;
  borderColor?: string;
}

interface ReactionSummaryProps {
  reactions?: Record<string, string[]>;
  currentUserUid?: string;
  onToggleReaction: (emojiId: string) => void;
  styleMuted?: React.CSSProperties;
}

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  reactions = {},
  currentUserUid,
  onToggleReaction,
  styleMuted,
}) => {
  const effectiveUid = currentUserUid || 'anonymous_guest';

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 relative">
      {/* List of all available emojis */}
      {CUSTOM_EMOJIS.map((emoji) => {
        const uids: string[] = Array.isArray(reactions[emoji.id]) ? reactions[emoji.id] : [];
        const count = uids.length;
        const hasReacted = uids.includes(effectiveUid);

        return (
          <button
            key={emoji.id}
            type="button"
            onClick={() => onToggleReaction(emoji.id)}
            className={`inline-flex items-center gap-1.5 p-1.5 rounded-xl text-sm transition-all cursor-pointer select-none border active:scale-95 ${
              hasReacted
                ? 'bg-amber-500/25 border-amber-500/80 text-amber-300 font-bold shadow-xs scale-105'
                : count > 0
                ? 'bg-black/20 hover:bg-black/35 border-slate-600/70 text-slate-200'
                : 'bg-black/5 hover:bg-black/15 border-slate-600/20 opacity-60 hover:opacity-100 hover:border-slate-400/40'
            }`}
            title={`${emoji.name}${count > 0 ? ` (${count} lượt)` : ''}`}
          >
            <EmojiImage id={emoji.id} size="lg" />
            {count > 0 && <span className="text-xs font-mono font-bold px-0.5">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const CommentReactions: React.FC<CommentReactionsProps> = ({
  comment,
  currentUserUid,
  onToggleReaction,
  styleMuted,
  borderColor,
}) => {
  if (!onToggleReaction) return null;
  return (
    <div className="mt-1">
      <ReactionSummary
        reactions={comment.reactions}
        currentUserUid={currentUserUid}
        onToggleReaction={(emojiId) => onToggleReaction(comment.id, emojiId)}
        styleMuted={styleMuted}
      />
    </div>
  );
};
