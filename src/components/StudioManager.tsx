import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { User as FirebaseUser } from 'firebase/auth';
import { Story, Chapter, UserProfile } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FileText, 
  ArrowLeft, 
  UploadCloud, 
  Layers, 
  UserCheck, 
  Lock, 
  Unlock, 
  Key, 
  Coins,
  X,
  User,
  Upload,
  Eye,
  BookOpen,
  Bookmark,
  Pipette,
  Download,
  RefreshCw,
  Settings,
  Check,
  Palette,
  ArrowUp,
  ArrowDown,
  BellRing,
  MessageSquare,
  Smartphone,
  Mail,
  Shield,
  StickyNote,
  Frame
} from 'lucide-react';
import { BulkChapterModal } from './BulkChapterModal';
import { LiveStoryEditor } from './LiveStoryEditor';
import { SpecialFrameInsertModal } from './SpecialFrameInsertModal';
import { FloatingSelectionMenu } from './FloatingSelectionMenu';
import { SpecialBlockType } from './ChapterSpecialBlocks';
import { claimStoryOwnership } from '../lib/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  BORDER_STYLE_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  BORDER_CORNER_ACCENT_OPTIONS,
  BORDER_GLOW_OPTIONS,
  getStoryBorderStyle,
  getStoryButtonBorderStyle,
  StoryCornerAccents,
} from '../lib/borderStyles';

const FONT_OPTIONS = [
  // Serif (Cổ điển / Trang trọng)
  { value: 'font-lora', label: 'Lora' },
  { value: 'font-garamond', label: 'EB Garamond' },
  { value: 'font-merriweather', label: 'Merriweather' },
  { value: 'font-playfair', label: 'Playfair Display' },
  { value: 'font-notoserif', label: 'Noto Serif' },
  { value: 'font-robotoslab', label: 'Roboto Slab' },
  { value: 'font-times', label: 'Times New Roman' },
  { value: 'font-cormorant', label: 'Cormorant Garamond' },

  // Sans-serif (Hiện đại / Sạch sẽ)
  { value: 'font-bevietnam', label: 'Be Vietnam Pro' },
  { value: 'font-inter', label: 'Inter' },
  { value: 'font-opensans', label: 'Open Sans' },
  { value: 'font-roboto', label: 'Roboto' },
  { value: 'font-montserrat', label: 'Montserrat' },
  { value: 'font-nunito', label: 'Nunito' },
  { value: 'font-quicksand', label: 'Quicksand' },
  { value: 'font-mulish', label: 'Mulish' },
  { value: 'font-notosans', label: 'Noto Sans' },
  { value: 'font-sourcesans', label: 'Source Sans 3' },
  { value: 'font-worksans', label: 'Work Sans' },
  { value: 'font-saira', label: 'Saira' },
  { value: 'font-lexend', label: 'Lexend' },
  { value: 'font-comfortaa', label: 'Comfortaa' },
  { value: 'font-baloo', label: 'Baloo 2' },

  // Calligraphy & Script (Bay bổng / Lãng mạn / Thư pháp)
  { value: 'font-charm', label: 'Charm' },
  { value: 'font-dancing', label: 'Dancing Script' },
  { value: 'font-pacifico', label: 'Pacifico' },
  { value: 'font-lobster', label: 'Lobster' },
  { value: 'font-pattaya', label: 'Pattaya' },
  { value: 'font-arima', label: 'Arima' },

  // Comic & Handwritten (Truyện tranh / Bình dị)
  { value: 'font-patrick', label: 'Patrick Hand' },
  { value: 'font-itim', label: 'Itim' },
  { value: 'font-sriracha', label: 'Sriracha' },
  { value: 'font-pangolin', label: 'Pangolin' },

  // Monospace & Pixel & Display (Công nghệ / Retro game)
  { value: 'font-mono', label: 'JetBrains Mono' },
  { value: 'font-inconsolata', label: 'Inconsolata' },
  { value: 'font-bungee', label: 'Bungee' }
];

const PRESET_THEME_COLORS: Record<string, {
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  btnBg: string;
  btnSecondaryBg?: string;
  btnBorder: string;
  btnText: string;
}> = {
  'dark-rose': {
    bg: '#080406',
    cardBg: '#11090c',
    text: '#e0d0d5',
    textMuted: '#8a717a',
    border: '#2d1822',
    btnBg: '#2b1620',
    btnBorder: '#5e2f46',
    btnText: '#ffd6e2',
  },
  'sepia': {
    bg: '#f4ecd8',
    cardBg: '#fcf8ed',
    text: '#4a3525',
    textMuted: '#8c7460',
    border: '#d3c29f',
    btnBg: '#e2d5b6',
    btnBorder: '#bca883',
    btnText: '#4a3525',
  },
  'emerald': {
    bg: '#06100c',
    cardBg: '#0b1a14',
    text: '#d1e7dd',
    textMuted: '#628f7a',
    border: '#153327',
    btnBg: '#163f2d',
    btnBorder: '#2a6b4e',
    btnText: '#d1e7dd',
  },
  'slate': {
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    btnBg: '#334155',
    btnBorder: '#475569',
    btnText: '#f1f5f9',
  },
  'classic-dark': {
    bg: '#0a0a0a',
    cardBg: '#121212',
    text: '#e5e5e5',
    textMuted: '#737373',
    border: '#242424',
    btnBg: '#262626',
    btnBorder: '#404040',
    btnText: '#e5e5e5',
  },
  'gradient-rose': {
    bg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: '#1c0a13',
    text: '#fce7f0',
    textMuted: '#f4a6c1',
    border: '#682542',
    btnBg: '#521930',
    btnBorder: '#832e55',
    btnText: '#ffc2d4',
  },
  'gradient-midnight': {
    bg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: '#170b33',
    text: '#f3e8ff',
    textMuted: '#c084fc',
    border: '#581c87',
    btnBg: '#3b1278',
    btnBorder: '#7e22ce',
    btnText: '#e9d5ff',
  },
  'gradient-ocean': {
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: '#081d2c',
    text: '#e0f2fe',
    textMuted: '#38bdf8',
    border: '#0284c7',
    btnBg: '#0369a1',
    btnBorder: '#38bdf8',
    btnText: '#bae6fd',
  },
  'gradient-emerald': {
    bg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: '#082119',
    text: '#ecfdf5',
    textMuted: '#34d399',
    border: '#059669',
    btnBg: '#047857',
    btnBorder: '#10b981',
    btnText: '#a7f3d0',
  },
  'gradient-sunset': {
    bg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: '#24080e',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#9f1239',
    btnBg: '#881337',
    btnBorder: '#e11d48',
    btnText: '#fecdd3',
  },
  'gradient-cyber': {
    bg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: '#210638',
    text: '#fae8ff',
    textMuted: '#e879f9',
    border: '#a21caf',
    btnBg: '#7e22ce',
    btnBorder: '#c084fc',
    btnText: '#f5d0fe',
  },
};

interface StudioManagerProps {
  stories: Story[];
  chapters: Chapter[];
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  onSaveStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onSaveBatchChapters?: (chapters: Chapter[]) => Promise<void>;
  onDeleteChapter: (chapterId: string, storyId: string) => void;
  onSelectStoryForDetail: (story: Story) => void;
}

// Helper function to compress cover images to prevent exceeding Firestore's 1MB document size limit
const compressImage = (file: File, maxWidth = 600, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as jpeg with 0.85 quality to keep it ultra sharp while dramatically reducing size (to ~100KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve('');
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
};

interface ColorPickerSwatchProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  onToggleOpen?: (open: boolean) => void;
}

const ColorPickerSwatch: React.FC<ColorPickerSwatchProps> = ({ color, onChange, label, onToggleOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onToggleOpen) onToggleOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggleOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onToggleOpen) onToggleOpen(nextState);
  };

  const handleEyedropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          onChange(result.sRGBHex);
        }
      } catch {
        // User canceled eyedropper
      }
    } else {
      nativeInputRef.current?.click();
    }
  };

  const validHex = color && color.startsWith('#') ? color : '#080406';

  return (
    <div className="relative inline-block w-full" ref={popoverRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full h-8 px-2 py-1 rounded-xs border border-[#4d2138] hover:border-[#a8446b] cursor-pointer bg-[#12060b] hover:bg-[#1b0a12] flex items-center gap-2 transition-colors min-w-0"
        title="Bấm để chọn màu"
      >
        <div
          className="w-5 h-5 rounded-2xs border border-[#ffffff33] shrink-0"
          style={{ background: validHex }}
        />
        <span className="text-[11px] text-[#ffc2d4] font-mono-code font-bold truncate flex-1 text-left">
          {label ? `${label}` : validHex}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 p-2.5 bg-[#180a12] border border-[#542438] rounded-sm shadow-2xl space-y-2 left-0 min-w-[210px]">
          <HexColorPicker color={validHex} onChange={onChange} />
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#3b1f2d]">
            <button
              type="button"
              onClick={handleEyedropper}
              className="p-1.5 bg-[#25101b] border border-[#4d2138] hover:border-[#a8446b] hover:bg-[#341525] text-[#ffc2d4] rounded-xs flex items-center gap-1 shrink-0 transition-colors"
              title="Chấm lấy màu trên màn hình (Eyedropper)"
            >
              <Pipette className="w-3.5 h-3.5 text-[#ffc2d4]" />
            </button>
            <span className="text-[10px] text-[#8a717a] font-mono-code font-bold">HEX:</span>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#10050a] border border-[#4d2138] px-2 py-1 text-[11px] text-[#ffc2d4] font-mono-code focus:outline-none rounded-xs"
              placeholder="#000000"
            />
            <input
              ref={nativeInputRef}
              type="color"
              value={validHex}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  allowGradient?: boolean;
}

const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange, allowGradient = false }) => {
  const [hasOpenPopover, setHasOpenPopover] = useState(false);
  const isGradient = allowGradient && value.includes('gradient');

  let color1 = '#2b111e';
  let color2 = '#0d0509';

  if (isGradient) {
    const colorMatches = value.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g);
    if (colorMatches && colorMatches.length >= 2) {
      color1 = colorMatches[0];
      color2 = colorMatches[1];
    } else if (colorMatches && colorMatches.length === 1) {
      color1 = colorMatches[0];
    }
  } else {
    color1 = value.startsWith('#') ? value : '#080406';
  }

  const handleToggleGradient = (checked: boolean) => {
    if (checked) {
      const c1 = value.startsWith('#') ? value : '#2b111e';
      const c2 = '#0d0509';
      onChange(`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
    } else {
      onChange(color1.startsWith('#') ? color1 : '#080406');
    }
  };

  const handleUpdateC1 = (newC1: string) => {
    if (isGradient) {
      onChange(`linear-gradient(135deg, ${newC1} 0%, ${color2} 100%)`);
    } else {
      onChange(newC1);
    }
  };

  const handleUpdateC2 = (newC2: string) => {
    onChange(`linear-gradient(135deg, ${color1} 0%, ${newC2} 100%)`);
  };

  return (
    <div className={`space-y-2.5 bg-[#160a10] p-2.5 border border-[#3b1f2d] rounded-sm flex flex-col justify-between relative min-w-0 ${hasOpenPopover ? 'z-30' : 'z-10'}`}>
      <div className="flex items-start justify-between gap-1.5 pb-1.5 border-b border-[#2d1822] min-w-0">
        <span className="text-[11px] text-[#ffc2d4] font-bold font-mono-code leading-snug min-w-0 flex-1 break-words">
          {label}
        </span>
        {allowGradient && (
          <label className="flex items-center gap-1 cursor-pointer text-[10px] text-[#e0c0cc] hover:text-[#ffffff] font-mono-code select-none shrink-0 bg-[#25101b] px-1.5 py-0.5 border border-[#4d2138] rounded-xs mt-0.5">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => handleToggleGradient(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#a8446b] rounded-xs cursor-pointer"
            />
            <span>Gradient</span>
          </label>
        )}
      </div>

      {!isGradient ? (
        <div className="pt-0.5 w-full min-w-0">
          <ColorPickerSwatch 
            color={color1} 
            onChange={handleUpdateC1} 
            label="Màu đơn" 
            onToggleOpen={setHasOpenPopover} 
          />
        </div>
      ) : (
        <div className="pt-0.5 w-full min-w-0">
          <div className="grid grid-cols-2 gap-2 w-full min-w-0">
            <ColorPickerSwatch 
              color={color1} 
              onChange={handleUpdateC1} 
              label="M1" 
              onToggleOpen={setHasOpenPopover} 
            />
            <ColorPickerSwatch 
              color={color2} 
              onChange={handleUpdateC2} 
              label="M2" 
              onToggleOpen={setHasOpenPopover} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const StudioManager: React.FC<StudioManagerProps> = ({
  stories = [],
  chapters = [],
  currentUser,
  userProfile,
  isAdmin = false,
  onSaveStory,
  onDeleteStory,
  onSaveChapter,
  onSaveBatchChapters,
  onDeleteChapter,
  onSelectStoryForDetail,
}) => {
  // Modal states
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedStoryForChapters, setSelectedStoryForChapters] = useState<Story | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);

  // Filter stories strictly owned by this editor
  // Cho phép hiển thị cả các bộ truyện cũ chưa gán authorUid để editor (askerhater21 / tác giả) có thể quản lý và nhận quyền
  const visibleStories = (stories || []).filter((story) => {
    if (story.authorUid) {
      return story.authorUid === currentUser?.uid;
    }
    if (story.authorEmail && currentUser?.email) {
      return story.authorEmail.toLowerCase() === currentUser.email.toLowerCase();
    }
    // Nếu truyện chưa có authorUid / authorEmail (2 bộ truyện cũ trước đó)
    // Tự động cho phép người dùng hiện tại quản lý và nhận quyền sở hữu
    return true;
  });

  // Story Form State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyAuthor, setStoryAuthor] = useState('');
  const [storyEditorName, setStoryEditorName] = useState('');
  const [storyEditorPhoto, setStoryEditorPhoto] = useState('');
  const [storyCoverUrl, setStoryCoverUrl] = useState('');
  const [storySynopsis, setStorySynopsis] = useState('');
  const [storyTagsInput, setStoryTagsInput] = useState('');
  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingEditorPhoto, setIsCompressingEditorPhoto] = useState(false);
  const [themeTone, setThemeTone] = useState('dark-rose');
  const [defaultFont, setDefaultFont] = useState('font-mono');
  const [customTitleFont, setCustomTitleFont] = useState('font-mono');
  const [customChapterTitleFont, setCustomChapterTitleFont] = useState('font-mono');
  const [customSubtitleFont, setCustomSubtitleFont] = useState('font-mono');
  const [customBodyFont, setCustomBodyFont] = useState('font-mono');
  const [customMutedFont, setCustomMutedFont] = useState('font-mono');
  const [customBtnFont, setCustomBtnFont] = useState('font-mono');
  const [titleFontSize, setTitleFontSize] = useState('24px');
  const [bodyFontSize, setBodyFontSize] = useState('14px');
  const [customBgColor, setCustomBgColor] = useState('#080406');
  const [customBgType, setCustomBgType] = useState<'solid' | 'gradient'>('solid');
  const [customGradientColor1, setCustomGradientColor1] = useState('#2b111e');
  const [customGradientColor2, setCustomGradientColor2] = useState('#0d0509');
  const [customGradientAngle, setCustomGradientAngle] = useState('135');
  const [gradientApplyTarget, setGradientApplyTarget] = useState<'all' | 'bg' | 'card' | 'btnPrimary' | 'btnSecondary'>('all');
  const [customCardBgColor, setCustomCardBgColor] = useState('#11090c');
  const [customTextColor, setCustomTextColor] = useState('#e0d0d5');
  const [customTextMutedColor, setCustomTextMutedColor] = useState('#8a717a');
  const [customBorderColor, setCustomBorderColor] = useState('#2d1822');
  const [customBtnBgColor, setCustomBtnBgColor] = useState('#2b1620');
  const [customBtnSecondaryBgColor, setCustomBtnSecondaryBgColor] = useState('#1c0f16');
  const [readingEffect, setReadingEffect] = useState<NonNullable<Story['readingEffect']>>('none');
  const [readingEffectColor, setReadingEffectColor] = useState<string>('#00f0ff');
  const [storyBorderStyle, setStoryBorderStyle] = useState<NonNullable<Story['borderStyle']>>('solid');
  const [storyBorderWidth, setStoryBorderWidth] = useState<NonNullable<Story['borderWidth']>>('thin');
  const [storyBorderRadius, setStoryBorderRadius] = useState<NonNullable<Story['borderRadius']>>('none');
  const [storyBorderCornerAccent, setStoryBorderCornerAccent] = useState<NonNullable<Story['borderCornerAccent']>>('none');
  const [storyBorderGlow, setStoryBorderGlow] = useState<NonNullable<Story['borderGlow']>>('none');
  const [storyCustomBorderGradientColor2, setStoryCustomBorderGradientColor2] = useState('#ff6b9d');
  const [storyCustomBorderGlowColor1, setStoryCustomBorderGlowColor1] = useState('#ff6b9d');
  const [storyCustomBorderGlowColor2, setStoryCustomBorderGlowColor2] = useState('#38bdf8');

  const handleUpdateGradientBg = (c1: string, c2: string, angle: string, target = gradientApplyTarget) => {
    setCustomGradientColor1(c1);
    setCustomGradientColor2(c2);
    setCustomGradientAngle(angle);
    const gradString = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    
    if (target === 'all' || target === 'bg') setCustomBgColor(gradString);
    if (target === 'all' || target === 'card') setCustomCardBgColor(gradString);
    if (target === 'all' || target === 'btnPrimary') setCustomBtnBgColor(gradString);
    if (target === 'all' || target === 'btnSecondary') setCustomBtnSecondaryBgColor(gradString);
  };

  // Chapter Form State
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isBulkUploadingChapter, setIsBulkUploadingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterVolumeTitle, setChapterVolumeTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isChapterLocked, setIsChapterLocked] = useState(false);
  const [chapterUnlockPrice, setChapterUnlockPrice] = useState(1);
  const [isChapterPasswordProtected, setIsChapterPasswordProtected] = useState(false);
  const [chapterPassword, setChapterPassword] = useState('');
  const [chapterPasswordHint, setChapterPasswordHint] = useState('');
  const [chapterUnlockMode, setChapterUnlockMode] = useState<'and' | 'or'>('and');
  const [showSpecialFrameModal, setShowSpecialFrameModal] = useState(false);
  const [modalInitialContent, setModalInitialContent] = useState('');
  const [modalInitialType, setModalInitialType] = useState<SpecialBlockType>('system');

  // Text selection floating menu state for studio chapter textarea
  const studioTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [floatingMenuVisible, setFloatingMenuVisible] = useState(false);
  const [floatingMenuPos, setFloatingMenuPos] = useState({ top: 0, left: 0 });
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number; text: string }>({
    start: 0,
    end: 0,
    text: '',
  });

  const handleStudioTextSelect = () => {
    const el = studioTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end && end > start) {
      const selected = el.value.substring(start, end).trim();
      if (selected) {
        const rect = el.getBoundingClientRect();
        setFloatingMenuPos({
          top: Math.max(30, rect.top + 10),
          left: Math.min(window.innerWidth - 180, Math.max(180, rect.left + rect.width / 2)),
        });
        setSelectedRange({ start, end, text: selected });
        setFloatingMenuVisible(true);
        return;
      }
    }
    setFloatingMenuVisible(false);
  };

  const handleApplyPresetToStudioSelection = (type: SpecialBlockType) => {
    if (!selectedRange.text) return;
    let snippet = '';
    const text = selectedRange.text.trim();

    if (type === 'system') {
      snippet = `[system: THÔNG BÁO HỆ THỐNG]\n${text}\n[/system]`;
    } else if (type === 'forum' || type === 'netizen') {
      const lines = text.split('\n').filter(Boolean);
      const parsedLines = lines.map((l, i) => `[netizen: Cư dân mạng #${i + 1} | Vừa xong | +${10 * (i + 1)}]: ${l.trim()}`).join('\n');
      snippet = `[forum: Diễn Đàn Mạng Xã Hội]\n${parsedLines || `[netizen: Ẩn danh | Vừa xong | +99]: ${text}`}\n[/forum]`;
    } else if (type === 'chat') {
      const lines = text.split('\n').filter(Boolean);
      const parsedLines = lines.map((l, i) => `[${i % 2 === 0 ? 'left: Đối phương' : 'right: Tôi'}]: ${l.trim()}`).join('\n');
      snippet = `[chat: Hội Thoại Trò Chuyện]\n${parsedLines || `[left: Đối phương]: ${text}`}\n[/chat]`;
    } else if (type === 'letter') {
      snippet = `[letter: Thư Từ / Mật Hàm | Gửi người nhận]\n${text}\n[/letter]`;
    } else if (type === 'status') {
      const lines = text.split('\n').filter(Boolean);
      snippet = `[status: BẢNG TRẠNG THÁI]\n${lines.join('\n')}\n[/status]`;
    } else if (type === 'note') {
      snippet = `[note: Lời tác giả]\n${text}\n[/note]`;
    } else if (type === 'warning') {
      snippet = `[warning: CẢNH BÁO NGUY HIỂM]\n${text}\n[/warning]`;
    } else if (type === 'thought') {
      snippet = `[thought: Độc thoại nội tâm]\n${text}\n[/thought]`;
    }

    if (snippet) {
      setChapterContent((prev) => {
        const before = prev.substring(0, selectedRange.start);
        const after = prev.substring(selectedRange.end);
        return `${before}\n\n${snippet}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
      });
      setFloatingMenuVisible(false);
      setSelectedRange({ start: 0, end: 0, text: '' });
    }
  };

  const handleOpenStudioDesignerForSelection = () => {
    setModalInitialContent(selectedRange.text);
    setModalInitialType('system');
    setShowSpecialFrameModal(true);
    setFloatingMenuVisible(false);
  };

  const handleInsertStudioFrameSnippet = (snippet: string) => {
    setChapterContent((prev) => {
      if (selectedRange.text && selectedRange.end > selectedRange.start) {
        const before = prev.substring(0, selectedRange.start);
        const after = prev.substring(selectedRange.end);
        return `${before}\n\n${snippet.trim()}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
      }
      const trimmed = prev ? prev.trim() : '';
      return trimmed ? `${trimmed}\n\n${snippet.trim()}\n\n` : `${snippet.trim()}\n\n`;
    });
    setSelectedRange({ start: 0, end: 0, text: '' });
  };

  // Batch Volume assignment in chapter list
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [batchVolumeTitleInput, setBatchVolumeTitleInput] = useState('');
  const [isUpdatingBatchVolume, setIsUpdatingBatchVolume] = useState(false);
  const [batchVolumeSuccessMessage, setBatchVolumeSuccessMessage] = useState<string | null>(null);

  // Active Preview Colors computed for Live Theme & Font Preview
  const activePreviewColors = themeTone === 'custom' ? {
    bg: customBgColor || '#080406',
    cardBg: customCardBgColor || '#11090c',
    text: customTextColor || '#e0d0d5',
    textMuted: customTextMutedColor || '#8a717a',
    border: customBorderColor || '#2d1822',
    btnBg: customBtnBgColor || '#2b1620',
    btnSecondaryBg: customBtnSecondaryBgColor || '#1c0f16',
    btnBorder: customBorderColor || '#5e2f46',
    btnText: customTextColor || '#ffd6e2',
  } : (PRESET_THEME_COLORS[themeTone] || PRESET_THEME_COLORS['dark-rose']);

  // Save from Live Story Editor
  const handleLiveStorySave = (storyData: Partial<Story>) => {
    const resolvedEditorName = 
      storyData.editorName !== undefined
        ? storyData.editorName.trim()
        : (editingStory?.editorName || userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu');

    const resolvedEditorPhoto =
      storyData.editorPhoto !== undefined
        ? storyData.editorPhoto.trim()
        : (editingStory?.editorPhoto !== undefined ? editingStory.editorPhoto : (userProfile?.photoURL || currentUser?.photoURL || ''));

    const newStory: Story = {
      id: storyData.id || (editingStory ? editingStory.id : 'story-' + Date.now()),
      title: (storyData.title || '').trim(),
      author: (storyData.author || 'Tác giả').trim(),
      authorUid: currentUser?.uid || editingStory?.authorUid,
      authorEmail: currentUser?.email || editingStory?.authorEmail || '',
      editorName: resolvedEditorName,
      editorPhoto: resolvedEditorPhoto,
      coverUrl: (storyData.coverUrl || '').trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: (storyData.synopsis || '').trim(),
      tags: storyData.tags,
      viewsCount: editingStory ? editingStory.viewsCount : 0,
      createdAt: editingStory ? editingStory.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      themeTone: storyData.themeTone || 'dark-rose',
      defaultFont: storyData.customBodyFont || 'font-mono',
      customTitleFont: storyData.customTitleFont,
      customChapterTitleFont: storyData.customChapterTitleFont,
      customSubtitleFont: storyData.customSubtitleFont,
      customBodyFont: storyData.customBodyFont,
      customMutedFont: storyData.customMutedFont,
      customBtnFont: storyData.customBtnFont,
      titleFontSize: storyData.titleFontSize,
      bodyFontSize: storyData.bodyFontSize,
      customBgColor: storyData.customBgColor,
      customCardBgColor: storyData.customCardBgColor,
      customTextColor: storyData.customTextColor,
      customTextMutedColor: storyData.customTextMutedColor,
      customBorderColor: storyData.customBorderColor,
      customBtnBgColor: storyData.customBtnBgColor,
      customBtnSecondaryBgColor: storyData.customBtnSecondaryBgColor,
      readingEffect: storyData.readingEffect,
      readingEffectColor: storyData.readingEffectColor,
      borderStyle: storyData.borderStyle,
      borderWidth: storyData.borderWidth,
      borderRadius: storyData.borderRadius,
      borderCornerAccent: storyData.borderCornerAccent,
      borderGlow: storyData.borderGlow,
      customBorderGradientColor2: storyData.customBorderGradientColor2,
      customBorderGlowColor1: storyData.customBorderGlowColor1,
      customBorderGlowColor2: storyData.customBorderGlowColor2,

      // Widget thông tin nhân vật
      showCharacterWidget: storyData.showCharacterWidget,
      characterWidgetTitle: storyData.characterWidgetTitle,
      characters: storyData.characters,

      // Widget tiến độ truyện
      showProgressWidget: storyData.showProgressWidget,
      progressWidgetTitle: storyData.progressWidgetTitle,
      totalPlannedChapters: storyData.totalPlannedChapters,

      // Widget nội dung tùy chỉnh
      showCustomWidget: storyData.showCustomWidget,
      customWidgetTitle: storyData.customWidgetTitle,
      customWidgetContent: storyData.customWidgetContent,

      // Widget ảnh lẻ / album di chuyển
      showGalleryWidget: storyData.showGalleryWidget,
      galleryWidgetTitle: storyData.galleryWidgetTitle,
      galleryMode: storyData.galleryMode,
      gallerySingleImageUrl: storyData.gallerySingleImageUrl,
      gallerySingleImageCaption: storyData.gallerySingleImageCaption,
      galleryImages: storyData.galleryImages,
      galleryAutoScrollSpeed: storyData.galleryAutoScrollSpeed,
      galleryImageSize: storyData.galleryImageSize,
      galleryWidgets: storyData.galleryWidgets,

      // Element / Sticker / Họa tiết trang trí tự do trên trang truyện
      storyElements: storyData.storyElements,

      // Kiểu trình bày danh sách chương
      chapterListStyle: storyData.chapterListStyle,

      // Tùy chỉnh Bố cục & Vị trí các phân đoạn trang truyện
      storyLayoutSections: storyData.storyLayoutSections,
      storyLayoutMode: storyData.storyLayoutMode,
      storyLayoutLeft: storyData.storyLayoutLeft,
      storyLayoutRight: storyData.storyLayoutRight,
      storyLayoutBottom: storyData.storyLayoutBottom,
      storyLayoutOrder: storyData.storyLayoutOrder,

      // Theme và Hiệu ứng chương riêng biệt
      useSeparateChapterTheme: storyData.useSeparateChapterTheme,
      useSeparateChapterEffect: storyData.useSeparateChapterEffect,
      chapterThemeTone: storyData.chapterThemeTone,
      chapterCustomBgColor: storyData.chapterCustomBgColor,
      chapterCustomCardBgColor: storyData.chapterCustomCardBgColor,
      chapterCustomTextColor: storyData.chapterCustomTextColor,
      chapterCustomTextMutedColor: storyData.chapterCustomTextMutedColor,
      chapterCustomBorderColor: storyData.chapterCustomBorderColor,
      chapterCustomBtnBgColor: storyData.chapterCustomBtnBgColor,
      chapterCustomBtnSecondaryBgColor: storyData.chapterCustomBtnSecondaryBgColor,
      chapterBorderStyle: storyData.chapterBorderStyle,
      chapterBorderWidth: storyData.chapterBorderWidth,
      chapterBorderRadius: storyData.chapterBorderRadius,
      chapterBorderCornerAccent: storyData.chapterBorderCornerAccent,
      chapterBorderGlow: storyData.chapterBorderGlow,
      chapterCustomBorderGradientColor2: storyData.chapterCustomBorderGradientColor2,
      chapterCustomBorderGlowColor1: storyData.chapterCustomBorderGlowColor1,
      chapterCustomBorderGlowColor2: storyData.chapterCustomBorderGlowColor2,
      chapterReadingEffect: storyData.chapterReadingEffect,
      chapterReadingEffectColor: storyData.chapterReadingEffectColor,
    };

    onSaveStory(newStory);
    setIsCreatingStory(false);
    setEditingStory(null);
  };

  // Open Create Story
  const handleOpenCreateStory = () => {
    setEditingStory(null);
    setStoryTitle('');
    setStoryAuthor('Tử Thời Hoan');
    setStoryEditorName(userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu');
    setStoryEditorPhoto(userProfile?.photoURL || currentUser?.photoURL || '');
    setStoryCoverUrl('');
    setStorySynopsis('');
    setStoryTagsInput('');
    setThemeTone('dark-rose');
    setDefaultFont('font-mono');
    setCustomTitleFont('font-mono');
    setCustomBodyFont('font-mono');
    setCustomMutedFont('font-mono');
    setCustomBtnFont('font-mono');
    setTitleFontSize('24px');
    setBodyFontSize('14px');
    setCustomBgColor('#080406');
    setCustomBgType('solid');
    setCustomGradientColor1('#2b111e');
    setCustomGradientColor2('#0d0509');
    setCustomGradientAngle('135');
    setCustomCardBgColor('#11090c');
    setCustomTextColor('#e0d0d5');
    setCustomTextMutedColor('#8a717a');
    setCustomBorderColor('#2d1822');
    setCustomBtnBgColor('#2b1620');
    setCustomBtnSecondaryBgColor('#1c0f16');
    setGradientApplyTarget('all');
    setReadingEffect('none');
    setStoryBorderStyle('solid');
    setStoryBorderWidth('thin');
    setStoryBorderRadius('none');
    setStoryBorderCornerAccent('none');
    setStoryBorderGlow('none');
    setIsCreatingStory(true);
  };

  // Open Edit Story
  const handleOpenEditStory = (story: Story) => {
    setEditingStory(story);
    setStoryTitle(story.title);
    setStoryAuthor(story.author || 'Tử Thời Hoan');
    setStoryEditorName(
      story.editorName !== undefined ? story.editorName : (
        userProfile?.displayName ||
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Cục Nâu'
      )
    );
    setStoryEditorPhoto(
      story.editorPhoto !== undefined ? story.editorPhoto : (
        userProfile?.photoURL ||
        currentUser?.photoURL ||
        ''
      )
    );
    setStoryCoverUrl(story?.coverUrl || '');
    setStorySynopsis(story?.synopsis || '');
    setStoryTagsInput(story?.tags ? story.tags.join(', ') : '');
    setThemeTone(story.themeTone || 'dark-rose');
    setDefaultFont(story.defaultFont || 'font-mono');
    setCustomTitleFont(story.customTitleFont || story.defaultFont || 'font-mono');
    setCustomChapterTitleFont(story.customChapterTitleFont || story.customSubtitleFont || story.customTitleFont || story.defaultFont || 'font-mono');
    setCustomSubtitleFont(story.customSubtitleFont || story.customTitleFont || story.defaultFont || 'font-mono');
    setCustomBodyFont(story.customBodyFont || story.defaultFont || 'font-mono');
    setCustomMutedFont(story.customMutedFont || story.defaultFont || 'font-mono');
    setCustomBtnFont(story.customBtnFont || story.defaultFont || 'font-mono');
    setTitleFontSize(story.titleFontSize || '24px');
    setBodyFontSize(story.bodyFontSize || '14px');
    
    const bg = story.customBgColor || '#080406';
    if (bg.includes('gradient')) {
      setCustomBgType('gradient');
      const angleMatch = bg.match(/(\d+)deg/);
      const colorMatches = bg.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g);
      if (angleMatch) setCustomGradientAngle(angleMatch[1]);
      if (colorMatches && colorMatches.length >= 2) {
         setCustomGradientColor1(colorMatches[0]);
         setCustomGradientColor2(colorMatches[1]);
      } else {
        setCustomGradientColor1('#2b111e');
        setCustomGradientColor2('#0d0509');
      }
    } else {
      setCustomBgType('solid');
      setCustomGradientColor1('#2b111e');
      setCustomGradientColor2('#0d0509');
      setCustomGradientAngle('135');
    }

    setCustomBgColor(bg);
    setCustomCardBgColor(story.customCardBgColor || '#11090c');
    setCustomTextColor(story.customTextColor || '#e0d0d5');
    setCustomTextMutedColor(story.customTextMutedColor || '#8a717a');
    setCustomBorderColor(story.customBorderColor || '#2d1822');
    setCustomBtnBgColor(story.customBtnBgColor || '#2b1620');
    setCustomBtnSecondaryBgColor(story.customBtnSecondaryBgColor || '#1c0f16');
    setGradientApplyTarget('all');
    setReadingEffect(story.readingEffect || 'none');
    setReadingEffectColor(story.readingEffectColor || '#00f0ff');
    setStoryBorderStyle(story.borderStyle || 'solid');
    setStoryBorderWidth(story.borderWidth || 'thin');
    setStoryBorderRadius(story.borderRadius || 'none');
    setStoryBorderCornerAccent(story.borderCornerAccent || 'none');
    setStoryBorderGlow(story.borderGlow || 'none');
    setStoryCustomBorderGradientColor2(story.customBorderGradientColor2 || '#ff6b9d');
    setStoryCustomBorderGlowColor1(story.customBorderGlowColor1 || '#ff6b9d');
    setStoryCustomBorderGlowColor2(story.customBorderGlowColor2 || '#38bdf8');
    setIsCreatingStory(true);
  };

  // Save Story
  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim()) return;

    const resolvedEditorName = 
      storyEditorName.trim() !== ''
        ? storyEditorName.trim()
        : (editingStory?.editorName || userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu');

    const resolvedEditorPhoto =
      storyEditorPhoto !== undefined
        ? storyEditorPhoto.trim()
        : (editingStory?.editorPhoto !== undefined ? editingStory.editorPhoto : (userProfile?.photoURL || currentUser?.photoURL || ''));

    const parsedTags = storyTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newStory: Story = {
      id: editingStory ? editingStory.id : 'story-' + Date.now(),
      title: storyTitle.trim(),
      author: storyAuthor.trim() || 'Tác giả',
      authorUid: currentUser?.uid || editingStory?.authorUid,
      authorEmail: currentUser?.email || editingStory?.authorEmail || '',
      editorName: resolvedEditorName,
      editorPhoto: resolvedEditorPhoto,
      coverUrl: storyCoverUrl.trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: storySynopsis.trim(),
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      viewsCount: editingStory ? editingStory.viewsCount : 0,
      createdAt: editingStory ? editingStory.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      themeTone: themeTone,
      defaultFont: customBodyFont,
      customTitleFont: customTitleFont,
      customChapterTitleFont: customChapterTitleFont,
      customSubtitleFont: customSubtitleFont,
      customBodyFont: customBodyFont,
      customMutedFont: customMutedFont,
      customBtnFont: customBtnFont,
      titleFontSize: titleFontSize,
      bodyFontSize: bodyFontSize,
      customBgColor: themeTone === 'custom' ? customBgColor : undefined,
      customCardBgColor: themeTone === 'custom' ? customCardBgColor : undefined,
      customTextColor: themeTone === 'custom' ? customTextColor : undefined,
      customTextMutedColor: themeTone === 'custom' ? customTextMutedColor : undefined,
      customBorderColor: themeTone === 'custom' ? customBorderColor : undefined,
      customBtnBgColor: themeTone === 'custom' ? customBtnBgColor : undefined,
      customBtnSecondaryBgColor: themeTone === 'custom' ? customBtnSecondaryBgColor : undefined,
      readingEffect: readingEffect,
      readingEffectColor: readingEffectColor,
      borderStyle: storyBorderStyle,
      borderWidth: storyBorderWidth,
      borderRadius: storyBorderRadius,
      borderCornerAccent: storyBorderCornerAccent,
      borderGlow: storyBorderGlow,
      customBorderGradientColor2: storyCustomBorderGradientColor2,
      customBorderGlowColor1: storyCustomBorderGlowColor1,
      customBorderGlowColor2: storyCustomBorderGlowColor2,
    };

    onSaveStory(newStory);
    setIsCreatingStory(false);
  };

  // Open Create Chapter
  const handleOpenCreateChapter = () => {
    setEditingChapter(null);
    setChapterTitle('');
    setChapterVolumeTitle('');
    setChapterContent('');
    setIsChapterLocked(false);
    setChapterUnlockPrice(1);
    setIsChapterPasswordProtected(false);
    setChapterPassword('');
    setChapterPasswordHint('');
    setChapterUnlockMode('and');
    setIsCreatingChapter(true);
  };

  // Open Edit Chapter
  const handleOpenEditChapter = (chap: Chapter) => {
    setEditingChapter(chap);
    setChapterTitle(chap.title);
    setChapterVolumeTitle(chap.volumeTitle || '');
    setChapterContent(chap.content);
    setIsChapterLocked(!!chap.isLocked);
    setChapterUnlockPrice(chap.unlockPrice && chap.unlockPrice > 0 ? chap.unlockPrice : 1);
    setIsChapterPasswordProtected(!!chap.isPasswordProtected || !!chap.password);
    setChapterPassword(chap.password || '');
    setChapterPasswordHint(chap.passwordHint || '');
    setChapterUnlockMode(chap.unlockMode || 'and');
    setIsCreatingChapter(true);
  };

  // Save Chapter
  const handleSubmitChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryForChapters || !chapterTitle.trim()) return;

    if (isChapterPasswordProtected && !chapterPassword.trim()) {
      alert('Vui lòng nhập mật khẩu (Pass) cho chương hoặc bỏ chọn ô đặt mật khẩu.');
      return;
    }

    const storyChaps = (chapters || []).filter(c => c && c.storyId === selectedStoryForChapters.id);
    const nextChapterNum = editingChapter ? editingChapter.chapterNumber : storyChaps.length + 1;

    const newChapter: Chapter = {
      id: editingChapter ? editingChapter.id : 'chap-' + Date.now(),
      storyId: selectedStoryForChapters.id,
      chapterNumber: nextChapterNum,
      title: chapterTitle.trim(),
      volumeTitle: chapterVolumeTitle.trim() || undefined,
      content: chapterContent.trim(),
      views: editingChapter ? editingChapter.views : 0,
      createdAt: editingChapter ? editingChapter.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isLocked: isChapterLocked,
      unlockPrice: isChapterLocked ? Math.max(1, chapterUnlockPrice) : undefined,
      isPasswordProtected: isChapterPasswordProtected,
      password: isChapterPasswordProtected ? chapterPassword.trim() : undefined,
      passwordHint: isChapterPasswordProtected ? (chapterPasswordHint.trim() || undefined) : undefined,
      unlockMode: (isChapterLocked && isChapterPasswordProtected) ? chapterUnlockMode : undefined,
    };

    onSaveChapter(newChapter);
    setChapterTitle('');
    setChapterVolumeTitle('');
    setChapterContent('');
    setIsChapterLocked(false);
    setChapterUnlockPrice(1);
    setIsChapterPasswordProtected(false);
    setChapterPassword('');
    setChapterPasswordHint('');
    setChapterUnlockMode('and');
    setEditingChapter(null);
    setIsCreatingChapter(false);
  };

  const handleToggleSelectChapter = (chapId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapId) ? prev.filter((id) => id !== chapId) : [...prev, chapId]
    );
  };

  const handleSelectAllChapters = (allChapIds: string[], select: boolean) => {
    if (select) {
      setSelectedChapterIds(allChapIds);
    } else {
      setSelectedChapterIds([]);
    }
  };

  const handleApplyBatchVolume = async (volumeName: string | undefined) => {
    if (!selectedStoryForChapters || selectedChapterIds.length === 0) return;
    setIsUpdatingBatchVolume(true);
    try {
      const storyChaps = (chapters || []).filter((c) => c && c.storyId === selectedStoryForChapters.id);
      const count = selectedChapterIds.length;
      const cleanVol = volumeName?.trim() || undefined;
      const updatedChaps = storyChaps
        .filter((c) => c && selectedChapterIds.includes(c.id))
        .map((c) => ({
          ...c,
          volumeTitle: cleanVol,
          updatedAt: new Date().toISOString().split('T')[0],
        }));

      if (onSaveBatchChapters) {
        await onSaveBatchChapters(updatedChaps);
      } else {
        for (const ch of updatedChaps) {
          onSaveChapter(ch);
        }
      }
      setSelectedChapterIds([]);
      setBatchVolumeTitleInput('');
      setBatchVolumeSuccessMessage(
        cleanVol
          ? `Đã đưa ${count} chương vào phần "${cleanVol}" thành công!`
          : `Đã xóa tên phần cho ${count} chương thành công!`
      );
      setTimeout(() => {
        setBatchVolumeSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Error applying batch volume:', err);
    } finally {
      setIsUpdatingBatchVolume(false);
    }
  };

  const handleMoveChapter = async (chapId: string, direction: 'up' | 'down') => {
    if (!selectedStoryForChapters) return;
    const storyChaps = (chapters || [])
      .filter((c) => c && c.storyId === selectedStoryForChapters.id)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);

    const idx = storyChaps.findIndex((c) => c.id === chapId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === storyChaps.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newOrder = [...storyChaps];
    const [moved] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, moved);

    const updatedBatch = newOrder.map((c, i) => ({
      ...c,
      chapterNumber: i + 1,
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    if (onSaveBatchChapters) {
      await onSaveBatchChapters(updatedBatch);
    } else {
      for (const ch of updatedBatch) {
        onSaveChapter(ch);
      }
    }
  };

  // Claim ownership for a legacy story
  const handleClaimStory = async (story: Story) => {
    if (!currentUser) return;
    await claimStoryOwnership(
      story.id,
      currentUser.uid,
      currentUser.email || '',
      currentUser.displayName || ''
    );
    const updatedStory: Story = {
      ...story,
      authorUid: currentUser.uid,
      authorEmail: currentUser.email || '',
      editorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Editor',
      editorPhoto: currentUser.photoURL || '',
    };
    onSaveStory(updatedStory);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-mono-code text-[#e0d0d5]">
      
      {/* Top Banner */}
      <div className="bg-[#11090c] border border-[#2d1822] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#e0d0d5] text-sm font-bold font-mono-code uppercase tracking-[0.15em]">
            Khu vực Quản lý của Editor
          </h1>
          <p className="text-xs text-[#8a717a] mt-1 font-mono-code">
            Editor: <strong className="text-[#e0c0cc]">{currentUser?.displayName || currentUser?.email || 'Editor'}</strong> • Mỗi Editor chỉ xem và quản lý những bộ truyện do chính mình đăng tải.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleOpenCreateStory}
            className="px-5 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm truyện</span>
          </button>
        </div>
      </div>

      {/* Chapters Sub-manager View if Selected */}
      {selectedStoryForChapters ? (
        <div className="bg-[#11090c] border border-[#2d1822] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#23151b] pb-4">
            <button
              onClick={() => {
                setSelectedStoryForChapters(null);
                setIsCreatingChapter(false);
                setEditingChapter(null);
              }}
              className="flex items-center gap-1.5 text-xs text-[#8a717a] hover:text-[#e0c0cc] transition font-mono-code"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách truyện</span>
            </button>
            <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc]">
              Quản lý chương: {selectedStoryForChapters.title}
            </h2>
          </div>

          {!isCreatingChapter ? (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-[#8a717a] font-mono-code">
                  Tổng số chương: {(chapters || []).filter(c => c && c.storyId === selectedStoryForChapters.id).length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBulkUploadingChapter(true)}
                    className="px-3.5 py-2 bg-[#1b1016] hover:bg-[#281622] border border-[#5e2f46] text-[#ffd6e2] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                    title="Tải lên file văn bản tổng hoặc dán nội dung để hệ thống tự nhận diện chia các chương"
                  >
                    <UploadCloud className="w-4 h-4 text-[#d0a0b0]" />
                    <span>Tải file tổng (Tự chia chương)</span>
                  </button>
                  <button
                    onClick={handleOpenCreateChapter}
                    className="px-4 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#e0c0cc] text-xs font-mono-code font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Viết chương mới</span>
                  </button>
                </div>
              </div>

              {/* Batch Volume / Section Manager Toolbar */}
              {(() => {
                const storyChaps = (chapters || [])
                  .filter((c) => c && c.storyId === selectedStoryForChapters.id)
                  .sort((a, b) => a.chapterNumber - b.chapterNumber);

                if (storyChaps.length === 0) return null;

                const existingVolumes = Array.from(
                  new Set(
                    storyChaps
                      .map((c) => c.volumeTitle?.trim())
                      .filter((v): v is string => Boolean(v && v.length > 0))
                  )
                );

                return (
                  <div className="p-3.5 bg-[#160a11] border border-[#3d1f2e] space-y-3 rounded-xs">
                    {/* Success feedback toast */}
                    {batchVolumeSuccessMessage && (
                      <div className="p-2.5 bg-[#1f2d1a] border border-[#3e6933] text-[#c3f0b4] text-xs font-mono-code flex items-center gap-2 rounded-xs animate-fadeIn">
                        <Check className="w-4 h-4 text-[#7ee765] shrink-0" />
                        <span>{batchVolumeSuccessMessage}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#ffd6e2]">
                          <input
                            type="checkbox"
                            checked={selectedChapterIds.length === storyChaps.length && storyChaps.length > 0}
                            onChange={(e) => handleSelectAllChapters(storyChaps.map(c => c.id), e.target.checked)}
                            className="cursor-pointer accent-[#5e2f46] w-4 h-4"
                          />
                          <span>Chọn tất cả ({storyChaps.length} chương)</span>
                        </label>
                        {selectedChapterIds.length > 0 && (
                          <span className="text-[11px] text-[#ff99bb] font-bold bg-[#26101c] px-2 py-0.5 border border-[#5e2f46] rounded-xs">
                            Đã chọn {selectedChapterIds.length} chương
                          </span>
                        )}
                      </div>
                      {selectedChapterIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedChapterIds([])}
                          className="text-[11px] text-[#8a717a] hover:text-[#ffd6e2] underline cursor-pointer"
                        >
                          Bỏ chọn tất cả
                        </button>
                      )}
                    </div>

                    {/* Quick Pick Existing Volumes */}
                    {existingVolumes.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-[#25121b]">
                        <div className="flex items-center justify-between text-[11px] text-[#b3889b] font-bold">
                          <span>Các phần / quyển đã có sẵn trong truyện:</span>
                          <span className="text-[10px] text-[#8a717a]">Bấm để chọn nhanh</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {existingVolumes.map((vol) => {
                            const countInVol = storyChaps.filter((c) => c.volumeTitle === vol).length;
                            const isCurrentInput = batchVolumeTitleInput.trim() === vol;
                            return (
                              <button
                                key={vol}
                                type="button"
                                onClick={() => setBatchVolumeTitleInput(vol)}
                                className={`px-2.5 py-1 text-xs font-mono-code rounded-xs flex items-center gap-1.5 transition border cursor-pointer ${
                                  isCurrentInput
                                    ? 'bg-[#3b172a] border-[#ff99bb] text-[#ffd6e2] font-bold shadow-xs'
                                    : 'bg-[#1b0c15] hover:bg-[#281220] border-[#3b1c2b] text-[#e0c0cc]'
                                }`}
                              >
                                <BookOpen className="w-3 h-3 text-[#ff99bb]" />
                                <span className="truncate max-w-[220px]">{vol}</span>
                                <span className="text-[10px] text-[#ff99bb] font-semibold bg-[#2d1222] px-1 rounded-xs">
                                  {countInVol}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Bar: Input + Dropdown + Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {existingVolumes.length > 0 && (
                        <select
                          value={existingVolumes.includes(batchVolumeTitleInput) ? batchVolumeTitleInput : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setBatchVolumeTitleInput(e.target.value);
                            }
                          }}
                          className="bg-[#10070a] border border-[#2d1822] px-2.5 py-1.5 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] font-mono-code max-w-[200px]"
                        >
                          <option value="">-- Chọn phần có sẵn ({existingVolumes.length}) --</option>
                          {existingVolumes.map((vol) => (
                            <option key={vol} value={vol}>
                              {vol} ({storyChaps.filter((c) => c.volumeTitle === vol).length} chương)
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={batchVolumeTitleInput}
                          onChange={(e) => setBatchVolumeTitleInput(e.target.value)}
                          placeholder="Nhập tên phần mới hoặc chọn ở trên (VD: Quyển 1: Đêm đông)..."
                          className="w-full bg-[#10070a] border border-[#2d1822] px-3 py-1.5 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] font-mono-code placeholder:text-[#6a555f]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyBatchVolume(batchVolumeTitleInput)}
                        disabled={!batchVolumeTitleInput.trim() || selectedChapterIds.length === 0 || isUpdatingBatchVolume}
                        className="px-3.5 py-1.5 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#ffd6e2] text-xs font-mono-code font-bold uppercase tracking-wider disabled:opacity-40 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-[#ff99bb]" />
                        <span>
                          {isUpdatingBatchVolume
                            ? 'Đang lưu...'
                            : selectedChapterIds.length > 0
                            ? `Đưa ${selectedChapterIds.length} chương vào phần này`
                            : 'Đưa chương đã chọn vào phần này'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyBatchVolume(undefined)}
                        disabled={selectedChapterIds.length === 0 || isUpdatingBatchVolume}
                        className="px-3 py-1.5 bg-[#180b12] hover:bg-[#25101b] border border-[#2d1822] hover:border-[#5e2f46] text-[#8a717a] hover:text-[#ffd6e2] text-xs font-mono-code disabled:opacity-40 transition cursor-pointer"
                      >
                        Xóa tên phần {selectedChapterIds.length > 0 ? `(${selectedChapterIds.length})` : ''}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* List of chapters with Volume Breaks / Ngắt Phần */}
              <div className="space-y-2">
                {(() => {
                  const storyChaps = (chapters || [])
                    .filter((c) => c && c.storyId === selectedStoryForChapters.id)
                    .sort((a, b) => a.chapterNumber - b.chapterNumber);

                  if (storyChaps.length === 0) {
                    return (
                      <div className="bg-[#170d12] border border-[#2d1822] p-4 text-center text-xs text-[#8a717a]">
                        Chưa có chương nào được viết.
                      </div>
                    );
                  }

                  return storyChaps.map((chap, idx) => {
                    const prevChap = idx > 0 ? storyChaps[idx - 1] : null;
                    const isNewVolume = !!(chap.volumeTitle && (!prevChap || prevChap.volumeTitle !== chap.volumeTitle));
                    const isTransitionToNoVolume = !chap.volumeTitle && !!(prevChap && prevChap.volumeTitle);
                    const isSelected = selectedChapterIds.includes(chap.id);

                    return (
                      <React.Fragment key={chap.id}>
                        {/* Volume / Section Break Header */}
                        {isNewVolume && (
                          <div className="pt-2 pb-0.5">
                            <div className="bg-[#1f0f18] border border-[#5e2f46] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#ffd6e2] rounded-xs shadow-xs">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-[#ff99bb]" />
                                <span>{chap.volumeTitle}</span>
                                <span className="text-[11px] font-normal text-[#c492a5] ml-1">
                                  ({storyChaps.filter((c) => c.volumeTitle === chap.volumeTitle).length} chương)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const volChapIds = storyChaps
                                      .filter((c) => c.volumeTitle === chap.volumeTitle)
                                      .map((c) => c.id);
                                    setSelectedChapterIds((prev) => Array.from(new Set([...prev, ...volChapIds])));
                                  }}
                                  className="text-[10px] font-mono-code font-normal px-2 py-0.5 bg-[#2a1321] hover:bg-[#3d1a30] border border-[#52253c] text-[#ffd6e2] rounded-xs transition cursor-pointer"
                                >
                                  Chọn tất cả trong phần này
                                </button>
                                {selectedChapterIds.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyBatchVolume(chap.volumeTitle)}
                                    disabled={isUpdatingBatchVolume}
                                    className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-[#3f192e] hover:bg-[#56223f] border border-[#753356] text-[#ffb8d0] rounded-xs transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    <span>+ Đưa {selectedChapterIds.length} chương đã chọn vào đây</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transition divider */}
                        {isTransitionToNoVolume && (
                          <div className="pt-2 pb-0.5">
                            <div className="bg-[#12080d] border border-dashed border-[#3b1f2d] px-3 py-1.5 flex items-center gap-2 text-xs text-[#8a717a] rounded-xs">
                              <BookOpen className="w-3 h-3 text-[#8a717a]" />
                              <span className="text-[10px] uppercase tracking-wider font-semibold">Các chương tiếp theo</span>
                            </div>
                          </div>
                        )}

                        <div 
                          className={`p-3 flex items-center justify-between text-xs font-mono-code border transition-colors ${
                            isSelected 
                              ? 'bg-[#1e0e17] border-[#6b314e]' 
                              : 'bg-[#170d12] border-[#2d1822]'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Checkbox for selecting chapter */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectChapter(chap.id)}
                              className="cursor-pointer accent-[#5e2f46] w-4 h-4 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#e0c0cc] font-mono-code">{chap.title}</span>
                                {chap.volumeTitle && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#200d18] border border-[#4d2138] text-[10px] text-[#e0a8be] font-medium rounded-xs">
                                    <BookOpen className="w-2.5 h-2.5 text-[#ff99bb]" />
                                    <span>{chap.volumeTitle}</span>
                                  </span>
                                )}
                                {chap.isLocked && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#2b1620] border border-[#5e2f46] text-[10px] text-[#ffd6e2] font-semibold">
                                    <Lock className="w-3 h-3 text-[#ff99bb]" />
                                    <span>{chap.unlockPrice || 1} Chucu</span>
                                  </span>
                                )}
                                {chap.isPasswordProtected && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#261220] border border-[#ff6699]/50 text-[10px] text-[#ffb5cd] font-semibold" title={chap.passwordHint ? `Gợi ý: ${chap.passwordHint}` : undefined}>
                                    <Key className="w-3 h-3 text-[#ff80a6]" />
                                    <span>Pass: {chap.password || '(Chưa đặt)'}</span>
                                  </span>
                                )}
                                {chap.isLocked && chap.isPasswordProtected && (
                                  <span 
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#2d1222] border border-[#ff80a6]/60 text-[10px] text-[#ffc2d4] font-semibold"
                                    title={chap.unlockMode === 'or' ? 'Độc giả hoàn thành Chucu HOẶC Pass là đọc được' : 'Bắt buộc độc giả hoàn thành CẢ Chucu VÀ Pass mới đọc được'}
                                  >
                                    <Shield className="w-2.5 h-2.5 text-[#ff80a6]" />
                                    <span>{chap.unlockMode === 'or' ? 'Mở: Chucu OR Pass' : 'Mở: Chucu AND Pass'}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#8a717a]">Cập nhật: {chap.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <div className="flex items-center gap-0.5 border-r border-[#2d1822] pr-1.5 mr-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveChapter(chap.id, 'up')}
                                className="p-1 text-[#8a717a] hover:text-[#ffd6e2] disabled:opacity-20 transition cursor-pointer disabled:cursor-not-allowed"
                                title="Di chuyển chương lên trên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === storyChaps.length - 1}
                                onClick={() => handleMoveChapter(chap.id, 'down')}
                                className="p-1 text-[#8a717a] hover:text-[#ffd6e2] disabled:opacity-20 transition cursor-pointer disabled:cursor-not-allowed"
                                title="Di chuyển chương xuống dưới"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleOpenEditChapter(chap)}
                              className="p-1.5 text-[#8a717a] hover:text-[#ffd6e2] transition"
                              title="Sửa chương / Đổi ngắt phần / Đổi giá Chucu / Đổi Pass"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setChapterToDelete(chap)}
                              className="p-1.5 text-[#8a717a] hover:text-[#ff99b0] transition"
                              title="Xóa chương"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            /* Create / Edit Chapter Form */
            <form onSubmit={handleSubmitChapter} className="space-y-4 bg-[#170d12] border border-[#2d1822] p-4 font-mono-code">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23151b] pb-2">
                <h3 className="text-xs font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc]">
                  {editingChapter ? `Sửa chương: ${editingChapter.title}` : 'Viết chương mới'}
                </h3>
                {!editingChapter && (
                  <button
                    type="button"
                    onClick={() => setIsBulkUploadingChapter(true)}
                    className="text-[11px] text-[#ffd6e2] hover:text-white bg-[#221019] hover:bg-[#321724] px-2.5 py-1 border border-[#5e2f46] transition flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#d0a0b0]" />
                    <span>Hoặc Tải file tổng tự chia chương</span>
                  </button>
                )}
              </div>

              {/* Volume Title / Section Break field */}
              <div className="space-y-1.5 bg-[#140a0f] border border-[#2d1822] p-3 rounded-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-xs font-bold text-[#ffd6e2] block font-mono-code flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Phần / Quyển (Ngắt phần - Tùy chọn):</span>
                  </label>
                  <span className="text-[10px] text-[#8a717a] italic">Ví dụ: Quyển 1: Đêm đông sống lại</span>
                </div>
                <input
                  type="text"
                  value={chapterVolumeTitle}
                  onChange={(e) => setChapterVolumeTitle(e.target.value)}
                  placeholder="Nhập tên phần/quyển để gom nhóm các chương (Ví dụ: Quyển 1: Đêm đông sống lại)..."
                  className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] font-mono-code"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Tiêu đề chương:</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Ví dụ: Chương 1: Khởi đầu..."
                  className="w-full bg-[#12090c] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                  required
                />
              </div>

              {/* Lock Chapter Setting with Chucu */}
              <div className="p-3 bg-[#140a0f] border border-[#2d1822] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChapterLocked}
                    onChange={(e) => setIsChapterLocked(e.target.checked)}
                    className="cursor-pointer accent-[#5e2f46] w-4 h-4"
                  />
                  <span className="font-bold text-xs text-[#ffd6e2] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Khóa chương này bằng Chucu (Độc giả dùng Chucu để mở khóa)</span>
                  </span>
                </label>

                {isChapterLocked && (
                  <div className="flex flex-wrap items-center gap-2 pl-6 pt-1 text-xs">
                    <span className="text-[#e0c0cc]">Số Chucu để mở khóa:</span>
                    <input
                      type="number"
                      min={1}
                      value={chapterUnlockPrice}
                      onChange={(e) => setChapterUnlockPrice(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-[#10070a] border border-[#5e2f46] p-1.5 text-center text-xs text-[#ffd6e2] font-bold focus:outline-none"
                      required
                    />
                    <span className="text-[#ffd6e2] font-bold">Chucu</span>
                    <span className="text-[10px] text-[#8a717a] italic">(Tối thiểu 1 Chucu).</span>
                  </div>
                )}
              </div>

              {/* Password Protection Setting (Pass chương) */}
              <div className="p-3 bg-[#140a0f] border border-[#2d1822] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChapterPasswordProtected}
                    onChange={(e) => setIsChapterPasswordProtected(e.target.checked)}
                    className="cursor-pointer accent-[#5e2f46] w-4 h-4"
                  />
                  <span className="font-bold text-xs text-[#ffd6e2] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Đặt mật khẩu (Pass) cho chương (Độc giả nhập đúng pass để đọc)</span>
                  </span>
                </label>

                {isChapterPasswordProtected && (
                  <div className="space-y-2.5 pl-6 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#ffd6e2] font-bold block font-mono-code flex items-center gap-1.5">
                        <span>Mật khẩu (Pass) bắt buộc:</span>
                        <span className="text-[#ff99bb]">*</span>
                      </label>
                      <input
                        type="text"
                        value={chapterPassword}
                        onChange={(e) => setChapterPassword(e.target.value)}
                        placeholder="Nhập mật khẩu (ví dụ: chuong1pass, 2026, ...)..."
                        className="w-full bg-[#10070a] border border-[#5e2f46] p-2 text-xs text-[#ffd6e2] font-bold focus:outline-none font-mono-code"
                        required={isChapterPasswordProtected}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#8a717a] block font-mono-code flex items-center justify-between">
                        <span>Gợi ý mật khẩu / Câu đố (Tùy chọn hiển thị cho độc giả):</span>
                        <span className="italic text-[10px]">Tùy chọn</span>
                      </label>
                      <input
                        type="text"
                        value={chapterPasswordHint}
                        onChange={(e) => setChapterPasswordHint(e.target.value)}
                        placeholder="Ví dụ: Tên thú cưng của nam chính viết liền không dấu..."
                        className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] font-mono-code"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lựa chọn Quy tắc mở khóa khi đặt CẢ Chucu VÀ Mật khẩu */}
              {isChapterLocked && isChapterPasswordProtected && (
                <div className="p-3 bg-[#1e0f18] border border-[#ff6699]/60 space-y-2.5">
                  <label className="text-xs font-bold text-[#ffd6e2] block font-mono-code flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#ff80a6]" />
                    <span>Cấu hình điều kiện mở khóa (Do đặt CẢ Chucu VÀ Mật khẩu):</span>
                  </label>
                  <div className="space-y-2 pl-2 font-mono-code">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="unlockMode"
                        value="and"
                        checked={chapterUnlockMode === 'and'}
                        onChange={() => setChapterUnlockMode('and')}
                        className="mt-0.5 cursor-pointer accent-[#ff6699]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#ffd6e2] block">1. Bắt buộc mở CẢ 2 (Chucu AND Pass)</span>
                        <span className="text-[11px] text-[#8a717a] block leading-tight">
                          Độc giả vừa phải trả Chucu VÀ vừa phải nhập đúng Pass mới mở được chương.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="unlockMode"
                        value="or"
                        checked={chapterUnlockMode === 'or'}
                        onChange={() => setChapterUnlockMode('or')}
                        className="mt-0.5 cursor-pointer accent-[#ff6699]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#ffd6e2] block">2. Chỉ cần mở 1 TRONG 2 (Chucu HOẶC Pass)</span>
                        <span className="text-[11px] text-[#8a717a] block leading-tight">
                          Độc giả trả Chucu HOẶC nhập đúng Pass (chỉ cần làm 1 trong 2 cách) là mở được chương ngay.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Nội dung chữ:</label>
                  
                  {/* Nút mở Modal Trình Tạo Khung Trực Quan */}
                  <button
                    type="button"
                    onClick={() => setShowSpecialFrameModal(true)}
                    className="px-2 py-1 rounded bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[11px] text-[#ffd6e2] font-mono-code font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Frame className="w-3.5 h-3.5 text-pink-400" />
                    <span>Trình tạo khung đặc biệt</span>
                  </button>
                </div>

                {/* Quick Frame Tags Toolbar */}
                <div className="p-2 rounded bg-[#0d0608] border border-[#2d1822] flex flex-wrap items-center gap-1.5 text-[11px] font-mono-code">
                  <span className="text-[#8a717a] text-[10px] mr-1 flex items-center gap-1">
                    <Frame className="w-3 h-3 text-pink-400" /> Chèn nhanh:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInsertStudioFrameSnippet('[system: THÔNG BÁO HỆ THỐNG]\nNội dung thông báo hệ thống ở đây...\n[/system]')}
                    className="px-2 py-0.5 rounded bg-[#160a0f] hover:bg-[#241119] border border-[#331c27] text-[#38bdf8] flex items-center gap-1 cursor-pointer"
                  >
                    <BellRing className="w-2.5 h-2.5" /> Hệ thống
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertStudioFrameSnippet('[forum: Diễn Đàn Mạng Xã Hội]\n[netizen: Lầu 1 - Ăn dưa | 1 phút trước | +99]: Bình luận của cư dân mạng...\n[netizen: Qua Đường Giáp | Vừa xong | +45]: Bình luận tiếp theo...\n[/forum]')}
                    className="px-2 py-0.5 rounded bg-[#160a0f] hover:bg-[#241119] border border-[#331c27] text-[#f472b6] flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-2.5 h-2.5" /> Cư dân mạng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertStudioFrameSnippet('[chat: Hộp Thoại Trò Chuyện]\n[left: Đối phương]: Cậu đang ở đâu thế?\n[right: Tôi]: Tớ vừa tới nơi nè!\n[/chat]')}
                    className="px-2 py-0.5 rounded bg-[#160a0f] hover:bg-[#241119] border border-[#331c27] text-[#4ade80] flex items-center gap-1 cursor-pointer"
                  >
                    <Smartphone className="w-2.5 h-2.5" /> Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertStudioFrameSnippet('[letter: Mật Hàm Cổ Điển | Gửi người thừa kế]\nNội dung bức thư hoặc nhật ký ở đây...\n[/letter]')}
                    className="px-2 py-0.5 rounded bg-[#160a0f] hover:bg-[#241119] border border-[#331c27] text-[#fbbf24] flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-2.5 h-2.5" /> Thư tay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertStudioFrameSnippet('[status: BẢNG TRẠNG THÁI]\nCảnh giới: Luyện Khí Kỳ\nHP: 100/100\nKỹ năng: Hỏa Cầu Thuật\n[/status]')}
                    className="px-2 py-0.5 rounded bg-[#160a0f] hover:bg-[#241119] border border-[#331c27] text-[#c084fc] flex items-center gap-1 cursor-pointer"
                  >
                    <Shield className="w-2.5 h-2.5" /> Bảng RPG
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertStudioFrameSnippet('[note: Lời tác giả]\nLời nhắn nhủ hoặc chú thích thuật ngữ của tác giả...\n[/note]')}
                    className="px-2 py-0.5 rounded bg-[#160a0f] hover:bg-[#241119] border border-[#331c27] text-[#94a3b8] flex items-center gap-1 cursor-pointer"
                  >
                    <StickyNote className="w-2.5 h-2.5" /> Lời tác giả
                  </button>
                </div>

                <div className="relative">
                  <style>{`
                    .studio-chapter-textarea::selection {
                      background-color: rgba(232, 121, 249, 0.4) !important;
                      color: inherit !important;
                    }
                  `}</style>
                  <textarea
                    ref={studioTextareaRef}
                    value={chapterContent}
                    onChange={(e) => {
                      setChapterContent(e.target.value);
                      handleStudioTextSelect();
                    }}
                    onSelect={handleStudioTextSelect}
                    onKeyUp={handleStudioTextSelect}
                    onMouseUp={handleStudioTextSelect}
                    onTouchEnd={handleStudioTextSelect}
                    placeholder="Nhập nội dung chương truyện ở đây... Bạn có thể bôi đen bất kỳ đoạn văn bản nào để tạo khung đặc biệt trực tiếp."
                    rows={14}
                    className="studio-chapter-textarea w-full bg-[#12090c] border border-[#2d1822] p-3 text-sm text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] leading-relaxed resize-y font-mono-code"
                    required
                  />

                  {/* Floating Selection Toolbar for Highlighted text */}
                  <FloatingSelectionMenu
                    visible={floatingMenuVisible}
                    position={floatingMenuPos}
                    selectedText={selectedRange.text}
                    onApplyPreset={handleApplyPresetToStudioSelection}
                    onOpenDesigner={handleOpenStudioDesignerForSelection}
                    themeColors={{
                      bg: '#0d0608',
                      cardBg: '#150a0f',
                      border: '#331c27',
                      btnBg: '#e879f9',
                      btnText: '#000000',
                      btnSecondaryBg: '#241119',
                      btnBorder: '#5e2f46',
                      text: '#ffd6e2',
                      textMuted: '#a88d98',
                      accentColor: '#e879f9',
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingChapter(false);
                    setEditingChapter(null);
                  }}
                  className="px-4 py-1.5 bg-[#12090c] border border-[#2d1822] text-xs text-[#8a717a] font-mono-code"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#2b1620] border border-[#5e2f46] text-xs text-[#e0c0cc] font-mono-code font-bold uppercase tracking-wider"
                >
                  {editingChapter ? 'Lưu cập nhật' : 'Đăng chương'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Stories List */
        <div className="bg-[#11090c] border border-[#2d1822] p-6 space-y-4 font-mono-code">
          <div className="flex items-center justify-between border-b border-[#23151b] pb-2">
            <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc]">
              Danh sách truyện của bạn ({visibleStories.length})
            </h2>
            <span className="text-[11px] text-[#8a717a]">
              {visibleStories.length === 1 ? '1 bộ truyện' : `${visibleStories.length} bộ truyện`}
            </span>
          </div>

          {visibleStories.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8a717a] font-mono-code space-y-2">
              <p>Bạn chưa đăng tải bộ truyện nào vào Studio này.</p>
              <p className="text-[11px] text-[#5e2f46]">Bấm nút "+ Thêm truyện" ở góc trên để bắt đầu tạo truyện của riêng bạn!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(visibleStories || []).map((story) => {
                const storyChaps = (chapters || []).filter(c => c && c.storyId === story.id);
                const isOwnedByCurrent = story.authorUid === currentUser?.uid || (story.authorEmail && story.authorEmail === currentUser?.email);

                return (
                  <div
                    key={story.id}
                    className="bg-[#170d12] border border-[#2d1822] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {story.coverUrl && (
                        <img
                          src={story.coverUrl}
                          alt={story.title}
                          className="w-12 h-16 object-cover border border-[#2d1822] shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onSelectStoryForDetail(story)}
                            className="font-bold text-sm font-mono-code text-[#e0c0cc] hover:text-[#d0a0b0] cursor-pointer transition"
                          >
                            {story.title}
                          </h3>
                          {story.authorEmail && (
                            <span className="text-[10px] text-[#8a717a] border border-[#2d1822] px-1.5 py-0.2">
                              {story.authorEmail}
                            </span>
                          )}
                          {!story.authorUid && (
                            <span className="text-[10px] text-[#ffb86c] bg-[#2a1a0a] border border-[#664411] px-1.5 py-0.2 flex items-center gap-1">
                              <span>Truyện ban đầu</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8a717a] mt-0.5 font-mono-code">
                          Tác giả/Editor: <span className="text-[#e0c0cc]">{story.author}</span> • {storyChaps.length} chương • Ngày đăng: <span>{story.createdAt}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end font-mono-code flex-wrap">
                      {!isOwnedByCurrent && (
                        <button
                          onClick={() => handleClaimStory(story)}
                          className="px-2.5 py-1.5 bg-[#2a1a0a] hover:bg-[#3d260f] border border-[#7a4e18] text-[#ffd699] flex items-center gap-1 transition"
                          title="Gán quyền quản lý bộ truyện này vĩnh viễn về tài khoản của bạn"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Nhận quyền quản lý</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditStory(story)}
                        className="px-3 py-1.5 bg-[#1f1017] hover:bg-[#2d1822] border border-[#3d202e] text-[#e0c0cc] flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => setStoryToDelete(story)}
                        className="p-1.5 bg-[#1f1017] hover:bg-[#3d1828] border border-[#3d202e] text-[#d0a0b0] hover:text-[#ff99b0] transition"
                        title="Xóa truyện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal: Delete Story */}
      {storyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#14080e] border border-[#ff3366]/40 p-6 max-w-md w-full shadow-2xl text-left font-mono-code">
            <h3 className="text-base font-bold text-[#ffb0c8] mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#ff3366]" />
              <span>Xác nhận xóa bộ truyện?</span>
            </h3>
            <p className="text-xs text-[#c0a0b0] mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa bộ truyện <strong className="text-[#ffe0ec]">"{storyToDelete.title}"</strong> không? 
              Hành động này sẽ xóa vĩnh viễn bộ truyện cùng toàn bộ các chương và bình luận liên quan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStoryToDelete(null)}
                disabled={isDeletingStory}
                className="px-4 py-2 border border-[#3d202e] text-[#a08090] hover:text-white transition text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeletingStory(true);
                  try {
                    await onDeleteStory(storyToDelete.id);
                  } finally {
                    setIsDeletingStory(false);
                    setStoryToDelete(null);
                  }
                }}
                disabled={isDeletingStory}
                className="px-4 py-2 bg-[#8b1538] hover:bg-[#a61c45] text-white flex items-center gap-2 font-medium transition text-xs"
              >
                {isDeletingStory ? <span>Đang xóa...</span> : <span>Xác nhận xóa</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Chapter */}
      {chapterToDelete && selectedStoryForChapters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#14080e] border border-[#ff3366]/40 p-6 max-w-md w-full shadow-2xl text-left font-mono-code">
            <h3 className="text-base font-bold text-[#ffb0c8] mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#ff3366]" />
              <span>Xác nhận xóa chương?</span>
            </h3>
            <p className="text-xs text-[#c0a0b0] mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong className="text-[#ffe0ec]">Chương {chapterToDelete.chapterNumber}: {chapterToDelete.title}</strong> không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setChapterToDelete(null)}
                className="px-4 py-2 border border-[#3d202e] text-[#a08090] hover:text-white transition text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteChapter(chapterToDelete.id, selectedStoryForChapters.id);
                  setChapterToDelete(null);
                }}
                className="px-4 py-2 bg-[#8b1538] hover:bg-[#a61c45] text-white font-medium transition text-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live WYSIWYG Story Editor */}
      {isCreatingStory && (
        <LiveStoryEditor
          initialStory={editingStory}
          currentUser={currentUser}
          userProfile={userProfile}
          chapters={editingStory ? (chapters || []).filter((c) => c && c.storyId === editingStory.id) : (chapters || [])}
          onSaveChapter={onSaveChapter}
          onDeleteChapter={onDeleteChapter}
          onSaveBatchChapters={onSaveBatchChapters}
          onOpenChapterManager={(story) => {
            setIsCreatingStory(false);
            setSelectedStoryForChapters(story);
          }}
          onSave={handleLiveStorySave}
          onCancel={() => {
            setIsCreatingStory(false);
            setEditingStory(null);
          }}
        />
      )}

      {/* Hidden Old Modal Form */}
      {false && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitStory}
            className="bg-[#11090c] border border-[#3d202e] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto font-mono-code rounded-none text-left"
          >
            {/* Sticky Header with Close Button */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2d1822] bg-[#150a0f] shrink-0">
              <h3 className="font-bold text-xs sm:text-sm font-mono-code uppercase tracking-[0.15em] text-[#ffd6e2]">
                {editingStory ? 'Sửa thông tin truyện' : 'Thêm truyện mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingStory(false)}
                className="text-[#8a717a] hover:text-[#ffd6e2] p-1 transition"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Tiêu đề truyện:</label>
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Tác giả (Tác giả nguyên tác):</label>
                <input
                  type="text"
                  value={storyAuthor}
                  onChange={(e) => setStoryAuthor(e.target.value)}
                  placeholder="Ví dụ: Tử Thời Hoan"
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                />
              </div>

              {/* Editor Info (Tên hiển thị & Avatar của Editor) */}
              <div className="p-3 bg-[#150a0f] border border-[#3d202e] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2d1822] pb-1.5">
                  <span className="text-xs font-bold text-[#ffd6e2] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d0a0b0]" />
                    <span>Thông tin Editor / Người dịch</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryEditorName(userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu');
                      setStoryEditorPhoto(userProfile?.photoURL || currentUser?.photoURL || '');
                    }}
                    className="text-[10px] text-[#8a717a] hover:text-[#ffd6e2] underline"
                    title="Lấy theo thông tin tài khoản hiện tại"
                  >
                    Lấy theo tài khoản ({userProfile?.displayName || currentUser?.displayName || 'Cục Nâu'})
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Tên Editor hiển thị:</label>
                  <input
                    type="text"
                    value={storyEditorName}
                    onChange={(e) => setStoryEditorName(e.target.value)}
                    placeholder="Ví dụ: Cục Nâu"
                    className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Ảnh đại diện Editor (Avatar):</label>
                  <div className="flex items-center gap-3 bg-[#10070a] border border-[#2d1822] p-2.5">
                    <div className="w-10 h-10 rounded-full border border-[#3d202e] overflow-hidden shrink-0 bg-black flex items-center justify-center">
                      {storyEditorPhoto ? (
                        <img
                          src={storyEditorPhoto}
                          alt="Avatar Editor"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#8a717a]" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <label className="cursor-pointer px-2.5 py-1 bg-[#221019] hover:bg-[#321724] border border-[#5e2f46] text-[#ffd6e2] text-[11px] font-bold flex items-center gap-1 transition">
                        <Upload className="w-3 h-3" />
                        <span>{isCompressingEditorPhoto ? 'Đang nén...' : 'Tải avatar mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsCompressingEditorPhoto(true);
                              try {
                                const compressed = await compressImage(file, 250, 250);
                                if (compressed) {
                                  setStoryEditorPhoto(compressed);
                                }
                              } catch (err) {
                                console.error('Lỗi nén ảnh avatar:', err);
                              } finally {
                                setIsCompressingEditorPhoto(false);
                              }
                            }
                          }}
                        />
                      </label>
                      {storyEditorPhoto && (
                        <button
                          type="button"
                          onClick={() => setStoryEditorPhoto('')}
                          className="px-2 py-1 bg-[#200b12] hover:bg-[#30121b] border border-[#4d1f2a] text-[#fca5a5] text-[11px] transition"
                        >
                          Xóa avatar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Ảnh bìa truyện (Tải lên từ thiết bị):</label>
                <div className="flex items-center gap-4 bg-[#170d12] border border-[#2d1822] p-3">
                  {storyCoverUrl ? (
                    <div className="relative shrink-0 border border-[#3d202e] w-16 h-20 bg-black">
                      <img
                        src={storyCoverUrl}
                        alt="Xem trước ảnh bìa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setStoryCoverUrl('')}
                        className="absolute -top-1.5 -right-1.5 bg-[#471b20] hover:bg-[#5a2329] border border-[#7a2e36] text-[#fecaca] p-0.5 rounded-full"
                        title="Xóa ảnh"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0 border border-dashed border-[#2d1822] w-16 h-20 flex items-center justify-center text-[10px] text-[#6e5860] bg-black">
                      Trống
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsCompressingCover(true);
                          try {
                            const compressed = await compressImage(file);
                            if (compressed) {
                              setStoryCoverUrl(compressed);
                            }
                          } catch (err) {
                            console.error('Lỗi nén ảnh bìa:', err);
                          } finally {
                            setIsCompressingCover(false);
                          }
                        }
                      }}
                      className="block w-full text-xs text-[#8a717a]
                        file:mr-3 file:py-1 file:px-2
                        file:border file:border-[#5e2f46]
                        file:text-xs file:font-semibold
                        file:bg-[#2b1620] file:text-[#e0c0cc]
                        hover:file:bg-[#3d1e2c] file:cursor-pointer"
                    />
                    <p className="text-[10px] text-[#6e5860]">
                      {isCompressingCover ? (
                        <span className="text-[#fdba74] font-bold animate-pulse">Đang nén ảnh bìa gọn nhẹ...</span>
                      ) : (
                        'Hỗ trợ định dạng JPG, PNG, GIF. Kích thước đề xuất: 300x400px.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8a717a] block font-mono-code">Giới thiệu:</label>
                <textarea
                  value={storySynopsis}
                  onChange={(e) => setStorySynopsis(e.target.value)}
                  placeholder="Giới thiệu về truyện..."
                  rows={4}
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                />
              </div>

              {/* Story Tags Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#8a717a] block font-mono-code">Tag truyện (cách nhau bởi dấu phẩy):</label>
                  <span className="text-[10px] text-[#6e5860] font-mono-code">Ví dụ: Đam mỹ, Xuyên sách, Ngọt sủng</span>
                </div>
                <input
                  type="text"
                  value={storyTagsInput}
                  onChange={(e) => setStoryTagsInput(e.target.value)}
                  placeholder="Ví dụ: Đam mỹ, Hiện đại, Xuyên sách, Ngọt sủng, Hài hước..."
                  className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                />
                {storyTagsInput.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {storyTagsInput
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#221019] border border-[#4a2235] text-[#ffd6e2] text-[10px] rounded-xs font-mono-code flex items-center gap-1"
                        >
                          <span>#{tag}</span>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Tông màu truyện:</label>
                    <select
                      value={themeTone}
                      onChange={(e) => setThemeTone(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      <optgroup label="── Đơn sắc (Classic) ──">
                        <option value="dark-rose">Hồng Tối (Mặc định)</option>
                        <option value="choco-light">Sô-cô-la Sữa Sáng (Choco Light)</option>
                        <option value="sepia">Cổ điển (Sepia)</option>
                        <option value="emerald">Lục Bảo (Emerald)</option>
                        <option value="slate">Xám Slate (Tối giản)</option>
                        <option value="classic-dark">Tối Thuần (Classic Dark)</option>
                      </optgroup>
                      <optgroup label="── Gradient (Chuyển sắc) ──">
                        <option value="gradient-choco-light">Gradient Kem Ca Cao Sáng (Choco Light)</option>
                        <option value="gradient-rose">Gradient Hồng Rượu (Rose Velvet)</option>
                        <option value="gradient-midnight">Gradient Đêm Thần Thoại (Midnight)</option>
                        <option value="gradient-ocean">Gradient Biển Sâu (Deep Ocean)</option>
                        <option value="gradient-emerald">Gradient Rừng Ngọc (Emerald Glow)</option>
                        <option value="gradient-sunset">Gradient Hoàng Hôn (Sunset Crimson)</option>
                        <option value="gradient-cyber">Gradient Cyber Neon (Cyber Violet)</option>
                      </optgroup>
                      <optgroup label="── Tùy biến ──">
                        <option value="custom">Tùy chỉnh màu sắc riêng</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Hiệu ứng nền:</label>
                    <select
                      value={readingEffect}
                      onChange={(e) => setReadingEffect(e.target.value as any)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      <option value="none">Không có hiệu ứng</option>
                      <option value="sci_fi_hud">Sci-Fi</option>
                      <option value="rain">Mưa rơi</option>
                      <option value="snow">Tuyết rơi</option>
                      <option value="glitch">Nhiễu sóng</option>
                      <option value="star">Bụi sao</option>
                      <option value="leaf">Lá phong rơi</option>
                      <option value="ginkgo">Lá bạch quả rơi</option>
                      <option value="cherry_blossom">Cánh hoa đào rơi</option>
                      <option value="firefly">Đom đóm</option>
                      <option value="soap_bubble">Bong bóng xà phòng</option>
                      <option value="fruits">Trái cây rơi</option>
                      <option value="ocean">Đại dương</option>
                      <option value="butterflies">Bướm bay</option>
                      <option value="feathers">Lông vũ rơi</option>
                      <option value="lightning">Sấm sét</option>
                      <option value="fog">Sương mù</option>
                      <option value="fireworks">Pháo hoa</option>
                      <option value="fire_sparks">Tàn lửa bay</option>
                    </select>
                  </div>

                  {readingEffect !== 'none' && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-[#8a717a] block font-mono-code">Màu hiệu ứng:</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="color"
                          value={readingEffectColor}
                          onChange={(e) => setReadingEffectColor(e.target.value)}
                          className="w-8 h-8 rounded border border-[#2d1822] cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={readingEffectColor}
                          onChange={(e) => setReadingEffectColor(e.target.value)}
                          className="w-24 bg-[#170d12] border border-[#2d1822] p-1.5 text-xs text-[#e0c0cc] focus:outline-none font-mono-code rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font tiêu đề truyện:</label>
                    <select
                      value={customTitleFont}
                      onChange={(e) => setCustomTitleFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font tiêu đề phụ/Tiêu đề widget:</label>
                    <select
                      value={customSubtitleFont}
                      onChange={(e) => setCustomSubtitleFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font tiêu đề chương:</label>
                    <select
                      value={customChapterTitleFont}
                      onChange={(e) => setCustomChapterTitleFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font chữ nội dung:</label>
                    <select
                      value={customBodyFont}
                      onChange={(e) => setCustomBodyFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font chữ phụ / chú thích:</label>
                    <select
                      value={customMutedFont}
                      onChange={(e) => setCustomMutedFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Font nút bấm / nhãn:</label>
                    <select
                      value={customBtnFont}
                      onChange={(e) => setCustomBtnFont(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Font Size Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[#2d1822]">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Cỡ chữ tiêu đề (Trang truyện):</label>
                    <select
                      value={titleFontSize}
                      onChange={(e) => setTitleFontSize(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      <option value="18px">Nhỏ (18px)</option>
                      <option value="20px">Vừa (20px)</option>
                      <option value="24px">Mặc định (24px)</option>
                      <option value="28px">Lớn (28px)</option>
                      <option value="32px">Rất lớn (32px)</option>
                      <option value="36px">Cực lớn (36px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Cỡ chữ tóm tắt & danh sách chương:</label>
                    <select
                      value={bodyFontSize}
                      onChange={(e) => setBodyFontSize(e.target.value)}
                      className="w-full bg-[#170d12] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      <option value="12px">Nhỏ (12px)</option>
                      <option value="13px">Hơi nhỏ (13px)</option>
                      <option value="14px">Mặc định (14px)</option>
                      <option value="15px">Vừa (15px)</option>
                      <option value="16px">Chuẩn (16px)</option>
                      <option value="18px">Lớn (18px)</option>
                      <option value="20px">Rất lớn (20px)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Story Border & Frame Customization Section */}
              <div className="p-3 bg-[#150a0f] border border-[#3d202e] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2d1822] pb-1.5">
                  <span className="text-xs font-bold text-[#ffd6e2] uppercase tracking-wider flex items-center gap-1.5 font-mono-code">
                    <span>Cài đặt đường viền & Khung trang trí</span>
                  </span>
                  <span className="text-[10px] text-[#8a717a] font-mono-code">Tùy chỉnh chi tiết</span>
                </div>

                {/* Detailed Border Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Border Style */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Kiểu nét viền:</label>
                    <select
                      value={storyBorderStyle}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setStoryBorderStyle(val);
                        if (val === 'sketch') {
                          setStoryBorderRadius('none');
                          setStoryBorderCornerAccent('none');
                        }
                      }}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_STYLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Border Width */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Độ dày viền:</label>
                    <select
                      value={storyBorderWidth}
                      onChange={(e) => setStoryBorderWidth(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_WIDTH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Border Radius & Shape */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Bo góc viền:</label>
                    <select
                      value={storyBorderStyle === 'sketch' ? 'none' : storyBorderRadius}
                      disabled={storyBorderStyle === 'sketch'}
                      onChange={(e) => setStoryBorderRadius(e.target.value as any)}
                      className={`w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code ${
                        storyBorderStyle === 'sketch' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {BORDER_RADIUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {storyBorderStyle === 'sketch' && (
                      <span className="text-[10px] text-amber-400/90 flex items-center gap-1 font-mono-code">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>Mặc định vuông vức khi chọn Nét vẽ tay</span>
                      </span>
                    )}
                  </div>

                  {/* 4. Corner Accents */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Họa tiết 4 góc nghệ thuật:</label>
                    <select
                      value={storyBorderStyle === 'sketch' ? 'none' : storyBorderCornerAccent}
                      disabled={storyBorderStyle === 'sketch'}
                      onChange={(e) => setStoryBorderCornerAccent(e.target.value as any)}
                      className={`w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code ${
                        storyBorderStyle === 'sketch' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {BORDER_CORNER_ACCENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {storyBorderStyle === 'sketch' && (
                      <span className="text-[10px] text-amber-400/90 flex items-center gap-1 font-mono-code">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>Mặc định không họa tiết khi chọn Nét vẽ tay</span>
                      </span>
                    )}
                  </div>

                  {/* 5. Border Glow / Shadow */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8a717a] block font-mono-code">Hiệu ứng viền & phát sáng:</label>
                    <select
                      value={storyBorderGlow}
                      onChange={(e) => setStoryBorderGlow(e.target.value as any)}
                      className="w-full bg-[#10070a] border border-[#2d1822] p-2 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#522d3d] font-mono-code"
                    >
                      {BORDER_GLOW_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Màu mở rộng cho Gradient hoặc Hào quang */}
                {(storyBorderStyle === 'gradient' || storyBorderGlow === 'gradient-aura') && (
                  <div className="p-3 bg-[#10070a] border border-[#2d1822] rounded space-y-3">
                    {storyBorderStyle === 'gradient' && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-[#ffd6e2] font-mono-code flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Tùy chỉnh 2 màu dải chuyển sắc (Gradient):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Màu 1 */}
                          <div className="flex items-center justify-between p-2 rounded bg-[#180a11] border border-[#3d1d2e]">
                            <span className="text-xs text-[#e0c0cc] font-mono-code">Màu 1 (Màu bắt đầu):</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={customBorderColor}
                                onChange={(e) => setCustomBorderColor(e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                              />
                              <span className="font-mono text-xs text-[#ffd6e2] uppercase">{customBorderColor}</span>
                            </div>
                          </div>

                          {/* Màu 2 */}
                          <div className="flex items-center justify-between p-2 rounded bg-[#180a11] border border-[#3d1d2e]">
                            <span className="text-xs text-[#e0c0cc] font-mono-code">Màu 2 (Màu kết thúc):</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={storyCustomBorderGradientColor2}
                                onChange={(e) => setStoryCustomBorderGradientColor2(e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                              />
                              <span className="font-mono text-xs text-[#ffd6e2] uppercase">{storyCustomBorderGradientColor2}</span>
                            </div>
                          </div>
                        </div>

                        {/* Preset gradient buttons */}
                        <div className="pt-2 border-t border-[#2d1822] flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-[#8a717a] font-mono-code mr-1">Gợi ý phối màu:</span>
                          {[
                            { name: 'Hồng - Tím', c1: '#ff6b9d', c2: '#a855f7' },
                            { name: 'Vàng - Cam', c1: '#f59e0b', c2: '#ef4444' },
                            { name: 'Xanh - Lam', c1: '#10b981', c2: '#06b6d4' },
                            { name: 'Tím - Neon', c1: '#8b5cf6', c2: '#ec4899' },
                            { name: 'Kim loại', c1: '#e2e8f0', c2: '#64748b' },
                            { name: 'Hào quang', c1: '#f43f5e', c2: '#38bdf8' },
                          ].map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCustomBorderColor(p.c1);
                                setStoryCustomBorderGradientColor2(p.c2);
                              }}
                              className="px-2 py-1 rounded text-[10px] font-medium border border-white/20 transition hover:scale-105 text-white shadow-sm font-mono-code"
                              style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {storyBorderGlow === 'gradient-aura' && (
                      <div className="flex items-center gap-3 pt-2 border-t border-[#2d1822]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#e0c0cc] font-mono-code">Màu hào quang 1:</span>
                          <input
                            type="color"
                            value={storyCustomBorderGlowColor1}
                            onChange={(e) => setStoryCustomBorderGlowColor1(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#e0c0cc] font-mono-code">Màu 2:</span>
                          <input
                            type="color"
                            value={storyCustomBorderGlowColor2}
                            onChange={(e) => setStoryCustomBorderGlowColor2(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {themeTone === 'custom' && (
                <div className="p-3 bg-[#13070b] border border-[#301622] space-y-3 rounded-sm">
                  <div className="border-b border-[#26131d] pb-2">
                    <p className="text-[11px] text-[#fdba74] font-bold font-mono-code">Thiết lập mã màu tùy biến cho giao diện truyện:</p>
                  </div>

                  {/* Unified Custom Colors Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Background */}
                    <ColorField
                      label="Màu nền trang (Body)"
                      value={customBgColor}
                      onChange={setCustomBgColor}
                      allowGradient
                    />

                    {/* Card */}
                    <ColorField
                      label="Màu khung / thẻ (Card)"
                      value={customCardBgColor}
                      onChange={setCustomCardBgColor}
                    />

                    {/* Primary Button */}
                    <ColorField
                      label="Màu nút chính (Primary)"
                      value={customBtnBgColor}
                      onChange={setCustomBtnBgColor}
                      allowGradient
                    />

                    {/* Secondary Button & Container */}
                    <ColorField
                      label="Màu nút phụ & Ô chứa"
                      value={customBtnSecondaryBgColor}
                      onChange={setCustomBtnSecondaryBgColor}
                      allowGradient
                    />

                    {/* Text Primary */}
                    <ColorField
                      label="Màu chữ chính (Text)"
                      value={customTextColor}
                      onChange={setCustomTextColor}
                    />

                    {/* Text Muted */}
                    <ColorField
                      label="Màu chữ phụ (Muted)"
                      value={customTextMutedColor}
                      onChange={setCustomTextMutedColor}
                    />

                    {/* Border */}
                    <ColorField
                      label="Màu viền (Border)"
                      value={customBorderColor}
                      onChange={setCustomBorderColor}
                    />
                  </div>
                </div>
              )}

              {/* Preview Giao Diện Trực Quan (Live Preview) */}
              <div className="space-y-2 pt-2 border-t border-[#2d1822]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#ffd6e2] font-bold font-mono-code flex items-center gap-1.5 uppercase tracking-wide">
                    <Eye className="w-3.5 h-3.5 text-[#ff99bb]" />
                    <span>Xem trước giao diện truyện (Live Preview)</span>
                  </span>
                  <span className="text-[10px] text-[#8a717a] font-mono-code">
                    {themeTone === 'custom' ? 'Tùy chỉnh riêng' : themeTone} • T: {customTitleFont.replace('font-', '')} • B: {customBodyFont.replace('font-', '')} • M: {customMutedFont.replace('font-', '')} • BT: {customBtnFont.replace('font-', '')}
                  </span>
                </div>

                <div 
                  className={`p-3.5 sm:p-5 border rounded-sm transition-colors duration-150 space-y-4 shadow-inner ${customBodyFont}`}
                  style={{
                    background: activePreviewColors.bg,
                    borderColor: activePreviewColors.border,
                    color: activePreviewColors.text,
                  }}
                >
                  {/* Story Main Detail Card */}
                  <div 
                    className="p-3.5 transition-all duration-150 space-y-4 relative overflow-hidden"
                    style={{
                      background: activePreviewColors.cardBg,
                      ...getStoryBorderStyle(
                        {
                          borderStyle: storyBorderStyle,
                          borderWidth: storyBorderWidth,
                          borderRadius: storyBorderRadius,
                          borderGlow: storyBorderGlow,
                          customBorderColor: customBorderColor || activePreviewColors.border,
                          customBorderGradientColor2: storyCustomBorderGradientColor2,
                          customBorderGlowColor1: storyCustomBorderGlowColor1,
                          customBorderGlowColor2: storyCustomBorderGlowColor2,
                          customCardBgColor: activePreviewColors.cardBg,
                          customBgColor: activePreviewColors.bg,
                        },
                        activePreviewColors.border
                      ),
                    }}
                  >
                    <StoryCornerAccents
                      accent={storyBorderCornerAccent}
                      borderStyle={storyBorderStyle}
                      color={activePreviewColors.border}
                    />

                    <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                      {/* Left: Cover & Editor & Action Buttons */}
                      <div className="w-full sm:w-36 shrink-0 space-y-2.5">
                        <div 
                          className="w-full h-44 flex items-center justify-center overflow-hidden relative"
                          style={{
                            background: activePreviewColors.bg,
                            ...getStoryBorderStyle(
                              {
                                borderStyle: 'solid',
                                borderWidth: 'thin',
                                borderRadius: storyBorderRadius,
                                borderGlow: 'none',
                              },
                              activePreviewColors.border
                            ),
                          }}
                        >
                          {storyCoverUrl ? (
                            <img
                              src={storyCoverUrl}
                              alt="Ảnh bìa"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className={`text-[10px] p-2 text-center opacity-70 ${customMutedFont}`} style={{ color: activePreviewColors.textMuted }}>
                              Ảnh bìa truyện
                            </span>
                          )}
                        </div>

                        {/* Editor badge */}
                        <div 
                          className="p-2 flex items-center gap-2"
                          style={{
                            background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                            ...getStoryBorderStyle(
                              {
                                borderStyle: 'solid',
                                borderWidth: 'thin',
                                borderRadius: storyBorderRadius,
                                borderGlow: 'none',
                              },
                              activePreviewColors.border
                            ),
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full border overflow-hidden shrink-0 flex items-center justify-center"
                            style={{
                              background: activePreviewColors.cardBg,
                              borderColor: activePreviewColors.border,
                            }}
                          >
                            {storyEditorPhoto ? (
                              <img src={storyEditorPhoto} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3 h-3" style={{ color: activePreviewColors.textMuted }} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[9px] uppercase font-bold block leading-none opacity-75 ${customMutedFont}`} style={{ color: activePreviewColors.textMuted }}>
                              Editor:
                            </span>
                            <span className={`text-[11px] font-bold truncate block leading-tight ${customBtnFont}`} style={{ color: activePreviewColors.text }}>
                              {storyEditorName.trim() || 'Cục Nâu'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons preview */}
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            className={`w-full py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${customBtnFont}`}
                            style={{
                              background: activePreviewColors.btnBg,
                              color: activePreviewColors.btnText,
                              ...getStoryButtonBorderStyle(
                                {
                                  borderStyle: storyBorderStyle,
                                  borderRadius: storyBorderRadius,
                                },
                                activePreviewColors.btnBorder
                              ),
                            }}
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Đọc từ đầu</span>
                          </button>
                          <button
                            type="button"
                            className={`w-full py-1.5 px-2 text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 ${customBtnFont}`}
                            style={{
                              background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                              color: activePreviewColors.text,
                              ...getStoryButtonBorderStyle(
                                {
                                  borderStyle: storyBorderStyle,
                                  borderRadius: storyBorderRadius,
                                },
                                activePreviewColors.border
                              ),
                            }}
                          >
                            <Bookmark className="w-3 h-3" />
                            <span>Lưu truyện</span>
                          </button>
                        </div>

                        {/* Tags Preview under Save Story button */}
                        {storyTagsInput.trim() && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {storyTagsInput
                              .split(',')
                              .map((t) => t.trim())
                              .filter((t) => t.length > 0)
                              .map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[9px] px-1.5 py-0.5 leading-tight ${customBtnFont}`}
                                  style={{
                                    background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                                    color: activePreviewColors.textMuted,
                                    ...getStoryBorderStyle(
                                      {
                                        borderStyle: 'solid',
                                        borderWidth: 'thin',
                                        borderRadius: storyBorderRadius,
                                        borderGlow: 'none',
                                      },
                                      activePreviewColors.border
                                    ),
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Title, Meta, Synopsis */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div>
                          <h3 
                            className={`font-bold tracking-wide leading-snug ${customTitleFont}`}
                            style={{ color: activePreviewColors.text, fontSize: titleFontSize }}
                          >
                            {storyTitle.trim() || 'Tên bộ truyện của bạn'}
                          </h3>
                          <div 
                            className={`text-[11px] flex flex-wrap items-center gap-x-2 border-b pb-2 mt-1 ${customMutedFont}`}
                            style={{ borderColor: activePreviewColors.border, color: activePreviewColors.textMuted }}
                          >
                            <span>Tác giả: <strong style={{ color: activePreviewColors.text }}>{storyAuthor.trim() || 'Tử Thời Hoan'}</strong></span>
                            <span>•</span>
                            <span>Ngày đăng: 15/08/2026</span>
                            <span>•</span>
                            <span>Lượt xem: 1,250</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider block ${customBodyFont}`} style={{ color: activePreviewColors.textMuted }}>
                            Giới thiệu:
                          </span>
                          <p 
                            className={`leading-relaxed line-clamp-4 opacity-90 text-justify ${customBodyFont}`}
                            style={{ color: activePreviewColors.text, fontSize: bodyFontSize }}
                          >
                            {storySynopsis.trim() || 'Đây là phần giới thiệu tác phẩm hiển thị trên trang thông tin truyện. Bạn có thể kiểm tra phông chữ và độ tương phản giữa màu chữ chính với màu nền thẻ.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chapters List Section Preview */}
                    <div className="pt-3 border-t space-y-2" style={{ borderColor: activePreviewColors.border }}>
                      <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${customBodyFont}`} style={{ color: activePreviewColors.text }}>
                        <span>Danh sách chương (2)</span>
                      </div>

                      <div className="space-y-1.5">
                        <div 
                          className="p-2 border rounded-xs flex items-center justify-between text-xs"
                          style={{
                            background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                            borderColor: activePreviewColors.border,
                          }}
                        >
                          <span className={`font-medium ${customBodyFont}`} style={{ color: activePreviewColors.text }}>
                            Chương 1: Mở đầu câu chuyện
                          </span>
                        </div>

                        <div 
                          className="p-2 border rounded-xs flex items-center justify-between text-xs"
                          style={{
                            background: activePreviewColors.btnSecondaryBg || activePreviewColors.bg,
                            borderColor: activePreviewColors.border,
                          }}
                        >
                          <span className={`font-medium ${customBodyFont}`} style={{ color: activePreviewColors.text }}>
                            Chương 2: Đêm trăng trên đỉnh núi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer with Action Buttons */}
            <div className="p-4 border-t border-[#2d1822] bg-[#150a0f] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreatingStory(false)}
                className="px-4 py-2 bg-[#12090c] hover:bg-[#1f1017] border border-[#2d1822] text-xs text-[#8a717a] hover:text-[#e0c0cc] font-mono-code transition"
                disabled={isCompressingCover}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isCompressingCover}
                className="px-6 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-xs text-[#ffd6e2] font-mono-code font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isCompressingCover ? 'Đang xử lý...' : (editingStory ? 'Lưu cập nhật' : 'Tạo truyện')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Upload Chapter Modal */}
      {isBulkUploadingChapter && selectedStoryForChapters && (
        <BulkChapterModal
          story={selectedStoryForChapters}
          existingChapters={chapters}
          onClose={() => setIsBulkUploadingChapter(false)}
          onSaveBatch={async (chaps) => {
            if (onSaveBatchChapters) {
              await onSaveBatchChapters(chaps);
            } else {
              for (const ch of chaps) {
                onSaveChapter(ch);
              }
            }
          }}
        />
      )}

      {/* Special Frame Insert Modal */}
      {showSpecialFrameModal && (
        <SpecialFrameInsertModal
          isOpen={showSpecialFrameModal}
          onClose={() => setShowSpecialFrameModal(false)}
          onInsertCode={handleInsertStudioFrameSnippet}
          initialContent={modalInitialContent}
          initialType={modalInitialType}
          themeColors={{
            bg: '#0d0608',
            cardBg: '#150a0f',
            border: '#331c27',
            btnBg: '#e879f9',
            btnText: '#000000',
            btnSecondaryBg: '#241119',
            btnBorder: '#5e2f46',
            text: '#ffd6e2',
            textMuted: '#a88d98',
            accentColor: '#e879f9',
          }}
        />
      )}

    </div>
  );
};
