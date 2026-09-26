import React, { useEffect, useRef } from 'react';
import {
  BellRing,
  MessageSquare,
  Smartphone,
  Mail,
  Shield,
  StickyNote,
  AlertTriangle,
  Frame,
  Sliders,
} from 'lucide-react';
import { SpecialBlockType } from './ChapterSpecialBlocks';

interface FloatingSelectionMenuProps {
  visible: boolean;
  position: { top: number; left: number };
  selectedText: string;
  onApplyPreset: (type: SpecialBlockType) => void;
  onOpenDesigner: () => void;
  themeColors?: {
    bg?: string;
    cardBg?: string;
    border?: string;
    btnBg?: string;
    btnText?: string;
    btnSecondaryBg?: string;
    btnBorder?: string;
    text?: string;
    textMuted?: string;
    accentColor?: string;
  };
}

export const FloatingSelectionMenu: React.FC<FloatingSelectionMenuProps> = ({
  visible,
  position,
  selectedText,
  onApplyPreset,
  onOpenDesigner,
  themeColors,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  if (!visible || !selectedText.trim()) return null;

  const tBg = themeColors?.bg || '#1a0b12';
  const tCardBg = themeColors?.cardBg || '#22111a';
  const tBorder = themeColors?.border || '#4a2838';
  const tBtnBg = themeColors?.btnBg || '#e879f9';
  const tBtnText = themeColors?.btnText || '#000000';
  const tBtnSecBg = themeColors?.btnSecondaryBg || '#2a1622';
  const tText = themeColors?.text || '#fbcfe8';
  const tAccent = themeColors?.accentColor || themeColors?.btnBg || '#e879f9';

  return (
    <div
      ref={menuRef}
      style={{
        top: `${Math.max(10, position.top)}px`,
        left: `${Math.max(10, position.left)}px`,
        transform: 'translate(-50%, -100%)',
        background: tCardBg,
        borderColor: tBorder,
      }}
      className="fixed z-[9999] shadow-2xl rounded-xl border p-1.5 flex items-center gap-1 font-mono text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => {
        // Prevent losing selection focus when clicking toolbar
        e.preventDefault();
      }}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5 border-r" style={{ borderColor: `${tBorder}80` }}>
        <Frame className="w-3.5 h-3.5" style={{ color: tAccent }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tAccent }}>
          Tạo khung:
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onApplyPreset('system')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#38bdf8' }}
          title="Đóng thành Khung Thông Báo Hệ Thống"
        >
          <BellRing className="w-3 h-3" />
          <span>Hệ thống</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyPreset('forum')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#f472b6' }}
          title="Đóng thành Khung Bình Luận Cư Dân Mạng"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Cư dân mạng</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyPreset('chat')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#4ade80' }}
          title="Đóng thành Khung Tin Nhắn Chat / SMS"
        >
          <Smartphone className="w-3 h-3" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyPreset('letter')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#fbbf24' }}
          title="Đóng thành Khung Thư Từ / Mật Thư"
        >
          <Mail className="w-3 h-3" />
          <span>Thư tay</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyPreset('status')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#c084fc' }}
          title="Đóng thành Khung Bảng Trạng Thái RPG"
        >
          <Shield className="w-3 h-3" />
          <span>Bảng RPG</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyPreset('note')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#94a3b8' }}
          title="Đóng thành Lời Tác Giả / Chú Thích"
        >
          <StickyNote className="w-3 h-3" />
          <span>Lời tác giả</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyPreset('warning')}
          className="px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 hover:brightness-125 transition cursor-pointer"
          style={{ background: tBtnSecBg, color: '#f87171' }}
          title="Đóng thành Khung Cảnh Báo"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Cảnh báo</span>
        </button>
      </div>

      {/* Button to open custom visual designer with this text preloaded */}
      <div className="pl-1 border-l" style={{ borderColor: `${tBorder}80` }}>
        <button
          type="button"
          onClick={onOpenDesigner}
          className="px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
          style={{ background: tBtnBg, color: tBtnText }}
          title="Mở bảng thiết kế nâng cao cho đoạn chữ này"
        >
          <Sliders className="w-3 h-3" />
          <span>Thiết kế nâng cao</span>
        </button>
      </div>
    </div>
  );
};
