import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { saveUserFontToCloud, deleteUserFontFromCloud, getUserFontsFromCloud } from '../lib/storage';
import { getIdbFonts, saveIdbFonts, deleteIdbFont, migrateLocalStorageFonts, StoredUserFont } from '../lib/idbStorage';
import { Story, StoryTheme, UserProfile, CharacterInfo, Chapter, StoryGalleryImage, StoryGalleryWidget, StoryLayoutBlockId, StoryLayoutSection, StoryLayoutSectionType, StoryLayoutColumnRatio, StoryElement } from '../types';
import { extractThemeFromStory } from '../lib/storyUtils';
import { BulkChapterModal } from './BulkChapterModal';
import {
  normalizeStorySections,
  DEFAULT_STORY_LAYOUT_SECTIONS,
  StoryLayoutContainer,
} from './StoryBlocks';
import {
  ArrowLeft,
  Check,
  Upload,
  Link,
  BookOpen,
  Bookmark,
  RotateCcw,
  User,
  Users,
  TrendingUp,
  Palette,
  Type,
  Square,
  Sparkles,
  Sliders,
  X,
  Plus,
  Trash2,
  Edit3,
  Pipette,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Folder,
  GitCommit,
  Table,
  Columns2,
  Tag,
  LayoutList,
  FileText,
  Lock,
  Key,
  UploadCloud,
  Hash,
  Image as ImageIcon,
  Images,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Clock,
  MessageSquare,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Lightbulb,
  ArrowRightLeft,
  MoveVertical,
  Move,
  PanelLeft,
  PanelRight,
  Sticker,
  Copy,
  FlipHorizontal,
  RotateCw,
  BellRing,
  Smartphone,
  Mail,
  Shield,
  StickyNote,
  AlertTriangle,
  Eye,
  Frame,
} from 'lucide-react';
import { ReadingEffects } from './ReadingEffects';
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
import { LiveStoryEditorView } from './LiveStoryEditorView';
import { StoryElementsLayer } from './StoryElementsLayer';
import { SpecialFrameInsertModal } from './SpecialFrameInsertModal';
import { FloatingSelectionMenu } from './FloatingSelectionMenu';
import { parseChapterContentBlocks, SpecialBlockRenderer, SpecialBlockType } from './ChapterSpecialBlocks';

const ALL_STORY_BLOCK_IDS: StoryLayoutBlockId[] = [
  'cover',
  'title',
  'meta',
  'synopsis',
  'editor_info',
  'action_buttons',
  'tags',
  'character_widget',
  'progress_widget',
  'custom_widget',
  'gallery_widget',
  'chapter_list',
  'comments',
];

const BLOCK_META_MAP: Record<StoryLayoutBlockId, { name: string; icon: any }> = {
  cover: { name: 'Ảnh bìa truyện', icon: ImageIcon },
  title: { name: 'Tiêu đề truyện', icon: Type },
  meta: { name: 'Tác giả, Ngày đăng, Lượt xem', icon: Clock },
  synopsis: { name: 'Giới thiệu / Tóm tắt', icon: FileText },
  editor_info: { name: 'Thông tin Editor', icon: User },
  action_buttons: { name: 'Các nút bấm', icon: Play },
  tags: { name: 'Tag thể loại', icon: Tag },
  character_widget: { name: 'Widget Nhân vật', icon: Users },
  progress_widget: { name: 'Widget Tiến độ', icon: TrendingUp },
  custom_widget: { name: 'Widget Tùy chỉnh', icon: FileText },
  gallery_widget: { name: 'Widget Ảnh / Album', icon: Images },
  chapter_list: { name: 'Danh sách chương', icon: BookOpen },
  comments: { name: 'Bình luận', icon: MessageSquare },
};

const FONT_OPTIONS = [
  // Serif
  { value: 'font-lora', label: 'Lora' },
  { value: 'font-garamond', label: 'EB Garamond' },
  { value: 'font-merriweather', label: 'Merriweather' },
  { value: 'font-playfair', label: 'Playfair Display' },
  { value: 'font-notoserif', label: 'Noto Serif' },
  { value: 'font-robotoslab', label: 'Roboto Slab' },
  { value: 'font-times', label: 'Times New Roman' },
  { value: 'font-cormorant', label: 'Cormorant Garamond' },

  // Sans-serif
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
  { value: 'font-sarabun', label: 'Sarabun' },
  { value: 'font-lexend', label: 'Lexend' },
  { value: 'font-comfortaa', label: 'Comfortaa' },
  { value: 'font-baloo', label: 'Baloo 2' },

  // Calligraphy & Script
  { value: 'font-charm', label: 'Charm' },
  { value: 'font-dancing', label: 'Dancing Script' },
  { value: 'font-pacifico', label: 'Pacifico' },
  { value: 'font-lobster', label: 'Lobster' },
  { value: 'font-pattaya', label: 'Pattaya' },
  { value: 'font-arima', label: 'Arima' },

  // Comic & Handwritten
  { value: 'font-patrick', label: 'Patrick Hand' },
  { value: 'font-itim', label: 'Itim' },
  { value: 'font-sriracha', label: 'Sriracha' },
  { value: 'font-cabinsketch', label: 'Cabin Sketch' },

  // Monospace
  { value: 'font-mono', label: 'JetBrains Mono' },
  { value: 'font-vt323', label: 'VT323' },
  { value: 'font-bungee', label: 'Bungee' },
];

const PRESET_THEME_COLORS: Record<string, {
  name: string;
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  btnBg: string;
  btnSecondaryBg?: string;
  btnBorder: string;
  btnText: string;
  accentColor?: string;
}> = {
  'dark-rose': {
    name: 'Dark Rose (Hồng Đen)',
    bg: '#080406',
    cardBg: '#11090c',
    text: '#f2e6ea',
    textMuted: '#d0a0b0',
    border: '#2d1822',
    btnBg: '#2b1620',
    btnSecondaryBg: '#1c0f16',
    btnBorder: '#5e2f46',
    btnText: '#ffd6e2',
  },
  'classic-black': {
    name: 'Classic Black (Đen Tuyến)',
    bg: '#0a0a0a',
    cardBg: '#141414',
    text: '#f5f5f5',
    textMuted: '#a3a3a3',
    border: '#262626',
    btnBg: '#1f1f1f',
    btnSecondaryBg: '#171717',
    btnBorder: '#404040',
    btnText: '#ffffff',
  },
  'classic-white': {
    name: 'Classic White (Trắng Tinh Khôi)',
    bg: '#ffffff',
    cardBg: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    btnBg: '#f1f5f9',
    btnSecondaryBg: '#ffffff',
    btnBorder: '#cbd5e1',
    btnText: '#0f172a',
  },
  'dark-violet': {
    name: 'Dark Violet (Tím Đêm)',
    bg: '#06030a',
    cardBg: '#0f0817',
    text: '#f2e8f8',
    textMuted: '#b690d4',
    border: '#28153b',
    btnBg: '#28133b',
    btnSecondaryBg: '#1a0c27',
    btnBorder: '#562c7e',
    btnText: '#ebd6fb',
  },
  'navy-blue': {
    name: 'Navy Blue (Xanh Đêm)',
    bg: '#03080d',
    cardBg: '#08121d',
    text: '#e6eff8',
    textMuted: '#8dafcb',
    border: '#152a40',
    btnBg: '#13283e',
    btnSecondaryBg: '#0c1b2c',
    btnBorder: '#295480',
    btnText: '#cce2f8',
  },
  'sepia': {
    name: 'Sepia (Giấy Cổ Điển)',
    bg: '#f4ecd8',
    cardBg: '#fcf8ed',
    text: '#4a3525',
    textMuted: '#8c7460',
    border: '#d3c29f',
    btnBg: '#e2d5b6',
    btnSecondaryBg: '#faf6eb',
    btnBorder: '#bca883',
    btnText: '#4a3525',
  },
  'emerald': {
    name: 'Emerald (Xanh Ngọc Lục)',
    bg: '#06100c',
    cardBg: '#0b1a14',
    text: '#d1e7dd',
    textMuted: '#628f7a',
    border: '#153327',
    btnBg: '#163f2d',
    btnSecondaryBg: '#0e251c',
    btnBorder: '#2a6b4e',
    btnText: '#d1e7dd',
  },
  'slate': {
    name: 'Slate (Xanh Đá Xám)',
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    btnBg: '#334155',
    btnSecondaryBg: '#1e293b',
    btnBorder: '#475569',
    btnText: '#f1f5f9',
  },
  'cyberpunk': {
    name: 'Cyberpunk (Neon Tím)',
    bg: '#05000a',
    cardBg: '#0d001a',
    text: '#00ffff',
    textMuted: '#ff007f',
    border: '#ff007f',
    btnBg: '#1f0038',
    btnSecondaryBg: '#120021',
    btnBorder: '#00ffff',
    btnText: '#00ffff',
  },
  'forest-dark': {
    name: 'Forest Dark (Rừng Đêm)',
    bg: '#030805',
    cardBg: '#08140c',
    text: '#e8f5ec',
    textMuted: '#88b894',
    border: '#163320',
    btnBg: '#14301d',
    btnSecondaryBg: '#0d2113',
    btnBorder: '#2d633c',
    btnText: '#c9e8d1',
  },
  'warm-coffee': {
    name: 'Warm Coffee (Cà Phê Ấm)',
    bg: '#0a0705',
    cardBg: '#140f0a',
    text: '#f5eee6',
    textMuted: '#c4ad97',
    border: '#332417',
    btnBg: '#2e1f13',
    btnSecondaryBg: '#21160d',
    btnBorder: '#5c4129',
    btnText: '#fceee1',
  },
  'gradient-rose': {
    name: 'Gradient Rose (Hồng Đen)',
    bg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: 'linear-gradient(135deg, #280c1b 0%, #1c0a13 100%)',
    text: '#fce7f0',
    textMuted: '#f4a6c1',
    border: '#682542',
    btnBg: '#521930',
    btnSecondaryBg: '#280c1b',
    btnBorder: '#832e55',
    btnText: '#ffc2d4',
  },
  'gradient-midnight': {
    name: 'Gradient Midnight (Đêm Tím)',
    bg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: 'linear-gradient(135deg, #210f47 0%, #170b33 100%)',
    text: '#f3e8ff',
    textMuted: '#c084fc',
    border: '#581c87',
    btnBg: '#3b1278',
    btnSecondaryBg: '#210f47',
    btnBorder: '#7e22ce',
    btnText: '#e9d5ff',
  },
  'gradient-ocean': {
    name: 'Gradient Ocean (Đại Dương)',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: 'linear-gradient(135deg, #0c273a 0%, #081d2c 100%)',
    text: '#e0f2fe',
    textMuted: '#38bdf8',
    border: '#0284c7',
    btnBg: '#0369a1',
    btnSecondaryBg: '#0c273a',
    btnBorder: '#38bdf8',
    btnText: '#bae6fd',
  },
  'gradient-emerald': {
    name: 'Gradient Emerald (Ngọc Lục Bảo)',
    bg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: 'linear-gradient(135deg, #0d3327 0%, #082119 100%)',
    text: '#ecfdf5',
    textMuted: '#34d399',
    border: '#059669',
    btnBg: '#047857',
    btnSecondaryBg: '#0d3327',
    btnBorder: '#10b981',
    btnText: '#a7f3d0',
  },
  'gradient-sunset': {
    name: 'Gradient Sunset (Hoàng Hôn)',
    bg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: 'linear-gradient(135deg, #380b15 0%, #24080e 100%)',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#9f1239',
    btnBg: '#881337',
    btnSecondaryBg: '#380b15',
    btnBorder: '#e11d48',
    btnText: '#fecdd3',
  },
  'gradient-cyber': {
    name: 'Gradient Cyber (Viễn Tưởng)',
    bg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: 'linear-gradient(135deg, #320a52 0%, #210638 100%)',
    text: '#fae8ff',
    textMuted: '#e879f9',
    border: '#a21caf',
    btnBg: '#7e22ce',
    btnSecondaryBg: '#320a52',
    btnBorder: '#c084fc',
    btnText: '#f5d0fe',
  },
  'gradient-gold': {
    name: 'Gradient Gold (Hoàng Gia Vàng)',
    bg: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #180801 100%)',
    cardBg: 'linear-gradient(135deg, #3d1703 0%, #290e02 100%)',
    text: '#fef3c7',
    textMuted: '#fbbf24',
    border: '#b45309',
    btnBg: '#92400e',
    btnSecondaryBg: '#3d1703',
    btnBorder: '#d97706',
    btnText: '#fef3c7',
  },
  'gradient-cherry': {
    name: 'Gradient Cherry (Hoa Đào)',
    bg: 'linear-gradient(135deg, #831843 0%, #500724 50%, #1f020d 100%)',
    cardBg: 'linear-gradient(135deg, #42081f 0%, #2e0516 100%)',
    text: '#fce7f0',
    textMuted: '#f472b6',
    border: '#be185d',
    btnBg: '#9d174d',
    btnSecondaryBg: '#42081f',
    btnBorder: '#e11d48',
    btnText: '#ffe4e6',
  },
};

interface LiveStoryEditorProps {
  initialStory?: Story | null;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  chapters?: Chapter[];
  onOpenChapterManager?: (story: Story) => void;
  onSave: (storyData: Partial<Story>) => void;
  onCancel: () => void;
  onSaveChapter?: (chapter: Chapter) => void;
  onDeleteChapter?: (chapterId: string, storyId: string) => void;
  onSaveBatchChapters?: (chapters: Chapter[]) => Promise<void>;
}

interface LocalColorFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  allowGradient?: boolean;
  currentBg: string;
  currentBorder: string;
  currentText: string;
  currentCardBg: string;
}

const LocalColorField: React.FC<LocalColorFieldProps> = ({
  label,
  value,
  onChange,
  allowGradient = false,
  currentBg,
  currentBorder,
  currentText,
  currentCardBg,
}) => {
  const isGradient = allowGradient && value.includes('gradient');

  let color1 = '#080406';
  let color2 = '#000000';

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
      const c1 = value.startsWith('#') ? value : '#2b1620';
      const c2 = '#080406';
      onChange(`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
    } else {
      onChange(color1);
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
    <div className="space-y-1.5 p-2 rounded border" style={{ background: currentCardBg, borderColor: currentBorder }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold" style={{ color: currentText }}>{label}:</span>
        {allowGradient && (
          <label className="flex items-center gap-1 cursor-pointer text-[9px] select-none">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => handleToggleGradient(e.target.checked)}
              className="w-3.5 h-3.5 rounded border accent-[#a8446b]"
            />
            <span style={{ color: currentText }}>Gradient</span>
          </label>
        )}
      </div>

      {!isGradient ? (
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={color1.startsWith('#') ? color1 : '#080406'}
            onChange={(e) => handleUpdateC1(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0 shrink-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-1.5 py-0.5 border rounded text-[10px] font-mono"
            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] shrink-0 w-8" style={{ color: currentText }}>Màu 1:</span>
            <input
              type="color"
              value={color1}
              onChange={(e) => handleUpdateC1(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 shrink-0"
            />
            <input
              type="text"
              value={color1}
              onChange={(e) => handleUpdateC1(e.target.value)}
              className="w-full px-1.5 py-0.5 border rounded text-[9px] font-mono"
              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] shrink-0 w-8" style={{ color: currentText }}>Màu 2:</span>
            <input
              type="color"
              value={color2}
              onChange={(e) => handleUpdateC2(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer border-0 p-0 shrink-0"
            />
            <input
              type="text"
              value={color2}
              onChange={(e) => handleUpdateC2(e.target.value)}
              className="w-full px-1.5 py-0.5 border rounded text-[9px] font-mono"
              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EFFECT_COLOR_PALETTES = [
  {
    category: 'Cyber & Neon',
    colors: [
      { name: 'Xanh ngọc Sci-Fi', val: '#00f0ff' },
      { name: 'Xanh lục Neon', val: '#00ff88' },
      { name: 'Tím Electric', val: '#a855f7' },
      { name: 'Hồng Cyber', val: '#ff2a85' },
      { name: 'Vàng Lôi điện', val: '#ffe600' },
      { name: 'Xanh Băng giá', val: '#38bdf8' },
    ],
  },
  {
    category: 'Lửa & Pháo hoa rực rỡ',
    colors: [
      { name: 'Hoàng Kim Champagne', val: '#ffd700' },
      { name: 'Hổ phách rực rỡ', val: '#ff9900' },
      { name: 'Đỏ Ruby lửa', val: '#ff2a5f' },
      { name: 'Cam Hoàng hôn', val: '#ff6b35' },
      { name: 'Hồng sen Pháo hoa', val: '#f43f5e' },
      { name: 'Đỏ San hô', val: '#ff4500' },
    ],
  },
  {
    category: 'Huyền bí & Sang trọng',
    colors: [
      { name: 'Tím Thạch anh', val: '#8b5cf6' },
      { name: 'Lam Sapphire', val: '#3b82f6' },
      { name: 'Ngọc Lục bảo', val: '#10b981' },
      { name: 'Bạc Ánh trăng', val: '#cbd5e1' },
      { name: 'Trắng Tinh khôi', val: '#ffffff' },
      { name: 'Hổ phách Cổ điển', val: '#d97706' },
    ],
  },
];

interface EffectColorPalettePickerProps {
  title: string;
  color: string;
  onChange: (hex: string) => void;
  accentColor?: string;
  currentCardBg: string;
  currentBorder: string;
  currentText: string;
  currentTextMuted: string;
}

const EffectColorPalettePicker: React.FC<EffectColorPalettePickerProps> = ({
  title,
  color,
  onChange,
  accentColor = '#00f0ff',
  currentCardBg,
  currentBorder,
  currentText,
  currentTextMuted,
}) => {
  return (
    <div className="mt-2.5 p-3 rounded-lg border space-y-2.5 bg-black/25 backdrop-blur-sm" style={{ borderColor: currentBorder }}>
      {/* Header & Xem trước màu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-white/40 shadow-sm transition-transform"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}80`,
            }}
          />
          <span className="text-[11px] font-bold" style={{ color: accentColor }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={color.startsWith('#') ? color : '#00f0ff'}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border border-white/30 p-0 bg-transparent"
            title="Mở bộ chọn màu tùy ý"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 px-1.5 py-0.5 rounded border text-[10px] font-mono uppercase text-center focus:outline-none"
            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
          />
        </div>
      </div>

      {/* Danh sách bảng màu phân nhóm */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        {EFFECT_COLOR_PALETTES.map((group) => (
          <div key={group.category} className="space-y-1">
            <div className="text-[9px] uppercase tracking-wider font-mono font-semibold" style={{ color: currentTextMuted }}>
              {group.category}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {group.colors.map((c) => {
                const isSelected = color.toLowerCase() === c.val.toLowerCase();
                return (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => onChange(c.val)}
                    title={`${c.name} (${c.val})`}
                    className={`h-6 rounded flex items-center justify-center border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-white scale-105 z-10'
                        : 'border-white/20 hover:scale-105 hover:border-white/60 opacity-85 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: c.val,
                      boxShadow: isSelected ? `0 0 8px ${c.val}` : undefined,
                    }}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black/80 ring-1 ring-white/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LiveStoryEditor: React.FC<LiveStoryEditorProps> = ({
  initialStory,
  currentUser,
  userProfile,
  chapters,
  onOpenChapterManager,
  onSave,
  onCancel,
  onSaveChapter,
  onDeleteChapter,
  onSaveBatchChapters,
}) => {
  // Story fields
  const [title, setTitle] = useState(initialStory?.title || '');
  const [author, setAuthor] = useState(initialStory?.author || 'Tử Thời Hoan');
  const [editorName, setEditorName] = useState(() => {
    if (initialStory && 'editorName' in initialStory) {
      return initialStory.editorName || '';
    }
    return userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Cục Nâu';
  });
  const [editorPhoto, setEditorPhoto] = useState(() => {
    if (initialStory && 'editorPhoto' in initialStory) {
      return initialStory.editorPhoto || '';
    }
    return userProfile?.photoURL || currentUser?.photoURL || '';
  });
  const [coverUrl, setCoverUrl] = useState(initialStory?.coverUrl || '');
  const [synopsis, setSynopsis] = useState(initialStory?.synopsis || '');
  const [tags, setTags] = useState<string[]>(initialStory?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const currentChapterCount = chapters ? chapters.length : (initialStory?.chapterCount || 0);

  // Styles & Theme
  const [themeTone, setThemeTone] = useState<string>(
    initialStory?.themeTone ||
      (initialStory?.customBtnBgColor || initialStory?.customBgColor ? 'custom' : 'dark-rose')
  );
  const [customTitleFont, setCustomTitleFont] = useState(initialStory?.customTitleFont || initialStory?.defaultFont || 'font-mono');
  const [customChapterTitleFont, setCustomChapterTitleFont] = useState(initialStory?.customChapterTitleFont || initialStory?.customSubtitleFont || initialStory?.customTitleFont || initialStory?.defaultFont || 'font-mono');
  const [customSubtitleFont, setCustomSubtitleFont] = useState(initialStory?.customSubtitleFont || initialStory?.customTitleFont || initialStory?.defaultFont || 'font-mono');
  const [customBodyFont, setCustomBodyFont] = useState(initialStory?.customBodyFont || initialStory?.defaultFont || 'font-mono');
  const [customMutedFont, setCustomMutedFont] = useState(initialStory?.customMutedFont || initialStory?.defaultFont || 'font-mono');
  const [customBtnFont, setCustomBtnFont] = useState(initialStory?.customBtnFont || initialStory?.defaultFont || 'font-mono');
  const [titleFontSize, setTitleFontSize] = useState<string>(initialStory?.titleFontSize || '24px');
  const [bodyFontSize, setBodyFontSize] = useState<string>(initialStory?.bodyFontSize || '14px');

  // Custom Colors
  const [customBgColor, setCustomBgColor] = useState(initialStory?.customBgColor || '#080406');
  const [customCardBgColor, setCustomCardBgColor] = useState(initialStory?.customCardBgColor || '#11090c');
  const [customTextColor, setCustomTextColor] = useState(initialStory?.customTextColor || '#e0d0d5');
  const [customTextMutedColor, setCustomTextMutedColor] = useState(initialStory?.customTextMutedColor || '#8a717a');
  const [customBorderColor, setCustomBorderColor] = useState(initialStory?.customBorderColor || '#2d1822');
  const [customBtnBgColor, setCustomBtnBgColor] = useState(initialStory?.customBtnBgColor || '#2b1620');
  const [customBtnSecondaryBgColor, setCustomBtnSecondaryBgColor] = useState(initialStory?.customBtnSecondaryBgColor || '#1c0f16');

  // Border & Frame & Card Pattern
  const [borderStyle, setBorderStyle] = useState<NonNullable<Story['borderStyle']>>(initialStory?.borderStyle || 'solid');
  const [borderWidth, setBorderWidth] = useState<NonNullable<Story['borderWidth']>>(initialStory?.borderWidth || 'thin');
  const [borderRadius, setBorderRadius] = useState<NonNullable<Story['borderRadius']>>(initialStory?.borderRadius || 'none');
  const [borderCornerAccent, setBorderCornerAccent] = useState<NonNullable<Story['borderCornerAccent']>>(initialStory?.borderCornerAccent || 'none');
  const [borderGlow, setBorderGlow] = useState<NonNullable<Story['borderGlow']>>(initialStory?.borderGlow || 'none');
  const [customBorderGradientColor2, setCustomBorderGradientColor2] = useState<string>(initialStory?.customBorderGradientColor2 || '#ff6b9d');
  const [customBorderGlowColor1, setCustomBorderGlowColor1] = useState<string>(initialStory?.customBorderGlowColor1 || '#ff6b9d');
  const [customBorderGlowColor2, setCustomBorderGlowColor2] = useState<string>(initialStory?.customBorderGlowColor2 || '#38bdf8');

  // Reading Effect
  const [readingEffect, setReadingEffect] = useState<NonNullable<Story['readingEffect']>>(
    (initialStory?.readingEffect as any) || 'none'
  );
  const [readingEffectColor, setReadingEffectColor] = useState<string>(initialStory?.readingEffectColor || '#00f0ff');

  // --- MULTI-THEMES STATE & HELPERS ---
  const [storyThemes, setStoryThemes] = useState<StoryTheme[]>(() => {
    if (initialStory?.storyThemes && initialStory.storyThemes.length > 0) {
      return initialStory.storyThemes;
    }
    if (initialStory) {
      return [extractThemeFromStory(initialStory, 'theme_main', 'Theme Mặc Định', 'Theme chính của truyện')];
    }
    return [
      {
        id: 'theme_default',
        name: 'Theme Mặc Định (Choco Light)',
        description: 'Giao diện chính tông Choco Light đồng bộ',
        themeTone: 'choco-light',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return initialStory?.activeThemeId || (storyThemes[0]?.id || 'theme_default');
  });

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [editingThemeItem, setEditingThemeItem] = useState<StoryTheme | null>(null);
  const [themeModalName, setThemeModalName] = useState<string>('');
  const [themeModalDesc, setThemeModalDesc] = useState<string>('');
  const [themeModalCover, setThemeModalCover] = useState<string>('');
  const [themeModalSynopsis, setThemeModalSynopsis] = useState<string>('');

  const handleAddNewTheme = (presetTone?: string) => {
    const newThemeId = `theme_${Date.now()}`;
    const count = storyThemes.length + 1;
    const toneToUse = presetTone || themeTone || 'choco-light';
    const presetObj = PRESET_THEME_COLORS[toneToUse] || PRESET_THEME_COLORS['choco-light'];

    const newTheme: StoryTheme = {
      id: newThemeId,
      name: `Theme ${count} (${presetObj?.name || toneToUse})`,
      description: 'Giao diện chủ đề tùy biến riêng',
      coverUrl: coverUrl.trim(),
      synopsis: synopsis.trim(),
      themeTone: toneToUse,
      defaultFont: customBodyFont || 'font-mono',
      customTitleFont,
      customChapterTitleFont,
      customSubtitleFont,
      customBodyFont,
      customMutedFont,
      customBtnFont,
      titleFontSize,
      bodyFontSize,
      customBgColor: toneToUse === 'custom' ? customBgColor : (presetObj?.bg || '#f8f3ee'),
      customCardBgColor: toneToUse === 'custom' ? customCardBgColor : (presetObj?.cardBg || '#fffcf9'),
      customTextColor: toneToUse === 'custom' ? customTextColor : (presetObj?.text || '#2c1810'),
      customTextMutedColor: toneToUse === 'custom' ? customTextMutedColor : (presetObj?.textMuted || '#7a5230'),
      customBorderColor: toneToUse === 'custom' ? customBorderColor : (presetObj?.border || '#e2d4c3'),
      customBtnBgColor: toneToUse === 'custom' ? customBtnBgColor : (presetObj?.btnBg || '#613b22'),
      customBtnSecondaryBgColor: toneToUse === 'custom' ? customBtnSecondaryBgColor : (presetObj?.btnSecondaryBg || presetObj?.btnBg || '#e8ddcc'),
      borderStyle,
      borderWidth,
      borderRadius,
      borderCornerAccent,
      borderGlow,
      customBorderGradientColor2,
      customBorderGlowColor1,
      customBorderGlowColor2,
      readingEffect,
      readingEffectColor,
      chapterListStyle,
      storyElements: [...storyElements],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStoryThemes((prev) => [...prev, newTheme]);
    if (!activeThemeId) {
      setActiveThemeId(newThemeId);
    }
  };

  const handleApplyCurrentEditorToTheme = (themeId: string) => {
    setStoryThemes((prev) =>
      prev.map((t) => {
        if (t.id === themeId) {
          return {
            ...t,
            coverUrl: coverUrl.trim(),
            synopsis: synopsis.trim(),
            themeTone,
            defaultFont: customBodyFont,
            customTitleFont,
            customChapterTitleFont,
            customSubtitleFont,
            customBodyFont,
            customMutedFont,
            customBtnFont,
            titleFontSize,
            bodyFontSize,
            customBgColor,
            customCardBgColor,
            customTextColor,
            customTextMutedColor,
            customBorderColor,
            customBtnBgColor,
            customBtnSecondaryBgColor,
            borderStyle,
            borderWidth,
            borderRadius,
            borderCornerAccent,
            borderGlow,
            customBorderGradientColor2,
            customBorderGlowColor1,
            customBorderGlowColor2,
            readingEffect,
            readingEffectColor,
            chapterListStyle,
            storyElements: [...storyElements],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    alert('Đã lưu toàn bộ thiết kế hiện tại vào Theme!');
  };

  const handleLoadThemeIntoEditor = (theme: StoryTheme) => {
    if (theme.coverUrl) setCoverUrl(theme.coverUrl);
    if (theme.synopsis) setSynopsis(theme.synopsis);
    if (theme.themeTone) setThemeTone(theme.themeTone);
    if (theme.customBgColor) setCustomBgColor(theme.customBgColor);
    if (theme.customCardBgColor) setCustomCardBgColor(theme.customCardBgColor);
    if (theme.customTextColor) setCustomTextColor(theme.customTextColor);
    if (theme.customTextMutedColor) setCustomTextMutedColor(theme.customTextMutedColor);
    if (theme.customBorderColor) setCustomBorderColor(theme.customBorderColor);
    if (theme.customBtnBgColor) setCustomBtnBgColor(theme.customBtnBgColor);
    if (theme.customBtnSecondaryBgColor) setCustomBtnSecondaryBgColor(theme.customBtnSecondaryBgColor);
    if (theme.customTitleFont !== undefined) setCustomTitleFont(theme.customTitleFont);
    if (theme.customChapterTitleFont !== undefined) setCustomChapterTitleFont(theme.customChapterTitleFont);
    if (theme.customSubtitleFont !== undefined) setCustomSubtitleFont(theme.customSubtitleFont);
    if (theme.customBodyFont !== undefined) setCustomBodyFont(theme.customBodyFont);
    if (theme.customMutedFont !== undefined) setCustomMutedFont(theme.customMutedFont);
    if (theme.customBtnFont !== undefined) setCustomBtnFont(theme.customBtnFont);
    if (theme.titleFontSize) setTitleFontSize(theme.titleFontSize);
    if (theme.bodyFontSize) setBodyFontSize(theme.bodyFontSize);
    if (theme.borderStyle) setBorderStyle(theme.borderStyle);
    if (theme.borderWidth) setBorderWidth(theme.borderWidth);
    if (theme.borderRadius) setBorderRadius(theme.borderRadius);
    if (theme.borderCornerAccent) setBorderCornerAccent(theme.borderCornerAccent);
    if (theme.borderGlow) setBorderGlow(theme.borderGlow);
    if (theme.customBorderGradientColor2) setCustomBorderGradientColor2(theme.customBorderGradientColor2);
    if (theme.customBorderGlowColor1) setCustomBorderGlowColor1(theme.customBorderGlowColor1);
    if (theme.customBorderGlowColor2) setCustomBorderGlowColor2(theme.customBorderGlowColor2);
    if (theme.readingEffect) setReadingEffect(theme.readingEffect);
    if (theme.readingEffectColor) setReadingEffectColor(theme.readingEffectColor);
    if (theme.chapterListStyle) setChapterListStyle(theme.chapterListStyle);
    if (theme.storyElements) setStoryElements([...theme.storyElements]);
  };

  const handleDuplicateTheme = (theme: StoryTheme) => {
    const dup: StoryTheme = {
      ...theme,
      id: `theme_${Date.now()}`,
      name: `${theme.name} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStoryThemes((prev) => [...prev, dup]);
  };

  const handleDeleteTheme = (themeId: string) => {
    if (storyThemes.length <= 1) {
      alert('Cần giữ lại ít nhất 1 Theme cho bộ truyện.');
      return;
    }
    const updated = storyThemes.filter((t) => t.id !== themeId);
    setStoryThemes(updated);
    if (activeThemeId === themeId) {
      setActiveThemeId(updated[0].id);
    }
  };

  const handleOpenThemeModal = (theme: StoryTheme) => {
    setEditingThemeItem(theme);
    setThemeModalName(theme.name || '');
    setThemeModalDesc(theme.description || '');
    setThemeModalCover(theme.coverUrl || '');
    setThemeModalSynopsis(theme.synopsis || '');
    setShowThemeModal(true);
  };

  const handleSaveThemeModal = () => {
    if (!editingThemeItem) return;
    if (!themeModalName.trim()) {
      alert('Vui lòng nhập tên Theme!');
      return;
    }
    setStoryThemes((prev) =>
      prev.map((t) =>
        t.id === editingThemeItem.id
          ? {
              ...t,
              name: themeModalName.trim(),
              description: themeModalDesc.trim(),
              coverUrl: themeModalCover.trim(),
              synopsis: themeModalSynopsis.trim(),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setShowThemeModal(false);
    setEditingThemeItem(null);
  };

  // Working Story ID & Chapter Management States
  const [workingStoryId] = useState<string>(() => initialStory?.id || 'story-' + Date.now());

  // Editing active chapter state (null => Story Page view; not null => Chapter Reader & Editor view)
  const [editingChapterItem, setEditingChapterItem] = useState<Chapter | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [chapterToDeleteItem, setChapterToDeleteItem] = useState<Chapter | null>(null);

  // Form fields for active editing chapter
  const [chapterTitleInput, setChapterTitleInput] = useState<string>('');
  const [chapterVolumeTitleInput, setChapterVolumeTitleInput] = useState<string>('');
  const [chapterContentInput, setChapterContentInput] = useState<string>('');
  const [isChapterLockedInput, setIsChapterLockedInput] = useState<boolean>(false);
  const [chapterUnlockPriceInput, setChapterUnlockPriceInput] = useState<number>(1);
  const [isChapterPasswordProtectedInput, setIsChapterPasswordProtectedInput] = useState<boolean>(false);
  const [chapterPasswordInput, setChapterPasswordInput] = useState<string>('');
  const [chapterPasswordHintInput, setChapterPasswordHintInput] = useState<string>('');
  const [showSpecialFrameModal, setShowSpecialFrameModal] = useState<boolean>(false);
  const [modalInitialContent, setModalInitialContent] = useState<string>('');
  const [modalInitialType, setModalInitialType] = useState<SpecialBlockType>('system');
  const [chapterViewMode, setChapterViewMode] = useState<'edit' | 'preview'>('edit');

  // Text selection floating menu state for chapter textarea
  const chapterTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [floatingMenuVisible, setFloatingMenuVisible] = useState(false);
  const [floatingMenuPos, setFloatingMenuPos] = useState({ top: 0, left: 0 });
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number; text: string }>({
    start: 0,
    end: 0,
    text: '',
  });

  const handleChapterTextSelect = () => {
    const el = chapterTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end && end > start) {
      const selected = el.value.substring(start, end).trim();
      if (selected) {
        // Calculate coordinates for floating toolbar
        const rect = el.getBoundingClientRect();
        // Compute approximate position based on cursor in textarea
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

  const handleApplyPresetToSelection = (type: SpecialBlockType) => {
    if (!selectedRange.text) return;
    const el = chapterTextareaRef.current;
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
      setChapterContentInput((prev) => {
        const before = prev.substring(0, selectedRange.start);
        const after = prev.substring(selectedRange.end);
        return `${before}\n\n${snippet}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
      });
      setFloatingMenuVisible(false);
      setSelectedRange({ start: 0, end: 0, text: '' });
    }
  };

  const handleOpenDesignerForSelection = () => {
    setModalInitialContent(selectedRange.text);
    setModalInitialType('system');
    setShowSpecialFrameModal(true);
    setFloatingMenuVisible(false);
  };

  const handleInsertFrameSnippet = (snippet: string) => {
    setChapterContentInput((prev) => {
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

  const storyChapters = (chapters || [])
    .filter((c) => c && c.storyId === workingStoryId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const handleMoveChapter = async (chapId: string, direction: 'up' | 'down') => {
    const idx = storyChapters.findIndex((c) => c.id === chapId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === storyChapters.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newOrder = [...storyChapters];
    const [moved] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, moved);

    const updatedBatch = newOrder.map((c, i) => ({
      ...c,
      chapterNumber: i + 1,
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    if (onSaveBatchChapters) {
      await onSaveBatchChapters(updatedBatch);
    } else if (onSaveChapter) {
      for (const ch of updatedBatch) {
        await onSaveChapter(ch);
      }
    }
  };

  // Trạng thái Tách theme và hiệu ứng chương và truyện riêng biệt
  const [useSeparateChapterTheme, setUseSeparateChapterTheme] = useState<boolean>(initialStory?.useSeparateChapterTheme || false);
  const [useSeparateChapterEffect, setUseSeparateChapterEffect] = useState<boolean>(
    initialStory?.useSeparateChapterEffect ?? (initialStory?.useSeparateChapterTheme || false)
  );
  const [chapterThemeTone, setChapterThemeTone] = useState<string>(initialStory?.chapterThemeTone || initialStory?.themeTone || 'dark-rose');
  const [chapterCustomBgColor, setChapterCustomBgColor] = useState(initialStory?.chapterCustomBgColor || '#080406');
  const [chapterCustomCardBgColor, setChapterCustomCardBgColor] = useState(initialStory?.chapterCustomCardBgColor || '#11090c');
  const [chapterCustomTextColor, setChapterCustomTextColor] = useState(initialStory?.chapterCustomTextColor || '#e0d0d5');
  const [chapterCustomTextMutedColor, setChapterCustomTextMutedColor] = useState(initialStory?.chapterCustomTextMutedColor || '#8a717a');
  const [chapterCustomBorderColor, setChapterCustomBorderColor] = useState(initialStory?.chapterCustomBorderColor || '#2d1822');
  const [chapterCustomBtnBgColor, setChapterCustomBtnBgColor] = useState(initialStory?.chapterCustomBtnBgColor || '#2b1620');
  const [chapterCustomBtnSecondaryBgColor, setChapterCustomBtnSecondaryBgColor] = useState(initialStory?.chapterCustomBtnSecondaryBgColor || '#1c0f16');

  const [chapterBorderStyle, setChapterBorderStyle] = useState<NonNullable<Story['borderStyle']>>(initialStory?.chapterBorderStyle || 'solid');
  const [chapterBorderWidth, setChapterBorderWidth] = useState<NonNullable<Story['borderWidth']>>(initialStory?.chapterBorderWidth || 'thin');
  const [chapterBorderRadius, setChapterBorderRadius] = useState<NonNullable<Story['borderRadius']>>(initialStory?.chapterBorderRadius || 'none');
  const [chapterBorderCornerAccent, setChapterBorderCornerAccent] = useState<NonNullable<Story['borderCornerAccent']>>(initialStory?.chapterBorderCornerAccent || 'none');
  const [chapterBorderGlow, setChapterBorderGlow] = useState<NonNullable<Story['borderGlow']>>(initialStory?.chapterBorderGlow || 'none');
  const [chapterCustomBorderGradientColor2, setChapterCustomBorderGradientColor2] = useState<string>(initialStory?.chapterCustomBorderGradientColor2 || '#ff6b9d');
  const [chapterCustomBorderGlowColor1, setChapterCustomBorderGlowColor1] = useState<string>(initialStory?.chapterCustomBorderGlowColor1 || '#ff6b9d');
  const [chapterCustomBorderGlowColor2, setChapterCustomBorderGlowColor2] = useState<string>(initialStory?.chapterCustomBorderGlowColor2 || '#38bdf8');
  const [chapterReadingEffect, setChapterReadingEffect] = useState<NonNullable<Story['chapterReadingEffect']>>(
    (initialStory?.chapterReadingEffect as any) || 'none'
  );
  const [chapterReadingEffectColor, setChapterReadingEffectColor] = useState<string>(initialStory?.chapterReadingEffectColor || '#00f0ff');

  // Widget thông tin nhân vật (Character Info Widget)
  const [showCharacterWidget, setShowCharacterWidget] = useState<boolean>(
    initialStory?.showCharacterWidget ?? false
  );
  const [characterWidgetTitle, setCharacterWidgetTitle] = useState<string>(
    initialStory?.characterWidgetTitle || 'Thông tin nhân vật'
  );
  const [characterAvatarShape, setCharacterAvatarShape] = useState<
    'circle' | 'square' | 'portrait_34' | 'portrait_23' | 'landscape_43' | 'landscape_169'
  >(initialStory?.characterAvatarShape || 'circle');
  const [characters, setCharacters] = useState<CharacterInfo[]>(
    initialStory?.characters || []
  );

  // Widget tiến độ bộ truyện (Story Progress Widget)
  const [showProgressWidget, setShowProgressWidget] = useState<boolean>(
    initialStory?.showProgressWidget ?? false
  );
  const [progressWidgetTitle, setProgressWidgetTitle] = useState<string>(
    (!initialStory?.progressWidgetTitle || initialStory.progressWidgetTitle === 'Tiến độ bộ truyện')
      ? 'Tiến độ'
      : initialStory.progressWidgetTitle
  );
  const [totalPlannedChapters, setTotalPlannedChapters] = useState<number>(
    initialStory?.totalPlannedChapters || 0
  );

  // Widget nội dung tùy chỉnh (Custom Content Widget)
  const [showCustomWidget, setShowCustomWidget] = useState<boolean>(
    initialStory?.showCustomWidget ?? false
  );
  const [customWidgetTitle, setCustomWidgetTitle] = useState<string>(
    initialStory?.customWidgetTitle || 'Thông báo'
  );
  const [customWidgetContent, setCustomWidgetContent] = useState<string>(
    initialStory?.customWidgetContent || ''
  );

  // Widget ảnh lẻ / album di chuyển (Single Image / Moving Album Widget - Hỗ trợ nhiều widget)
  const [galleryWidgets, setGalleryWidgets] = useState<StoryGalleryWidget[]>(() => {
    if (initialStory?.galleryWidgets && initialStory.galleryWidgets.length > 0) {
      return initialStory.galleryWidgets;
    }
    if (
      initialStory?.showGalleryWidget ||
      initialStory?.gallerySingleImageUrl ||
      (initialStory?.galleryImages && initialStory.galleryImages.length > 0)
    ) {
      return [
        {
          id: 'gw_1',
          title: initialStory.galleryWidgetTitle || 'Album',
          mode: initialStory.galleryMode || 'single',
          singleImageUrl: initialStory.gallerySingleImageUrl || '',
          singleImageCaption: initialStory.gallerySingleImageCaption || '',
          images: initialStory.galleryImages || [],
          autoScrollSpeed: initialStory.galleryAutoScrollSpeed || 'normal',
          imageSize: initialStory.galleryImageSize || 100,
          enabled: initialStory.showGalleryWidget ?? true,
        },
      ];
    }
    return [
      {
        id: `gw_${Date.now()}`,
        title: 'Ảnh / Album',
        mode: 'single',
        singleImageUrl: '',
        singleImageCaption: '',
        images: [],
        autoScrollSpeed: 'normal',
        imageSize: 100,
        enabled: initialStory?.showGalleryWidget ?? false,
      },
    ];
  });

  const [expandedWidgetIds, setExpandedWidgetIds] = useState<Record<string, boolean>>({});
  const targetUploadWidgetIdRef = useRef<string | null>(null);

  const [showGalleryWidget, setShowGalleryWidget] = useState<boolean>(
    initialStory?.showGalleryWidget ?? (galleryWidgets.some(w => w.enabled !== false))
  );
  const [galleryWidgetTitle, setGalleryWidgetTitle] = useState<string>(
    initialStory?.galleryWidgetTitle || galleryWidgets[0]?.title || 'Album'
  );
  const [galleryMode, setGalleryMode] = useState<'single' | 'album'>(
    initialStory?.galleryMode || galleryWidgets[0]?.mode || 'single'
  );
  const [gallerySingleImageUrl, setGallerySingleImageUrl] = useState<string>(
    initialStory?.gallerySingleImageUrl || galleryWidgets[0]?.singleImageUrl || ''
  );
  const [gallerySingleImageCaption, setGallerySingleImageCaption] = useState<string>(
    initialStory?.gallerySingleImageCaption || galleryWidgets[0]?.singleImageCaption || ''
  );
  const [galleryImages, setGalleryImages] = useState<StoryGalleryImage[]>(
    initialStory?.galleryImages || galleryWidgets[0]?.images || []
  );
  const [galleryAutoScrollSpeed, setGalleryAutoScrollSpeed] = useState<'slow' | 'normal' | 'fast'>(
    initialStory?.galleryAutoScrollSpeed || galleryWidgets[0]?.autoScrollSpeed || 'normal'
  );
  const [galleryImageSize, setGalleryImageSize] = useState<number>(
    initialStory?.galleryImageSize || galleryWidgets[0]?.imageSize || 100
  );

  // Input & nén ảnh cho Gallery
  const [newAlbumImgUrl, setNewAlbumImgUrl] = useState('');
  const [newAlbumImgCaption, setNewAlbumImgCaption] = useState('');
  const [isCompressingGalleryImg, setIsCompressingGalleryImg] = useState(false);
  const gallerySingleFileInputRef = useRef<HTMLInputElement>(null);
  const galleryAlbumFileInputRef = useRef<HTMLInputElement>(null);

  // Kiểu trình bày danh sách chương (Chapter List Display Style)
  const [chapterListStyle, setChapterListStyle] = useState<NonNullable<Story['chapterListStyle']>>(
    initialStory?.chapterListStyle || 'standard'
  );
  const [collapsedVolumes, setCollapsedVolumes] = useState<Record<string, boolean>>({});
  const [showNewVolumeInput, setShowNewVolumeInput] = useState(false);

  // Form thêm/sửa nhân vật
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('');
  const [charDesc, setCharDesc] = useState('');
  const [charAvatar, setCharAvatar] = useState('');
  const [showCharModal, setShowCharModal] = useState(false);
  const [isCompressingCharAvatar, setIsCompressingCharAvatar] = useState(false);
  const charAvatarFileInputRef = useRef<HTMLInputElement>(null);

  // Element / Sticker / Họa tiết trang trí tự do trên trang truyện
  const [storyElements, setStoryElements] = useState<StoryElement[]>(
    initialStory?.storyElements || []
  );
  const [selectedStoryElementId, setSelectedStoryElementId] = useState<string | null>(null);
  const [isCompressingElementImg, setIsCompressingElementImg] = useState(false);
  const elementFileInputRef = useRef<HTMLInputElement>(null);
  const [elementUrlInput, setElementUrlInput] = useState('');

  // View mode: 'edit' (Soạn thảo) vs 'preview' (Xem trước & Đính Element 1:1)
  const [editorMainView, setEditorMainView] = useState<'edit' | 'preview'>('edit');
  const previewArticleRef = useRef<HTMLElement | null>(null);
  const [previewStripPaused, setPreviewStripPaused] = useState(false);
  const [previewSynopsisExpanded, setPreviewSynopsisExpanded] = useState(false);
  const [previewSearchChapterQuery, setPreviewSearchChapterQuery] = useState('');
  const [previewSelectedVolumeFilter, setPreviewSelectedVolumeFilter] = useState<string | null>('ALL');
  const [previewExpandedVolumes, setPreviewExpandedVolumes] = useState<Record<string, boolean>>({});
  const [previewLightboxImages, setPreviewLightboxImages] = useState<Array<{ url: string; caption?: string }>>([]);
  const [previewLightboxCurrentIndex, setPreviewLightboxCurrentIndex] = useState(0);

  const togglePreviewVolume = (vol: string) => {
    setPreviewExpandedVolumes((prev) => ({
      ...prev,
      [vol]: !prev[vol],
    }));
  };

  // Floating Design Drawer Tabs
  const [activeDrawerTab, setActiveDrawerTab] = useState<'theme' | 'fonts' | 'borders' | 'effects' | 'elements' | 'widgets' | 'layout' | 'multi-themes' | null>(null);

  // Story Page Flexible Sections Layout State (từng đoạn 1 cột hoặc 2 cột linh hoạt)
  const [storyLayoutSections, setStoryLayoutSections] = useState<StoryLayoutSection[]>(() =>
    normalizeStorySections(initialStory)
  );
  const [draggedSectionBlock, setDraggedSectionBlock] = useState<{
    blockId: StoryLayoutBlockId;
    sourceSecIdx: number;
    sourceCol?: 'left' | 'right' | 'single';
  } | null>(null);

  const handleAddSection = (type: StoryLayoutSectionType) => {
    const newSec: StoryLayoutSection = {
      id: `sec-${Date.now()}`,
      type,
      title: `Phân đoạn ${storyLayoutSections.length + 1}`,
      columnRatio: type === '2_columns' ? 'left_fixed' : undefined,
      blocks: type === '1_column' ? [] : undefined,
      leftBlocks: type === '2_columns' ? [] : undefined,
      rightBlocks: type === '2_columns' ? [] : undefined,
    };
    setStoryLayoutSections((prev) => [...prev, newSec]);
  };

  const handleToggleSectionType = (secIdx: number) => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      const target = next[secIdx];
      if (!target) return prev;

      if (target.type === '1_column') {
        const existingBlocks = target.blocks || [];
        const half = Math.ceil(existingBlocks.length / 2);
        next[secIdx] = {
          ...target,
          type: '2_columns',
          columnRatio: target.columnRatio || 'left_fixed',
          blocks: undefined,
          leftBlocks: existingBlocks.slice(0, half),
          rightBlocks: existingBlocks.slice(half),
        };
      } else {
        const mergedBlocks = [...(target.leftBlocks || []), ...(target.rightBlocks || [])];
        next[secIdx] = {
          ...target,
          type: '1_column',
          blocks: mergedBlocks,
          leftBlocks: undefined,
          rightBlocks: undefined,
        };
      }
      return next;
    });
  };

  const handleUpdateSectionRatio = (secIdx: number, ratio: StoryLayoutColumnRatio) => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      if (!next[secIdx]) return prev;
      next[secIdx] = { ...next[secIdx], columnRatio: ratio };
      return next;
    });
  };

  const handleDeleteSection = (secIdx: number) => {
    if (storyLayoutSections.length <= 1) {
      alert('Cần giữ lại ít nhất 1 phân đoạn trên trang.');
      return;
    }
    setStoryLayoutSections((prev) => {
      const target = prev[secIdx];
      if (!target) return prev;
      const targetBlocks =
        target.type === '1_column'
          ? target.blocks || []
          : [...(target.leftBlocks || []), ...(target.rightBlocks || [])];

      const next = prev.filter((_, idx) => idx !== secIdx);
      if (targetBlocks.length > 0 && next.length > 0) {
        // Dồn các khối còn lại vào phân đoạn trước đó hoặc sau đó
        const mergeIdx = Math.max(0, secIdx - 1);
        const mergeTarget = next[mergeIdx];
        if (mergeTarget.type === '1_column') {
          next[mergeIdx] = {
            ...mergeTarget,
            blocks: [...(mergeTarget.blocks || []), ...targetBlocks],
          };
        } else {
          next[mergeIdx] = {
            ...mergeTarget,
            rightBlocks: [...(mergeTarget.rightBlocks || []), ...targetBlocks],
          };
        }
      }
      return next;
    });
  };

  const handleMoveSection = (secIdx: number, direction: 'up' | 'down') => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? secIdx - 1 : secIdx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const [item] = next.splice(secIdx, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
  };

  const handleMoveBlockWithinSection = (
    secIdx: number,
    col: 'left' | 'right' | 'single',
    fromIdx: number,
    toIdx: number
  ) => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      const sec = next[secIdx];
      if (!sec) return prev;

      if (col === 'single' && sec.blocks) {
        const list = [...sec.blocks];
        if (toIdx < 0 || toIdx >= list.length) return prev;
        const [item] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, item);
        next[secIdx] = { ...sec, blocks: list };
      } else if (col === 'left' && sec.leftBlocks) {
        const list = [...sec.leftBlocks];
        if (toIdx < 0 || toIdx >= list.length) return prev;
        const [item] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, item);
        next[secIdx] = { ...sec, leftBlocks: list };
      } else if (col === 'right' && sec.rightBlocks) {
        const list = [...sec.rightBlocks];
        if (toIdx < 0 || toIdx >= list.length) return prev;
        const [item] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, item);
        next[secIdx] = { ...sec, rightBlocks: list };
      }
      return next;
    });
  };

  const handleMoveBlockBetweenColumns = (
    secIdx: number,
    fromCol: 'left' | 'right',
    blockId: StoryLayoutBlockId
  ) => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      const sec = next[secIdx];
      if (!sec || sec.type !== '2_columns') return prev;

      if (fromCol === 'left') {
        const newLeft = (sec.leftBlocks || []).filter((id) => id !== blockId);
        const newRight = [...(sec.rightBlocks || []).filter((id) => id !== blockId), blockId];
        next[secIdx] = { ...sec, leftBlocks: newLeft, rightBlocks: newRight };
      } else {
        const newRight = (sec.rightBlocks || []).filter((id) => id !== blockId);
        const newLeft = [...(sec.leftBlocks || []).filter((id) => id !== blockId), blockId];
        next[secIdx] = { ...sec, leftBlocks: newLeft, rightBlocks: newRight };
      }
      return next;
    });
  };

  const handleMoveBlockToSection = (
    sourceSecIdx: number,
    sourceCol: 'left' | 'right' | 'single' | undefined,
    targetSecIdx: number,
    targetCol: 'left' | 'right' | 'single',
    blockId: StoryLayoutBlockId
  ) => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      const sourceSec = next[sourceSecIdx];
      const targetSec = next[targetSecIdx];
      if (!sourceSec || !targetSec) return prev;

      // Xóa khỏi nguồn
      if (sourceSec.type === '1_column') {
        next[sourceSecIdx] = {
          ...sourceSec,
          blocks: (sourceSec.blocks || []).filter((id) => id !== blockId),
        };
      } else {
        next[sourceSecIdx] = {
          ...sourceSec,
          leftBlocks: (sourceSec.leftBlocks || []).filter((id) => id !== blockId),
          rightBlocks: (sourceSec.rightBlocks || []).filter((id) => id !== blockId),
        };
      }

      // Thêm vào đích
      const updatedTarget = next[targetSecIdx];
      if (updatedTarget.type === '1_column') {
        next[targetSecIdx] = {
          ...updatedTarget,
          blocks: [...(updatedTarget.blocks || []).filter((id) => id !== blockId), blockId],
        };
      } else {
        if (targetCol === 'left') {
          next[targetSecIdx] = {
            ...updatedTarget,
            leftBlocks: [...(updatedTarget.leftBlocks || []).filter((id) => id !== blockId), blockId],
          };
        } else {
          next[targetSecIdx] = {
            ...updatedTarget,
            rightBlocks: [...(updatedTarget.rightBlocks || []).filter((id) => id !== blockId), blockId],
          };
        }
      }
      return next;
    });
  };

  const handleAddUnusedBlockToSection = (
    blockId: StoryLayoutBlockId,
    targetSecIdx: number,
    targetCol?: 'left' | 'right'
  ) => {
    setStoryLayoutSections((prev) => {
      const next = [...prev];
      const targetSec = next[targetSecIdx];
      if (!targetSec) return prev;

      if (targetSec.type === '1_column') {
        next[targetSecIdx] = {
          ...targetSec,
          blocks: [...(targetSec.blocks || []).filter((id) => id !== blockId), blockId],
        };
      } else {
        if (targetCol === 'left') {
          next[targetSecIdx] = {
            ...targetSec,
            leftBlocks: [...(targetSec.leftBlocks || []).filter((id) => id !== blockId), blockId],
          };
        } else {
          next[targetSecIdx] = {
            ...targetSec,
            rightBlocks: [...(targetSec.rightBlocks || []).filter((id) => id !== blockId), blockId],
          };
        }
      }
      return next;
    });
  };

  const handleResetLayoutSections = () => {
    setStoryLayoutSections(DEFAULT_STORY_LAYOUT_SECTIONS);
  };

  const [isCompressingCover, setIsCompressingCover] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [showCoverUrlModal, setShowCoverUrlModal] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState('');

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Custom User-Uploaded Fonts (lưu trữ trong IndexedDB an toàn, đồng bộ Firestore)
  const [userUploadedFonts, setUserUploadedFonts] = useState<StoredUserFont[]>([]);

  // Tự động nạp fonts từ IndexedDB khi mount
  useEffect(() => {
    migrateLocalStorageFonts().then((fonts) => {
      setUserUploadedFonts(fonts);
      fonts.forEach(font => {
        if (font.value && font.fontData) {
          injectFontFace(font);
        }
      });
    }).catch(err => {
      console.warn('[LiveStoryEditor] Error loading IDB fonts:', err);
    });
  }, []);

  const injectFontFace = (font: { value: string; fontData: string }) => {
    const styleId = `style-${font.value}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @font-face {
        font-family: '${font.value}';
        src: url('${font.fontData}');
      }
      .${font.value} {
        font-family: '${font.value}', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    userUploadedFonts.forEach(font => {
      injectFontFace(font);
    });
  }, [userUploadedFonts]);

  // Sync fonts from Firestore to IndexedDB and State when user logs in
  useEffect(() => {
    const syncFontsFromCloud = async () => {
      if (!currentUser?.uid) return;
      try {
        const cloudFonts = await getUserFontsFromCloud(currentUser.uid);
        if (cloudFonts.length > 0) {
          const currentIdbFonts = await getIdbFonts();
          const merged: StoredUserFont[] = [...currentIdbFonts];

          cloudFonts.forEach(cf => {
            const exists = merged.find(lf => lf.value === cf.value);
            if (!exists) {
              merged.push({
                value: cf.value,
                label: cf.name,
                styleId: `style-${cf.value}`,
                fontData: cf.fileData
              });
            }
          });

          setUserUploadedFonts(merged);
          await saveIdbFonts(merged);
          merged.forEach(font => {
            injectFontFace(font);
          });
        }
      } catch (err) {
        console.warn('[Sync Fonts] Lỗi khi tải font cá nhân từ Firestore:', err);
      }
    };
    syncFontsFromCloud();
  }, [currentUser]);

  const handleUploadFontFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files) as File[];
    let updatedFonts = [...userUploadedFonts];
    let skippedCount = 0;
    let successCount = 0;

    for (const file of filesArray) {
      // Cho phép font đến 3MB an toàn trên IndexedDB
      if (file.size > 3 * 1024 * 1024) {
        alert(`Kích thước font "${file.name}" quá lớn! Hãy chọn file dưới 3MB.`);
        continue;
      }

      // Read file to base64
      const base64Data = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string || null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (!base64Data) continue;

      const fontName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      const label = `${fontName} (Tùy biến)`;

      // Check for duplicates (case insensitive name, or same base64 data)
      const isDuplicate = updatedFonts.some(f => 
        f.label.replace(' (Tùy biến)', '').toLowerCase() === fontName.toLowerCase() ||
        f.fontData === base64Data
      );

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      const fontValue = `font-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const styleId = `style-${fontValue}`;

      const newFont: StoredUserFont = {
        value: fontValue,
        label,
        styleId,
        fontData: base64Data
      };

      updatedFonts.push(newFont);
      injectFontFace(newFont);
      successCount++;

      // Lưu lên Firestore nếu người dùng đã đăng nhập
      if (currentUser?.uid) {
        try {
          await saveUserFontToCloud(currentUser.uid, newFont.label, newFont.value, newFont.fontData);
        } catch (err) {
          console.warn('[Sync Fonts] Không thể sao lưu font lên Firestore:', err);
        }
      }
    }

    if (successCount > 0) {
      setUserUploadedFonts(updatedFonts);
      await saveIdbFonts(updatedFonts);
    }

    if (filesArray.length > 1) {
      alert(`Đã tải lên thành công ${successCount} font. Bỏ qua ${skippedCount} font trùng lặp.`);
    } else if (skippedCount > 0) {
      alert(`Font "${filesArray[0].name}" đã tồn tại trên hệ thống (đã lọc trùng).`);
    }

    // Reset input value so same files can be selected again
    e.target.value = '';
  };

  const handleDeleteUploadedFont = async (fontValue: string) => {
    const updated = userUploadedFonts.filter(f => f.value !== fontValue);
    setUserUploadedFonts(updated);
    await deleteIdbFont(fontValue);

    const styleEl = document.getElementById(`style-${fontValue}`);
    if (styleEl) {
      styleEl.remove();
    }

    // Xóa khỏi Firestore nếu người dùng đã đăng nhập
    if (currentUser?.uid) {
      try {
        await deleteUserFontFromCloud(currentUser.uid, fontValue);
      } catch (err) {
        console.warn('[Sync Fonts] Không thể xóa font trên Firestore:', err);
      }
    }
  };

  const ALL_FONTS = [...userUploadedFonts, ...FONT_OPTIONS];

  // Lock body overflow while live editor is open full screen
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Compute live visual tokens based on active preview page (if split)
  const isViewingChapterTheme = useSeparateChapterTheme && editingChapterItem !== null;
  const activeTone = isViewingChapterTheme ? chapterThemeTone : themeTone;
  const isCustomTheme = activeTone === 'custom';
  const activePreset = PRESET_THEME_COLORS[activeTone] || PRESET_THEME_COLORS['dark-rose'];

  const currentBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBgColor : customBgColor) 
    : activePreset.bg;
  const currentCardBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomCardBgColor : customCardBgColor) 
    : activePreset.cardBg;
  const currentText = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomTextColor : customTextColor) 
    : activePreset.text;
  const currentTextMuted = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomTextMutedColor : customTextMutedColor) 
    : activePreset.textMuted;
  const currentBorder = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBorderColor : customBorderColor) 
    : activePreset.border;
  const currentBtnBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBtnBgColor : customBtnBgColor) 
    : activePreset.btnBg;
  const currentBtnSecondaryBg = isCustomTheme 
    ? (isViewingChapterTheme ? chapterCustomBtnSecondaryBgColor : customBtnSecondaryBgColor) 
    : (activePreset.btnSecondaryBg || activePreset.btnBg);
  const currentBtnBorder = isCustomTheme ? currentBorder : activePreset.btnBorder;
  const currentBtnText = isCustomTheme ? currentText : activePreset.btnText;

  // Check if background is dark for effect visibility
  const isDarkTheme = !currentBg.toLowerCase().includes('#fff') && !currentBg.toLowerCase().includes('255, 255, 255');

  const activeBStyle = isViewingChapterTheme ? chapterBorderStyle : borderStyle;
  const activeBWidth = isViewingChapterTheme ? chapterBorderWidth : borderWidth;
  const activeBRadius = isViewingChapterTheme ? chapterBorderRadius : borderRadius;
  const activeBCorner = isViewingChapterTheme ? chapterBorderCornerAccent : borderCornerAccent;
  const activeBGlow = isViewingChapterTheme ? chapterBorderGlow : borderGlow;

  const isSeparatedEffect = useSeparateChapterEffect || useSeparateChapterTheme;
  const isViewingChapterEffect = isSeparatedEffect && editingChapterItem !== null;
  const activeReadingEffect = isViewingChapterEffect ? chapterReadingEffect : readingEffect;

  const currentBorderObj = {
    borderStyle: activeBStyle,
    borderWidth: activeBWidth,
    borderRadius: activeBRadius,
    borderCornerAccent: activeBCorner,
    borderGlow: activeBGlow,
    customBorderColor: currentBorder,
    customCardBgColor: currentCardBg,
    customBorderGradientColor2: isViewingChapterTheme ? chapterCustomBorderGradientColor2 : customBorderGradientColor2,
    customBorderGlowColor1: isViewingChapterTheme ? chapterCustomBorderGlowColor1 : customBorderGlowColor1,
    customBorderGlowColor2: isViewingChapterTheme ? chapterCustomBorderGlowColor2 : customBorderGlowColor2,
  };

  // Getters/setters for Customizer Drawer controls (handles automatic target switching)
  const activeThemeTone = isViewingChapterTheme ? chapterThemeTone : themeTone;
  const activeBgColorVal = isViewingChapterTheme ? chapterCustomBgColor : customBgColor;
  const activeCardBgColorVal = isViewingChapterTheme ? chapterCustomCardBgColor : customCardBgColor;
  const activeTextColorVal = isViewingChapterTheme ? chapterCustomTextColor : customTextColor;
  const activeTextMutedColorVal = isViewingChapterTheme ? chapterCustomTextMutedColor : customTextMutedColor;
  const activeBorderColorVal = isViewingChapterTheme ? chapterCustomBorderColor : customBorderColor;
  const activeBtnBgColorVal = isViewingChapterTheme ? chapterCustomBtnBgColor : customBtnBgColor;
  const activeBtnSecondaryBgColorVal = isViewingChapterTheme ? chapterCustomBtnSecondaryBgColor : customBtnSecondaryBgColor;
  const activeBorderGradientColor2Val = isViewingChapterTheme ? chapterCustomBorderGradientColor2 : customBorderGradientColor2;
  const activeBorderGlowColor1Val = isViewingChapterTheme ? chapterCustomBorderGlowColor1 : customBorderGlowColor1;
  const activeBorderGlowColor2Val = isViewingChapterTheme ? chapterCustomBorderGlowColor2 : customBorderGlowColor2;

  const handleSetBorderGradientColor2 = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderGradientColor2(val);
    else setCustomBorderGradientColor2(val);
  };
  const handleSetBorderGlowColor1 = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderGlowColor1(val);
    else setCustomBorderGlowColor1(val);
  };
  const handleSetBorderGlowColor2 = (val: string) => {
    if (isViewingChapterTheme) setChapterCustomBorderGlowColor2(val);
    else setCustomBorderGlowColor2(val);
  };

  const handleSetThemeTone = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterThemeTone(val);
      if (val === 'custom') {
        const preset = PRESET_THEME_COLORS[chapterThemeTone] || PRESET_THEME_COLORS['dark-rose'];
        if (preset) {
          setChapterCustomBgColor(preset.bg);
          setChapterCustomCardBgColor(preset.cardBg);
          setChapterCustomTextColor(preset.text);
          setChapterCustomTextMutedColor(preset.textMuted);
          setChapterCustomBorderColor(preset.border);
          setChapterCustomBtnBgColor(preset.btnBg);
          setChapterCustomBtnSecondaryBgColor(preset.btnSecondaryBg || preset.btnBg);
        }
      }
    } else {
      setThemeTone(val);
      if (val === 'custom') {
        const preset = PRESET_THEME_COLORS[themeTone] || PRESET_THEME_COLORS['dark-rose'];
        if (preset) {
          setCustomBgColor(preset.bg);
          setCustomCardBgColor(preset.cardBg);
          setCustomTextColor(preset.text);
          setCustomTextMutedColor(preset.textMuted);
          setCustomBorderColor(preset.border);
          setCustomBtnBgColor(preset.btnBg);
          setCustomBtnSecondaryBgColor(preset.btnSecondaryBg || preset.btnBg);
        }
      }
    }
  };
  const handleSetBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetCardBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomCardBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomCardBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetTextColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomTextColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomTextColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetTextMutedColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomTextMutedColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomTextMutedColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetBorderColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBorderColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBorderColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetBtnBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBtnBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBtnBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };
  const handleSetBtnSecondaryBgColor = (val: string) => {
    if (isViewingChapterTheme) {
      setChapterCustomBtnSecondaryBgColor(val);
      if (chapterThemeTone !== 'custom') setChapterThemeTone('custom');
    } else {
      setCustomBtnSecondaryBgColor(val);
      if (themeTone !== 'custom') setThemeTone('custom');
    }
  };

  const handleSetBorderStyle = (val: any) => {
    if (isViewingChapterTheme) {
      setChapterBorderStyle(val);
      if (val === 'sketch') {
        setChapterBorderRadius('none');
        setChapterBorderCornerAccent('none');
      }
    } else {
      setBorderStyle(val);
      if (val === 'sketch') {
        setBorderRadius('none');
        setBorderCornerAccent('none');
      }
    }
  };
  const handleSetBorderWidth = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderWidth(val);
    else setBorderWidth(val);
  };
  const handleSetBorderRadius = (val: any) => {
    if (activeBStyle === 'sketch') return;
    if (isViewingChapterTheme) setChapterBorderRadius(val);
    else setBorderRadius(val);
  };
  const handleSetBorderCornerAccent = (val: any) => {
    if (activeBStyle === 'sketch') return;
    if (isViewingChapterTheme) setChapterBorderCornerAccent(val);
    else setBorderCornerAccent(val);
  };
  const handleSetBorderGlow = (val: any) => {
    if (isViewingChapterTheme) setChapterBorderGlow(val);
    else setBorderGlow(val);
  };
  const handleSetReadingEffect = (val: any) => {
    if (isViewingChapterEffect) setChapterReadingEffect(val);
    else setReadingEffect(val);
  };

  // Image compressor
  const handleCompressAndSetImage = (file: File, target: 'cover' | 'avatar') => {
    if (target === 'cover') setIsCompressingCover(true);
    else setIsCompressingAvatar(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = target === 'cover' ? 800 : 256;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (target === 'cover') {
            setCoverUrl(dataUrl);
            setIsCompressingCover(false);
          } else {
            setEditorPhoto(dataUrl);
            setIsCompressingAvatar(false);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Multi-Gallery Widget Helpers
  const handleAddGalleryWidget = () => {
    const newId = `gw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newWidget: StoryGalleryWidget = {
      id: newId,
      title: `Widget Ảnh ${galleryWidgets.length + 1}`,
      mode: 'single',
      singleImageUrl: '',
      singleImageCaption: '',
      images: [],
      autoScrollSpeed: 'normal',
      imageSize: 100,
      enabled: true,
    };
    setGalleryWidgets((prev) => [...prev, newWidget]);
    setExpandedWidgetIds((prev) => ({ ...prev, [newId]: true }));
    setShowGalleryWidget(true);
  };

  const handleUpdateGalleryWidget = (id: string, updates: Partial<StoryGalleryWidget>) => {
    setGalleryWidgets((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const updated = { ...w, ...updates };
          // Đồng bộ nếu là widget đầu tiên
          if (prev[0]?.id === id) {
            if (updates.title !== undefined) setGalleryWidgetTitle(updates.title);
            if (updates.mode !== undefined) setGalleryMode(updates.mode);
            if (updates.singleImageUrl !== undefined) setGallerySingleImageUrl(updates.singleImageUrl);
            if (updates.singleImageCaption !== undefined) setGallerySingleImageCaption(updates.singleImageCaption);
            if (updates.images !== undefined) setGalleryImages(updates.images);
            if (updates.autoScrollSpeed !== undefined) setGalleryAutoScrollSpeed(updates.autoScrollSpeed);
            if (updates.imageSize !== undefined) setGalleryImageSize(updates.imageSize);
            if (updates.enabled !== undefined) setShowGalleryWidget(updates.enabled);
          }
          return updated;
        }
        return w;
      })
    );
  };

  const handleDeleteGalleryWidget = (id: string) => {
    if (galleryWidgets.length <= 1) {
      if (confirm('Xóa widget này và đặt lại trạng thái trống?')) {
        const emptyWidget: StoryGalleryWidget = {
          id: `gw_${Date.now()}`,
          title: 'Ảnh / Album',
          mode: 'single',
          singleImageUrl: '',
          singleImageCaption: '',
          images: [],
          autoScrollSpeed: 'normal',
          imageSize: 100,
          enabled: false,
        };
        setGalleryWidgets([emptyWidget]);
        setShowGalleryWidget(false);
        setGallerySingleImageUrl('');
        setGalleryImages([]);
      }
      return;
    }
    if (confirm('Bạn có chắc muốn xóa Widget ảnh này?')) {
      setGalleryWidgets((prev) => prev.filter((w) => w.id !== id));
      // Xóa block tương ứng trong storyLayoutSections nếu có
      const blockToRemove1 = `gallery_widget:${id}`;
      const blockToRemove2 = `gallery_widget_${id}`;
      setStoryLayoutSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          blocks: sec.blocks?.filter((b) => b !== blockToRemove1 && b !== blockToRemove2),
          leftBlocks: sec.leftBlocks?.filter((b) => b !== blockToRemove1 && b !== blockToRemove2),
          rightBlocks: sec.rightBlocks?.filter((b) => b !== blockToRemove1 && b !== blockToRemove2),
        }))
      );
    }
  };

  const handleMoveGalleryWidget = (index: number, direction: 'up' | 'down') => {
    setGalleryWidgets((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Nén ảnh đơn cho Gallery Widget (hỗ trợ target widget cụ thể)
  const handleCompressGallerySingle = (file: File, targetWidgetId?: string) => {
    const targetId = targetWidgetId || targetUploadWidgetIdRef.current || galleryWidgets[0]?.id;
    if (file.type === 'image/gif' && file.size > 500 * 1024) {
      alert(`Kích thước ảnh GIF quá lớn (${(file.size / 1024).toFixed(1)} KB). Vui lòng chọn ảnh GIF dưới 500 KB để tránh lỗi lưu trữ.`);
      return;
    }
    setIsCompressingGalleryImg(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Giữ nguyên file GIF để không mất hoạt ảnh
      if (file.type === 'image/gif') {
        if (targetId) {
          handleUpdateGalleryWidget(targetId, { singleImageUrl: result });
        }
        setGallerySingleImageUrl(result);
        setIsCompressingGalleryImg(false);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const outputType = (file.type === 'image/png' || file.type === 'image/webp') ? 'image/webp' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputType, 0.85);
          if (targetId) {
            handleUpdateGalleryWidget(targetId, { singleImageUrl: dataUrl });
          }
          setGallerySingleImageUrl(dataUrl);
          setIsCompressingGalleryImg(false);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Nén và thêm nhiều ảnh album cho Gallery Widget
  const handleCompressGalleryAlbum = (files: FileList | File[], targetWidgetId?: string) => {
    const targetId = targetWidgetId || targetUploadWidgetIdRef.current || galleryWidgets[0]?.id;
    const validFiles = Array.from(files).filter(file => {
      if (file.type === 'image/gif' && file.size > 500 * 1024) {
        alert(`Ảnh "${file.name}" là GIF quá lớn (${(file.size / 1024).toFixed(1)} KB). Vui lòng chọn GIF dưới 500 KB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsCompressingGalleryImg(true);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Giữ nguyên GIF để giữ hoạt ảnh
        if (file.type === 'image/gif') {
          const newImg = {
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            url: result,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          };
          if (targetId) {
            setGalleryWidgets((prev) =>
              prev.map((w) => (w.id === targetId ? { ...w, images: [...(w.images || []), newImg] } : w))
            );
          }
          setGalleryImages((prev) => [...prev, newImg]);
          setIsCompressingGalleryImg(false);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const outputType = (file.type === 'image/png' || file.type === 'image/webp') ? 'image/webp' : 'image/jpeg';
            const dataUrl = canvas.toDataURL(outputType, 0.82);
            const newImg = {
              id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              url: dataUrl,
              caption: file.name.replace(/\.[^/.]+$/, ''),
            };
            if (targetId) {
              setGalleryWidgets((prev) =>
                prev.map((w) => (w.id === targetId ? { ...w, images: [...(w.images || []), newImg] } : w))
              );
            }
            setGalleryImages((prev) => [...prev, newImg]);
            setIsCompressingGalleryImg(false);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Nén và thêm ảnh/GIF Element trang trí
  const handleCompressElementImg = (file: File) => {
    if (file.type === 'image/gif' && file.size > 800 * 1024) {
      alert(`Kích thước GIF element (${(file.size / 1024).toFixed(1)} KB) hơi lớn. Nên chọn dưới 800 KB để trang tải nhanh nhất.`);
    }
    setIsCompressingElementImg(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (file.type === 'image/gif') {
        const newEl: StoryElement = {
          id: `ele_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          imageUrl: result,
          name: file.name.replace(/\.[^/.]+$/, ''),
          x: 50,
          y: 40,
          width: 90,
          rotation: 0,
          opacity: 1,
          zIndex: 15,
          animation: 'none',
        };
        setStoryElements((prev) => [...prev, newEl]);
        setSelectedStoryElementId(newEl.id);
        setIsCompressingElementImg(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png'); // Dùng PNG để bảo toàn độ trong suốt
          const newEl: StoryElement = {
            id: `ele_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            imageUrl: dataUrl,
            name: file.name.replace(/\.[^/.]+$/, ''),
            x: 50,
            y: 40,
            width: 85,
            rotation: 0,
            opacity: 1,
            zIndex: 15,
            animation: 'none',
          };
          setStoryElements((prev) => [...prev, newEl]);
          setSelectedStoryElementId(newEl.id);
          setIsCompressingElementImg(false);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddElementFromUrl = (url: string, defaultWidth = 85, name?: string) => {
    if (!url || !url.trim()) return;
    const newEl: StoryElement = {
      id: `ele_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      imageUrl: url.trim(),
      name: name || 'Element URL',
      x: 50,
      y: 40,
      width: defaultWidth,
      rotation: 0,
      opacity: 1,
      zIndex: 15,
      animation: 'none',
    };
    setStoryElements((prev) => [...prev, newEl]);
    setSelectedStoryElementId(newEl.id);
    setElementUrlInput('');
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const rawTags = newTagInput.split(/[,，\n]/);
    const updatedTags = [...tags];
    rawTags.forEach((item) => {
      const cleanTag = item.trim().replace(/^#/, '');
      if (cleanTag && !updatedTags.includes(cleanTag)) {
        updatedTags.push(cleanTag);
      }
    });
    setTags(updatedTags);
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Helper functions cho Widget nhân vật
  const handleOpenAddChar = () => {
    setEditingCharId(null);
    setCharName('');
    setCharRole('');
    setCharDesc('');
    setCharAvatar('');
    setShowCharModal(true);
  };

  const handleOpenEditChar = (char: CharacterInfo) => {
    setEditingCharId(char.id);
    setCharName(char.name);
    setCharRole(char.role || '');
    setCharDesc(char.description || '');
    setCharAvatar(char.avatarUrl || '');
    setShowCharModal(true);
  };

  const handleSaveChar = () => {
    if (!charName.trim()) {
      alert('Vui lòng nhập tên nhân vật!');
      return;
    }
    if (editingCharId) {
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingCharId
            ? {
                id: editingCharId,
                name: charName.trim(),
                role: charRole.trim() || undefined,
                description: charDesc.trim() || undefined,
                avatarUrl: charAvatar.trim() || undefined,
              }
            : c
        )
      );
    } else {
      const newChar: CharacterInfo = {
        id: 'char-' + Date.now(),
        name: charName.trim(),
        role: charRole.trim() || undefined,
        description: charDesc.trim() || undefined,
        avatarUrl: charAvatar.trim() || undefined,
      };
      setCharacters((prev) => [...prev, newChar]);
    }
    setShowCharModal(false);
    setEditingCharId(null);
  };

  const handleDeleteChar = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCompressCharAvatar = (file: File) => {
    setIsCompressingCharAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 256;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setCharAvatar(canvas.toDataURL('image/jpeg', 0.85));
        }
        setIsCompressingCharAvatar(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditChapterItem = (chap: Chapter) => {
    setEditingChapterItem(chap);
    setChapterTitleInput(chap.title || '');
    setChapterVolumeTitleInput(chap.volumeTitle || '');
    setChapterContentInput(chap.content || '');
    setIsChapterLockedInput(!!chap.isLocked);
    setChapterUnlockPriceInput(chap.unlockPrice && chap.unlockPrice > 0 ? chap.unlockPrice : 1);
    setIsChapterPasswordProtectedInput(!!chap.isPasswordProtected || !!chap.password);
    setChapterPasswordInput(chap.password || '');
    setChapterPasswordHintInput(chap.passwordHint || '');

    const existingVols = Array.from(new Set(
      storyChapters
        .map(c => c.volumeTitle?.trim())
        .filter((v): v is string => !!v)
    ));
    const isCustom = chap.volumeTitle ? !existingVols.includes(chap.volumeTitle.trim()) : false;
    setShowNewVolumeInput(isCustom);
  };

  const handleOpenCreateNewChapter = (presetVolume = '') => {
    const nextNum = storyChapters.length + 1;
    const newChap: Chapter = {
      id: 'chap-' + Date.now(),
      storyId: workingStoryId,
      chapterNumber: nextNum,
      title: `Chương ${nextNum}`,
      volumeTitle: presetVolume,
      content: '',
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isLocked: false,
      unlockPrice: 1,
      isPasswordProtected: false,
      password: '',
      passwordHint: '',
    };
    handleOpenEditChapterItem(newChap);
  };

  const handleSaveChapterItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingChapterItem) return;

    if (!chapterTitleInput.trim()) {
      alert('Vui lòng nhập tiêu đề chương.');
      return;
    }

    if (isChapterPasswordProtectedInput && !chapterPasswordInput.trim()) {
      alert('Vui lòng nhập mật khẩu (Pass) cho chương hoặc bỏ chọn ô đặt mật khẩu.');
      return;
    }

    const updatedChap: Chapter = {
      ...editingChapterItem,
      storyId: workingStoryId,
      title: chapterTitleInput.trim(),
      volumeTitle: chapterVolumeTitleInput.trim() || undefined,
      content: chapterContentInput.trim(),
      isLocked: isChapterLockedInput,
      unlockPrice: isChapterLockedInput ? Math.max(1, chapterUnlockPriceInput) : undefined,
      isPasswordProtected: isChapterPasswordProtectedInput,
      password: isChapterPasswordProtectedInput ? chapterPasswordInput.trim() : undefined,
      passwordHint: isChapterPasswordProtectedInput ? (chapterPasswordHintInput.trim() || undefined) : undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (onSaveChapter) {
      onSaveChapter(updatedChap);
    }
    setEditingChapterItem(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên truyện!');
      return;
    }

    // Cập nhật theme đang active với các thông số editor hiện tại
    const finalThemes = storyThemes.map((t) => {
      if (t.id === activeThemeId) {
        return {
          ...t,
          coverUrl: coverUrl.trim(),
          synopsis: synopsis.trim(),
          themeTone,
          defaultFont: customBodyFont,
          customTitleFont,
          customChapterTitleFont,
          customSubtitleFont,
          customBodyFont,
          customMutedFont,
          customBtnFont,
          titleFontSize,
          bodyFontSize,
          customBgColor: themeTone === 'custom' ? customBgColor : undefined,
          customCardBgColor: themeTone === 'custom' ? customCardBgColor : undefined,
          customTextColor: themeTone === 'custom' ? customTextColor : undefined,
          customTextMutedColor: themeTone === 'custom' ? customTextMutedColor : undefined,
          customBorderColor: themeTone === 'custom' ? customBorderColor : undefined,
          customBtnBgColor: themeTone === 'custom' ? customBtnBgColor : undefined,
          customBtnSecondaryBgColor: themeTone === 'custom' ? customBtnSecondaryBgColor : undefined,
          borderStyle,
          borderWidth,
          borderRadius,
          borderCornerAccent,
          borderGlow,
          customBorderGradientColor2,
          customBorderGlowColor1,
          customBorderGlowColor2,
          readingEffect,
          readingEffectColor,
          chapterListStyle,
          storyElements: [...storyElements],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    onSave({
      id: workingStoryId,
      title: title.trim(),
      author: author.trim() || 'Tác giả',
      editorName: editorName.trim() || 'Cục Nâu',
      editorPhoto: editorPhoto.trim(),
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      synopsis: synopsis.trim(),
      tags: tags.length > 0 ? tags : undefined,

      // Đa dạng Theme bộ truyện
      storyThemes: finalThemes.length > 0 ? finalThemes : undefined,
      activeThemeId: activeThemeId || (finalThemes[0]?.id || undefined),

      // Widget thông tin nhân vật
      showCharacterWidget,
      characterWidgetTitle: characterWidgetTitle.trim() || 'Thông tin nhân vật',
      characterAvatarShape,
      characters: characters.length > 0 ? characters : undefined,

      // Widget tiến độ bộ truyện
      showProgressWidget,
      progressWidgetTitle: progressWidgetTitle.trim() || 'Tiến độ',
      totalPlannedChapters: totalPlannedChapters || 0,

      // Widget nội dung tùy chỉnh
      showCustomWidget,
      customWidgetTitle: customWidgetTitle.trim() || 'Thông báo',
      customWidgetContent: customWidgetContent.trim(),

      // Widget ảnh lẻ / album di chuyển (Đơn & Nhiều widgets)
      galleryWidgets: galleryWidgets.length > 0 ? galleryWidgets : undefined,
      showGalleryWidget,
      galleryWidgetTitle: galleryWidgetTitle.trim() || 'Album',
      galleryMode,
      gallerySingleImageUrl: gallerySingleImageUrl.trim(),
      gallerySingleImageCaption: gallerySingleImageCaption.trim(),
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      galleryAutoScrollSpeed,
      galleryImageSize,

      // Element / Sticker / Họa tiết trang trí tự do trên trang truyện
      storyElements: storyElements.length > 0 ? storyElements : undefined,

      // Kiểu trình bày danh sách chương
      chapterListStyle,

      // Tùy biến vị trí & bố cục các phân đoạn trang truyện
      storyLayoutSections,

      themeTone,
      defaultFont: customBodyFont,
      customTitleFont,
      customChapterTitleFont,
      customSubtitleFont,
      customBodyFont,
      customMutedFont,
      customBtnFont,
      titleFontSize,
      bodyFontSize,
      customBgColor: themeTone === 'custom' ? customBgColor : undefined,
      customCardBgColor: themeTone === 'custom' ? customCardBgColor : undefined,
      customTextColor: themeTone === 'custom' ? customTextColor : undefined,
      customTextMutedColor: themeTone === 'custom' ? customTextMutedColor : undefined,
      customBorderColor: themeTone === 'custom' ? customBorderColor : undefined,
      customBtnBgColor: themeTone === 'custom' ? customBtnBgColor : undefined,
      customBtnSecondaryBgColor: themeTone === 'custom' ? customBtnSecondaryBgColor : undefined,
      borderStyle,
      borderWidth,
      borderRadius,
      borderCornerAccent,
      borderGlow,
      customBorderGradientColor2,
      customBorderGlowColor1,
      customBorderGlowColor2,
      readingEffect,
      readingEffectColor,

      // Thông số theme & hiệu ứng chương riêng biệt
      useSeparateChapterTheme,
      useSeparateChapterEffect,
      chapterThemeTone,
      chapterCustomBgColor: chapterThemeTone === 'custom' ? chapterCustomBgColor : undefined,
      chapterCustomCardBgColor: chapterThemeTone === 'custom' ? chapterCustomCardBgColor : undefined,
      chapterCustomTextColor: chapterThemeTone === 'custom' ? chapterCustomTextColor : undefined,
      chapterCustomTextMutedColor: chapterThemeTone === 'custom' ? chapterCustomTextMutedColor : undefined,
      chapterCustomBorderColor: chapterThemeTone === 'custom' ? chapterCustomBorderColor : undefined,
      chapterCustomBtnBgColor: chapterThemeTone === 'custom' ? chapterCustomBtnBgColor : undefined,
      chapterCustomBtnSecondaryBgColor: chapterThemeTone === 'custom' ? chapterCustomBtnSecondaryBgColor : undefined,
      chapterBorderStyle,
      chapterBorderWidth,
      chapterBorderRadius,
      chapterBorderCornerAccent,
      chapterBorderGlow,
      chapterCustomBorderGradientColor2,
      chapterCustomBorderGlowColor1,
      chapterCustomBorderGlowColor2,
      chapterReadingEffect,
      chapterReadingEffectColor,
    });
  };

  const activeReadingEffectColor = isViewingChapterEffect ? chapterReadingEffectColor : readingEffectColor;

  const previewStoryObject: Story = {
    id: initialStory?.id || workingStoryId || 'preview-story-id',
    title: title || 'Chưa đặt tên truyện',
    author: author || 'Tác giả',
    synopsis: synopsis || '',
    coverUrl: coverUrl || '',
    authorEmail: initialStory?.authorEmail || currentUser?.email || '',
    authorUid: initialStory?.authorUid || currentUser?.uid || '',
    tags: tags || [],
    viewsCount: initialStory?.viewsCount || 0,
    createdAt: initialStory?.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    themeTone: themeTone || 'custom',
    customBgColor: currentBg,
    customCardBgColor: currentCardBg,
    customTextColor: currentText,
    customTextMutedColor: currentTextMuted,
    customBorderColor: currentBorder,
    customBtnBgColor: currentBtnBg,
    customBtnTextColor: currentBtnText,
    customBtnSecondaryBgColor: currentBtnSecondaryBg,
    customTitleFont,
    customSubtitleFont,
    customChapterTitleFont,
    customBodyFont,
    customMutedFont,
    customBtnFont,
    titleFontSize,
    bodyFontSize,
    borderCornerAccent: activeBCorner,
    borderWidth,
    borderRadius,
    borderGlow,
    borderStyle,
    readingEffect,
    readingEffectColor,
    showCharacterWidget,
    characterWidgetTitle,
    characterAvatarShape,
    characters,
    showProgressWidget,
    progressWidgetTitle,
    totalPlannedChapters,
    showCustomWidget,
    customWidgetTitle,
    customWidgetContent,
    showGalleryWidget,
    galleryWidgets,
    galleryWidgetTitle,
    galleryMode,
    gallerySingleImageUrl,
    gallerySingleImageCaption,
    galleryImages,
    galleryImageSize,
    galleryAutoScrollSpeed,
    chapterListStyle,
    storyLayoutSections,
    storyElements,
    editorPhoto,
    editorName,
  };

  const customPreviewStyles = {
    container: { background: currentBg, color: currentText },
    card: { background: currentCardBg, ...getStoryBorderStyle(currentBorderObj, currentBorder) },
    border: { borderColor: currentBorder },
    text: { color: currentText },
    textMuted: { color: currentTextMuted },
    buttonPrimary: {
      background: currentBtnBg,
      color: currentBtnText,
      ...getStoryButtonBorderStyle(currentBorderObj, currentBtnBorder),
    },
    buttonSecondary: {
      background: currentBtnSecondaryBg,
      color: currentText,
      ...getStoryButtonBorderStyle(currentBorderObj, currentBtnBorder),
    },
  };

  return (
    <div
      className="live-editor-root preserve-story-theme fixed inset-0 z-[100] overflow-y-auto w-full h-full min-h-screen transition-colors duration-200"
      style={{
        background: currentBg,
        color: currentText,
      }}
    >
      {/* Dynamic selection style based on active theme */}
      <style>{`
        .live-editor-root ::selection,
        .live-editor-root *::selection,
        .live-editor-root input::selection,
        .live-editor-root textarea::selection {
          background-color: ${currentBtnBg} !important;
          color: ${currentBtnText} !important;
        }
      `}</style>

      {/* Hiệu ứng đọc thời gian thực */}
      {activeReadingEffect !== 'none' && <ReadingEffects effect={activeReadingEffect} effectColor={activeReadingEffectColor} isDarkTheme={isDarkTheme} />}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={coverFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCompressAndSetImage(e.target.files[0], 'cover');
          }
        }}
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCompressAndSetImage(e.target.files[0], 'avatar');
          }
        }}
      />
      <input
        type="file"
        ref={gallerySingleFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCompressGallerySingle(e.target.files[0]);
          }
        }}
      />
      <input
        type="file"
        ref={galleryAlbumFileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleCompressGalleryAlbum(e.target.files);
          }
        }}
      />
      <input
        type="file"
        ref={elementFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCompressElementImg(e.target.files[0]);
          }
        }}
      />

      {/* STICKY TOP TOOLBAR */}
      <header
        className="sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md border-b flex items-center justify-between shadow-lg"
        style={{
          background: currentCardBg,
          borderColor: currentBorder,
          color: currentText,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded border hover:opacity-80 transition"
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hủy / Quay lại</span>
          </button>

          {/* Toggle Chế độ Soạn thảo vs Xem trước (1:1 Trang truyện thật & Đính Element) */}
          <div className="flex items-center p-0.5 rounded border" style={{ background: currentBg, borderColor: currentBorder }}>
            <button
              type="button"
              onClick={() => setEditorMainView('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded transition cursor-pointer ${
                editorMainView === 'edit'
                  ? 'shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={
                editorMainView === 'edit'
                  ? { background: currentBtnBg, color: currentBtnText }
                  : { color: currentText }
              }
              title="Chuyển sang chế độ chỉnh sửa nội dung, thông tin truyện và các widget"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Soạn thảo</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorMainView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded transition cursor-pointer ${
                editorMainView === 'preview'
                  ? 'shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={
                editorMainView === 'preview'
                  ? { background: currentBtnBg, color: currentBtnText }
                  : { color: currentText }
              }
              title="Chuyển sang chế độ xem trước 1:1 y hệt trang truyện thật và đính Element"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước</span>
              {storyElements.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-pink-500 text-white font-bold leading-none">
                  {storyElements.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Design Switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'multi-themes' ? null : 'multi-themes')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition cursor-pointer ${
              activeDrawerTab === 'multi-themes' ? 'ring-2 ring-amber-400 font-bold' : 'hover:opacity-90'
            }`}
            style={{
              background: activeDrawerTab === 'multi-themes' ? currentBtnBg : currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: activeDrawerTab === 'multi-themes' ? currentBtnText : currentText,
            }}
            title="Thêm và quản lý nhiều Theme thiết kế cho bộ truyện"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Đa Theme ({storyThemes.length})</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'theme' ? null : 'theme')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'theme' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Đổi màu sắc & Tông màu"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Màu sắc</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'fonts' ? null : 'fonts')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'fonts' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Đổi font chữ"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Font chữ</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'borders' ? null : 'borders')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'borders' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Đổi đường viền & Khung trang trí"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Khung viền</span>
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'effects' ? null : 'effects')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'effects' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Hiệu ứng rơi / mưa / sao / tuyết"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hiệu ứng</span>
          </button>

          <button
            onClick={() => {
              if (activeDrawerTab === 'elements') {
                setActiveDrawerTab(null);
              } else {
                setActiveDrawerTab('elements');
                setEditorMainView('preview');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'elements' ? 'ring-2 ring-pink-500' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Họa tiết, Sticker & Element trang trí tự do trên trang truyện"
          >
            <Sticker className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Element</span>
            {storyElements.length > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[9px] bg-pink-500 text-white font-bold leading-none">
                {storyElements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'layout' ? null : 'layout')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition ${
              activeDrawerTab === 'layout' ? 'ring-2 ring-white/50' : 'hover:opacity-90'
            }`}
            style={{
              background: currentBtnSecondaryBg,
              borderColor: currentBtnBorder,
              color: currentText,
            }}
            title="Tùy chỉnh bố cục & Kéo thả sắp xếp vị trí các phần"
          >
            <MoveVertical className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Bố cục</span>
          </button>

          {/* Primary Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded border shadow-md hover:opacity-90 active:scale-95 transition"
            style={{
              background: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            <Check className="w-4 h-4" />
            <span>Lưu truyện</span>
          </button>
        </div>
      </header>

      {/* FLOATING DESIGN DRAWER */}
      {activeDrawerTab && (
        <div
          className="fixed top-14 right-4 z-50 w-full max-w-sm sm:max-w-md p-4 rounded-lg shadow-2xl border backdrop-blur-xl max-h-[80vh] overflow-y-auto space-y-4 font-mono"
          style={{
            background: currentCardBg,
            borderColor: currentBorder,
            color: currentText,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: currentText }}>
              {activeDrawerTab === 'multi-themes' && <Layers className="w-4 h-4 text-amber-400" />}
              {activeDrawerTab === 'theme' && <Palette className="w-4 h-4" />}
              {activeDrawerTab === 'fonts' && <Type className="w-4 h-4" />}
              {activeDrawerTab === 'borders' && <Square className="w-4 h-4" />}
              {activeDrawerTab === 'effects' && <Sparkles className="w-4 h-4" />}
              {activeDrawerTab === 'elements' && <Sticker className="w-4 h-4" />}
              {activeDrawerTab === 'widgets' && <Users className="w-4 h-4" />}
              {activeDrawerTab === 'layout' && <MoveVertical className="w-4 h-4" />}
              <span>
                {activeDrawerTab === 'multi-themes' && 'Đa dạng Theme bộ truyện'}
                {activeDrawerTab === 'theme' && 'Cài đặt màu sắc & Tông nền'}
                {activeDrawerTab === 'fonts' && 'Cài đặt Font chữ'}
                {activeDrawerTab === 'borders' && 'Cài đặt Viền & Khung trang trí'}
                {activeDrawerTab === 'effects' && 'Cài đặt Hiệu ứng nền'}
                {activeDrawerTab === 'elements' && 'Cài đặt Element & Họa tiết trang trí'}
                {activeDrawerTab === 'widgets' && 'Cài đặt Widgets'}
                {activeDrawerTab === 'layout' && 'Tùy chỉnh bố cục & Vị trí các phần'}
              </span>
            </span>
            <button
              onClick={() => setActiveDrawerTab(null)}
              className="p-1 hover:opacity-70 transition rounded"
              style={{ color: currentText }}
              title="Đóng bảng thiết kế"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 0: MULTI-THEMES (Đa dạng Theme) */}
          {activeDrawerTab === 'multi-themes' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-2.5 rounded border bg-black/20 space-y-1.5" style={{ borderColor: currentBorder }}>
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Layers className="w-4 h-4" />
                  <span>Quản lý Đa dạng Theme bộ truyện</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-80" style={{ color: currentTextMuted }}>
                  Tạo nhiều giao diện khác nhau cho truyện. Mỗi Theme có thể có ảnh bìa riêng, lời tựa riêng, phối màu, font chữ, khung viền và hiệu ứng hạt riêng.
                </p>
              </div>

              {/* Nút Tạo Theme Mới */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold uppercase text-[10px]" style={{ color: currentText }}>
                  Danh sách Theme ({storyThemes.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleAddNewTheme()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold border transition shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Theme Mới</span>
                </button>
              </div>

              {/* Gợi ý khởi tạo nhanh theo Preset Tone */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <span className="text-[10px] opacity-75 font-mono block" style={{ color: currentTextMuted }}>
                  Tạo nhanh Theme mới theo tông màu mẫu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'choco-light', label: 'Choco Light' },
                    { key: 'sepia', label: 'Giấy Sepia' },
                    { key: 'dark-rose', label: 'Dark Rose' },
                    { key: 'gradient-rose', label: 'Hồng Đêm' },
                    { key: 'gradient-ocean', label: 'Đại Dương' },
                    { key: 'gradient-emerald', label: 'Ngọc Lục' },
                    { key: 'gradient-gold', label: 'Hoàng Gia' },
                    { key: 'classic-dark', label: 'Classic Dark' },
                  ].map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleAddNewTheme(preset.key)}
                      className="px-2 py-1 rounded text-[10px] font-medium border transition hover:opacity-90 flex items-center gap-1 cursor-pointer"
                      style={{
                        background: currentBtnSecondaryBg,
                        borderColor: currentBorder,
                        color: currentText,
                      }}
                    >
                      <Plus className="w-2.5 h-2.5 text-amber-400" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách các Theme đã tạo */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {storyThemes.map((theme) => {
                  const isActive = theme.id === activeThemeId;
                  const displayCover = theme.coverUrl || coverUrl;

                  return (
                    <div
                      key={theme.id}
                      className={`p-3 rounded-lg border transition space-y-2.5 relative ${
                        isActive ? 'ring-2 ring-amber-400 shadow-md' : 'hover:border-amber-500/50'
                      }`}
                      style={{
                        background: isActive ? currentBtnSecondaryBg : currentCardBg,
                        borderColor: isActive ? '#f59e0b' : currentBorder,
                      }}
                    >
                      {/* Header theme */}
                      <div className="flex items-start gap-2.5 justify-between">
                        <div className="flex items-center gap-2.5">
                          {displayCover ? (
                            <img
                              src={displayCover}
                              alt={theme.name}
                              className="w-10 h-14 object-cover rounded border border-white/20 shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-black/30 rounded border border-white/10 shrink-0 flex items-center justify-center text-[9px] text-center p-1">
                              Bìa mẫu
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs" style={{ color: currentText }}>
                                {theme.name}
                              </span>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black flex items-center gap-1 shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Theme Chính</span>
                                </span>
                              )}
                            </div>
                            {theme.description && (
                              <p className="text-[10px] opacity-75 line-clamp-1" style={{ color: currentTextMuted }}>
                                {theme.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-[9px] font-mono opacity-70" style={{ color: currentTextMuted }}>
                              <span>Tông: {theme.themeTone || 'Mặc định'}</span>
                              {theme.readingEffect && theme.readingEffect !== 'none' && (
                                <span>• Hiệu ứng: {theme.readingEffect}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenThemeModal(theme)}
                            className="p-1 rounded hover:bg-black/20 transition cursor-pointer"
                            style={{ color: currentText }}
                            title="Chỉnh sửa Tên, Bìa riêng & Lời tựa riêng của Theme"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateTheme(theme)}
                            className="p-1 rounded hover:bg-black/20 transition cursor-pointer"
                            style={{ color: currentText }}
                            title="Sao chép Theme này"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTheme(theme.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                            title="Xóa Theme này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Các thao tác chính cho theme */}
                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => setActiveThemeId(theme.id)}
                            className="w-full py-1.5 px-2 rounded text-[10px] font-bold border transition flex items-center justify-center gap-1 bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Đặt làm Theme Chính</span>
                          </button>
                        ) : (
                          <div className="w-full py-1.5 px-2 rounded text-[10px] font-bold text-center bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            ✓ Đang là Theme Chính
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleLoadThemeIntoEditor(theme)}
                          className="w-full py-1.5 px-2 rounded text-[10px] font-bold border transition flex items-center justify-center gap-1 hover:opacity-90 cursor-pointer"
                          style={{
                            background: currentBtnBg,
                            borderColor: currentBtnBorder,
                            color: currentBtnText,
                          }}
                          title="Tải màu sắc, font chữ & cấu hình Theme này vào Editor để xem trước và chỉnh sửa"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem / Sửa trên Editor</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleApplyCurrentEditorToTheme(theme.id)}
                          className="w-full py-1 px-2 rounded text-[9px] font-mono border text-center transition opacity-80 hover:opacity-100 border-dashed cursor-pointer"
                          style={{ borderColor: currentBorder, color: currentTextMuted }}
                        >
                          💾 Ghi đè thiết kế Editor hiện tại vào Theme này
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1: THEME / COLORS */}
          {activeDrawerTab === 'theme' && (
            <div className="space-y-3 text-xs">
              {/* Nút bật/tắt tách theme */}
              <div className="p-2.5 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder }}>
                <div className="pr-2">
                  <span className="font-bold block text-[11px]" style={{ color: currentText }}>Tách biệt theme truyện & chương</span>
                  <span className="text-[10px] leading-tight block" style={{ color: currentTextMuted }}>Cho phép thiết kế giao diện chương đọc khác với trang giới thiệu.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSeparateChapterTheme(!useSeparateChapterTheme)}
                  className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: useSeparateChapterTheme ? currentBtnBg : 'rgb(75, 85, 99)'
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      useSeparateChapterTheme ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {useSeparateChapterTheme && (
                <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  {editingChapterItem === null ? (
                    <span className="text-amber-500">Thiết lập: Giao diện trang truyện</span>
                  ) : (
                    <span className="text-emerald-500">Thiết lập: Giao diện đọc chương</span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Chọn bộ màu có sẵn:
                </label>
                <select
                  value={activeThemeTone}
                  onChange={(e) => handleSetThemeTone(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none font-semibold"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  <optgroup label="Đơn sắc & Trầm ấm" style={{ background: currentCardBg, color: currentText }}>
                    <option value="dark-rose" style={{ background: currentCardBg, color: currentText }}>Dark Rose (Hồng Đen)</option>
                    <option value="choco-light" style={{ background: currentCardBg, color: currentText }}>Choco Light (Sô-cô-la Sữa)</option>
                    <option value="classic-black" style={{ background: currentCardBg, color: currentText }}>Classic Black (Đen Tuyến)</option>
                    <option value="classic-white" style={{ background: currentCardBg, color: currentText }}>Classic White (Trắng Tinh Khôi)</option>
                    <option value="dark-violet" style={{ background: currentCardBg, color: currentText }}>Dark Violet (Tím Đêm)</option>
                    <option value="navy-blue" style={{ background: currentCardBg, color: currentText }}>Navy Blue (Xanh Đêm)</option>
                    <option value="forest-dark" style={{ background: currentCardBg, color: currentText }}>Forest Dark (Rừng Đêm)</option>
                    <option value="warm-coffee" style={{ background: currentCardBg, color: currentText }}>Warm Coffee (Cà Phê Ấm)</option>
                    <option value="sepia" style={{ background: currentCardBg, color: currentText }}>Sepia (Giấy Cổ Điển)</option>
                    <option value="emerald" style={{ background: currentCardBg, color: currentText }}>Emerald (Xanh Ngọc Lục)</option>
                    <option value="slate" style={{ background: currentCardBg, color: currentText }}>Slate (Xanh Đá Xám)</option>
                    <option value="cyberpunk" style={{ background: currentCardBg, color: currentText }}>Cyberpunk (Neon Tím)</option>
                  </optgroup>
                  <optgroup label="Gradient (Chuyển sắc)" style={{ background: currentCardBg, color: currentText }}>
                    <option value="gradient-choco-light" style={{ background: currentCardBg, color: currentText }}>Gradient Choco Light (Kem Ca Cao Sáng)</option>
                    <option value="gradient-rose" style={{ background: currentCardBg, color: currentText }}>Gradient Rose (Hồng Đen)</option>
                    <option value="gradient-midnight" style={{ background: currentCardBg, color: currentText }}>Gradient Midnight (Đêm Tím)</option>
                    <option value="gradient-ocean" style={{ background: currentCardBg, color: currentText }}>Gradient Ocean (Đại Dương)</option>
                    <option value="gradient-emerald" style={{ background: currentCardBg, color: currentText }}>Gradient Emerald (Ngọc Lục Bảo)</option>
                    <option value="gradient-sunset" style={{ background: currentCardBg, color: currentText }}>Gradient Sunset (Hoàng Hôn)</option>
                    <option value="gradient-cyber" style={{ background: currentCardBg, color: currentText }}>Gradient Cyber (Viễn Tưởng)</option>
                    <option value="gradient-gold" style={{ background: currentCardBg, color: currentText }}>Gradient Gold (Hoàng Gia Vàng)</option>
                    <option value="gradient-cherry" style={{ background: currentCardBg, color: currentText }}>Gradient Cherry (Hoa Đào)</option>
                  </optgroup>
                  <optgroup label="Tùy biến tự do" style={{ background: currentCardBg, color: currentText }}>
                    <option value="custom" style={{ background: currentCardBg, color: currentText }}>Tùy biến bảng màu chi tiết (Custom)</option>
                  </optgroup>
                </select>
              </div>

              {/* Chi tiết từng mã màu khi chọn Custom */}
              {isCustomTheme && (
                <div className="p-3 rounded border space-y-2.5" style={{ background: currentBg, borderColor: currentBorder }}>
                  <div className="text-[11px] font-bold pb-1 border-b flex items-center justify-between" style={{ borderColor: currentBorder, color: currentText }}>
                    <span>Bảng mã màu tùy biến:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <LocalColorField
                      label="Màu nền chính"
                      value={activeBgColorVal}
                      onChange={handleSetBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu thẻ nội dung"
                      value={activeCardBgColorVal}
                      onChange={handleSetCardBgColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu nút chính"
                      value={activeBtnBgColorVal}
                      onChange={handleSetBtnBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu nút phụ & Ô chứa"
                      value={activeBtnSecondaryBgColorVal}
                      onChange={handleSetBtnSecondaryBgColor}
                      allowGradient
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu chữ chính"
                      value={activeTextColorVal}
                      onChange={handleSetTextColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu chữ phụ / mờ"
                      value={activeTextMutedColorVal}
                      onChange={handleSetTextMutedColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />

                    <LocalColorField
                      label="Màu đường viền"
                      value={activeBorderColorVal}
                      onChange={handleSetBorderColor}
                      currentBg={currentBg}
                      currentBorder={currentBorder}
                      currentText={currentText}
                      currentCardBg={currentCardBg}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FONTS */}
          {activeDrawerTab === 'fonts' && (
            <div className="space-y-4 text-xs">
              {/* Custom Upload Font Box */}
              <div className="p-3 rounded-lg border space-y-2.5" style={{ background: currentCardBg, borderColor: currentBorder }}>
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: currentText }}>
                  Tải Font cá nhân (.ttf, .otf, .woff, .woff2):
                </span>
                <p className="text-[9px] leading-tight" style={{ color: currentTextMuted }}>
                  * Font chữ được lưu trữ trong trình duyệt của bạn (chỉ thiết bị này mới sử dụng được và không lưu chung). Dung lượng giới hạn dưới 1.5MB.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    multiple
                    onChange={handleUploadFontFile}
                    className="hidden"
                    id="user-custom-font-upload"
                  />
                  <label
                    htmlFor="user-custom-font-upload"
                    className="w-full py-1.5 px-3 bg-opacity-10 rounded border text-center font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-opacity-20 transition flex items-center justify-center gap-1.5 shadow-sm"
                    style={{
                      background: currentBtnBg,
                      borderColor: currentBtnBorder,
                      color: currentBtnText,
                    }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn File Font từ máy</span>
                  </label>
                  
                  {/* List of uploaded custom fonts with delete option */}
                  {userUploadedFonts.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                      <span className="block text-[9px] font-bold" style={{ color: currentTextMuted }}>
                        Font đã tải lên:
                      </span>
                      <div className="space-y-1 max-h-[100px] overflow-y-auto">
                        {userUploadedFonts.map((font) => (
                          <div key={font.value} className="flex items-center justify-between gap-1.5 p-1 rounded bg-black/10 border" style={{ borderColor: currentBorder }}>
                            <span className="text-[10px] truncate font-semibold" style={{ color: currentText, fontFamily: font.value }}>
                              {font.label.replace(' (Tùy biến)', '')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteUploadedFont(font.value)}
                              className="text-red-400 hover:text-red-300 p-0.5"
                              title="Xóa font"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font tiêu đề truyện:
                </label>
                <select
                  value={customTitleFont}
                  onChange={(e) => setCustomTitleFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

               <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font tiêu đề phụ/Tiêu đề widget:
                </label>
                <select
                  value={customSubtitleFont}
                  onChange={(e) => setCustomSubtitleFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font tiêu đề chương:
                </label>
                <select
                  value={customChapterTitleFont}
                  onChange={(e) => setCustomChapterTitleFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font thân bài & giới thiệu:
                </label>
                <select
                  value={customBodyFont}
                  onChange={(e) => setCustomBodyFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font nút bấm:
                </label>
                <select
                  value={customBtnFont}
                  onChange={(e) => setCustomBtnFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                  Font thông tin phụ / tác giả:
                </label>
                <select
                  value={customMutedFont}
                  onChange={(e) => setCustomMutedFont(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                >
                  {ALL_FONTS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: currentCardBg, color: currentText }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-dashed space-y-3" style={{ borderColor: currentBorder }}>
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                    Cỡ chữ tiêu đề (Trang truyện):
                  </label>
                  <select
                    value={titleFontSize}
                    onChange={(e) => setTitleFontSize(e.target.value)}
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  >
                    <option value="18px" style={{ background: currentCardBg, color: currentText }}>Nhỏ (18px)</option>
                    <option value="20px" style={{ background: currentCardBg, color: currentText }}>Vừa (20px)</option>
                    <option value="24px" style={{ background: currentCardBg, color: currentText }}>Mặc định (24px)</option>
                    <option value="28px" style={{ background: currentCardBg, color: currentText }}>Lớn (28px)</option>
                    <option value="32px" style={{ background: currentCardBg, color: currentText }}>Rất lớn (32px)</option>
                    <option value="36px" style={{ background: currentCardBg, color: currentText }}>Cực lớn (36px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                    Cỡ chữ tóm tắt & danh sách chương:
                  </label>
                  <select
                    value={bodyFontSize}
                    onChange={(e) => setBodyFontSize(e.target.value)}
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  >
                    <option value="12px" style={{ background: currentCardBg, color: currentText }}>Nhỏ (12px)</option>
                    <option value="13px" style={{ background: currentCardBg, color: currentText }}>Hơi nhỏ (13px)</option>
                    <option value="14px" style={{ background: currentCardBg, color: currentText }}>Mặc định (14px)</option>
                    <option value="15px" style={{ background: currentCardBg, color: currentText }}>Vừa (15px)</option>
                    <option value="16px" style={{ background: currentCardBg, color: currentText }}>Chuẩn (16px)</option>
                    <option value="18px" style={{ background: currentCardBg, color: currentText }}>Lớn (18px)</option>
                    <option value="20px" style={{ background: currentCardBg, color: currentText }}>Rất lớn (20px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BORDERS & FRAMES */}
          {activeDrawerTab === 'borders' && (
            <div className="space-y-4 text-xs">
              {useSeparateChapterTheme && (
                <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  {editingChapterItem === null ? (
                    <span className="text-amber-500">Thiết lập viền: Giao diện trang truyện</span>
                  ) : (
                    <span className="text-emerald-500">Thiết lập viền: Giao diện đọc chương</span>
                  )}
                </div>
              )}

              {/* 1. Kiểu nét viền */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    1. Kiểu nét viền:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {BORDER_STYLE_OPTIONS.find(o => o.value === activeBStyle)?.label || activeBStyle}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {BORDER_STYLE_OPTIONS.map((opt) => {
                    const isSelected = activeBStyle === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSetBorderStyle(opt.value)}
                        className={`p-2 rounded text-left transition relative border ${
                          isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isSelected ? currentBtnBg : currentCardBg,
                          borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                          color: isSelected ? currentBtnText : currentText,
                        }}
                      >
                        <div className="text-[11px] font-bold truncate">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Tùy chỉnh 2 màu cho dải chuyển sắc (Gradient) */}
                {activeBStyle === 'gradient' && (
                  <div className="p-3 rounded border mt-2 space-y-2.5" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                    <div className="text-[11px] font-bold flex items-center justify-between" style={{ color: currentText }}>
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Tùy chỉnh 2 màu dải chuyển sắc (Gradient):</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Màu 1 */}
                      <div className="p-2 rounded bg-black/30 border border-white/10 space-y-1">
                        <span className="text-[10px] font-medium block" style={{ color: currentTextMuted }}>Màu 1 (Màu bắt đầu):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={currentBorder}
                            onChange={(e) => handleSetBorderColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent shrink-0"
                          />
                          <span className="font-mono text-[10px] uppercase opacity-90 truncate" style={{ color: currentText }}>{currentBorder}</span>
                        </div>
                      </div>

                      {/* Màu 2 */}
                      <div className="p-2 rounded bg-black/30 border border-white/10 space-y-1">
                        <span className="text-[10px] font-medium block" style={{ color: currentTextMuted }}>Màu 2 (Màu kết thúc):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={activeBorderGradientColor2Val}
                            onChange={(e) => handleSetBorderGradientColor2(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-white/20 p-0 bg-transparent shrink-0"
                          />
                          <span className="font-mono text-[10px] uppercase opacity-90 truncate" style={{ color: currentText }}>{activeBorderGradientColor2Val}</span>
                        </div>
                      </div>
                    </div>

                    {/* Phối màu Gradient mẫu */}
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] opacity-75 block font-mono" style={{ color: currentTextMuted }}>Phối màu gradient gợi ý:</span>
                      <div className="flex flex-wrap gap-1.5">
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
                              handleSetBorderColor(p.c1);
                              handleSetBorderGradientColor2(p.c2);
                            }}
                            className="px-2 py-1 rounded text-[10px] font-medium border border-white/20 transition hover:scale-105 flex items-center gap-1 text-white shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                          >
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Độ dày nét viền */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    2. Độ dày nét viền:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {BORDER_WIDTH_OPTIONS.find(o => o.value === activeBWidth)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {BORDER_WIDTH_OPTIONS.map((opt) => {
                    const isSelected = activeBWidth === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSetBorderWidth(opt.value)}
                        className={`py-2 px-1.5 rounded text-center transition border ${
                          isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isSelected ? currentBtnBg : currentCardBg,
                          borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                          color: isSelected ? currentBtnText : currentText,
                        }}
                      >
                        <div className="text-[10px] font-bold">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Kiểu bo góc & Hình dáng */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    3. Kiểu bo góc:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {activeBStyle === 'sketch' ? 'Vuông vức (Mặc định Nét vẽ tay)' : BORDER_RADIUS_OPTIONS.find(o => o.value === activeBRadius)?.label}
                  </span>
                </div>
                {activeBStyle === 'sketch' ? (
                  <div className="p-2 text-[11px] rounded border text-amber-500/90 font-medium bg-amber-500/10 border-amber-500/20 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Khi chọn Nét vẽ tay, góc viền sẽ mặc định vuông vức và không thể chọn bo góc.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {BORDER_RADIUS_OPTIONS.map((opt) => {
                      const isSelected = activeBRadius === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSetBorderRadius(opt.value)}
                          className={`p-2 rounded text-left transition border ${
                            isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                          }`}
                          style={{
                            background: isSelected ? currentBtnBg : currentCardBg,
                            borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          <div className="text-[10px] font-bold truncate">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Họa tiết 4 góc nghệ thuật */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    4. Họa tiết 4 góc nghệ thuật:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {activeBStyle === 'sketch' ? 'Không có (Mặc định Nét vẽ tay)' : BORDER_CORNER_ACCENT_OPTIONS.find(o => o.value === activeBCorner)?.label}
                  </span>
                </div>
                {activeBStyle === 'sketch' ? (
                  <div className="p-2 text-[11px] rounded border text-amber-500/90 font-medium bg-amber-500/10 border-amber-500/20 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Khi chọn Nét vẽ tay, mặc định không có họa tiết góc và không thể chọn họa tiết.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {BORDER_CORNER_ACCENT_OPTIONS.map((opt) => {
                      const isSelected = activeBCorner === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSetBorderCornerAccent(opt.value)}
                          className={`p-2 rounded text-left transition border ${
                            isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                          }`}
                          style={{
                            background: isSelected ? currentBtnBg : currentCardBg,
                            borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          <div className="text-[10px] font-bold truncate">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Hiệu ứng viền & Đổ bóng */}
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold" style={{ color: currentText }}>
                    5. Hiệu ứng phát sáng & Đổ bóng:
                  </label>
                  <span className="text-[10px] opacity-75 font-mono" style={{ color: currentTextMuted }}>
                    {BORDER_GLOW_OPTIONS.find(o => o.value === activeBGlow)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {BORDER_GLOW_OPTIONS.map((opt) => {
                    const isSelected = activeBGlow === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSetBorderGlow(opt.value)}
                        className={`p-2 rounded text-left transition border ${
                          isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isSelected ? currentBtnBg : currentCardBg,
                          borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                          color: isSelected ? currentBtnText : currentText,
                        }}
                      >
                        <div className="text-[10px] font-bold truncate">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Tùy chỉnh màu hào quang khi chọn Hào quang chuyển sắc */}
                {activeBGlow === 'gradient-aura' && (
                  <div className="p-2.5 rounded border mt-2 space-y-2" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                    <div className="text-[11px] font-bold" style={{ color: currentText }}>Tùy chọn màu hào quang:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-1.5 rounded bg-black/20">
                        <span className="text-[10px]" style={{ color: currentTextMuted }}>Màu 1:</span>
                        <input
                          type="color"
                          value={activeBorderGlowColor1Val}
                          onChange={(e) => handleSetBorderGlowColor1(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                        />
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-black/20">
                        <span className="text-[10px]" style={{ color: currentTextMuted }}>Màu 2:</span>
                        <input
                          type="color"
                          value={activeBorderGlowColor2Val}
                          onChange={(e) => handleSetBorderGlowColor2(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: READING EFFECTS */}
          {activeDrawerTab === 'effects' && (
            <div className="space-y-3.5 text-xs">
              {/* Nút bật/tắt tách hiệu ứng */}
              <div className="p-2.5 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder }}>
                <div className="pr-2">
                  <span className="font-bold block text-[11px]" style={{ color: currentText }}>Tách biệt hiệu ứng truyện & chương</span>
                  <span className="text-[10px] leading-tight block" style={{ color: currentTextMuted }}>
                    Cho phép chọn hiệu ứng rơi riêng biệt cho trang giới thiệu truyện và trang đọc chương.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSeparateChapterEffect(!useSeparateChapterEffect)}
                  className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: isSeparatedEffect ? currentBtnBg : 'rgb(75, 85, 99)'
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      isSeparatedEffect ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Khi bật tách hiệu ứng: Hiển thị cả 2 bộ chọn */}
              {isSeparatedEffect ? (
                <div className="space-y-3">
                  {/* Thông tin mục tiêu cấu hình */}
                  <div className="p-2 rounded text-[10px] font-mono border text-center font-bold" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                    {editingChapterItem === null ? (
                      <span className="text-amber-500">Đang hiển thị hiệu ứng: Trang truyện</span>
                    ) : (
                      <span className="text-emerald-500">Đang hiển thị hiệu ứng: Đọc chương</span>
                    )}
                  </div>

                  {/* 1. Hiệu ứng Trang giới thiệu truyện */}
                  <div className={`p-2.5 rounded border space-y-1.5 transition-all ${
                    editingChapterItem === null ? 'ring-1 ring-amber-500/50' : 'opacity-80'
                  }`} style={{ background: currentBg, borderColor: currentBorder }}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-amber-500">
                        Hiệu ứng Trang giới thiệu truyện:
                      </label>
                      {editingChapterItem !== null && (
                        <button
                          type="button"
                          onClick={() => setEditingChapterItem(null)}
                          className="text-[10px] text-amber-400 underline hover:opacity-80 font-mono cursor-pointer"
                        >
                          Trở về trang truyện
                        </button>
                      )}
                    </div>
                    <select
                      value={readingEffect}
                      onChange={(e) => setReadingEffect(e.target.value as any)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    >
                      <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                      <option value="sci_fi_hud" style={{ background: currentCardBg, color: currentText }}>Sci-Fi</option>
                      <option value="rain" style={{ background: currentCardBg, color: currentText }}>Mưa rơi</option>
                      <option value="snow" style={{ background: currentCardBg, color: currentText }}>Tuyết rơi</option>
                      <option value="star" style={{ background: currentCardBg, color: currentText }}>Bụi sao</option>
                      <option value="leaf" style={{ background: currentCardBg, color: currentText }}>Lá phong rơi</option>
                      <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>Lá bạch quả rơi</option>
                      <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>Cánh hoa đào rơi</option>
                      <option value="firefly" style={{ background: currentCardBg, color: currentText }}>Đom đóm</option>
                      <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>Bong bóng xà phòng</option>
                      <option value="fruits" style={{ background: currentCardBg, color: currentText }}>Trái cây rơi</option>
                      <option value="ocean" style={{ background: currentCardBg, color: currentText }}>Đại dương</option>
                      <option value="butterflies" style={{ background: currentCardBg, color: currentText }}>Bướm bay</option>
                      <option value="feathers" style={{ background: currentCardBg, color: currentText }}>Lông vũ rơi</option>
                      <option value="lightning" style={{ background: currentCardBg, color: currentText }}>Sấm sét</option>
                      <option value="fog" style={{ background: currentCardBg, color: currentText }}>Sương mù</option>
                      <option value="fireworks" style={{ background: currentCardBg, color: currentText }}>Pháo hoa</option>
                      <option value="fire_sparks" style={{ background: currentCardBg, color: currentText }}>Tàn lửa bay</option>
                      <option value="glitch" style={{ background: currentCardBg, color: currentText }}>Nhiễu sóng</option>
                    </select>

                    {/* Color picker cho hiệu ứng trang truyện */}
                    {readingEffect !== 'none' && (
                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: currentBorder }}>
                        <label className="block text-[10px] font-semibold" style={{ color: currentText }}>
                          Màu hiệu ứng trang truyện:
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="color"
                            value={readingEffectColor}
                            onChange={(e) => setReadingEffectColor(e.target.value)}
                            className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                            style={{ borderColor: currentBorder }}
                          />
                          <input
                            type="text"
                            value={readingEffectColor}
                            onChange={(e) => setReadingEffectColor(e.target.value)}
                            className="w-20 p-1 rounded border text-[11px] font-mono focus:outline-none"
                            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Hiệu ứng Trang đọc chương */}
                  <div className={`p-2.5 rounded border space-y-1.5 transition-all ${
                    editingChapterItem !== null ? 'ring-1 ring-emerald-500/50' : 'opacity-80'
                  }`} style={{ background: currentBg, borderColor: currentBorder }}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-emerald-500">
                        Hiệu ứng Trang đọc chương:
                      </label>
                    </div>
                    <select
                      value={chapterReadingEffect}
                      onChange={(e) => setChapterReadingEffect(e.target.value as any)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    >
                      <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                      <option value="sci_fi_hud" style={{ background: currentCardBg, color: currentText }}>Sci-Fi</option>
                      <option value="rain" style={{ background: currentCardBg, color: currentText }}>Mưa rơi</option>
                      <option value="snow" style={{ background: currentCardBg, color: currentText }}>Tuyết rơi</option>
                      <option value="star" style={{ background: currentCardBg, color: currentText }}>Bụi sao</option>
                      <option value="leaf" style={{ background: currentCardBg, color: currentText }}>Lá phong rơi</option>
                      <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>Lá bạch quả rơi</option>
                      <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>Cánh hoa đào rơi</option>
                      <option value="firefly" style={{ background: currentCardBg, color: currentText }}>Đom đóm</option>
                      <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>Bong bóng xà phòng</option>
                      <option value="fruits" style={{ background: currentCardBg, color: currentText }}>Trái cây rơi</option>
                      <option value="ocean" style={{ background: currentCardBg, color: currentText }}>Đại dương</option>
                      <option value="butterflies" style={{ background: currentCardBg, color: currentText }}>Bướm bay</option>
                      <option value="feathers" style={{ background: currentCardBg, color: currentText }}>Lông vũ rơi</option>
                      <option value="lightning" style={{ background: currentCardBg, color: currentText }}>Sấm sét</option>
                      <option value="fog" style={{ background: currentCardBg, color: currentText }}>Sương mù</option>
                      <option value="fireworks" style={{ background: currentCardBg, color: currentText }}>Pháo hoa</option>
                      <option value="fire_sparks" style={{ background: currentCardBg, color: currentText }}>Tàn lửa bay</option>
                      <option value="glitch" style={{ background: currentCardBg, color: currentText }}>Nhiễu sóng</option>
                    </select>

                    {/* Color picker cho hiệu ứng chương */}
                    {chapterReadingEffect !== 'none' && (
                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: currentBorder }}>
                        <label className="block text-[10px] font-semibold" style={{ color: currentText }}>
                          Màu hiệu ứng trang đọc chương:
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="color"
                            value={chapterReadingEffectColor}
                            onChange={(e) => setChapterReadingEffectColor(e.target.value)}
                            className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                            style={{ borderColor: currentBorder }}
                          />
                          <input
                            type="text"
                            value={chapterReadingEffectColor}
                            onChange={(e) => setChapterReadingEffectColor(e.target.value)}
                            className="w-20 p-1 rounded border text-[11px] font-mono focus:outline-none"
                            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Dùng chung hiệu ứng */
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: currentText }}>
                    Hiệu ứng đọc chung (Áp dụng cho cả trang truyện & chương):
                  </label>
                  <select
                    value={readingEffect}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setReadingEffect(val);
                      setChapterReadingEffect(val);
                    }}
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  >
                    <option value="none" style={{ background: currentCardBg, color: currentText }}>Không hiệu ứng (Tắt)</option>
                    <option value="sci_fi_hud" style={{ background: currentCardBg, color: currentText }}>Sci-Fi</option>
                    <option value="rain" style={{ background: currentCardBg, color: currentText }}>Mưa rơi</option>
                    <option value="snow" style={{ background: currentCardBg, color: currentText }}>Tuyết rơi</option>
                    <option value="star" style={{ background: currentCardBg, color: currentText }}>Bụi sao</option>
                    <option value="leaf" style={{ background: currentCardBg, color: currentText }}>Lá phong rơi</option>
                    <option value="ginkgo" style={{ background: currentCardBg, color: currentText }}>Lá bạch quả rơi</option>
                    <option value="cherry_blossom" style={{ background: currentCardBg, color: currentText }}>Cánh hoa đào rơi</option>
                    <option value="firefly" style={{ background: currentCardBg, color: currentText }}>Đom đóm</option>
                    <option value="soap_bubble" style={{ background: currentCardBg, color: currentText }}>Bong bóng xà phòng</option>
                    <option value="fruits" style={{ background: currentCardBg, color: currentText }}>Trái cây rơi</option>
                    <option value="ocean" style={{ background: currentCardBg, color: currentText }}>Đại dương</option>
                    <option value="butterflies" style={{ background: currentCardBg, color: currentText }}>Bướm bay</option>
                    <option value="feathers" style={{ background: currentCardBg, color: currentText }}>Lông vũ rơi</option>
                    <option value="lightning" style={{ background: currentCardBg, color: currentText }}>Sấm sét</option>
                    <option value="fog" style={{ background: currentCardBg, color: currentText }}>Sương mù</option>
                    <option value="fireworks" style={{ background: currentCardBg, color: currentText }}>Pháo hoa</option>
                    <option value="fire_sparks" style={{ background: currentCardBg, color: currentText }}>Tàn lửa bay</option>
                    <option value="glitch" style={{ background: currentCardBg, color: currentText }}>Nhiễu sóng</option>
                  </select>

                  {/* Color picker cho hiệu ứng dùng chung */}
                  {readingEffect !== 'none' && (
                    <div className="mt-2.5 p-2 rounded border space-y-1.5" style={{ background: currentCardBg, borderColor: currentBorder }}>
                      <label className="block text-[10px] font-semibold" style={{ color: currentText }}>
                        Màu hiệu ứng:
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="color"
                          value={readingEffectColor}
                          onChange={(e) => {
                            setReadingEffectColor(e.target.value);
                            setChapterReadingEffectColor(e.target.value);
                          }}
                          className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                          style={{ borderColor: currentBorder }}
                        />
                        <input
                          type="text"
                          value={readingEffectColor}
                          onChange={(e) => {
                            setReadingEffectColor(e.target.value);
                            setChapterReadingEffectColor(e.target.value);
                          }}
                          className="w-20 p-1 rounded border text-[11px] font-mono focus:outline-none"
                          style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] leading-relaxed" style={{ color: currentTextMuted }}>
                Hiệu ứng rơi sẽ tự động kích hoạt ngay trên nền trang đọc và trang chi tiết của bộ truyện theo từng cài đặt riêng.
              </p>
            </div>
          )}

          {/* TAB: ELEMENT & HỌA TIẾT TRANG TRÍ TỰ DO TRÊN TRANG TRUYỆN */}
          {activeDrawerTab === 'elements' && (
            <div className="space-y-4 text-xs font-mono">
              {/* Giới thiệu & Hướng dẫn */}
              <div className="p-2.5 rounded border space-y-1.5" style={{ background: currentBg, borderColor: currentBorder }}>
                <span className="text-[11px] font-bold uppercase tracking-wider block flex items-center gap-1.5" style={{ color: currentText }}>
                  <Sticker className="w-3.5 h-3.5 text-pink-400" />
                  Element & Họa tiết trang trí tự do
                </span>
                <p className="text-[10px] leading-relaxed opacity-85" style={{ color: currentTextMuted }}>
                  Đính các sticker, hình ảnh PNG trong suốt, GIF hoạt ảnh hoặc họa tiết lên trang truyện. Bạn có thể <strong className="text-pink-400">kéo thả vị trí</strong>, <strong className="text-pink-400">co giãn to nhỏ</strong>, <strong className="text-pink-400">xoay góc</strong> và chọn hiệu ứng chuyển động lặp lại sống động.
                </p>
              </div>

              {/* Action Buttons: Tải ảnh/GIF từ máy hoặc Nhập URL */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => elementFileInputRef.current?.click()}
                  disabled={isCompressingElementImg}
                  className="w-full py-2 px-3 rounded border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition shadow-sm"
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isCompressingElementImg ? 'Đang xử lý ảnh...' : 'Tải Element từ máy (PNG, GIF, WebP)'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Hoặc dán URL ảnh / GIF element..."
                    value={elementUrlInput}
                    onChange={(e) => setElementUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddElementFromUrl(elementUrlInput);
                      }
                    }}
                    className="flex-1 p-2 rounded border text-xs focus:outline-none"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddElementFromUrl(elementUrlInput)}
                    disabled={!elementUrlInput.trim()}
                    className="px-3 py-2 rounded border text-xs font-bold shrink-0 disabled:opacity-50 hover:opacity-80 transition"
                    style={{
                      background: currentBtnSecondaryBg,
                      borderColor: currentBtnBorder,
                      color: currentText,
                    }}
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Danh sách Element đang có trên trang */}
              <div className="space-y-2 pt-1 border-t" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: currentText }}>
                    Element trên trang ({storyElements.length})
                  </span>
                  {storyElements.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ element trên trang?')) {
                          setStoryElements([]);
                          setSelectedStoryElementId(null);
                        }
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 transition flex items-center gap-1 underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {storyElements.length === 0 ? (
                  <div className="p-3 text-center border border-dashed rounded text-[11px]" style={{ borderColor: currentBorder, color: currentTextMuted }}>
                    Chưa có element nào. Hãy tải lên hoặc chọn từ kho mẫu bên dưới để trang trí!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {storyElements.map((el, idx) => {
                      const isSelected = selectedStoryElementId === el.id;
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedStoryElementId(el.id)}
                          className={`p-2 rounded border flex items-center justify-between gap-2 cursor-pointer transition ${
                            isSelected ? 'ring-2 ring-pink-500' : 'hover:opacity-90'
                          }`}
                          style={{ background: isSelected ? currentBtnSecondaryBg : currentBg, borderColor: currentBorder }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded border bg-black/20 shrink-0 overflow-hidden flex items-center justify-center p-0.5" style={{ borderColor: currentBorder }}>
                              <img src={el.imageUrl} alt="" className="w-full h-full object-contain pointer-events-none" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block truncate" style={{ color: currentText }}>
                                {el.name || `Element #${idx + 1}`}
                              </span>
                              <span className="text-[9px] block opacity-75" style={{ color: currentTextMuted }}>
                                Rộng {el.width}px • {el.rotation || 0}° • {el.animation !== 'none' ? el.animation : 'Tĩnh'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => {
                                const clone: StoryElement = {
                                  ...el,
                                  id: `ele_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                  x: Math.min(85, el.x + 4),
                                  y: Math.min(85, el.y + 4),
                                };
                                setStoryElements((prev) => [...prev, clone]);
                                setSelectedStoryElementId(clone.id);
                              }}
                              className="p-1 rounded hover:opacity-80 transition"
                              style={{ color: currentText }}
                              title="Nhân bản"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Flip */}
                            <button
                              type="button"
                              onClick={() => {
                                setStoryElements((prev) =>
                                  prev.map((item) => (item.id === el.id ? { ...item, flipHorizontal: !item.flipHorizontal } : item))
                                );
                              }}
                              className="p-1 rounded hover:opacity-80 transition"
                              style={{ color: currentText }}
                              title="Lật ngang"
                            >
                              <FlipHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setStoryElements((prev) => prev.filter((item) => item.id !== el.id));
                                if (selectedStoryElementId === el.id) {
                                  setSelectedStoryElementId(null);
                                }
                              }}
                              className="p-1 rounded text-red-400 hover:text-red-300 transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hướng dẫn thao tác trực tiếp */}
              <div className="p-2.5 rounded border bg-black/10 text-[10px] leading-relaxed space-y-1" style={{ borderColor: currentBorder, color: currentTextMuted }}>
                <p className="font-bold" style={{ color: currentText }}>💡 Mẹo tương tác trên trang truyện:</p>
                <p>• <strong>Kéo chuột / chạm tay</strong> vào element để di chuyển đến bất kỳ vị trí nào.</p>
                <p>• <strong>Kéo chấm tròn</strong> ở góc dưới bên phải element để co giãn to/nhỏ tùy ý.</p>
                <p>• <strong>Thanh công cụ nổi</strong>: Click chọn element để chỉnh chuyển động (bay, lơ lửng, quay tròn, nảy tưng tưng, lắc lư), xoay góc, lật ngang hoặc nhân bản.</p>
              </div>
            </div>
          )}

          {/* TAB 5: WIDGETS (WIDGET NHÂN VẬT) */}
          {activeDrawerTab === 'widgets' && (
            <div className="space-y-4 text-xs">
              {/* Switch bật/tắt widget */}
              <div className="p-3 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder, background: currentBg }}>
                <div className="pr-2">
                  <span className="font-bold block text-xs" style={{ color: currentText }}>Bật ô Widget nhân vật</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCharacterWidget(!showCharacterWidget)}
                  className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                  style={{
                    backgroundColor: showCharacterWidget ? currentBtnBg : 'rgb(75, 85, 99)'
                  }}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      showCharacterWidget ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {showCharacterWidget && (
                <>
                  {/* Cấu hình tiêu đề widget */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                      Tiêu đề ô Widget:
                    </label>
                    <input
                      type="text"
                      value={characterWidgetTitle}
                      onChange={(e) => setCharacterWidgetTitle(e.target.value)}
                      placeholder="Thông tin nhân vật"
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                    />
                  </div>

                  {/* Nút thêm nhân vật */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-[11px]" style={{ color: currentText }}>
                      Danh sách nhân vật ({characters.length}):
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenAddChar}
                      className="px-2.5 py-1 text-[11px] font-bold rounded border flex items-center gap-1 hover:opacity-90 transition"
                      style={{
                        background: currentBtnBg,
                        borderColor: currentBtnBorder,
                        color: currentBtnText,
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm nhân vật</span>
                    </button>
                  </div>

                  {/* Danh sách nhân vật hiện tại */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {characters.length === 0 ? (
                      <p className="text-[11px] italic text-center py-3 opacity-70" style={{ color: currentTextMuted }}>
                        Chưa có nhân vật nào. Nhấp "Thêm nhân vật" để bắt đầu tạo.
                      </p>
                    ) : (
                      characters.map((char) => (
                        <div
                          key={char.id}
                          className="p-2 rounded border flex items-center justify-between gap-2"
                          style={{ background: currentBg, borderColor: currentBorder }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="w-8 h-8 rounded-full border shrink-0 overflow-hidden flex items-center justify-center bg-black/20"
                              style={{ borderColor: currentBorder }}
                            >
                              {char.avatarUrl ? (
                                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 opacity-60" style={{ color: currentText }} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold truncate text-xs" style={{ color: currentText }}>
                                  {char.name}
                                </span>
                                {char.role && (
                                  <span
                                    className="text-[9px] px-1 rounded font-mono shrink-0"
                                    style={{ background: currentBtnBg, color: currentBtnText }}
                                  >
                                    {char.role}
                                  </span>
                                )}
                              </div>
                              {char.description && (
                                <p className="text-[10px] truncate opacity-75" style={{ color: currentTextMuted }}>
                                  {char.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditChar(char)}
                              className="p-1 hover:opacity-80 transition rounded text-blue-400"
                              title="Chỉnh sửa nhân vật"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteChar(char.id)}
                              className="p-1 hover:opacity-80 transition rounded text-red-400"
                              title="Xóa nhân vật"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* PHẦN 2: WIDGET TIẾN ĐỘ BỘ TRUYỆN */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: currentBorder }}>
                <div className="p-3 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder, background: currentBg }}>
                  <div className="pr-2">
                    <span className="font-bold block text-xs" style={{ color: currentText }}>Bật ô Widget Tiến độ</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProgressWidget(!showProgressWidget)}
                    className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                    style={{
                      backgroundColor: showProgressWidget ? currentBtnBg : 'rgb(75, 85, 99)'
                    }}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                        showProgressWidget ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {showProgressWidget && (
                  <div className="space-y-3 p-3 rounded border" style={{ borderColor: currentBorder, background: currentBg }}>
                    {/* Cấu hình tiêu đề widget tiến độ */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                        Tiêu đề Widget Tiến độ:
                      </label>
                      <input
                        type="text"
                        value={progressWidgetTitle}
                        onChange={(e) => setProgressWidgetTitle(e.target.value)}
                        placeholder="Tiến độ"
                        className="w-full p-2 rounded border text-xs focus:outline-none"
                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                      />
                    </div>

                    {/* Cấu hình tổng số chương dự kiến */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                        Tổng số chương dự kiến của bộ truyện:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={totalPlannedChapters || ''}
                        onChange={(e) => setTotalPlannedChapters(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="Ví dụ: 100, 500, 1000..."
                        className="w-full p-2 rounded border text-xs focus:outline-none font-mono"
                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                      />
                    </div>

                    {/* Xem trước tiến độ */}
                    <div className="p-2.5 rounded border space-y-1.5" style={{ background: currentCardBg, borderColor: currentBorder }}>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span style={{ color: currentText }}>{progressWidgetTitle || 'Tiến độ'}</span>
                        <span className="font-mono" style={{ color: currentBtnBg }}>
                          {totalPlannedChapters > 0
                            ? `${Math.min(100, Math.round(((initialStory?.chapterCount || 0) / totalPlannedChapters) * 100))}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-black/30 border" style={{ borderColor: currentBorder }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: currentBtnBg,
                            width: `${totalPlannedChapters > 0
                              ? Math.min(100, Math.round(((initialStory?.chapterCount || 0) / totalPlannedChapters) * 100))
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 2.5: WIDGET NỘI DUNG TÙY CHỈNH */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: currentBorder }}>
                <div className="p-3 rounded border border-dashed flex items-center justify-between" style={{ borderColor: currentBorder, background: currentBg }}>
                  <div className="pr-2">
                    <span className="font-bold block text-xs" style={{ color: currentText }}>Bật ô Widget Tùy chỉnh</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomWidget(!showCustomWidget)}
                    className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0"
                    style={{
                      backgroundColor: showCustomWidget ? currentBtnBg : 'rgb(75, 85, 99)'
                    }}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                        showCustomWidget ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {showCustomWidget && (
                  <div className="space-y-3 p-3 rounded border" style={{ borderColor: currentBorder, background: currentBg }}>
                    {/* Cấu hình tiêu đề widget tùy chỉnh */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                        Tiêu đề Widget Tùy chỉnh:
                      </label>
                      <input
                        type="text"
                        value={customWidgetTitle}
                        onChange={(e) => setCustomWidgetTitle(e.target.value)}
                        placeholder="Ví dụ: Thông báo, Lời ngỏ, Quà tặng..."
                        className="w-full p-2 rounded border text-xs focus:outline-none"
                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                      />
                    </div>

                    {/* Cấu hình nội dung tùy chỉnh */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                        Nội dung hiển thị:
                      </label>
                      <textarea
                        rows={4}
                        value={customWidgetContent}
                        onChange={(e) => setCustomWidgetContent(e.target.value)}
                        placeholder="Nhập nội dung thông báo, liên hệ hoặc ghi chú tùy chỉnh ở đây..."
                        className="w-full p-2 rounded border text-xs focus:outline-none resize-none font-sans"
                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 2.6: QUẢN LÝ NHIỀU WIDGET ẢNH LẺ / ALBUM ẢNH DI CHUYỂN */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="font-bold block text-xs" style={{ color: currentText }}>
                      Widget Ảnh / Album ({galleryWidgets.length})
                    </span>
                    <span className="text-[10px] block opacity-70" style={{ color: currentTextMuted }}>
                      Thêm nhiều album hoặc ảnh nghệ thuật tùy ý
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddGalleryWidget}
                    className="px-2.5 py-1 text-[11px] font-bold rounded border flex items-center gap-1 hover:opacity-90 transition cursor-pointer"
                    style={{
                      background: currentBtnBg,
                      borderColor: currentBtnBorder,
                      color: currentBtnText,
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Widget Ảnh mới</span>
                  </button>
                </div>

                {/* Danh sách các Widget Ảnh/Album */}
                <div className="space-y-3">
                  {galleryWidgets.map((gw, gwIdx) => {
                    const isExpanded = expandedWidgetIds[gw.id] ?? (gwIdx === 0);
                    const isEnabled = gw.enabled !== false;
                    const widgetMode = gw.mode || 'single';
                    const widgetSize = gw.imageSize || 100;
                    const widgetSpeed = gw.autoScrollSpeed || 'normal';
                    const widgetImgs = gw.images || [];

                    return (
                      <div
                        key={gw.id}
                        className="rounded border transition"
                        style={{ background: currentBg, borderColor: isEnabled ? currentBorder : 'rgba(128,128,128,0.3)' }}
                      >
                        {/* Header của từng Widget */}
                        <div
                          className="p-2.5 flex items-center justify-between gap-2 border-b select-none"
                          style={{ borderColor: currentBorder, background: currentCardBg }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Reorder up/down */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={gwIdx === 0}
                                onClick={() => handleMoveGalleryWidget(gwIdx, 'up')}
                                className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition cursor-pointer"
                                title="Lên trên"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={gwIdx === galleryWidgets.length - 1}
                                onClick={() => handleMoveGalleryWidget(gwIdx, 'down')}
                                className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition cursor-pointer"
                                title="Xuống dưới"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Tiêu đề widget */}
                            <input
                              type="text"
                              value={gw.title}
                              onChange={(e) => handleUpdateGalleryWidget(gw.id, { title: e.target.value })}
                              placeholder="Tiêu đề widget..."
                              className="font-bold text-xs bg-transparent border-b border-dashed border-transparent hover:border-white/30 focus:border-white focus:outline-none px-1 py-0.5 min-w-0 flex-1 truncate"
                              style={{ color: currentText }}
                            />

                            {/* Badge loại widget */}
                            <span
                              className="px-1.5 py-0.5 text-[9px] rounded font-semibold shrink-0"
                              style={{
                                background: currentBtnSecondaryBg,
                                color: currentText,
                              }}
                            >
                              {widgetMode === 'single' ? 'Ảnh đơn' : `Album (${widgetImgs.length})`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Switch bật/tắt widget */}
                            <button
                              type="button"
                              onClick={() => handleUpdateGalleryWidget(gw.id, { enabled: !isEnabled })}
                              className="w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 shrink-0"
                              style={{
                                backgroundColor: isEnabled ? currentBtnBg : 'rgb(75, 85, 99)',
                              }}
                              title={isEnabled ? 'Đang bật widget' : 'Đang tắt widget'}
                            >
                              <div
                                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-all duration-300 ${
                                  isEnabled ? 'translate-x-3.5' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Xóa widget */}
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryWidget(gw.id)}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title="Xóa widget này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Thu gọn / Mở rộng */}
                            <button
                              type="button"
                              onClick={() => setExpandedWidgetIds((prev) => ({ ...prev, [gw.id]: !isExpanded }))}
                              className="p-1 rounded hover:bg-white/10 transition cursor-pointer"
                              title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Thân Widget khi mở rộng */}
                        {isExpanded && (
                          <div className="p-3 space-y-3">
                            {/* Chọn kiểu hiển thị: Ảnh đơn vs Album */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                                Kiểu hiển thị:
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateGalleryWidget(gw.id, { mode: 'single' })}
                                  className={`p-2 rounded border text-center text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                                    widgetMode === 'single' ? 'ring-2 font-bold' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{
                                    background: widgetMode === 'single' ? currentBtnSecondaryBg : currentCardBg,
                                    borderColor: widgetMode === 'single' ? currentBtnBg : currentBorder,
                                    color: currentText,
                                  }}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                  <span>Ảnh lẻ (Đơn)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateGalleryWidget(gw.id, { mode: 'album' })}
                                  className={`p-2 rounded border text-center text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                                    widgetMode === 'album' ? 'ring-2 font-bold' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{
                                    background: widgetMode === 'album' ? currentBtnSecondaryBg : currentCardBg,
                                    borderColor: widgetMode === 'album' ? currentBtnBg : currentBorder,
                                    color: currentText,
                                  }}
                                >
                                  <Images className="w-4 h-4" />
                                  <span>Album di chuyển</span>
                                </button>
                              </div>
                            </div>

                            {/* Kích thước ảnh / Album */}
                            <div className="space-y-1 p-2 rounded border bg-black/10" style={{ borderColor: currentBorder }}>
                              <label className="text-[11px] font-semibold flex justify-between items-center" style={{ color: currentText }}>
                                <span className="flex items-center gap-1">
                                  <Sliders className="w-3 h-3 text-[#e879f9]" /> Kích thước ảnh / Album:
                                </span>
                                <span className="font-mono font-bold text-xs" style={{ color: currentBtnBg }}>{widgetSize}%</span>
                              </label>
                              <input
                                type="range"
                                min="20"
                                max="100"
                                step="1"
                                value={widgetSize}
                                onChange={(e) => handleUpdateGalleryWidget(gw.id, { imageSize: Number(e.target.value) })}
                                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#e879f9]"
                                style={{ background: currentBtnBg }}
                              />
                              <div className="flex justify-between text-[9px] opacity-60 font-mono" style={{ color: currentTextMuted }}>
                                <span>20% (Nhỏ)</span>
                                <span>50% (Vừa)</span>
                                <span>100% (Gốc)</span>
                              </div>
                            </div>

                            {/* Cấu hình Chế độ 1: Ảnh Lẻ */}
                            {widgetMode === 'single' && (
                              <div className="space-y-2.5 pt-2 border-t border-dashed" style={{ borderColor: currentBorder }}>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                                    Hình ảnh / GIF lẻ:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={gw.singleImageUrl || ''}
                                      onChange={(e) => handleUpdateGalleryWidget(gw.id, { singleImageUrl: e.target.value })}
                                      placeholder="Dán URL ảnh/GIF hoặc tải từ máy..."
                                      className="flex-1 p-2 rounded border text-xs focus:outline-none"
                                      style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        targetUploadWidgetIdRef.current = gw.id;
                                        gallerySingleFileInputRef.current?.click();
                                      }}
                                      disabled={isCompressingGalleryImg}
                                      className="px-2.5 py-2 rounded border text-xs flex items-center gap-1 transition shrink-0 cursor-pointer disabled:opacity-50"
                                      style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>{isCompressingGalleryImg ? 'Đang nén...' : 'Tải lên'}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Preview ảnh lẻ nếu có */}
                                {gw.singleImageUrl && (
                                  <div className="relative rounded overflow-hidden border p-2 flex flex-col items-center justify-center bg-black/20" style={{ borderColor: currentBorder }}>
                                    <img
                                      src={gw.singleImageUrl}
                                      alt="Gallery Preview"
                                      className="h-auto max-h-48 object-contain rounded transition-all duration-200"
                                      style={{ width: `${widgetSize}%`, maxWidth: '100%' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateGalleryWidget(gw.id, { singleImageUrl: '' })}
                                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-red-900 text-white transition cursor-pointer"
                                      title="Xóa ảnh"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}

                                {/* Chú thích ảnh lẻ */}
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                                    Chú thích ảnh (tùy chọn):
                                  </label>
                                  <input
                                    type="text"
                                    value={gw.singleImageCaption || ''}
                                    onChange={(e) => handleUpdateGalleryWidget(gw.id, { singleImageCaption: e.target.value })}
                                    placeholder="Ví dụ: Bìa đặc biệt, Fanart kỷ niệm..."
                                    className="w-full p-2 rounded border text-xs focus:outline-none"
                                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Cấu hình Chế độ 2: Album Di Chuyển */}
                            {widgetMode === 'album' && (
                              <div className="space-y-3 pt-2 border-t border-dashed" style={{ borderColor: currentBorder }}>
                                {/* Tốc độ tự động di chuyển */}
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                                    Tốc độ di chuyển dải album:
                                  </label>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                      { id: 'slow', name: 'Chậm' },
                                      { id: 'normal', name: 'Vừa' },
                                      { id: 'fast', name: 'Nhanh' },
                                    ].map((spd) => (
                                      <button
                                        key={spd.id}
                                        type="button"
                                        onClick={() => handleUpdateGalleryWidget(gw.id, { autoScrollSpeed: spd.id as any })}
                                        className={`py-1.5 px-2 rounded border text-center text-xs transition cursor-pointer ${
                                          widgetSpeed === spd.id ? 'font-bold ring-1' : 'opacity-70 hover:opacity-100'
                                        }`}
                                        style={{
                                          background: widgetSpeed === spd.id ? currentBtnBg : currentCardBg,
                                          borderColor: widgetSpeed === spd.id ? currentBtnBorder : currentBorder,
                                          color: widgetSpeed === spd.id ? currentBtnText : currentText,
                                        }}
                                      >
                                        {spd.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Form thêm ảnh vào album */}
                                <div className="p-2.5 rounded border space-y-2" style={{ background: currentCardBg, borderColor: currentBorder }}>
                                  <span className="text-[11px] font-bold block" style={{ color: currentText }}>
                                    Thêm ảnh vào Album này:
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={newAlbumImgUrl}
                                      onChange={(e) => setNewAlbumImgUrl(e.target.value)}
                                      placeholder="Dán link ảnh trực tiếp..."
                                      className="flex-1 p-1.5 rounded border text-xs focus:outline-none"
                                      style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        targetUploadWidgetIdRef.current = gw.id;
                                        galleryAlbumFileInputRef.current?.click();
                                      }}
                                      disabled={isCompressingGalleryImg}
                                      className="px-2 py-1.5 rounded border text-[11px] font-bold flex items-center gap-1 transition shrink-0 cursor-pointer disabled:opacity-50"
                                      style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                                      title="Tải một hoặc nhiều ảnh từ máy"
                                    >
                                      <Upload className="w-3 h-3" />
                                      <span>{isCompressingGalleryImg ? 'Đang nén...' : 'Tải file'}</span>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={newAlbumImgCaption}
                                      onChange={(e) => setNewAlbumImgCaption(e.target.value)}
                                      placeholder="Chú thích ảnh (tùy chọn)..."
                                      className="flex-1 p-1.5 rounded border text-xs focus:outline-none"
                                      style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!newAlbumImgUrl.trim()) {
                                          alert('Vui lòng nhập link ảnh!');
                                          return;
                                        }
                                        const newImg = {
                                          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                          url: newAlbumImgUrl.trim(),
                                          caption: newAlbumImgCaption.trim() || undefined,
                                        };
                                        handleUpdateGalleryWidget(gw.id, {
                                          images: [...widgetImgs, newImg],
                                        });
                                        setNewAlbumImgUrl('');
                                        setNewAlbumImgCaption('');
                                      }}
                                      className="px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer"
                                      style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Thêm</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Danh sách các ảnh đã thêm trong album */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: currentText }}>
                                    <span>Danh sách ảnh ({widgetImgs.length}):</span>
                                    {widgetImgs.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm('Bạn có chắc muốn xóa tất cả ảnh trong album này?')) {
                                            handleUpdateGalleryWidget(gw.id, { images: [] });
                                          }
                                        }}
                                        className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                                      >
                                        Xóa tất cả
                                      </button>
                                    )}
                                  </div>

                                  {widgetImgs.length === 0 ? (
                                    <p className="text-[11px] italic opacity-60 text-center py-2" style={{ color: currentTextMuted }}>
                                      Chưa có ảnh nào trong album này. Hãy dán link hoặc tải ảnh lên.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                      {widgetImgs.map((img, idx) => (
                                        <div
                                          key={img.id}
                                          className="relative group rounded border overflow-hidden bg-black/30"
                                          style={{ borderColor: currentBorder }}
                                        >
                                          <img
                                            src={img.url}
                                            alt={img.caption || `Ảnh ${idx + 1}`}
                                            className="w-full h-20 object-cover"
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleUpdateGalleryWidget(gw.id, {
                                                images: widgetImgs.filter((item) => item.id !== img.id),
                                              })
                                            }
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-700 text-white flex items-center justify-center transition cursor-pointer"
                                            title="Xóa ảnh"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                          {img.caption && (
                                            <div className="p-1 text-[9px] truncate bg-black/60 text-white text-center">
                                              {img.caption}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN 3: KIỂU TRÌNH BÀY DANH SÁCH CHƯƠNG */}
              <div className="pt-3 border-t space-y-2.5" style={{ borderColor: currentBorder }}>
                <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: currentText }}>
                  Kiểu trình bày Danh sách chương:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'standard', name: 'Thẻ truyền thống', desc: 'Danh sách thẻ dọc chi tiết đầy đủ với hiệu ứng viền', icon: List },
                    { id: 'grid', name: 'Lưới ô gọn gàng', desc: 'Các ô nút chương gọn nhẹ kiểu Webtoon/Manga', icon: LayoutGrid },
                    { id: 'accordion', name: 'Gấp gọn theo Quyển', desc: 'Có thể bấm thu/mở từng Quyển hoặc Tập', icon: Folder },
                    { id: 'timeline', name: 'Dòng thời gian nghệ thuật', desc: 'Trục mốc thời gian nối dọc phát sáng theo theme', icon: GitCommit },
                    { id: 'minimal_table', name: 'Bảng phẳng tối giản', desc: 'Hàng phẳng đơn giản, cổ điển thanh lịch', icon: Table },
                    { id: 'book_catalog', name: 'Mục lục sách xuất bản', desc: 'Chấm lửng nối liền giữa tên chương và số từ', icon: Columns2 },
                    { id: 'scroll_strip', name: 'Thẻ con nhộng huy hiệu', desc: 'Các thẻ pill bo tròn mềm mại xếp cụm', icon: Tag },
                    { id: 'cards_bento', name: 'Thẻ Bento đa giác quan', desc: 'Các khối chương to nhỏ nổi bật chương đọc dở', icon: LayoutList },
                    { id: 'modern_compact', name: 'Hàng ngang số to', desc: 'Đánh số thứ tự 01, 02 nổi bật phong cách hiện đại', icon: List },
                    { id: 'numbers_only', name: 'Chỉ hiện số chương', desc: 'Mỗi chương là một ô số tròn 01, 02... cực kì tối giản', icon: Hash },
                  ].map((styleOpt) => {
                    const IconComp = styleOpt.icon;
                    const isSelected = chapterListStyle === styleOpt.id;
                    return (
                      <button
                        key={styleOpt.id}
                        type="button"
                        onClick={() => setChapterListStyle(styleOpt.id as any)}
                        className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected ? 'ring-2' : 'hover:opacity-90 opacity-75'
                        }`}
                        style={{
                          background: isSelected ? currentBtnSecondaryBg : currentBg,
                          borderColor: isSelected ? currentBtnBg : currentBorder,
                        }}
                      >
                        <div
                          className="p-1.5 rounded border shrink-0 mt-0.5"
                          style={{
                            borderColor: currentBorder,
                            backgroundColor: isSelected ? currentBtnBg : 'transparent',
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold flex items-center justify-between text-xs" style={{ color: currentText }}>
                            <span>{styleOpt.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </span>
                          <span className="text-[10px] leading-tight block opacity-75" style={{ color: currentTextMuted }}>
                            {styleOpt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BỐ CỤC & SẮP XẾP VỊ TRÍ PHÂN ĐOẠN */}
          {activeDrawerTab === 'layout' && (() => {
            const getBlockMeta = (blockId: string): { name: string; icon: any } => {
              if (blockId === 'gallery_widget') {
                const title = galleryWidgets[0]?.title;
                return {
                  name: title ? `Widget Ảnh: ${title}` : 'Widget Ảnh / Album',
                  icon: Images,
                };
              }
              if (blockId.startsWith('gallery_widget:') || blockId.startsWith('gallery_widget_')) {
                const wId = blockId.replace('gallery_widget:', '').replace('gallery_widget_', '');
                const gw = galleryWidgets.find((w) => w.id === wId);
                return {
                  name: gw?.title ? `Widget Ảnh: ${gw.title}` : 'Widget Ảnh / Album',
                  icon: Images,
                };
              }
              return BLOCK_META_MAP[blockId] || { name: blockId, icon: Move };
            };

            const usedBlockIds = new Set<StoryLayoutBlockId>();
            storyLayoutSections.forEach((sec) => {
              if (sec.type === '1_column') {
                sec.blocks?.forEach((id) => usedBlockIds.add(id));
              } else {
                sec.leftBlocks?.forEach((id) => usedBlockIds.add(id));
                sec.rightBlocks?.forEach((id) => usedBlockIds.add(id));
              }
            });

            const allAvailableBlockIds: StoryLayoutBlockId[] = [
              ...ALL_STORY_BLOCK_IDS.filter((id) => id !== 'gallery_widget'),
              ...(galleryWidgets.length === 1
                ? ['gallery_widget']
                : galleryWidgets.map((gw, idx) => (idx === 0 ? 'gallery_widget' : `gallery_widget:${gw.id}`))),
            ];
            const unusedBlockIds = allAvailableBlockIds.filter((id) => !usedBlockIds.has(id));

            return (
              <div className="space-y-4 text-xs font-mono">
                {/* Giới thiệu & Hướng dẫn */}
                <div className="p-2.5 rounded border space-y-1.5" style={{ background: currentBg, borderColor: currentBorder }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: currentText }}>
                    Quản lý Bố cục Phân đoạn linh hoạt
                  </span>
                  <p className="text-[10px] opacity-80" style={{ color: currentTextMuted }}>
                    Trang truyện được chia thành từng Phân đoạn (Section). Bạn có thể chọn từng đoạn là 1 cột (toàn chiều rộng) hoặc 2 cột (Sidebar trái / phải / 50-50).
                  </p>
                </div>

                {/* Nút thêm phân đoạn */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSection('1_column')}
                    className="flex-1 py-1.5 px-2 rounded border font-bold text-[11px] flex items-center justify-center gap-1.5 transition hover:opacity-90 cursor-pointer"
                    style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm đoạn 1 Cột</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSection('2_columns')}
                    className="flex-1 py-1.5 px-2 rounded border font-bold text-[11px] flex items-center justify-center gap-1.5 transition hover:opacity-90 cursor-pointer"
                    style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm đoạn 2 Cột</span>
                  </button>
                </div>

                {/* Danh sách Phân đoạn */}
                <div className="space-y-3">
                  {storyLayoutSections.map((sec, secIdx) => {
                    const is1Col = sec.type === '1_column';
                    return (
                      <div
                        key={sec.id || `sec-${secIdx}`}
                        className="p-3 rounded border space-y-2.5 transition"
                        style={{ background: currentCardBg, borderColor: currentBorder }}
                      >
                        {/* Header phân đoạn */}
                        <div className="flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: currentBorder }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-[11px] truncate" style={{ color: currentText }}>
                              {sec.title || `Phân đoạn ${secIdx + 1}`}
                            </span>
                            <span
                              className="px-1.5 py-0.5 text-[9px] rounded font-semibold uppercase shrink-0"
                              style={{ background: is1Col ? currentBtnBg : currentBtnSecondaryBg, color: is1Col ? currentBtnText : currentText }}
                            >
                              {is1Col ? '1 Cột' : '2 Cột'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSectionType(secIdx)}
                              className="px-1.5 py-0.5 text-[9px] rounded border hover:opacity-80 transition cursor-pointer"
                              style={{ borderColor: currentBorder, color: currentTextMuted }}
                              title="Chuyển đổi kiểu 1 Cột <-> 2 Cột"
                            >
                              {is1Col ? 'Sang 2 Cột' : 'Sang 1 Cột'}
                            </button>

                            <button
                              type="button"
                              disabled={secIdx === 0}
                              onClick={() => handleMoveSection(secIdx, 'up')}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition cursor-pointer"
                              title="Lên trên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={secIdx === storyLayoutSections.length - 1}
                              onClick={() => handleMoveSection(secIdx, 'down')}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-20 transition cursor-pointer"
                              title="Xuống dưới"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSection(secIdx)}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title="Xóa phân đoạn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Cấu hình Tỉ lệ cột nếu là 2 cột */}
                        {!is1Col && (
                          <div className="flex items-center gap-2 text-[10px]">
                            <span style={{ color: currentTextMuted }}>Tỉ lệ cột:</span>
                            <select
                              value={sec.columnRatio || 'left_fixed'}
                              onChange={(e) => handleUpdateSectionRatio(secIdx, e.target.value as StoryLayoutColumnRatio)}
                              className="py-0.5 px-1.5 rounded border text-[10px] outline-none"
                              style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                            >
                              <option value="left_fixed">Sidebar Trái (224px) + Cột Phải co giãn</option>
                              <option value="right_fixed">Cột Trái co giãn + Sidebar Phải (224px)</option>
                              <option value="equal">Chia đều 2 cột (50% / 50%)</option>
                            </select>
                          </div>
                        )}

                        {/* Hiển thị các khối trong phân đoạn */}
                        {is1Col ? (
                          <div
                            className="space-y-1.5 p-2 rounded border min-h-12"
                            style={{ background: currentBg, borderColor: currentBorder }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedSectionBlock) {
                                const { blockId, sourceSecIdx, sourceCol } = draggedSectionBlock;
                                handleMoveBlockToSection(sourceSecIdx, sourceCol, secIdx, 'single', blockId);
                                setDraggedSectionBlock(null);
                              }
                            }}
                          >
                            {(sec.blocks || []).length === 0 ? (
                              <p className="text-[10px] italic opacity-60 text-center py-1">Kéo thả hoặc thêm khối vào đây</p>
                            ) : (
                              (sec.blocks || []).map((blockId, bIdx) => {
                                const meta = getBlockMeta(blockId);
                                const IconComp = meta.icon;
                                return (
                                  <div
                                    key={blockId}
                                    draggable
                                    onDragStart={() => setDraggedSectionBlock({ blockId, sourceSecIdx: secIdx, sourceCol: 'single' })}
                                    className="p-1.5 rounded border flex items-center justify-between gap-1.5 shadow-xs transition hover:opacity-95 cursor-grab active:cursor-grabbing text-[11px]"
                                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <GripVertical className="w-3 h-3 opacity-40 shrink-0" />
                                      <IconComp className="w-3 h-3 opacity-70 shrink-0" />
                                      <span className="font-semibold truncate">{meta.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        disabled={bIdx === 0}
                                        onClick={() => handleMoveBlockWithinSection(secIdx, 'single', bIdx, bIdx - 1)}
                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-20"
                                        title="Lên trên"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={bIdx === (sec.blocks || []).length - 1}
                                        onClick={() => handleMoveBlockWithinSection(secIdx, 'single', bIdx, bIdx + 1)}
                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-20"
                                        title="Xuống dưới"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {/* Cột trái */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-semibold block" style={{ color: currentTextMuted }}>
                                Cột Trái ({ (sec.leftBlocks || []).length })
                              </span>
                              <div
                                className="space-y-1.5 p-1.5 rounded border min-h-12"
                                style={{ background: currentBg, borderColor: currentBorder }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (draggedSectionBlock) {
                                    const { blockId, sourceSecIdx, sourceCol } = draggedSectionBlock;
                                    handleMoveBlockToSection(sourceSecIdx, sourceCol, secIdx, 'left', blockId);
                                    setDraggedSectionBlock(null);
                                  }
                                }}
                              >
                                {(sec.leftBlocks || []).length === 0 ? (
                                  <p className="text-[9px] italic opacity-60 text-center py-2">Cột Trái trống</p>
                                ) : (
                                  (sec.leftBlocks || []).map((blockId, bIdx) => {
                                    const meta = getBlockMeta(blockId);
                                    const IconComp = meta.icon;
                                    return (
                                      <div
                                        key={blockId}
                                        draggable
                                        onDragStart={() => setDraggedSectionBlock({ blockId, sourceSecIdx: secIdx, sourceCol: 'left' })}
                                        className="p-1 rounded border flex items-center justify-between gap-1 shadow-xs transition text-[10px] cursor-grab active:cursor-grabbing"
                                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                      >
                                        <div className="flex items-center gap-1 min-w-0">
                                          <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0" />
                                          <IconComp className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                          <span className="font-semibold truncate">{meta.name}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveBlockBetweenColumns(secIdx, 'left', blockId)}
                                            className="px-1 py-0.5 text-[8px] rounded border hover:bg-white/10"
                                            title="Sang Cột Phải"
                                          >
                                            &gt;
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Cột phải */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-semibold block" style={{ color: currentTextMuted }}>
                                Cột Phải ({ (sec.rightBlocks || []).length })
                              </span>
                              <div
                                className="space-y-1.5 p-1.5 rounded border min-h-12"
                                style={{ background: currentBg, borderColor: currentBorder }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (draggedSectionBlock) {
                                    const { blockId, sourceSecIdx, sourceCol } = draggedSectionBlock;
                                    handleMoveBlockToSection(sourceSecIdx, sourceCol, secIdx, 'right', blockId);
                                    setDraggedSectionBlock(null);
                                  }
                                }}
                              >
                                {(sec.rightBlocks || []).length === 0 ? (
                                  <p className="text-[9px] italic opacity-60 text-center py-2">Cột Phải trống</p>
                                ) : (
                                  (sec.rightBlocks || []).map((blockId, bIdx) => {
                                    const meta = getBlockMeta(blockId);
                                    const IconComp = meta.icon;
                                    return (
                                      <div
                                        key={blockId}
                                        draggable
                                        onDragStart={() => setDraggedSectionBlock({ blockId, sourceSecIdx: secIdx, sourceCol: 'right' })}
                                        className="p-1 rounded border flex items-center justify-between gap-1 shadow-xs transition text-[10px] cursor-grab active:cursor-grabbing"
                                        style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                      >
                                        <div className="flex items-center gap-1 min-w-0">
                                          <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0" />
                                          <IconComp className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                          <span className="font-semibold truncate">{meta.name}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveBlockBetweenColumns(secIdx, 'right', blockId)}
                                            className="px-1 py-0.5 text-[8px] rounded border hover:bg-white/10"
                                            title="Sang Cột Trái"
                                          >
                                            &lt;
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Các khối chưa được phân bổ (nếu có) */}
                {unusedBlockIds.length > 0 && (
                  <div className="p-2.5 rounded border space-y-2" style={{ background: currentBg, borderColor: currentBorder }}>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Khối chưa sử dụng ({unusedBlockIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {unusedBlockIds.map((blockId) => {
                        const meta = getBlockMeta(blockId);
                        return (
                          <div
                            key={blockId}
                            className="px-2 py-1 rounded border text-[10px] flex items-center gap-1.5"
                            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                          >
                            <span className="font-semibold">{meta.name}</span>
                            <button
                              type="button"
                              onClick={() => handleAddUnusedBlockToSection(blockId, 0, 'left')}
                              className="px-1 py-0.5 text-[8px] rounded border bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
                              title="Thêm vào Phân đoạn đầu tiên"
                            >
                              + Thêm
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nút đặt lại mặc định */}
                <div className="pt-2 border-t flex justify-end" style={{ borderColor: currentBorder }}>
                  <button
                    type="button"
                    onClick={handleResetLayoutSections}
                    className="px-3 py-1 text-[11px] rounded border hover:opacity-80 transition cursor-pointer"
                    style={{ borderColor: currentBorder, color: currentTextMuted }}
                  >
                    Khôi phục bố cục mặc định
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL THÊM / SỬA NHÂN VẬT */}
      {showCharModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div
            className="w-full max-w-md p-5 rounded-lg border shadow-2xl space-y-4"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: currentText }}>
                <Users className="w-4 h-4" />
                <span>{editingCharId ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}</span>
              </span>
              <button onClick={() => setShowCharModal(false)} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Ảnh đại diện nhân vật */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Ảnh đại diện nhân vật:
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border overflow-hidden shrink-0 flex items-center justify-center bg-black/30 relative"
                    style={{ borderColor: currentBorder }}
                  >
                    {charAvatar ? (
                      <img src={charAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 opacity-50" style={{ color: currentTextMuted }} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Dán URL ảnh đại diện..."
                      value={charAvatar}
                      onChange={(e) => setCharAvatar(e.target.value)}
                      className="w-full p-2 rounded border text-xs focus:outline-none"
                      style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => charAvatarFileInputRef.current?.click()}
                        className="px-2 py-1 text-[10px] rounded border flex items-center gap-1 hover:opacity-80 transition"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBtnBorder, color: currentText }}
                      >
                        <Upload className="w-3 h-3" />
                        <span>{isCompressingCharAvatar ? 'Đang xử lý...' : 'Tải ảnh từ máy'}</span>
                      </button>
                      {charAvatar && (
                        <button
                          type="button"
                          onClick={() => setCharAvatar('')}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={charAvatarFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCompressCharAvatar(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Tên nhân vật */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Tên nhân vật <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lâm Nhược Vũ"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              {/* Vai trò / Danh xưng */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Vai trò / Danh xưng (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nam chính, Nữ chính, Sư phụ, Phản diện..."
                  value={charRole}
                  onChange={(e) => setCharRole(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              {/* Mô tả nhân vật */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: currentText }}>
                  Mô tả ngắn nhân vật (Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Tộc trưởng Lâm gia, sở hữu Thái Cổ Thần Thể..."
                  value={charDesc}
                  onChange={(e) => setCharDesc(e.target.value)}
                  className="w-full p-2 rounded border text-xs focus:outline-none resize-none"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: currentBorder }}>
              <button
                type="button"
                onClick={() => setShowCharModal(false)}
                className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveChar}
                className="px-4 py-1.5 text-xs font-bold rounded border shadow-sm flex items-center gap-1.5"
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu nhân vật</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NHẬP LINK ẢNH BÌA */}
      {showCoverUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div
            className="w-full max-w-md p-5 rounded-lg border shadow-2xl space-y-4"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
              <span className="text-xs font-bold uppercase tracking-wider">Dán liên kết ảnh bìa trực tiếp</span>
              <button onClick={() => setShowCoverUrlModal(false)} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold" style={{ color: currentText }}>Đường dẫn ảnh (URL):</label>
              <input
                type="text"
                placeholder="https://example.com/cover.jpg"
                value={tempCoverUrl}
                onChange={(e) => setTempCoverUrl(e.target.value)}
                className="w-full p-2.5 rounded border text-xs focus:outline-none"
                style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCoverUrlModal(false)}
                className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (tempCoverUrl.trim()) {
                    setCoverUrl(tempCoverUrl.trim());
                  }
                  setShowCoverUrlModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded border shadow-sm"
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INTERACTIVE STORY PAGE CONTAINER */}
      <main className={`max-w-4xl mx-auto px-4 py-6 space-y-6 ${customBodyFont}`}>
        {/* Helper Banner (Ẩn ở chế độ Xem trước) */}
        {editorMainView !== 'preview' && (
          <div
            className="p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 font-mono shadow-sm"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <span className="font-medium">Bạn có thể nhấp chuột trực tiếp vào Tên truyện, Tác giả, Ảnh bìa, Giới thiệu hoặc Tag bên dưới để chỉnh sửa ngay tại chỗ.</span>
            <button
              onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'theme')}
              className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded border hover:opacity-90 transition shadow-xs"
              style={{
                background: currentBtnBg,
                borderColor: currentBtnBorder,
                color: currentBtnText,
              }}
            >
              Mở bảng thiết kế
            </button>
          </div>
        )}

        {/* CHAPTER EDITOR VIEW VS STORY PAGE VIEW */}
        {editingChapterItem !== null ? (
          <div className={`space-y-6 text-xs ${customBodyFont}`}>
            {/* Top Action Header */}
            <div className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-sm ${customBodyFont}`} style={{ background: currentCardBg, borderColor: currentBorder }}>
              <button
                type="button"
                onClick={() => setEditingChapterItem(null)}
                className={`px-3 py-1.5 text-xs font-bold rounded border flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer ${customBtnFont}`}
                style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại trang truyện</span>
              </button>
              <div className={`text-xs sm:text-sm font-bold truncate max-w-xs sm:max-w-md ${customTitleFont}`} style={{ color: currentText }}>
                Sửa chương {editingChapterItem.chapterNumber}: {chapterTitleInput || '(Chưa có tiêu đề)'}
              </div>
              <button
                type="button"
                onClick={handleSaveChapterItem}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded border shadow-sm flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer ${customBtnFont}`}
                style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
              >
                <Check className="w-4 h-4" />
                <span>Lưu chương</span>
              </button>
            </div>

            {/* LIVE CHAPTER READER PREVIEW (NOW AN INLINE DIRECT EDITOR) */}
            <article
              className={`p-6 sm:p-8 space-y-6 relative transition-all duration-200 shadow-xl rounded ${customBodyFont}`}
              style={{
                background: currentCardBg,
                ...getStoryBorderStyle(currentBorderObj, currentBorder),
              }}
            >
              <StoryCornerAccents accent={activeBCorner} borderStyle={currentBorderObj?.borderStyle} color={currentBorder} />

              {/* Header: Chapter title, volume, author/editor, word count */}
              <div className="text-center space-y-3 pb-5 border-b border-dashed" style={{ borderColor: currentBorder }}>
                {/* Volume / Part Selector */}
                <div className="flex flex-col items-center gap-1.5 max-w-sm mx-auto">
                  <span className={`text-[10px] uppercase tracking-widest font-bold block ${customMutedFont}`} style={{ color: currentTextMuted }}>
                    Phần / Quyển sách
                  </span>
                  <div className="flex items-center gap-2 w-full justify-center">
                    {(() => {
                      const existingVols = Array.from(new Set(
                        storyChapters
                          .map(c => c.volumeTitle?.trim())
                          .filter((v): v is string => !!v)
                      ));
                      const isPredefined = existingVols.includes(chapterVolumeTitleInput);
                      const currentSelectValue = isPredefined ? chapterVolumeTitleInput : (chapterVolumeTitleInput === '' ? '' : '__new__');

                      return (
                        <select
                          value={currentSelectValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '__new__') {
                              setChapterVolumeTitleInput('');
                              setShowNewVolumeInput(true);
                            } else {
                              setChapterVolumeTitleInput(val);
                              setShowNewVolumeInput(false);
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded border bg-transparent focus:outline-none max-w-[220px] ${customMutedFont}`}
                          style={{ borderColor: currentBorder, color: currentText, backgroundColor: currentBtnSecondaryBg }}
                        >
                          <option value="" style={{ color: '#000' }}>-- Chọn phần (Không phân phần) --</option>
                          {existingVols.map((vol) => (
                            <option key={vol} value={vol} style={{ color: '#000' }}>{vol}</option>
                          ))}
                          <option value="__new__" style={{ color: '#000' }}>+ Thêm phần mới...</option>
                        </select>
                      );
                    })()}
                  </div>

                  {/* Text input to enter custom/new volume title */}
                  {(showNewVolumeInput || (chapterVolumeTitleInput !== '' && !Array.from(new Set(storyChapters.map(c => c.volumeTitle?.trim()).filter((v): v is string => !!v))).includes(chapterVolumeTitleInput))) && (
                    <input
                      type="text"
                      value={chapterVolumeTitleInput}
                      onChange={(e) => setChapterVolumeTitleInput(e.target.value)}
                      placeholder="Nhập tên phần mới..."
                      className={`px-2 py-1 text-xs rounded border text-center w-full max-w-[220px] focus:outline-none ${customMutedFont}`}
                      style={{ borderColor: currentBorder, color: currentText, backgroundColor: currentBtnSecondaryBg }}
                    />
                  )}
                </div>

                {/* Chapter Title Inline Input */}
                <div className="max-w-lg mx-auto">
                  <input
                    type="text"
                    value={chapterTitleInput}
                    onChange={(e) => setChapterTitleInput(e.target.value)}
                    placeholder={`Chương ${editingChapterItem.chapterNumber}: Tiêu đề`}
                    className={`w-full text-center bg-transparent border-b border-dashed focus:border-solid focus:outline-none font-bold tracking-wide leading-snug ${customSubtitleFont} py-1 px-2`}
                    style={{ color: currentText, borderColor: currentBorder, fontSize: titleFontSize || '24px' }}
                  />
                </div>

                <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs ${customMutedFont}`} style={{ color: currentTextMuted }}>
                  {author && (
                    <>
                      <span>Tác giả: {author}</span>
                      <span>•</span>
                    </>
                  )}
                  {editorName && (
                    <>
                      <span>Người đăng: {editorName}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{(chapterContentInput.match(/\S+/g) || []).length} chữ</span>
                  {isChapterLockedInput && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> {chapterUnlockPriceInput} Chucu</span>
                    </>
                  )}
                  {isChapterPasswordProtectedInput && (
                    <>
                      <span>•</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1"><Key className="w-3 h-3" /> Có Pass</span>
                    </>
                  )}
                </div>
              </div>

              {/* SPECIAL FRAMES TOOLBAR FOR CHAPTER */}
              <div
                className={`p-2 sm:p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs select-none ${customBtnFont}`}
                style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold opacity-80 flex items-center gap-1 mr-1" style={{ color: currentBtnBg }}>
                    <Frame className="w-3.5 h-3.5" /> Khung đặc biệt:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleInsertFrameSnippet('[system: THÔNG BÁO HỆ THỐNG]\nNội dung thông báo hệ thống ở đây...\n[/system]')}
                    className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 hover:opacity-85 transition cursor-pointer"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    title="Chèn khung Thông Báo Hệ Thống"
                  >
                    <BellRing className="w-3 h-3 text-sky-400" /> Hệ thống
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertFrameSnippet('[forum: Diễn Đàn Mạng Xã Hội]\n[netizen: Lầu 1 - Ăn dưa | 1 phút trước | +99]: Bình luận của cư dân mạng...\n[netizen: Qua Đường Giáp | Vừa xong | +45]: Bình luận tiếp theo...\n[/forum]')}
                    className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 hover:opacity-85 transition cursor-pointer"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    title="Chèn khung Bình Luận Cư Dân Mạng"
                  >
                    <MessageSquare className="w-3 h-3 text-pink-400" /> Cư dân mạng
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertFrameSnippet('[chat: Hộp Thoại Trò Chuyện]\n[left: Đối phương]: Cậu đang ở đâu thế?\n[right: Tôi]: Tớ vừa tới nơi nè!\n[/chat]')}
                    className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 hover:opacity-85 transition cursor-pointer"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    title="Chèn khung Tin Nhắn Chat / SMS"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-400" /> Chat / SMS
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertFrameSnippet('[letter: Mật Hàm Cổ Điển | Gửi người thừa kế]\nNội dung bức thư hoặc nhật ký ở đây...\n[/letter]')}
                    className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 hover:opacity-85 transition cursor-pointer"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    title="Chèn khung Bức Thư / Mật Thư"
                  >
                    <Mail className="w-3 h-3 text-amber-400" /> Thư / Nhật ký
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertFrameSnippet('[status: BẢNG TRẠNG THÁI]\nCảnh giới: Luyện Khí Kỳ\nHP: 100/100\nKỹ năng: Hỏa Cầu Thuật\n[/status]')}
                    className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 hover:opacity-85 transition cursor-pointer"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    title="Chèn khung Bảng Chỉ Số RPG"
                  >
                    <Shield className="w-3 h-3 text-purple-400" /> Bảng RPG
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertFrameSnippet('[note: Lời tác giả]\nLời nhắn nhủ hoặc chú thích thuật ngữ của tác giả...\n[/note]')}
                    className="px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 hover:opacity-85 transition cursor-pointer"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                    title="Chèn khung Lời Tác Giả / Chú Thích"
                  >
                    <StickyNote className="w-3 h-3 text-slate-400" /> Lời tác giả
                  </button>
                </div>

                {/* Nút mở Modal Trình Tạo Khung Trực Quan & Nút Xem Trước */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded border p-0.5" style={{ borderColor: currentBorder, background: currentCardBg }}>
                    <button
                      type="button"
                      onClick={() => setChapterViewMode('edit')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${chapterViewMode === 'edit' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'}`}
                      style={{
                        background: chapterViewMode === 'edit' ? currentBtnSecondaryBg : 'transparent',
                        color: currentText,
                      }}
                    >
                      Soạn thảo
                    </button>
                    <button
                      type="button"
                      onClick={() => setChapterViewMode('preview')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${chapterViewMode === 'preview' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'}`}
                      style={{
                        background: chapterViewMode === 'preview' ? currentBtnSecondaryBg : 'transparent',
                        color: currentText,
                      }}
                    >
                      <Eye className="w-3 h-3 text-pink-400" />
                      <span>Xem trước</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSpecialFrameModal(true)}
                    className="px-2.5 py-1 rounded border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
                    style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                  >
                    <Frame className="w-3.5 h-3.5" />
                    <span>Trình tạo khung</span>
                  </button>
                </div>
              </div>

              {/* Chapter Content -> DIRECT INLINE TEXTAREA OR LIVE RENDERED PREVIEW */}
              {chapterViewMode === 'edit' ? (
                <div className={`space-y-4 relative ${customBodyFont}`} style={{ color: currentText, fontSize: bodyFontSize || '16px' }}>
                  <textarea
                    ref={chapterTextareaRef}
                    rows={16}
                    value={chapterContentInput}
                    onChange={(e) => {
                      setChapterContentInput(e.target.value);
                      handleChapterTextSelect();
                    }}
                    onSelect={handleChapterTextSelect}
                    onKeyUp={handleChapterTextSelect}
                    onMouseUp={handleChapterTextSelect}
                    onTouchEnd={handleChapterTextSelect}
                    placeholder="Dán hoặc gõ nội dung chương vào đây... Bạn có thể bôi đen bất kỳ đoạn văn bản nào để tạo khung đặc biệt trực tiếp."
                    className={`chapter-live-textarea w-full min-h-[500px] bg-transparent focus:outline-none resize-y leading-relaxed border-none p-2 sm:p-4 ${customBodyFont}`}
                    style={{ color: currentText, fontSize: bodyFontSize || '16px' }}
                  />

                  {/* Floating Selection Toolbar for Highlighted text */}
                  <FloatingSelectionMenu
                    visible={floatingMenuVisible}
                    position={floatingMenuPos}
                    selectedText={selectedRange.text}
                    onApplyPreset={handleApplyPresetToSelection}
                    onOpenDesigner={handleOpenDesignerForSelection}
                    themeColors={{
                      bg: currentBg,
                      cardBg: currentCardBg,
                      border: currentBorder,
                      btnBg: currentBtnBg,
                      btnText: currentBtnText,
                      btnSecondaryBg: currentBtnSecondaryBg,
                      btnBorder: currentBtnBorder,
                      text: currentText,
                      textMuted: currentTextMuted,
                      accentColor: currentBtnBg,
                    }}
                  />
                </div>
              ) : (
                /* LIVE PREVIEW OF CHAPTER WITH ALL SPECIAL FRAMES RENDERED */
                <div className={`space-y-5 leading-relaxed min-h-[500px] p-2 sm:p-4 ${customBodyFont}`} style={{ color: currentText, fontSize: bodyFontSize || '16px' }}>
                  {parseChapterContentBlocks(chapterContentInput).length > 0 ? (
                    parseChapterContentBlocks(chapterContentInput).map((block, bIdx) => (
                      <div key={bIdx} className="transition-all">
                        {block.type === 'paragraph' ? (
                          <p className="leading-relaxed whitespace-pre-line">{block.rawText}</p>
                        ) : (
                          <SpecialBlockRenderer
                            block={block}
                            themeColors={{
                              bg: currentBg,
                              cardBg: currentCardBg,
                              border: currentBorder,
                              btnBg: currentBtnBg,
                              btnText: currentBtnText,
                              btnSecondaryBg: currentBtnSecondaryBg,
                              btnBorder: currentBtnBorder,
                              text: currentText,
                              textMuted: currentTextMuted,
                              accentColor: activePreset?.accentColor || currentText,
                            }}
                            fontFamily={customBodyFont}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`py-16 text-center text-xs opacity-50 ${customMutedFont}`}>
                      (Chưa có nội dung chữ trong chương này để xem trước)
                    </div>
                  )}
                </div>
              )}
            </article>

            {/* CONFIGURATION & SETTINGS PANEL */}
            <div className={`p-5 sm:p-6 rounded border space-y-5 text-xs shadow-md ${customBodyFont}`} style={{ background: currentCardBg, borderColor: currentBorder }}>
              {/* Lock & Pass Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderColor: currentBorder }}>
                {/* Lock Chucu */}
                <div className="p-3.5 rounded border space-y-3" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  <label className="flex items-center gap-2 font-bold cursor-pointer" style={{ color: currentText }}>
                    <input
                      type="checkbox"
                      checked={isChapterLockedInput}
                      onChange={(e) => setIsChapterLockedInput(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Khóa chương bằng Chucu</span>
                  </label>
                  {isChapterLockedInput && (
                    <div className="space-y-1 pl-6">
                      <label className="block text-[11px]" style={{ color: currentTextMuted }}>Số Chucu để mở khóa chương:</label>
                      <input
                        type="number"
                        min={1}
                        value={chapterUnlockPriceInput}
                        onChange={(e) => setChapterUnlockPriceInput(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded border focus:outline-none font-bold text-amber-400 text-sm"
                        style={{ background: currentCardBg, borderColor: currentBorder }}
                      />
                    </div>
                  )}
                </div>

                {/* Password Protection */}
                <div className="p-3.5 rounded border space-y-3" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                  <label className="flex items-center gap-2 font-bold cursor-pointer" style={{ color: currentText }}>
                    <input
                      type="checkbox"
                      checked={isChapterPasswordProtectedInput}
                      onChange={(e) => setIsChapterPasswordProtectedInput(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <Key className="w-4 h-4 text-rose-500" />
                    <span>Đặt mật khẩu (Pass) cho chương</span>
                  </label>
                  {isChapterPasswordProtectedInput && (
                    <div className="space-y-2 pl-6">
                      <div>
                        <label className="block text-[11px]" style={{ color: currentTextMuted }}>Mật khẩu mở chương *:</label>
                        <input
                          type="text"
                          value={chapterPasswordInput}
                          onChange={(e) => setChapterPasswordInput(e.target.value)}
                          placeholder="Nhập mật khẩu..."
                          className="w-full px-3 py-1.5 rounded border focus:outline-none font-bold text-rose-400 text-sm"
                          style={{ background: currentCardBg, borderColor: currentBorder }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px]" style={{ color: currentTextMuted }}>Gợi ý mật khẩu (Tùy chọn):</label>
                        <input
                          type="text"
                          value={chapterPasswordHintInput}
                          onChange={(e) => setChapterPasswordHintInput(e.target.value)}
                          placeholder="VD: Ngày sinh tác giả"
                          className="w-full px-3 py-1.5 rounded border focus:outline-none text-xs"
                          style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Separate Chapter Theme & Effects Toggle */}
              <div className="pt-3 border-t space-y-3" style={{ borderColor: currentBorder }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer" style={{ color: currentText }}>
                    <input
                      type="checkbox"
                      checked={useSeparateChapterTheme}
                      onChange={(e) => {
                        setUseSeparateChapterTheme(e.target.checked);
                        setUseSeparateChapterEffect(e.target.checked);
                      }}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <Palette className="w-4 h-4 text-emerald-500" />
                    <span>Thiết kế giao diện & hiệu ứng riêng cho chương này (Des giao diện)</span>
                  </label>
                  {useSeparateChapterTheme && (
                    <button
                      type="button"
                      onClick={() => setActiveDrawerTab(activeDrawerTab ? null : 'theme')}
                      className="px-3 py-1 text-[11px] font-bold rounded border hover:opacity-90 transition cursor-pointer"
                      style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                    >
                      Mở bảng Des giao diện chương
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Actions inside Chapter Editor */}
              <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: currentBorder }}>
                <button
                  type="button"
                  onClick={() => setEditingChapterItem(null)}
                  className="px-4 py-2 rounded border hover:opacity-80 transition cursor-pointer"
                  style={{ borderColor: currentBorder, color: currentTextMuted }}
                >
                  ← Trở về trang truyện
                </button>
                <button
                  type="button"
                  onClick={handleSaveChapterItem}
                  className="px-6 py-2 font-bold uppercase rounded border shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
                  style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu chương</span>
                </button>
              </div>
            </div>
          </div>
        ) : editorMainView === 'preview' ? (
          <div className="space-y-4">
            {/* Banner hướng dẫn chế độ Xem trước & Đính Element */}
            <div
              className="p-3 rounded border flex items-center justify-between gap-3 text-xs font-mono shadow-sm"
              style={{
                background: currentBtnSecondaryBg,
                borderColor: currentBtnBorder,
                color: currentText,
              }}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-pink-400 shrink-0" />
                <span>
                  <strong>Chế độ Xem trước 1:1:</strong> Trang truyện hiển thị chuẩn xác 100% như độc giả xem. Thêm hoặc kéo thả element tại đây sẽ giữ đúng vị trí tuyệt đối khi lưu!
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab('elements')}
                  className="px-2.5 py-1 text-xs font-bold uppercase rounded border flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                  style={{
                    background: currentBtnBg,
                    borderColor: currentBtnBorder,
                    color: currentBtnText,
                  }}
                >
                  <Sticker className="w-3.5 h-3.5" />
                  <span>Bảng Element</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMainView('edit')}
                  className="px-2.5 py-1 text-xs font-bold uppercase rounded border hover:opacity-80 transition cursor-pointer"
                  style={{
                    borderColor: currentBorder,
                    color: currentText,
                  }}
                >
                  ← Soạn thảo
                </button>
              </div>
            </div>

            {/* PREVIEW ARTICLE 1:1 - EXACTLY MATCHES StoryDetail.tsx */}
            <article
              ref={previewArticleRef as any}
              id="live-editor-preview-story-article"
              className={`p-6 space-y-6 relative overflow-visible transition-all duration-200 shadow-xl rounded ${customBodyFont}`}
              style={{
                background: currentCardBg,
                ...getStoryBorderStyle(currentBorderObj, currentBorder),
              }}
            >
              {/* Corner Accents */}
              <StoryCornerAccents
                accent={activeBCorner}
                borderStyle={currentBorderObj?.borderStyle}
                color={currentBorder}
              />

              {/* Story Decorative Elements Layer - Interactive in Preview Mode for Precise Placement! */}
              <StoryElementsLayer
                elements={storyElements}
                isEditable={true}
                onUpdateElements={setStoryElements}
                selectedElementId={selectedStoryElementId}
                onSelectElement={setSelectedStoryElementId}
                containerRef={previewArticleRef}
                themeColors={{
                  bg: currentBg,
                  cardBg: currentCardBg,
                  border: currentBorder,
                  btnBg: currentBtnBg,
                  btnText: currentBtnText,
                  btnSecondaryBg: currentBtnSecondaryBg,
                  btnBorder: currentBtnBorder,
                  text: currentText,
                  textMuted: currentTextMuted,
                  accentColor: currentBorder,
                }}
              />

              {/* Story Layout Container - Exact Component as StoryDetail */}
              <StoryLayoutContainer
                story={previewStoryObject}
                chapters={storyChapters}
                lastReadChapter={null}
                lastReadProgress={null}
                firstChapter={storyChapters[0] || null}
                isBookmarked={false}
                onToggleBookmark={() => {}}
                onSelectChapter={(chap) => {
                  handleOpenEditChapterItem(chap);
                }}
                getChapterStatus={(chap) => ({
                  isUnlocked: true,
                  isPassUnlocked: true,
                  isAuthorOrOwner: true,
                  isReading: false,
                })}
                customStyles={customPreviewStyles}
                isCustomTheme={true}
                tone={{
                  cardBg: '',
                  text: '',
                  textMuted: '',
                  border: '',
                  buttonBgPrimary: '',
                  buttonBorderPrimary: '',
                  inputBg: '',
                }}
                storyTitleFont={customTitleFont}
                storySubtitleFont={customSubtitleFont}
                storyBodyFont={customBodyFont}
                storyMutedFont={customMutedFont}
                storyBtnFont={customBtnFont}
                activeBorderColor={currentBorder}
                activeBtnBorderColor={currentBtnBorder}
                activeBtnBgColor={currentBtnBg}
                cardBgColor={currentCardBg}
                storyBorderObj={currentBorderObj}
                comments={[]}
                commentText=""
                setCommentText={() => {}}
                handleCommentSubmit={(e) => e.preventDefault()}
                setLightboxImages={setPreviewLightboxImages}
                setLightboxCurrentIndex={setPreviewLightboxCurrentIndex}
                isStripPaused={previewStripPaused}
                setIsStripPaused={setPreviewStripPaused}
                isSynopsisExpanded={previewSynopsisExpanded}
                setIsSynopsisExpanded={setPreviewSynopsisExpanded}
                searchChapterQuery={previewSearchChapterQuery}
                setSearchChapterQuery={setPreviewSearchChapterQuery}
                selectedVolumeFilter={previewSelectedVolumeFilter}
                setSelectedVolumeFilter={setPreviewSelectedVolumeFilter}
                expandedVolumes={previewExpandedVolumes}
                toggleVolume={togglePreviewVolume}
                editorAvatarUrl={editorPhoto}
                editorDisplayName={editorName}
                currentUserUid={currentUser?.uid}
                isEditor={true}
              />
            </article>
          </div>
        ) : (
          <LiveStoryEditorView
            isPlacingElements={activeDrawerTab === 'elements'}
            storyLayoutSections={storyLayoutSections}
            currentCardBg={currentCardBg}
            currentBtnBg={currentBtnBg}
            currentBtnBorder={currentBtnBorder}
            currentBtnText={currentBtnText}
            currentBtnSecondaryBg={currentBtnSecondaryBg}
            currentBorder={currentBorder}
            currentText={currentText}
            currentTextMuted={currentTextMuted}
            currentBorderObj={currentBorderObj}
            borderRadius={borderRadius}
            activeBCorner={activeBCorner}
            customTitleFont={customTitleFont}
            customSubtitleFont={customSubtitleFont}
            customChapterTitleFont={customChapterTitleFont}
            customBodyFont={customBodyFont}
            customMutedFont={customMutedFont}
            customBtnFont={customBtnFont}
            titleFontSize={titleFontSize}
            bodyFontSize={bodyFontSize}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            setTempCoverUrl={setTempCoverUrl}
            setShowCoverUrlModal={setShowCoverUrlModal}
            isCompressingCover={isCompressingCover}
            coverFileInputRef={coverFileInputRef}
            title={title}
            setTitle={setTitle}
            author={author}
            setAuthor={setAuthor}
            synopsis={synopsis}
            setSynopsis={setSynopsis}
            initialStory={initialStory}
            editorAvatarUrl={editorPhoto}
            setEditorAvatarUrl={setEditorPhoto}
            editorName={editorName}
            setEditorName={setEditorName}
            isCompressingAvatar={isCompressingAvatar}
            avatarFileInputRef={avatarFileInputRef}
            tags={tags}
            newTagInput={newTagInput}
            setNewTagInput={setNewTagInput}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            showCharacterWidget={showCharacterWidget}
            setShowCharacterWidget={setShowCharacterWidget}
            characterWidgetTitle={characterWidgetTitle}
            setCharacterWidgetTitle={setCharacterWidgetTitle}
            characterAvatarShape={characterAvatarShape}
            setCharacterAvatarShape={setCharacterAvatarShape}
            characters={characters}
            handleOpenAddChar={handleOpenAddChar}
            handleOpenEditChar={handleOpenEditChar}
            handleDeleteChar={handleDeleteChar}
            setActiveDrawerTab={setActiveDrawerTab}
            showProgressWidget={showProgressWidget}
            setShowProgressWidget={setShowProgressWidget}
            progressTitle={progressWidgetTitle}
            setProgressTitle={setProgressWidgetTitle}
            progressTotalChapters={totalPlannedChapters}
            setProgressTotalChapters={setTotalPlannedChapters}
            storyChapters={storyChapters}
            showCustomWidget={showCustomWidget}
            setShowCustomWidget={setShowCustomWidget}
            customWidgetTitle={customWidgetTitle}
            setCustomWidgetTitle={setCustomWidgetTitle}
            customWidgetContent={customWidgetContent}
            setCustomWidgetContent={setCustomWidgetContent}
            showGalleryWidget={showGalleryWidget}
            setShowGalleryWidget={setShowGalleryWidget}
            galleryWidgetTitle={galleryWidgetTitle}
            setGalleryWidgetTitle={setGalleryWidgetTitle}
            galleryMode={galleryMode}
            setGalleryMode={setGalleryMode}
            gallerySingleImageUrl={gallerySingleImageUrl}
            setGallerySingleImageUrl={setGallerySingleImageUrl}
            gallerySingleImageCaption={gallerySingleImageCaption}
            setGallerySingleImageCaption={setGallerySingleImageCaption}
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
            galleryImageSize={galleryImageSize}
            setGalleryImageSize={setGalleryImageSize}
            galleryAutoScrollSpeed={galleryAutoScrollSpeed}
            setGalleryAutoScrollSpeed={setGalleryAutoScrollSpeed}
            gallerySingleFileInputRef={gallerySingleFileInputRef}
            galleryAlbumFileInputRef={galleryAlbumFileInputRef}
            isCompressingGalleryImg={isCompressingGalleryImg}
            handleCompressGallerySingle={handleCompressGallerySingle}
            handleCompressGalleryAlbum={handleCompressGalleryAlbum}
            chapterListStyle={chapterListStyle}
            setChapterListStyle={setChapterListStyle}
            storyElements={storyElements}
            setStoryElements={setStoryElements}
            selectedStoryElementId={selectedStoryElementId}
            setSelectedStoryElementId={setSelectedStoryElementId}
            handleOpenCreateNewChapter={handleOpenCreateNewChapter}
            setIsBulkUploading={setIsBulkUploading}
            handleOpenEditChapterItem={handleOpenEditChapterItem}
            setChapterToDeleteItem={setChapterToDeleteItem}
            handleMoveChapter={handleMoveChapter}
            getStoryBorderStyle={getStoryBorderStyle}
          />
      )}

        {/* BOTTOM FLOATING SAVE BAR */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t font-mono" style={{ borderColor: currentBorder }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs rounded border hover:opacity-80 transition"
            style={{
              borderColor: currentBorder,
              color: currentTextMuted,
            }}
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded border shadow-lg hover:opacity-90 active:scale-95 transition flex items-center gap-2"
            style={{
              background: currentBtnBg,
              borderColor: currentBtnBorder,
              color: currentBtnText,
            }}
          >
            <Check className="w-4 h-4" />
            <span>{initialStory ? 'Cập nhật truyện' : 'Hoàn tất & Đăng truyện'}</span>
          </button>
        </div>
      </main>

      {/* BULK CHAPTER UPLOAD MODAL */}
      {isBulkUploading && (
        <BulkChapterModal
          story={{
            id: workingStoryId,
            title: title || 'Truyện mới',
            author: author,
            coverUrl: coverUrl,
            synopsis: synopsis,
            tags: tags,
            viewsCount: initialStory?.viewsCount || 0,
            createdAt: initialStory?.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          }}
          existingChapters={chapters || []}
          onClose={() => setIsBulkUploading(false)}
          onSaveBatch={async (importedChapters) => {
            if (onSaveBatchChapters && importedChapters.length > 0) {
              await onSaveBatchChapters(importedChapters);
            }
            setIsBulkUploading(false);
          }}
        />
      )}

      {/* DELETE CHAPTER CONFIRMATION MODAL */}
      {chapterToDeleteItem && (
        <div className="fixed inset-[#0000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div
            className="w-full max-w-sm p-5 rounded-lg border space-y-4 shadow-xl font-mono"
            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">Xác nhận xóa chương</h3>
            <p className="text-xs">
              Bạn có chắc chắn muốn xóa chương <strong className="underline">{chapterToDeleteItem.title || `Chương ${chapterToDeleteItem.chapterNumber}`}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChapterToDeleteItem(null)}
                className="px-3 py-1.5 text-xs rounded border hover:opacity-80 cursor-pointer"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteChapter && chapterToDeleteItem) {
                    onDeleteChapter(
                      chapterToDeleteItem.id,
                      chapterToDeleteItem.storyId || workingStoryId || initialStory?.id || ''
                    );
                  }
                  if (editingChapterItem?.id === chapterToDeleteItem.id) {
                    setEditingChapterItem(null);
                  }
                  setChapterToDeleteItem(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECIAL FRAME INSERT MODAL */}
      {showSpecialFrameModal && (
        <SpecialFrameInsertModal
          isOpen={showSpecialFrameModal}
          onClose={() => setShowSpecialFrameModal(false)}
          onInsertCode={handleInsertFrameSnippet}
          initialContent={modalInitialContent}
          initialType={modalInitialType}
          themeColors={{
            bg: currentBg,
            cardBg: currentCardBg,
            border: currentBorder,
            btnBg: currentBtnBg,
            btnText: currentBtnText,
            btnSecondaryBg: currentBtnSecondaryBg,
            btnBorder: currentBtnBorder,
            text: currentText,
            textMuted: currentTextMuted,
            accentColor: currentBtnBg,
          }}
        />
      )}

      {/* THEME DETAILS MODAL */}
      {showThemeModal && editingThemeItem && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md p-5 rounded-xl border space-y-4 shadow-2xl font-mono text-xs max-h-[85vh] overflow-y-auto"
            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: currentBorder }}>
              <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa Thông tin Theme</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowThemeModal(false);
                  setEditingThemeItem(null);
                }}
                className="p-1 hover:bg-black/20 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold mb-1 opacity-80" style={{ color: currentTextMuted }}>
                  Tên Theme *
                </label>
                <input
                  type="text"
                  value={themeModalName}
                  onChange={(e) => setThemeModalName(e.target.value)}
                  placeholder="Ví dụ: Theme Giáng Sinh, Theme Sepia Hoài Cổ..."
                  className="w-full px-2.5 py-1.5 rounded border focus:ring-1 focus:ring-amber-400 text-xs"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1 opacity-80" style={{ color: currentTextMuted }}>
                  Mô tả ngắn Theme
                </label>
                <input
                  type="text"
                  value={themeModalDesc}
                  onChange={(e) => setThemeModalDesc(e.target.value)}
                  placeholder="Ví dụ: Phong cách cổ điển với tone giấy vàng..."
                  className="w-full px-2.5 py-1.5 rounded border focus:ring-1 focus:ring-amber-400 text-xs"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1 opacity-80" style={{ color: currentTextMuted }}>
                  Ảnh bìa riêng cho Theme này
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={themeModalCover}
                    onChange={(e) => setThemeModalCover(e.target.value)}
                    placeholder="Dán URL ảnh bìa hoặc dùng bìa chính..."
                    className="w-full px-2.5 py-1.5 rounded border text-xs"
                    style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                  />
                  {themeModalCover && (
                    <button
                      type="button"
                      onClick={() => setThemeModalCover('')}
                      className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] shrink-0 cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>
                {themeModalCover && (
                  <div className="mt-2 w-16 h-24 rounded border overflow-hidden shrink-0">
                    <img src={themeModalCover} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1 opacity-80" style={{ color: currentTextMuted }}>
                  Lời tựa / Tóm tắt riêng cho Theme này
                </label>
                <textarea
                  rows={3}
                  value={themeModalSynopsis}
                  onChange={(e) => setThemeModalSynopsis(e.target.value)}
                  placeholder="Nếu để trống sẽ sử dụng lời tựa mặc định của bộ truyện..."
                  className="w-full px-2.5 py-1.5 rounded border text-xs"
                  style={{ background: currentBg, borderColor: currentBorder, color: currentText }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: currentBorder }}>
              <button
                type="button"
                onClick={() => {
                  setShowThemeModal(false);
                  setEditingThemeItem(null);
                }}
                className="px-3 py-1.5 rounded border hover:opacity-80 cursor-pointer"
                style={{ borderColor: currentBorder, color: currentTextMuted }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveThemeModal}
                className="px-4 py-1.5 rounded font-bold transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
              >
                Lưu Thay Đổi Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
