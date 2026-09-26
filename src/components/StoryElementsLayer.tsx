import React, { useState, useRef, useEffect } from 'react';
import { StoryElement } from '../types';
import {
  Move,
  RotateCw,
  FlipHorizontal,
  Trash2,
  Copy,
  Sliders,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

interface StoryElementsLayerProps {
  elements: StoryElement[];
  isEditable?: boolean;
  onUpdateElements?: (elements: StoryElement[]) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  containerRef?: React.RefObject<HTMLDivElement | HTMLElement | null>;
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

export const StoryElementsLayer: React.FC<StoryElementsLayerProps> = ({
  elements = [],
  isEditable = false,
  onUpdateElements,
  selectedElementId,
  onSelectElement,
  containerRef,
  themeColors,
}) => {
  const [activeElId, setActiveElId] = useState<string | null>(selectedElementId || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  // Theme color fallbacks
  const tBg = themeColors?.bg || '#1a0b12';
  const tCardBg = themeColors?.cardBg || '#22111a';
  const tBorder = themeColors?.border || '#30222a';
  const tBtnBg = themeColors?.btnBg || '#e879f9';
  const tBtnText = themeColors?.btnText || '#000000';
  const tBtnSecBg = themeColors?.btnSecondaryBg || '#30222a';
  const tText = themeColors?.text || '#fbcfe8';
  const tTextMuted = themeColors?.textMuted || '#fbcfe8aa';
  const tAccent = themeColors?.accentColor || themeColors?.border || themeColors?.btnBg || '#e879f9';

  useEffect(() => {
    if (selectedElementId !== undefined) {
      setActiveElId(selectedElementId);
    }
  }, [selectedElementId]);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    containerWidth: number;
    containerHeight: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 50,
    initialY: 50,
    initialWidth: 100,
    containerWidth: 1,
    containerHeight: 1,
  });

  const handlePointerDownDrag = (e: React.PointerEvent, el: StoryElement) => {
    if (!isEditable) return;
    e.stopPropagation();
    e.preventDefault();

    const parent = containerRef?.current || (e.currentTarget.parentElement?.parentElement as HTMLElement);
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialWidth: el.width,
      containerWidth: rect.width || 1,
      containerHeight: rect.height || 1,
    };

    setActiveElId(el.id);
    if (onSelectElement) onSelectElement(el.id);
    setIsDragging(true);

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - dragStartRef.current.startX;
      const deltaY = moveEv.clientY - dragStartRef.current.startY;

      const deltaPercentX = (deltaX / dragStartRef.current.containerWidth) * 100;
      const deltaPercentY = (deltaY / dragStartRef.current.containerHeight) * 100;

      const nextX = Math.min(100, Math.max(0, Number((dragStartRef.current.initialX + deltaPercentX).toFixed(1))));
      const nextY = Math.min(100, Math.max(0, Number((dragStartRef.current.initialY + deltaPercentY).toFixed(1))));

      if (onUpdateElements) {
        onUpdateElements(
          elements.map((item) => (item.id === el.id ? { ...item, x: nextX, y: nextY } : item))
        );
      }
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handlePointerDownResize = (e: React.PointerEvent, el: StoryElement) => {
    if (!isEditable) return;
    e.stopPropagation();
    e.preventDefault();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialWidth: el.width,
      containerWidth: 1,
      containerHeight: 1,
    };

    setIsResizing(true);

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - dragStartRef.current.startX;
      const nextWidth = Math.min(600, Math.max(20, Math.round(dragStartRef.current.initialWidth + deltaX * 1.5)));

      if (onUpdateElements) {
        onUpdateElements(
          elements.map((item) => (item.id === el.id ? { ...item, width: nextWidth } : item))
        );
      }
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const updateSelectedElement = (updates: Partial<StoryElement>) => {
    if (!activeElId || !onUpdateElements) return;
    onUpdateElements(
      elements.map((item) => (item.id === activeElId ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteElement = (id: string) => {
    if (!onUpdateElements) return;
    onUpdateElements(elements.filter((item) => item.id !== id));
    if (activeElId === id) {
      setActiveElId(null);
      if (onSelectElement) onSelectElement(null);
    }
  };

  const handleDuplicateElement = (el: StoryElement) => {
    if (!onUpdateElements) return;
    const newEl: StoryElement = {
      ...el,
      id: `ele_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: Math.min(95, el.x + 3),
      y: Math.min(95, el.y + 3),
    };
    onUpdateElements([...elements, newEl]);
    setActiveElId(newEl.id);
    if (onSelectElement) onSelectElement(newEl.id);
  };

  const activeElement = elements.find((el) => el.id === activeElId);

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-20 overflow-visible select-none`}
      style={{ minHeight: '100%' }}
    >
      {/* CSS Animation Keyframes for Elements */}
      <style>{`
        @keyframes storyEleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes storyEleSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes storyElePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes storyEleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes storyEleWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .anim-ele-float { animation: storyEleFloat 3.5s ease-in-out infinite; }
        .anim-ele-spin { animation: storyEleSpin 12s linear infinite; }
        .anim-ele-pulse { animation: storyElePulse 2.5s ease-in-out infinite; }
        .anim-ele-bounce { animation: storyEleBounce 1.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite; }
        .anim-ele-wiggle { animation: storyEleWiggle 1.5s ease-in-out infinite; }
      `}</style>

      {elements.map((el) => {
        const isSelected = isEditable && activeElId === el.id;

        let animClass = '';
        if (el.animation === 'float') animClass = 'anim-ele-float';
        if (el.animation === 'spin') animClass = 'anim-ele-spin';
        if (el.animation === 'pulse') animClass = 'anim-ele-pulse';
        if (el.animation === 'bounce') animClass = 'anim-ele-bounce';
        if (el.animation === 'wiggle') animClass = 'anim-ele-wiggle';

        return (
          <div
            key={el.id}
            onClick={(e) => {
              if (isEditable) {
                e.stopPropagation();
                setActiveElId(el.id);
                if (onSelectElement) onSelectElement(el.id);
              }
            }}
            className={`absolute flex flex-col items-center justify-center ${
              isEditable ? 'pointer-events-auto cursor-move' : 'pointer-events-none'
            } transition-shadow duration-150`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}px`,
              maxWidth: '90%',
              transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) ${
                el.flipHorizontal ? 'scaleX(-1)' : ''
              }`,
              opacity: el.opacity ?? 1,
              zIndex: isSelected ? 40 : el.zIndex ?? 10,
              touchAction: 'none',
            }}
          >
            {/* Vùng bao quanh và nút thao tác khi đang chọn trong Editor */}
            <div
              onPointerDown={(e) => handlePointerDownDrag(e, el)}
              className={`relative group/ele w-full h-full flex items-center justify-center rounded transition-all ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-offset-black/50 shadow-xl'
                  : isEditable
                  ? 'hover:ring-1'
                  : ''
              }`}
              style={{
                borderColor: isSelected ? tAccent : undefined,
                boxShadow: isSelected ? `0 0 0 2px ${tAccent}` : undefined,
              }}
            >
              {/* Ảnh hoặc GIF của Element */}
              <img
                src={el.imageUrl}
                alt={el.name || 'Story Element'}
                className={`w-full h-auto object-contain select-none pointer-events-none drop-shadow-md ${animClass}`}
                draggable={false}
              />

              {/* Nút kéo chỉnh kích thước (Resize Handle) */}
              {isSelected && isEditable && (
                <div
                  onPointerDown={(e) => handlePointerDownResize(e, el)}
                  className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full shadow-lg flex items-center justify-center cursor-nwse-resize z-50 hover:scale-110 active:scale-95 transition-transform"
                  style={{
                    background: tBtnBg,
                    color: tBtnText,
                  }}
                  title="Kéo để phóng to / thu nhỏ kích thước"
                >
                  <Move className="w-3 h-3 rotate-45" />
                </div>
              )}

              {/* Huy hiệu hiển thị kích thước nhanh */}
              {isSelected && isEditable && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow border z-50"
                  style={{
                    background: tBg,
                    borderColor: tBorder,
                    color: tText,
                  }}
                >
                  {el.width}px {el.rotation ? `• ${el.rotation}°` : ''}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* FLOATING ACTION TOOLBAR CHO ELEMENT ĐANG ĐƯỢC CHỌN (KHI Ở CHẾ ĐỘ EDITOR) */}
      {isEditable && activeElement && showToolbar && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92vw] p-3 rounded-xl shadow-2xl border backdrop-blur-xl font-mono pointer-events-auto space-y-2.5"
          style={{
            background: tCardBg,
            borderColor: tBorder,
            color: tText,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header toolbar */}
          <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: tBorder }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: tAccent }} />
              <span className="text-xs font-bold" style={{ color: tAccent }}>
                Chỉnh sửa Element ({activeElement.width}px)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleDuplicateElement(activeElement)}
                className="p-1 text-xs rounded hover:opacity-80 transition cursor-pointer"
                style={{ background: tBtnSecBg, color: tText }}
                title="Nhân bản element"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteElement(activeElement.id)}
                className="p-1 text-xs rounded hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                title="Xóa element này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveElId(null);
                  if (onSelectElement) onSelectElement(null);
                }}
                className="p-1 text-xs rounded hover:opacity-80 transition cursor-pointer"
                style={{ background: tBtnSecBg, color: tText }}
                title="Đóng bảng chỉnh sửa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Controls: Kích thước & Góc xoay & Độ mờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {/* Slider Kích thước */}
            <div className="space-y-1 p-2 rounded border" style={{ background: tBg, borderColor: tBorder }}>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold flex items-center gap-1">
                  <Sliders className="w-3 h-3" style={{ color: tAccent }} /> Cỡ (Width):
                </span>
                <span className="font-bold" style={{ color: tAccent }}>{activeElement.width}px</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateSelectedElement({ width: Math.max(20, activeElement.width - 10) })}
                  className="p-1 rounded text-xs cursor-pointer hover:opacity-80 transition"
                  style={{ background: tBtnSecBg, color: tText }}
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="5"
                  value={activeElement.width}
                  onChange={(e) => updateSelectedElement({ width: Number(e.target.value) })}
                  className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: tBtnBg, background: tBtnSecBg }}
                />
                <button
                  type="button"
                  onClick={() => updateSelectedElement({ width: Math.min(400, activeElement.width + 10) })}
                  className="p-1 rounded text-xs cursor-pointer hover:opacity-80 transition"
                  style={{ background: tBtnSecBg, color: tText }}
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Slider Góc xoay */}
            <div className="space-y-1 p-2 rounded border" style={{ background: tBg, borderColor: tBorder }}>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold flex items-center gap-1">
                  <RotateCw className="w-3 h-3" style={{ color: tAccent }} /> Góc xoay:
                </span>
                <span className="font-bold" style={{ color: tAccent }}>{activeElement.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={activeElement.rotation || 0}
                onChange={(e) => updateSelectedElement({ rotation: Number(e.target.value) })}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: tBtnBg, background: tBtnSecBg }}
              />
            </div>
          </div>

          {/* Hàng nút chức năng phụ: Hiệu ứng động, Lật, Lớp z-index */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t text-[10px]" style={{ borderColor: tBorder }}>
            {/* Chọn Animation */}
            <div className="flex items-center gap-1">
              <span className="opacity-70" style={{ color: tTextMuted }}>Chuyển động:</span>
              <select
                value={activeElement.animation || 'none'}
                onChange={(e) => updateSelectedElement({ animation: e.target.value as any })}
                className="px-2 py-1 rounded font-bold focus:outline-none cursor-pointer border"
                style={{ background: tBg, borderColor: tBorder, color: tText }}
              >
                <option value="none">Tĩnh (None)</option>
                <option value="float">Bay lượn (Float)</option>
                <option value="pulse">Nhịp thở (Pulse)</option>
                <option value="bounce">Nhún nhảy (Bounce)</option>
                <option value="wiggle">Lắc lư (Wiggle)</option>
                <option value="spin">Xoay tròn (Spin)</option>
              </select>
            </div>

            {/* Nút Lật ngang */}
            <button
              type="button"
              onClick={() => updateSelectedElement({ flipHorizontal: !activeElement.flipHorizontal })}
              className="px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer hover:opacity-90"
              style={{
                background: activeElement.flipHorizontal ? tBtnBg : tBtnSecBg,
                color: activeElement.flipHorizontal ? tBtnText : tText,
                borderColor: tBorder,
              }}
            >
              <FlipHorizontal className="w-3 h-3" />
              <span>Lật ngang</span>
            </button>

            {/* Nâng / Hạ lớp z-index */}
            <div className="flex items-center gap-1">
              <span className="opacity-70" style={{ color: tTextMuted }}>Lớp:</span>
              <button
                type="button"
                onClick={() => updateSelectedElement({ zIndex: Math.max(1, (activeElement.zIndex || 10) - 2) })}
                className="px-1.5 py-0.5 rounded font-bold cursor-pointer hover:opacity-80 transition"
                style={{ background: tBtnSecBg, color: tText }}
                title="Hạ lớp (xuống dưới)"
              >
                -
              </button>
              <span className="font-bold min-w-4 text-center" style={{ color: tAccent }}>{activeElement.zIndex || 10}</span>
              <button
                type="button"
                onClick={() => updateSelectedElement({ zIndex: Math.min(50, (activeElement.zIndex || 10) + 2) })}
                className="px-1.5 py-0.5 rounded font-bold cursor-pointer hover:opacity-80 transition"
                style={{ background: tBtnSecBg, color: tText }}
                title="Nâng lớp (lên trên)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
