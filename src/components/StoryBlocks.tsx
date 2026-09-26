import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Story, Chapter, Comment, StoryLayoutBlockId, StoryLayoutSection, StoryLayoutSectionType, StoryLayoutColumnRatio } from '../types';
import { EmojiPickerButton, CommentReactions, FormattedCommentContent, QuickEmojiBar, ReactionSummary } from './CustomEmoji';
import {
  Bookmark,
  BookOpen,
  Send,
  MessageSquare,
  Lock,
  Key,
  CheckCircle2,
  User,
  RotateCcw,
  BookmarkCheck,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Trash2,
  List,
  Folder,
  GitCommit,
  Table,
  Columns2,
  Tag,
  LayoutList,
  Clock,
  FileText,
  Image as ImageIcon,
  Images,
  ZoomIn,
  Play,
  Pause,
  Hash,
} from 'lucide-react';
import { getStoryBorderStyle, getStoryButtonBorderStyle } from '../lib/borderStyles';
import { ProtectedStoryText } from './ProtectedStoryText';

export const DEFAULT_STORY_LAYOUT_SECTIONS: StoryLayoutSection[] = [
  {
    id: 'sec-header',
    type: '2_columns',
    title: 'Phần 1: Thông tin đầu truyện',
    columnRatio: 'left_fixed',
    leftBlocks: ['cover', 'editor_info', 'action_buttons', 'tags', 'character_widget'],
    rightBlocks: ['title', 'meta', 'synopsis', 'progress_widget', 'custom_widget', 'gallery_widget'],
  },
  {
    id: 'sec-chapters',
    type: '1_column',
    title: 'Phần 2: Danh sách chương',
    blocks: ['chapter_list'],
  },
  {
    id: 'sec-comments',
    type: '1_column',
    title: 'Phần 3: Bình luận',
    blocks: ['comments'],
  },
];

export function normalizeStorySections(story?: Partial<Story>): StoryLayoutSection[] {
  if (story?.storyLayoutSections && Array.isArray(story.storyLayoutSections) && story.storyLayoutSections.length > 0) {
    return story.storyLayoutSections;
  }
  // Tương thích ngược với các trường cũ nếu có
  if (story?.storyLayoutLeft || story?.storyLayoutRight || story?.storyLayoutBottom) {
    const left = story.storyLayoutLeft || [];
    const right = story.storyLayoutRight || [];
    const bottom = story.storyLayoutBottom || [];
    const sections: StoryLayoutSection[] = [];
    if (left.length > 0 || right.length > 0) {
      sections.push({
        id: 'sec-header',
        type: '2_columns',
        title: 'Phần 1: Thông tin đầu truyện',
        columnRatio: 'left_fixed',
        leftBlocks: left,
        rightBlocks: right,
      });
    }
    if (bottom.length > 0) {
      sections.push({
        id: 'sec-bottom',
        type: '1_column',
        title: 'Phần 2: Danh sách & Bình luận',
        blocks: bottom,
      });
    }
    if (sections.length > 0) return sections;
  }
  return DEFAULT_STORY_LAYOUT_SECTIONS;
}

export interface StoryBlockRendererProps {
  blockId: StoryLayoutBlockId;
  story: Story;
  chapters: Chapter[];
  lastReadChapter: Chapter | null;
  lastReadProgress: any;
  firstChapter: Chapter | null;
  isBookmarked: boolean;
  onToggleBookmark: (storyId: string) => void;
  onSelectChapter: (chapter: Chapter) => void;
  getChapterStatus: (chap: Chapter) => {
    isUnlocked: boolean;
    isPassUnlocked: boolean;
    isAuthorOrOwner: boolean;
    isReading: boolean;
  };
  customStyles: any;
  isCustomTheme: boolean;
  tone: any;
  storyTitleFont: string;
  storySubtitleFont: string;
  storyBodyFont: string;
  storyMutedFont: string;
  storyBtnFont: string;
  activeBorderColor: string;
  activeBtnBorderColor: string;
  activeBtnBgColor: string;
  cardBgColor: string;
  storyBorderObj: any;
  comments: Comment[];
  commentText: string;
  setCommentText: (val: string) => void;
  handleCommentSubmit: (e: React.FormEvent) => void;
  setLightboxImages: (imgs: any) => void;
  setLightboxCurrentIndex: (idx: number) => void;
  isStripPaused: boolean;
  setIsStripPaused: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSynopsisExpanded: boolean;
  setIsSynopsisExpanded: (val: boolean) => void;
  searchChapterQuery: string;
  setSearchChapterQuery: (val: string) => void;
  selectedVolumeFilter: string | null;
  setSelectedVolumeFilter: (val: string | null) => void;
  expandedVolumes: Record<string, boolean>;
  toggleVolume: (vol: string) => void;
  editorAvatarUrl?: string;
  editorDisplayName: string;
  onToggleCommentReaction?: (commentId: string, emojiId: string) => void;
  currentUserUid?: string;
  onAddComment?: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onDeleteComment?: (commentId: string) => void;
  isEditor?: boolean;
}

const AutoScrollAlbum = ({
  albumImages,
  story,
  widgetTitle,
  autoScrollSpeed,
  imageSize,
  isCustomTheme,
  tone,
  activeBorderColor,
  storyBodyFont,
  customStyles,
  setLightboxImages,
  setLightboxCurrentIndex,
}: any) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const length = albumImages.length;

  const activeSpeed = autoScrollSpeed || story?.galleryAutoScrollSpeed || 'normal';
  const activeSize = imageSize !== undefined ? imageSize : (story?.galleryImageSize || 100);
  const activeTitle = widgetTitle !== undefined ? widgetTitle : story?.galleryWidgetTitle;

  React.useEffect(() => {
    if (length > 0 && currentIndex >= length) {
      setCurrentIndex(0);
    }
  }, [length, currentIndex]);

  React.useEffect(() => {
    if (length <= 1 || isHovered) return;

    let delay = 3000;
    if (activeSpeed === 'slow') delay = 5000;
    if (activeSpeed === 'fast') delay = 1500;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length);
    }, delay);

    return () => clearInterval(interval);
  }, [length, isHovered, activeSpeed]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const currentHeight = activeSize ? (activeSize * 1.9) : 192;

  if (length === 0) return null;

  return (
    <div 
      className="w-full flex flex-col my-3 space-y-2 select-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {activeTitle && activeTitle !== 'Album' && activeTitle !== 'Hình ảnh & Album' && (
        <div className="flex items-center justify-between opacity-90 mb-1">
          <div className="flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            <span className={`text-xs font-bold uppercase tracking-wider ${storyBodyFont}`} style={customStyles.text}>
              {activeTitle}
            </span>
          </div>
          {length > 1 && (
            <span className="text-[10px] opacity-75 font-mono" style={customStyles.text}>
              {currentIndex + 1} / {length}
            </span>
          )}
        </div>
      )}

      <div className="relative w-full flex items-center justify-center overflow-visible" style={{ height: `${currentHeight + 20}px` }}>
        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
          {albumImages.map((img: any, i: number) => {
            // Tính toán khoảng cách tương đối (diff) cho vòng lặp vòng tròn
            let diff = (i - currentIndex + length) % length;
            if (diff > length / 2) {
              diff -= length;
            }

            // Chỉ hiển thị các ảnh nằm trong phạm vi [-2, 2] để tạo hiệu ứng 3D chiều sâu
            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            let xTranslation = 0;
            let scaleValue = 0.5;
            let opacityValue = 0;
            let zIndexValue = 0;

            if (diff === 0) {
              xTranslation = 0;
              scaleValue = 1.0;
              opacityValue = 1;
              zIndexValue = 20;
            } else if (diff === -1) {
              xTranslation = -130;
              scaleValue = 0.75;
              opacityValue = 0.6;
              zIndexValue = 10;
            } else if (diff === 1) {
              xTranslation = 130;
              scaleValue = 0.75;
              opacityValue = 0.6;
              zIndexValue = 10;
            } else if (diff === -2) {
              xTranslation = -220;
              scaleValue = 0.55;
              opacityValue = 0.2;
              zIndexValue = 5;
            } else if (diff === 2) {
              xTranslation = 220;
              scaleValue = 0.55;
              opacityValue = 0.2;
              zIndexValue = 5;
            }

            // Điều chỉnh khoảng dịch chuyển trên màn hình nhỏ/điện thoại
            if (typeof window !== 'undefined' && window.innerWidth < 640) {
              if (diff === -1) xTranslation = -70;
              if (diff === 1) xTranslation = 70;
              if (diff === -2) xTranslation = -120;
              if (diff === 2) xTranslation = 120;
            }

            return (
              <motion.div
                key={`${img.id}-${i}`}
                className={`absolute cursor-pointer origin-center transition-colors duration-300 flex flex-col items-center justify-center ${
                  diff === 0 ? 'drop-shadow-lg' : 'hover:opacity-90'
                }`}
                style={{
                  zIndex: zIndexValue,
                  width: '65%',
                  maxWidth: '300px',
                  height: `${currentHeight}px`,
                }}
                animate={{
                  x: xTranslation,
                  scale: scaleValue,
                  opacity: opacityValue,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 26,
                }}
                onClick={() => {
                  if (diff === 0) {
                    setLightboxImages(albumImages);
                    setLightboxCurrentIndex(i);
                  } else {
                    setCurrentIndex(i);
                  }
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img
                    src={img.url}
                    alt={img.caption || `Ảnh ${i + 1}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bullet Indicators */}
      {length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {albumImages.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all rounded-full cursor-pointer ${
                idx === currentIndex ? 'w-4' : 'w-1.5 opacity-40 hover:opacity-70'
              }`}
              style={{
                backgroundColor: idx === currentIndex 
                  ? (isCustomTheme && story.customBtnBgColor ? story.customBtnBgColor : '#c89666')
                  : (isCustomTheme && story.customTextColor ? story.customTextColor : '#a1887f')
              }}
              title={`Ảnh ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface StoryChapterListRendererProps {
  story: Story;
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  getChapterStatus: (chap: Chapter) => {
    isUnlocked: boolean;
    isPassUnlocked: boolean;
    isAuthorOrOwner: boolean;
    isReading: boolean;
  };
  customStyles: any;
  isCustomTheme: boolean;
  tone: any;
  storyBodyFont: string;
  storySubtitleFont: string;
  storyMutedFont: string;
  storyBtnFont: string;
  activeBorderColor: string;
  activeBtnBgColor: string;
  lastReadProgress?: any;
}

const StoryChapterListRenderer: React.FC<StoryChapterListRendererProps> = ({
  story,
  chapters,
  onSelectChapter,
  getChapterStatus,
  customStyles,
  isCustomTheme,
  tone,
  storyBodyFont,
  storySubtitleFont,
  storyMutedFont,
  storyBtnFont,
  activeBorderColor,
  activeBtnBgColor,
  lastReadProgress,
}) => {
  const [collapsedVolumes, setCollapsedVolumes] = useState<Record<string, boolean>>({});
  const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const style = story.chapterListStyle || 'standard';
  const cardBgColor = isCustomTheme ? (story.customCardBgColor || story.customBgColor) : (customStyles.card?.background || tone.cardBg || '#ffffff');
  const activeBtnBorderColor = isCustomTheme ? story.customBorderColor : (tone.buttonBorderPrimary || activeBorderColor);

  if (chapters.length === 0) {
    return (
      <div className="p-6 text-center text-xs opacity-75" style={customStyles.textMuted}>
        Chưa có chương nào được đăng tải.
      </div>
    );
  }

  const renderBadgeStatus = (chap: Chapter) => {
    const { isUnlocked, isPassUnlocked, isAuthorOrOwner, isReading } = getChapterStatus(chap);
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {isReading && (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.2 border text-[10px] font-semibold ${storyBtnFont}`}
            style={{
              backgroundColor: `${activeBtnBgColor}1a`,
              borderColor: `${activeBtnBgColor}33`,
              color: activeBtnBgColor,
            }}
          >
            <BookmarkCheck className="w-3 h-3 opacity-80" />
            <span>Đang đọc ({lastReadProgress?.progressPercent || 0}%)</span>
          </span>
        )}
        {chap.isLocked && (
          isUnlocked && !isAuthorOrOwner ? (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 border text-[10px] font-semibold ${storyBtnFont}`}
              style={{
                backgroundColor: isCustomTheme ? story.customCardBgColor : cardBgColor,
                borderColor: activeBorderColor,
                color: customStyles.text.color,
              }}
            >
              <CheckCircle2 className="w-3 h-3 opacity-80" />
              <span>Đã mở</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 border text-[10px] font-semibold shadow-xs ${storyBtnFont}`}
              style={{
                backgroundColor: isCustomTheme ? (story.customBtnBgColor || story.customCardBgColor) : activeBtnBgColor,
                borderColor: isCustomTheme ? story.customBorderColor : activeBtnBorderColor,
                color: isCustomTheme ? (story.customBtnTextColor || story.customTextColor) : customStyles.btnPrimary.color,
              }}
            >
              <Lock className="w-3 h-3" style={{ color: isCustomTheme ? (story.customBtnTextColor || story.customTextColor) : customStyles.btnPrimary.color }} />
              <span>{chap.unlockPrice || 1} C</span>
            </span>
          )
        )}
        {chap.isPasswordProtected && (
          isPassUnlocked && !isAuthorOrOwner ? (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 border text-[10px] font-semibold ${storyBtnFont}`}
              style={{
                backgroundColor: isCustomTheme ? story.customCardBgColor : cardBgColor,
                borderColor: activeBorderColor,
                color: customStyles.text.color,
              }}
            >
              <CheckCircle2 className="w-3 h-3 opacity-80" />
              <span>Mở Pass</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 border text-[10px] font-semibold shadow-xs ${storyBtnFont}`}
              style={{
                backgroundColor: isCustomTheme ? (story.customBtnBgColor || story.customCardBgColor) : activeBtnBgColor,
                borderColor: isCustomTheme ? story.customBorderColor : activeBtnBorderColor,
                color: isCustomTheme ? (story.customBtnTextColor || story.customTextColor) : customStyles.btnPrimary.color,
              }}
            >
              <Key className="w-3 h-3" style={{ color: isCustomTheme ? (story.customBtnTextColor || story.customTextColor) : customStyles.btnPrimary.color }} />
              <span>Pass</span>
            </span>
          )
        )}
      </div>
    );
  };

  // 1. GRID
  if (style === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {sorted.map((chap) => (
          <div
            key={chap.id}
            onClick={() => onSelectChapter(chap)}
            className={`p-3 rounded border flex flex-col justify-between gap-2 hover:opacity-90 transition cursor-pointer ${isCustomTheme ? '' : `${tone.inputBg}`}`}
            style={{
              ...(isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor } : {}),
              borderColor: activeBorderColor,
            }}
          >
            <div className="min-w-0">
              {chap.volumeTitle && (
                <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-70 truncate mb-0.5 ${storyMutedFont}`} style={customStyles.textMuted}>
                  {chap.volumeTitle}
                </span>
              )}
              <span className={`font-bold text-xs line-clamp-2 ${storyBodyFont}`} style={customStyles.text}>
                {chap.title || `Chương ${chap.chapterNumber}`}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-dashed" style={{ borderColor: `${activeBorderColor}60` }}>
              <span className={`text-[10px] font-mono opacity-65 ${storyMutedFont}`} style={customStyles.textMuted}>
                {(chap.content || '').match(/\S+/g)?.length || 0} từ
              </span>
              {renderBadgeStatus(chap)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. ACCORDION
  if (style === 'accordion') {
    const groupedByVolume: { volume: string; list: Chapter[] }[] = [];
    const unassigned: Chapter[] = [];
    sorted.forEach((c) => {
      if (c.volumeTitle) {
        let group = groupedByVolume.find((g) => g.volume === c.volumeTitle);
        if (!group) {
          group = { volume: c.volumeTitle, list: [] };
          groupedByVolume.push(group);
        }
        group.list.push(c);
      } else {
        unassigned.push(c);
      }
    });
    if (unassigned.length > 0) {
      groupedByVolume.push({ volume: 'Chương chưa phân quyển', list: unassigned });
    }

    return (
      <div className="space-y-3">
        {groupedByVolume.map((grp, gIdx) => {
          const isCollapsed = !!collapsedVolumes[grp.volume];
          return (
            <div
              key={gIdx}
              className="rounded border overflow-hidden transition"
              style={{
                borderColor: activeBorderColor,
                background: isCustomTheme ? (story.customBtnSecondaryBgColor || story.customCardBgColor) : undefined,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsedVolumes((prev) => ({
                    ...prev,
                    [grp.volume]: !prev[grp.volume],
                  }))
                }
                className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left font-bold text-xs transition cursor-pointer select-none"
                style={{
                  background: isCustomTheme ? (story.customBtnBgColor || story.customCardBgColor) : activeBtnBgColor,
                  color: isCustomTheme ? (story.customBtnTextColor || story.customTextColor) : customStyles.btnPrimary.color,
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate uppercase tracking-wider">{grp.volume}</span>
                  <span className="text-[10px] font-mono opacity-80 font-normal">
                    ({grp.list.length} chương)
                  </span>
                </div>
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {!isCollapsed && (
                <div className="p-2 space-y-1.5" style={{ background: isCustomTheme ? story.customCardBgColor : undefined }}>
                  {grp.list.map((chap, cIdx) => (
                    <div
                      key={chap.id}
                      onClick={() => onSelectChapter(chap)}
                      className={`p-2.5 rounded border text-xs flex items-center justify-between gap-2 hover:opacity-90 transition cursor-pointer ${isCustomTheme ? '' : `${tone.inputBg}`}`}
                      style={{
                        ...(isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor } : {}),
                        borderColor: `${activeBorderColor}70`,
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 opacity-75"
                          style={{ background: `${activeBorderColor}40`, color: customStyles.text.color }}
                        >
                          {cIdx + 1}
                        </span>
                        <span className={`font-bold text-xs truncate ${storyBodyFont}`} style={customStyles.text}>
                          {chap.title || `Chương ${chap.chapterNumber}`}
                        </span>
                      </div>
                      {renderBadgeStatus(chap)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 3. TIMELINE
  if (style === 'timeline') {
    return (
      <div className="relative pl-6 sm:pl-8 space-y-3.5 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-current before:opacity-30" style={{ color: activeBorderColor }}>
        {sorted.map((chap) => (
          <div key={chap.id} className="relative group">
            <div
              className="absolute -left-6 sm:-left-8 top-3 w-3 h-3 rounded-full border-2 transform -translate-x-1/2 transition-transform group-hover:scale-125 shadow-xs"
              style={{
                background: isCustomTheme ? (story.customBtnBgColor || activeBorderColor) : activeBtnBgColor,
                borderColor: isCustomTheme ? story.customCardBgColor : cardBgColor,
              }}
            />
            <div
              onClick={() => onSelectChapter(chap)}
              className={`p-3 rounded border text-xs flex items-center justify-between gap-3 hover:opacity-90 transition cursor-pointer ${isCustomTheme ? '' : `${tone.inputBg}`}`}
              style={{
                ...(isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor } : {}),
                borderColor: activeBorderColor,
              }}
            >
              <div className="flex-1 min-w-0">
                {chap.volumeTitle && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-75 ${storyMutedFont}`} style={customStyles.textMuted}>
                    {chap.volumeTitle}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs truncate ${storyBodyFont}`} style={customStyles.text}>
                    {chap.title || `Chương ${chap.chapterNumber}`}
                  </span>
                  {renderBadgeStatus(chap)}
                </div>
                <div className={`text-[10px] font-mono opacity-65 flex items-center gap-2 mt-0.5 ${storyMutedFont}`} style={customStyles.textMuted}>
                  <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
                  <span>•</span>
                  <span>{chap.updatedAt || chap.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 4. MINIMAL_TABLE
  if (style === 'minimal_table') {
    return (
      <div className="border rounded overflow-hidden" style={{ borderColor: activeBorderColor }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b text-[10px] font-mono uppercase font-bold" style={{ background: `${activeBorderColor}25`, borderColor: activeBorderColor, color: customStyles.textMuted.color }}>
              <th className="p-2.5 w-12 text-center">#</th>
              <th className="p-2.5">Tên chương</th>
              <th className="p-2.5 w-24 hidden sm:table-cell text-center">Số từ</th>
              <th className="p-2.5 w-32 hidden md:table-cell">Ngày đăng</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: `${activeBorderColor}40` }}>
            {sorted.map((chap, idx) => (
              <tr
                key={chap.id}
                onClick={() => onSelectChapter(chap)}
                className={`hover:opacity-85 transition cursor-pointer ${isCustomTheme ? '' : `${tone.inputBg}`}`}
                style={{ background: isCustomTheme ? (idx % 2 === 0 ? story.customCardBgColor : story.customBtnSecondaryBgColor) : undefined }}
              >
                <td className="p-2.5 text-center font-mono font-bold opacity-70" style={customStyles.textMuted}>
                  {idx + 1}
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${storyBodyFont}`} style={customStyles.text}>
                      {chap.title || `Chương ${chap.chapterNumber}`}
                    </span>
                    {renderBadgeStatus(chap)}
                  </div>
                  {chap.volumeTitle && (
                    <span className={`text-[9px] uppercase tracking-wider opacity-60 block ${storyMutedFont}`} style={customStyles.textMuted}>
                      {chap.volumeTitle}
                    </span>
                  )}
                </td>
                <td className="p-2.5 text-center font-mono text-[11px] opacity-75 hidden sm:table-cell" style={customStyles.textMuted}>
                  {(chap.content || '').match(/\S+/g)?.length || 0}
                </td>
                <td className="p-2.5 text-[11px] font-mono opacity-70 hidden md:table-cell" style={customStyles.textMuted}>
                  {chap.updatedAt || chap.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 5. BOOK_CATALOG
  if (style === 'book_catalog') {
    return (
      <div
        className={`p-4 sm:p-6 rounded border space-y-2.5 ${storyBodyFont}`}
        style={{
          borderColor: activeBorderColor,
          background: isCustomTheme ? (story.customBtnSecondaryBgColor || story.customCardBgColor) : undefined,
        }}
      >
        <div className="text-center pb-2 border-b border-dashed mb-4" style={{ borderColor: activeBorderColor }}>
          <span className={`text-xs font-bold uppercase tracking-widest ${storySubtitleFont || storyBodyFont}`} style={customStyles.text}>
            MỤC LỤC
          </span>
        </div>
        {sorted.map((chap) => (
          <div
            key={chap.id}
            onClick={() => onSelectChapter(chap)}
            className="flex items-baseline justify-between gap-2 hover:opacity-85 transition cursor-pointer py-1"
          >
            <div className="flex items-center gap-2 min-w-0 shrink-0 max-w-[70%]">
              <span className={`font-bold text-xs ${storyBodyFont}`} style={customStyles.text}>
                {chap.title || `Chương ${chap.chapterNumber}`}
              </span>
              {renderBadgeStatus(chap)}
            </div>
            <div className="flex-1 border-b border-dotted min-w-[20px] mx-1 opacity-50" style={{ borderColor: customStyles.textMuted.color }} />
            <div className={`flex items-center gap-2 shrink-0 font-mono text-[10px] opacity-75 ${storyMutedFont}`} style={customStyles.textMuted}>
              <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 6. SCROLL_STRIP
  if (style === 'scroll_strip') {
    return (
      <div className="flex flex-wrap gap-2">
        {sorted.map((chap) => (
          <div
            key={chap.id}
            onClick={() => onSelectChapter(chap)}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 hover:opacity-85 transition cursor-pointer shadow-xs ${isCustomTheme ? '' : `${tone.inputBg}`}`}
            style={{
              ...(isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor } : {}),
              borderColor: activeBorderColor,
              color: customStyles.text.color,
            }}
          >
            <Tag className="w-3 h-3 opacity-60" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{chap.title || `C.${chap.chapterNumber}`}</span>
            {renderBadgeStatus(chap)}
          </div>
        ))}
      </div>
    );
  }

  // 7. CARDS_BENTO
  if (style === 'cards_bento') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((chap, idx) => {
          const isFeatured = idx === 0 || idx % 5 === 0;
          return (
            <div
              key={chap.id}
              onClick={() => onSelectChapter(chap)}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 hover:opacity-90 transition cursor-pointer shadow-xs ${
                isFeatured ? 'sm:col-span-2' : ''
              } ${isCustomTheme ? '' : `${tone.inputBg}`}`}
              style={{
                background: isFeatured
                  ? (isCustomTheme && story.customBtnBgColor ? `${story.customBtnBgColor}18` : `${activeBtnBgColor}15`)
                  : (isCustomTheme ? (story.customBtnSecondaryBgColor || story.customCardBgColor) : undefined),
                borderColor: isFeatured ? (isCustomTheme && story.customBtnBgColor ? story.customBtnBgColor : activeBtnBgColor) : activeBorderColor,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: isCustomTheme ? (story.customBtnBgColor || activeBtnBgColor) : activeBtnBgColor,
                      color: isCustomTheme ? (story.customBtnTextColor || story.customTextColor) : customStyles.btnPrimary.color,
                    }}
                  >
                    #{idx + 1}
                  </span>
                  {renderBadgeStatus(chap)}
                </div>
                <span className={`font-bold text-xs sm:text-sm line-clamp-2 ${storyBodyFont}`} style={customStyles.text}>
                  {chap.title || `Chương ${chap.chapterNumber}`}
                </span>
                {chap.volumeTitle && (
                  <span className={`text-[10px] uppercase font-bold opacity-60 block mt-1 ${storyMutedFont}`} style={customStyles.textMuted}>
                    {chap.volumeTitle}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed" style={{ borderColor: `${activeBorderColor}60` }}>
                <span className={`text-[10px] font-mono opacity-70 ${storyMutedFont}`} style={customStyles.textMuted}>
                  {(chap.content || '').match(/\S+/g)?.length || 0} từ • {chap.updatedAt || chap.createdAt}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 8. MODERN_COMPACT
  if (style === 'modern_compact') {
    return (
      <div className="space-y-2">
        {sorted.map((chap, idx) => (
          <div
            key={chap.id}
            onClick={() => onSelectChapter(chap)}
            className={`p-3 rounded-lg border text-xs flex items-center gap-3 hover:opacity-90 transition cursor-pointer shadow-xs ${isCustomTheme ? '' : `${tone.inputBg}`}`}
            style={{
              ...(isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor } : {}),
              borderColor: activeBorderColor,
            }}
          >
            <div
              className="w-10 h-10 rounded flex items-center justify-center font-mono font-black text-sm shrink-0 border"
              style={{
                background: isCustomTheme && story.customBtnBgColor ? `${story.customBtnBgColor}20` : `${activeBtnBgColor}20`,
                borderColor: isCustomTheme && story.customBtnBgColor ? story.customBtnBgColor : activeBtnBgColor,
                color: customStyles.text.color,
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              {chap.volumeTitle && (
                <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-70 ${storyMutedFont}`} style={customStyles.textMuted}>
                  {chap.volumeTitle}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className={`font-bold text-xs truncate ${storyBodyFont}`} style={customStyles.text}>
                  {chap.title || `Chương ${chap.chapterNumber}`}
                </span>
                {renderBadgeStatus(chap)}
              </div>
              <span className={`text-[10px] font-mono opacity-65 block mt-0.5 ${storyMutedFont}`} style={customStyles.textMuted}>
                {(chap.content || '').match(/\S+/g)?.length || 0} từ • {chap.updatedAt || chap.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 9. NUMBERS_ONLY
  if (style === 'numbers_only') {
    return (
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {sorted.map((chap, idx) => (
          <div
            key={chap.id}
            onClick={() => onSelectChapter(chap)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border font-bold text-xs sm:text-sm flex items-center justify-center relative hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs group ${storyBodyFont} ${isCustomTheme ? '' : `${tone.inputBg}`}`}
            style={{
              ...(isCustomTheme ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor } : {}),
              borderColor: activeBorderColor,
              color: customStyles.text.color,
            }}
            title={chap.title || `Chương ${chap.chapterNumber}`}
          >
            <span>{idx + 1}</span>
            {chap.isLocked && (
              <span className="absolute -top-1 -right-1 bg-amber-500/90 text-white rounded-full p-0.5 shadow-xs">
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 10. STANDARD
  return (
    <div className="space-y-2">
      {sorted.map((chap, idx) => {
        const prevChap = idx > 0 ? sorted[idx - 1] : null;
        const isNewVolume = !!(chap.volumeTitle && (!prevChap || prevChap.volumeTitle !== chap.volumeTitle));
        const isTransitionToNoVolume = !chap.volumeTitle && !!(prevChap && prevChap.volumeTitle);

        return (
          <React.Fragment key={chap.id}>
            {isNewVolume && (
              <div className="pt-3 pb-1">
                <div
                  className={`px-3.5 py-2 flex items-center justify-between border font-bold text-xs uppercase tracking-wider rounded-xs select-none shadow-xs ${storySubtitleFont}`}
                  style={{
                    background: isCustomTheme
                      ? (story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor)
                      : undefined,
                    borderColor: activeBorderColor,
                    color: customStyles.text.color,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 opacity-80" />
                    <span className={storySubtitleFont}>{chap.volumeTitle}</span>
                  </div>
                  <span className={`text-[10px] font-normal font-mono ${storyMutedFont}`} style={customStyles.textMuted}>
                    {(sorted || []).filter((c) => c && c.volumeTitle === chap.volumeTitle).length} chương
                  </span>
                </div>
              </div>
            )}

            {isTransitionToNoVolume && (
              <div className="pt-3 pb-1">
                <div
                  className="px-3 py-1.5 flex items-center gap-2 border border-dashed text-xs opacity-75 rounded-xs"
                  style={{
                    borderColor: activeBorderColor,
                    color: customStyles.textMuted.color,
                  }}
                >
                  <BookOpen className="w-3 h-3 opacity-60" />
                  <span className={`text-[11px] uppercase tracking-wider font-semibold ${storyMutedFont}`}>Các chương tiếp theo</span>
                </div>
              </div>
            )}

            <div
              onClick={() => onSelectChapter(chap)}
              className={`p-3 text-xs flex items-center justify-between cursor-pointer transition ${isCustomTheme ? '' : `${tone.inputBg}`}`}
              style={{
                ...(isCustomTheme
                  ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
                  : {}),
                ...getStoryBorderStyle(
                  {
                    borderStyle: 'solid',
                    borderWidth: 'thin',
                    borderRadius: story.borderRadius,
                    borderGlow: 'none',
                  },
                  activeBorderColor
                ),
              }}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`font-bold ${storyBodyFont} ${story.bodyFontSize ? '' : 'text-sm'}`}
                  style={{
                    ...customStyles.text,
                    ...(story.bodyFontSize ? { fontSize: story.bodyFontSize } : {}),
                  }}
                >
                  {chap.title}
                </span>
                {renderBadgeStatus(chap)}
              </div>
              <span className={`text-xs ${storyMutedFont}`} style={customStyles.textMuted}>{chap.createdAt}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const StoryBlockRenderer: React.FC<StoryBlockRendererProps> = (props) => {
  const {
    blockId,
    story,
    chapters,
    lastReadChapter,
    lastReadProgress,
    firstChapter,
    isBookmarked,
    onToggleBookmark,
    onSelectChapter,
    getChapterStatus,
    customStyles,
    isCustomTheme,
    tone,
    storyTitleFont,
    storySubtitleFont,
    storyBodyFont,
    storyMutedFont,
    storyBtnFont,
    activeBorderColor,
    activeBtnBorderColor,
    activeBtnBgColor,
    cardBgColor,
    storyBorderObj,
    comments,
    commentText,
    setCommentText,
    handleCommentSubmit,
    setLightboxImages,
    setLightboxCurrentIndex,
    isStripPaused,
    setIsStripPaused,
    isSynopsisExpanded,
    setIsSynopsisExpanded,
    searchChapterQuery,
    setSearchChapterQuery,
    selectedVolumeFilter,
    setSelectedVolumeFilter,
    expandedVolumes,
    toggleVolume,
    editorAvatarUrl,
    editorDisplayName,
    currentUserUid,
    onToggleCommentReaction,
    onAddComment,
    onDeleteComment,
    isEditor,
  } = props;

  // 1. COVER BLOCK
  if (blockId === 'cover') {
    if (!story.coverUrl) return null;
    return (
      <div
        key="cover"
        className="w-full aspect-[3/4] max-w-[220px] mx-auto overflow-hidden flex justify-center items-center relative shrink-0"
        style={{
          background: isCustomTheme
            ? (story.customBtnSecondaryBgColor || story.customBgColor)
            : (customStyles.btnSecondary.background || cardBgColor),
          ...getStoryBorderStyle(
            {
              borderStyle: 'solid',
              borderWidth: 'thin',
              borderRadius: story.borderRadius,
              borderGlow: 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <img
          src={story.coverUrl}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2. EDITOR INFO BLOCK
  if (blockId === 'editor_info') {
    return (
      <div
        key="editor_info"
        className={`p-2.5 flex items-center gap-2.5 ${isCustomTheme ? '' : `${tone.inputBg}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: 'solid',
              borderWidth: 'thin',
              borderRadius: story.borderRadius,
              borderGlow: 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <div
          className="w-8 h-8 rounded-full border overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: cardBgColor, borderColor: activeBorderColor }}
        >
          {editorAvatarUrl ? (
            <img
              src={editorAvatarUrl}
              alt={editorDisplayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 opacity-70" style={customStyles.textMuted} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className={`text-[10px] uppercase font-bold tracking-wider block leading-tight opacity-75 ${storyMutedFont}`} style={customStyles.textMuted}>
            Editor:
          </span>
          <span className={`text-xs font-bold truncate block leading-tight ${storyBtnFont}`} style={customStyles.text}>
            {editorDisplayName}
          </span>
        </div>
      </div>
    );
  }

  // 3. ACTION BUTTONS BLOCK
  if (blockId === 'action_buttons') {
    return (
      <div key="action_buttons" className="space-y-2">
        {lastReadChapter ? (
          <>
            <button
              onClick={() => onSelectChapter(lastReadChapter)}
              className={`w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgPrimary}`}`}
              style={{
                background: activeBtnBgColor,
                color: customStyles.btnPrimary.color,
                ...getStoryButtonBorderStyle(
                  {
                    borderStyle: story.borderStyle,
                    borderRadius: story.borderRadius,
                  },
                  activeBtnBorderColor
                ),
              }}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Đọc tiếp (Ch. {lastReadChapter.chapterNumber}{lastReadProgress?.progressPercent !== undefined ? ` - ${lastReadProgress.progressPercent}%` : ''})</span>
            </button>

            {firstChapter && firstChapter.id !== lastReadChapter.id && (
              <button
                onClick={() => onSelectChapter(firstChapter)}
                className={`w-full py-1.5 px-3 text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgSecondary}`}`}
                style={{
                  background: isCustomTheme
                    ? (story.customBtnSecondaryBgColor || story.customCardBgColor)
                    : customStyles.btnSecondary.background,
                  color: customStyles.btnSecondary.color,
                  ...getStoryButtonBorderStyle(
                    {
                      borderStyle: story.borderStyle,
                      borderRadius: story.borderRadius,
                    },
                    activeBorderColor
                  ),
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Đọc từ đầu</span>
              </button>
            )}
          </>
        ) : (
          firstChapter && (
            <button
              onClick={() => onSelectChapter(firstChapter)}
              className={`w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs ${storyBtnFont} ${isCustomTheme ? '' : `${tone.buttonBgPrimary}`}`}
              style={{
                background: activeBtnBgColor,
                color: customStyles.btnPrimary.color,
                ...getStoryButtonBorderStyle(
                  {
                    borderStyle: story.borderStyle,
                    borderRadius: story.borderRadius,
                  },
                  activeBtnBorderColor
                ),
              }}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Đọc từ đầu</span>
            </button>
          )
        )}

        <button
          onClick={() => onToggleBookmark(story.id)}
          className={`w-full py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${storyBtnFont} ${
            isCustomTheme
              ? ''
              : `${tone.buttonBgSecondary}`
          }`}
          style={{
            background: isCustomTheme
              ? (story.customBtnSecondaryBgColor || story.customCardBgColor)
              : customStyles.btnSecondary.background,
            color: isBookmarked ? (story.customBorderColor || activeBorderColor) : customStyles.btnSecondary.color,
            ...getStoryButtonBorderStyle(
              {
                borderStyle: story.borderStyle,
                borderRadius: story.borderRadius,
              },
              activeBorderColor
            ),
          }}
        >
          <Bookmark className={`w-4 h-4 shrink-0 transition-all ${isBookmarked ? 'fill-current' : ''}`} />
          <span>{isBookmarked ? 'Đã lưu truyện' : 'Lưu truyện'}</span>
        </button>
      </div>
    );
  }

  // 4. TAGS BLOCK
  if (blockId === 'tags') {
    if (!story?.tags || story.tags.length === 0) return null;
    return (
      <div key="tags" className="flex flex-wrap gap-1.5 pt-1">
        {story.tags.map((tag, idx) => (
          <span
            key={idx}
            className={`text-[10px] px-2 py-0.5 leading-tight ${storyBtnFont}`}
            style={{
              background: isCustomTheme
                ? (story.customBtnSecondaryBgColor || story.customBgColor)
                : (customStyles.btnSecondary.background || cardBgColor),
              color: customStyles.textMuted.color,
              ...getStoryBorderStyle(
                {
                  borderStyle: 'solid',
                  borderWidth: 'thin',
                  borderRadius: story.borderRadius,
                  borderGlow: 'none',
                },
                activeBorderColor
              ),
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  }

  // 5. CHARACTER WIDGET BLOCK
  if (blockId === 'character_widget') {
    if (!story?.showCharacterWidget || !story.characters || story.characters.length === 0) return null;
    return (
      <div
        key="character_widget"
        className={`p-3 space-y-2.5 rounded transition ${isCustomTheme ? '' : `${tone.buttonBgPrimary}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <div className="flex items-center gap-1.5 border-b pb-1.5 opacity-90" style={{ borderColor: activeBorderColor }}>
          <Users className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
          <span className={`text-xs font-bold uppercase tracking-wider ${storySubtitleFont}`} style={customStyles.text}>
            {story.characterWidgetTitle || 'Thông tin nhân vật'}
          </span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
          {story.characters.map((char) => {
            const effectiveShape = char.avatarShape || story.characterAvatarShape || 'circle';
            let shapeClass = 'w-9 h-9 rounded-full aspect-square';
            if (effectiveShape === 'square') shapeClass = 'w-10 h-10 rounded-md aspect-square';
            else if (effectiveShape === 'portrait_34') shapeClass = 'w-12 h-16 rounded-md aspect-[3/4]';
            else if (effectiveShape === 'portrait_23') shapeClass = 'w-12 h-18 rounded-md aspect-[2/3]';
            else if (effectiveShape === 'landscape_43') shapeClass = 'w-16 h-12 rounded-md aspect-[4/3]';
            else if (effectiveShape === 'landscape_169') shapeClass = 'w-20 h-11 rounded-md aspect-[16/9]';

            return (
              <div key={char.id} className="flex items-start gap-2 text-xs">
                <div
                  className={`${shapeClass} border shrink-0 overflow-hidden flex items-center justify-center bg-black/20`}
                  style={{ borderColor: activeBorderColor }}
                >
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 opacity-60" style={customStyles.text} />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold ${storyBodyFont}`} style={customStyles.text}>
                      {char.name}
                    </span>
                    {char.role && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${storyBtnFont}`}
                        style={{
                          background: isCustomTheme ? (story.customBtnSecondaryBgColor || story.customBorderColor || 'rgba(0,0,0,0.2)') : `${activeBorderColor}30`,
                          color: customStyles.text.color,
                        }}
                      >
                        {char.role}
                      </span>
                    )}
                  </div>
                  {char.description && (
                    <p className={`text-[11px] leading-relaxed opacity-80 ${storyMutedFont}`} style={customStyles.textMuted}>
                      {char.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 6. TITLE BLOCK
  if (blockId === 'title') {
    return (
      <h1
        key="title"
        className={`font-bold tracking-[0.02em] ${storyTitleFont} ${story.titleFontSize ? '' : 'text-lg sm:text-2xl'}`}
        style={{
          ...customStyles.text,
          ...(story.titleFontSize ? { fontSize: story.titleFontSize } : {}),
        }}
      >
        {story.title}
      </h1>
    );
  }

  // 7. META BLOCK (Tác giả, Ngày đăng, Lượt xem)
  if (blockId === 'meta') {
    return (
      <div
        key="meta"
        className={`text-xs space-y-1 border-b pb-3 ${storyMutedFont}`}
        style={{ borderColor: activeBorderColor, color: customStyles.textMuted.color }}
      >
        <p>Tác giả: <span className="font-semibold" style={customStyles.text}>{story.author}</span></p>
        <p>Ngày đăng: <span>{story.createdAt}</span></p>
        <p>Lượt xem: <span>{story.viewsCount}</span></p>
      </div>
    );
  }

  // 8. SYNOPSIS BLOCK
  if (blockId === 'synopsis') {
    return (
      <div key="synopsis" className="space-y-2">
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${storySubtitleFont}`} style={customStyles.textMuted}>Giới thiệu:</h4>
        {story.synopsis ? (
          <div className="space-y-2">
            <div
              className={`space-y-3 relative transition-all duration-300 ${
                !isSynopsisExpanded ? 'max-h-none sm:max-h-80 overflow-visible sm:overflow-hidden' : ''
              }`}
            >
              {story.synopsis
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((para, idx) => (
                  <p
                    key={idx}
                    className={`leading-relaxed opacity-90 text-justify ${story.bodyFontSize ? '' : 'text-sm'}`}
                    style={{
                      ...customStyles.text,
                      ...(story.bodyFontSize ? { fontSize: story.bodyFontSize } : {}),
                    }}
                  >
                    <ProtectedStoryText text={para} />
                  </p>
                ))}

              {!isSynopsisExpanded && story.synopsis.length > 250 && (
                <div
                  className="hidden sm:block absolute bottom-0 inset-x-0 h-16 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${cardBgColor} 15%, transparent 100%)`,
                  }}
                />
              )}
            </div>

            {story.synopsis.length > 250 && (
              <button
                type="button"
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                className="hidden sm:inline-block text-xs font-bold underline hover:opacity-80 transition cursor-pointer pt-0.5"
                style={customStyles.textMuted}
              >
                {isSynopsisExpanded ? 'Thu gọn' : 'Xem thêm...'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs italic" style={customStyles.textMuted}>Chưa có phần giới thiệu.</p>
        )}
      </div>
    );
  }

  // 9. PROGRESS WIDGET BLOCK
  if (blockId === 'progress_widget') {
    if (!story?.showProgressWidget) return null;
    return (
      <div
        key="progress_widget"
        className={`p-3 space-y-2 rounded transition border ${isCustomTheme ? '' : `${tone.buttonBgPrimary}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-90">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            <span className={`text-xs font-bold uppercase tracking-wider ${storySubtitleFont}`} style={customStyles.text}>
              {(!story.progressWidgetTitle || story.progressWidgetTitle === 'Tiến độ bộ truyện') ? 'Tiến độ' : story.progressWidgetTitle}
            </span>
          </div>
          <span className={`text-xs font-bold font-mono ${storyBtnFont}`} style={customStyles.text}>
            {story.totalPlannedChapters && story.totalPlannedChapters > 0
              ? `${Math.min(100, Math.round((chapters.length / story.totalPlannedChapters) * 100))}%`
              : '0%'}
          </span>
        </div>

        <div
          className="w-full h-2.5 rounded-full overflow-hidden bg-black/20 border"
          style={{ borderColor: activeBorderColor }}
        >
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${story.totalPlannedChapters && story.totalPlannedChapters > 0
                ? Math.min(100, Math.round((chapters.length / story.totalPlannedChapters) * 100))
                : 0}%`,
              background: isCustomTheme ? (story.customBtnSecondaryBgColor || story.customBorderColor) : activeBtnBgColor,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] opacity-90" style={customStyles.textMuted}>
          <span></span>
          <span className="font-mono">
            <strong style={customStyles.text}>{chapters.length}</strong>/{story.totalPlannedChapters || '—'} chương
          </span>
        </div>
      </div>
    );
  }

  // 10. CUSTOM CONTENT WIDGET BLOCK
  if (blockId === 'custom_widget') {
    if (!story?.showCustomWidget || (!story.customWidgetTitle && !story.customWidgetContent)) return null;
    return (
      <div
        key="custom_widget"
        className={`p-3 space-y-2 rounded transition border ${isCustomTheme ? '' : `${tone.buttonBgPrimary}`}`}
        style={{
          ...(isCustomTheme
            ? { background: story.customBtnBgColor || story.customCardBgColor || story.customBgColor }
            : {}),
          ...getStoryBorderStyle(
            {
              borderStyle: story.borderStyle || 'solid',
              borderWidth: story.borderWidth || 'thin',
              borderRadius: story.borderRadius || 'xs',
              borderCornerAccent: story.borderCornerAccent || 'none',
              borderGlow: story.borderGlow || 'none',
            },
            activeBorderColor
          ),
        }}
      >
        {story.customWidgetTitle && (
          <div className="flex items-center gap-1.5 opacity-90 border-b pb-1.5" style={{ borderColor: activeBorderColor }}>
            <FileText className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
            <span className={`text-xs font-bold uppercase tracking-wider ${storySubtitleFont}`} style={customStyles.text}>
              {story.customWidgetTitle}
            </span>
          </div>
        )}
        {story.customWidgetContent && (
          <div
            className={`text-xs leading-relaxed opacity-90 whitespace-pre-wrap ${storyBodyFont}`}
            style={customStyles.text}
          >
            {story.customWidgetContent}
          </div>
        )}
      </div>
    );
  }

  // 11. GALLERY WIDGET BLOCK (Hỗ trợ thêm nhiều widget ảnh / album tùy ý)
  if (blockId === 'gallery_widget' || blockId.startsWith('gallery_widget:') || blockId.startsWith('gallery_widget_')) {
    const renderGalleryItem = (widget: any, widgetKey: string) => {
      if (widget.enabled === false) return null;
      const isSingle = widget.mode === 'single' || (!widget.images || widget.images.length === 0);
      const singleUrl = widget.singleImageUrl || (widget.images && widget.images[0]?.url);
      const albumImages = (widget.images && widget.images.length > 0)
        ? widget.images
        : (singleUrl ? [{ id: `${widget.id || 'single'}_img_0`, url: singleUrl, caption: widget.singleImageCaption }] : []);

      if (isSingle && !singleUrl) return null;
      if (!isSingle && albumImages.length === 0) return null;

      if (isSingle) {
        return (
          <div key={widgetKey} className="w-full flex flex-col items-center justify-center my-3">
            {widget.title && widget.title !== 'Album' && widget.title !== 'Hình ảnh & Album' && (
              <div className="w-full flex items-center justify-between opacity-90 mb-2">
                <div className="flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5 shrink-0" style={customStyles.text} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${storyBodyFont}`} style={customStyles.text}>
                    {widget.title}
                  </span>
                </div>
              </div>
            )}
            <div
              className="group relative cursor-pointer flex items-center justify-center w-full"
              onClick={() => {
                setLightboxImages([{ url: singleUrl!, caption: widget.singleImageCaption }]);
                setLightboxCurrentIndex(0);
              }}
            >
              <img
                src={singleUrl}
                alt={widget.singleImageCaption || widget.title || 'Story image'}
                className="h-auto object-contain transition duration-300 group-hover:opacity-90 rounded"
                style={{ width: `${widget.imageSize || 100}%`, maxWidth: '100%' }}
                loading="lazy"
              />
            </div>
            {widget.singleImageCaption && (
              <p className={`mt-2 text-[11px] italic text-center opacity-85 ${storyMutedFont}`} style={customStyles.textMuted}>
                {widget.singleImageCaption}
              </p>
            )}
          </div>
        );
      }

      return (
        <AutoScrollAlbum
          key={widgetKey}
          albumImages={albumImages}
          story={story}
          widgetTitle={widget.title}
          autoScrollSpeed={widget.autoScrollSpeed}
          imageSize={widget.imageSize}
          isCustomTheme={isCustomTheme}
          tone={tone}
          activeBorderColor={activeBorderColor}
          storyBodyFont={storyBodyFont}
          customStyles={customStyles}
          setLightboxImages={setLightboxImages}
          setLightboxCurrentIndex={setLightboxCurrentIndex}
        />
      );
    };

    // Nếu câu chuyện có danh sách nhiều galleryWidgets
    if (story?.galleryWidgets && story.galleryWidgets.length > 0) {
      if (blockId.startsWith('gallery_widget:') || blockId.startsWith('gallery_widget_')) {
        const targetId = blockId.replace('gallery_widget:', '').replace('gallery_widget_', '');
        const targetWidget = story.galleryWidgets.find(
          (w: any) => w.id === targetId || `gallery_widget:${w.id}` === blockId || `gallery_widget_${w.id}` === blockId
        );
        if (targetWidget) {
          return renderGalleryItem(targetWidget, blockId);
        }
      }

      // Nếu là block chung 'gallery_widget'
      return (
        <React.Fragment key={blockId}>
          {story.galleryWidgets.map((w: any, idx: number) => renderGalleryItem(w, `gw_${w.id || idx}`))}
        </React.Fragment>
      );
    }

    // Tương thích ngược với cấu hình widget đơn trước đây
    if (!story?.showGalleryWidget) return null;
    const isSingle = story.galleryMode === 'single' || (!story.galleryImages || story.galleryImages.length === 0);
    const singleUrl = story.gallerySingleImageUrl || (story.galleryImages && story.galleryImages[0]?.url);
    const albumImages = (story.galleryImages && story.galleryImages.length > 0)
      ? story.galleryImages
      : (singleUrl ? [{ id: 'single_img_0', url: singleUrl, caption: story.gallerySingleImageCaption }] : []);

    if (isSingle && !singleUrl) return null;
    if (!isSingle && albumImages.length === 0) return null;

    return renderGalleryItem(
      {
        id: 'legacy_gallery',
        title: story.galleryWidgetTitle,
        mode: story.galleryMode || 'single',
        singleImageUrl: singleUrl,
        singleImageCaption: story.gallerySingleImageCaption,
        images: albumImages,
        autoScrollSpeed: story.galleryAutoScrollSpeed,
        imageSize: story.galleryImageSize,
        enabled: story.showGalleryWidget,
      },
      'gallery_widget'
    );
  }

  // 12. CHAPTER LIST BLOCK
  if (blockId === 'chapter_list') {
    return (
      <div
        key="chapter_list"
        className="space-y-3 pt-4 border-t"
        style={customStyles.border}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storySubtitleFont}`} style={customStyles.text}>
            <BookOpen className="w-4 h-4 opacity-80" />
            <span>Danh sách chương ({chapters.length})</span>
          </h3>
        </div>

        <StoryChapterListRenderer
          story={story}
          chapters={chapters}
          onSelectChapter={onSelectChapter}
          getChapterStatus={getChapterStatus}
          customStyles={customStyles}
          isCustomTheme={isCustomTheme}
          tone={tone}
          storyBodyFont={storyBodyFont}
          storySubtitleFont={storySubtitleFont}
          storyMutedFont={storyMutedFont}
          storyBtnFont={storyBtnFont}
          activeBorderColor={activeBorderColor}
          activeBtnBgColor={activeBtnBgColor}
          lastReadProgress={lastReadProgress}
        />
      </div>
    );
  }

  // 13. COMMENTS BLOCK
  if (blockId === 'comments') {
    const rawComments = comments || [];
    const storyComments = rawComments.filter(
      (cm) => cm && 
        cm.content !== '__story_reactions__' && 
        cm.content !== '__paragraph_reactions__' && 
        cm.content !== '__chapter_reactions__'
    );

    return (
      <div
        key="comments"
        className="space-y-4 pt-6 border-t"
        style={customStyles.border}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className={`text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${storySubtitleFont}`} style={customStyles.text}>
            <MessageSquare className="w-4 h-4 opacity-85" style={customStyles.textMuted} />
            <span>Bình luận ({storyComments.length})</span>
          </h3>
        </div>

        <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className={`flex-1 border p-2 text-xs focus:outline-none placeholder:text-current placeholder:opacity-50 ${storyBodyFont}`}
            style={{
              background: customStyles.btnSecondary.background || cardBgColor,
              borderColor: activeBorderColor,
              color: customStyles.text.color,
            }}
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className={`px-4 py-2 border disabled:opacity-40 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${storyBtnFont}`}
            style={{
              background: activeBtnBgColor,
              borderColor: activeBtnBorderColor,
              color: customStyles.btnPrimary.color,
            }}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>

        <div className="space-y-2">
          {storyComments.map((cm) => (
            <div
              key={cm.id}
              className="border p-3 space-y-1"
              style={{
                background: customStyles.btnSecondary.background || cardBgColor,
                borderColor: activeBorderColor,
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${storyBtnFont}`} style={customStyles.text}>{cm.userName}</span>
                  {(isEditor || (currentUserUid && currentUserUid === cm.userUid)) && onDeleteComment && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
                          onDeleteComment(cm.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-500 p-0.5 rounded transition"
                      title="Xóa bình luận"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className={storyMutedFont} style={customStyles.textMuted}>{cm.createdAt}</span>
              </div>
              <p className={`text-xs opacity-90 ${storyBodyFont}`} style={customStyles.text}>
                <FormattedCommentContent content={cm.content} />
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const MOBILE_BLOCK_PRIORITY: Record<string, number> = {
  cover: 1,
  title: 2,
  meta: 3,
  action_buttons: 4,
  editor_info: 5,
  synopsis: 6,
  tags: 7,
  character_widget: 8,
  progress_widget: 9,
  gallery_widget: 10,
  custom_widget: 11,
  chapter_list: 12,
  comments: 13,
};

export const getSortedMobileBlocks = (blocks: StoryLayoutBlockId[]) => {
  return [...blocks].sort((a, b) => {
    const prioA = MOBILE_BLOCK_PRIORITY[a] ?? 99;
    const prioB = MOBILE_BLOCK_PRIORITY[b] ?? 99;
    return prioA - prioB;
  });
};

export const StoryLayoutContainer: React.FC<Omit<StoryBlockRendererProps, 'blockId'>> = (props) => {
  const { story } = props;
  const sections = normalizeStorySections(story);

  return (
    <div className="space-y-6 w-full">
      {sections.map((sec, secIdx) => {
        if (sec.type === '1_column') {
          const blocks = sec.blocks || [];
          if (blocks.length === 0) return null;
          const mobileBlocks = getSortedMobileBlocks(blocks);

          return (
            <div key={sec.id || `sec-1col-${secIdx}`} className="w-full">
              {/* Hiển thị 1 cột trên điện thoại */}
              <div className="flex sm:hidden flex-col gap-4 w-full">
                {mobileBlocks.map((blockId) => (
                  <StoryBlockRenderer key={`m-${blockId}`} blockId={blockId} {...props} />
                ))}
              </div>
              {/* Hiển thị trên máy tính */}
              <div className="hidden sm:flex flex-col gap-4 w-full">
                {blocks.map((blockId) => (
                  <StoryBlockRenderer key={`d-${blockId}`} blockId={blockId} {...props} />
                ))}
              </div>
            </div>
          );
        }

        // 2_columns
        const leftBlocks = sec.leftBlocks || [];
        const rightBlocks = sec.rightBlocks || [];
        if (leftBlocks.length === 0 && rightBlocks.length === 0) return null;

        const ratio = sec.columnRatio || 'left_fixed';
        let gridColsClass = 'sm:grid-cols-[224px_1fr]';
        if (ratio === 'equal') {
          gridColsClass = 'sm:grid-cols-2';
        } else if (ratio === 'right_fixed') {
          gridColsClass = 'sm:grid-cols-[1fr_224px]';
        }

        const mobileBlocks = getSortedMobileBlocks([...leftBlocks, ...rightBlocks]);

        return (
          <div key={sec.id || `sec-2col-${secIdx}`} className="w-full">
            {/* Giao diện di động (< sm): Sắp xếp 1 cột theo thứ tự ưu tiên Bìa -> Tên truyện -> Meta (Tác giả, Ngày đăng, Lượt xem) */}
            <div className="flex sm:hidden flex-col gap-4 w-full">
              {mobileBlocks.map((blockId) => (
                <StoryBlockRenderer key={`m-${blockId}`} blockId={blockId} {...props} />
              ))}
            </div>

            {/* Giao diện máy tính (>= sm): Bố cục 2 cột song song */}
            <div className={`hidden sm:grid ${gridColsClass} gap-6 items-start w-full`}>
              {/* Cột trái */}
              <div className="w-full flex flex-col gap-3.5 min-w-0">
                {leftBlocks.map((blockId) => (
                  <StoryBlockRenderer key={`d-${blockId}`} blockId={blockId} {...props} />
                ))}
              </div>

              {/* Cột phải */}
              <div className="w-full flex flex-col gap-4 min-w-0">
                {rightBlocks.map((blockId) => (
                  <StoryBlockRenderer key={`d-${blockId}`} blockId={blockId} {...props} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
