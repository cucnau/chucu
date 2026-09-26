import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  Plus,
  Trash2,
  Lock,
  Upload,
  Link,
  User,
  Users,
  TrendingUp,
  FileText,
  Images,
  Folder,
  UploadCloud,
  List,
  LayoutGrid,
  GitCommit,
  Table,
  Columns2,
  Tag,
  LayoutList,
  Hash,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Sliders,
  ZoomIn,
  ZoomOut,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { StoryLayoutBlockId, StoryLayoutSection, Chapter, CharacterInfo, StoryGalleryImage, StoryElement } from '../types';
import { getSortedMobileBlocks } from './StoryBlocks';
import { StoryCornerAccents } from '../lib/borderStyles';
import { StoryElementsLayer } from './StoryElementsLayer';

interface LiveStoryEditorViewProps {
  storyLayoutSections: StoryLayoutSection[];
  currentCardBg: string;
  currentBtnBg: string;
  currentBtnBorder: string;
  currentBtnText: string;
  currentBtnSecondaryBg: string;
  currentBorder: string;
  currentText: string;
  currentTextMuted: string;
  currentBorderObj: any;
  borderRadius: string;
  activeBCorner: any;
  customTitleFont: string;
  customSubtitleFont?: string;
  customChapterTitleFont?: string;
  customBodyFont: string;
  customMutedFont: string;
  customBtnFont?: string;
  titleFontSize: string;
  bodyFontSize: string;
  coverUrl: string;
  setCoverUrl: (url: string) => void;
  setTempCoverUrl: (url: string) => void;
  setShowCoverUrlModal: (show: boolean) => void;
  isCompressingCover: boolean;
  coverFileInputRef: React.RefObject<HTMLInputElement>;
  title: string;
  setTitle: (t: string) => void;
  author: string;
  setAuthor: (a: string) => void;
  synopsis: string;
  setSynopsis: (s: string) => void;
  initialStory?: any;
  editorAvatarUrl: string;
  setEditorAvatarUrl: (url: string) => void;
  editorName: string;
  setEditorName: (n: string) => void;
  isCompressingAvatar: boolean;
  avatarFileInputRef: React.RefObject<HTMLInputElement>;
  tags: string[];
  newTagInput: string;
  setNewTagInput: (t: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (t: string) => void;
  characters: CharacterInfo[];
  characterWidgetTitle?: string;
  setCharacterWidgetTitle?: (t: string) => void;
  characterAvatarShape?: 'circle' | 'square' | 'portrait_34' | 'portrait_23' | 'landscape_43' | 'landscape_169';
  setCharacterAvatarShape?: (shape: any) => void;
  showCharacterWidget?: boolean;
  setShowCharacterWidget?: (show: boolean) => void;
  handleOpenAddChar?: () => void;
  handleOpenEditChar?: (char: CharacterInfo) => void;
  handleDeleteChar?: (id: string) => void;
  handleCompressCharAvatar?: (file: File) => void;
  charAvatarFileInputRef?: React.RefObject<HTMLInputElement>;
  setActiveDrawerTab: (tab: any) => void;
  showProgressWidget: boolean;
  setShowProgressWidget: (show: boolean) => void;
  progressTitle: string;
  setProgressTitle?: (t: string) => void;
  progressTotalChapters: number;
  setProgressTotalChapters?: (n: number) => void;
  storyChapters: Chapter[];
  showCustomWidget: boolean;
  setShowCustomWidget: (show: boolean) => void;
  customWidgetTitle: string;
  setCustomWidgetTitle?: (t: string) => void;
  customWidgetContent: string;
  setCustomWidgetContent?: (c: string) => void;
  showGalleryWidget: boolean;
  setShowGalleryWidget: (show: boolean) => void;
  galleryWidgetTitle: string;
  setGalleryWidgetTitle?: (t: string) => void;
  galleryMode: 'single' | 'album';
  setGalleryMode?: (m: 'single' | 'album') => void;
  gallerySingleImageUrl: string;
  setGallerySingleImageUrl?: (u: string) => void;
  gallerySingleImageCaption: string;
  setGallerySingleImageCaption?: (c: string) => void;
  galleryImages: StoryGalleryImage[];
  setGalleryImages?: React.Dispatch<React.SetStateAction<StoryGalleryImage[]>>;
  galleryImageSize?: number;
  setGalleryImageSize?: (size: number) => void;
  galleryAutoScrollSpeed?: 'slow' | 'normal' | 'fast';
  setGalleryAutoScrollSpeed?: (s: 'slow' | 'normal' | 'fast') => void;
  gallerySingleFileInputRef?: React.RefObject<HTMLInputElement>;
  galleryAlbumFileInputRef?: React.RefObject<HTMLInputElement>;
  isCompressingGalleryImg?: boolean;
  handleCompressGallerySingle?: (file: File) => void;
  handleCompressGalleryAlbum?: (files: FileList) => void;
  chapterListStyle: any;
  setChapterListStyle: (style: any) => void;
  storyElements?: StoryElement[];
  setStoryElements?: React.Dispatch<React.SetStateAction<StoryElement[]>>;
  selectedStoryElementId?: string | null;
  setSelectedStoryElementId?: (id: string | null) => void;
  handleOpenCreateNewChapter: (volumeTitle?: string) => void;
  setIsBulkUploading: (b: boolean) => void;
  handleOpenEditChapterItem: (chap: Chapter) => void;
  setChapterToDeleteItem: (chap: Chapter) => void;
  handleMoveChapter?: (chapId: string, direction: 'up' | 'down') => void;
  getStoryBorderStyle: (borderConfig: any, fallbackColor: string) => React.CSSProperties;
  isPlacingElements?: boolean;
}

export const LiveStoryEditorView: React.FC<LiveStoryEditorViewProps> = (props) => {
  const { isPlacingElements, ...restProps } = props; // Extract to avoid passing to DOM elements if necessary, though we just destructure later

  const {
    storyLayoutSections,
    currentCardBg,
    currentBtnBg,
    currentBtnBorder,
    currentBtnText,
    currentBtnSecondaryBg,
    currentBorder,
    currentText,
    currentTextMuted,
    currentBorderObj,
    borderRadius,
    activeBCorner,
    customTitleFont,
    customSubtitleFont,
    customChapterTitleFont,
    customBodyFont,
    customMutedFont,
    customBtnFont = 'font-mono',
    titleFontSize,
    bodyFontSize,
    coverUrl,
    setCoverUrl,
    setTempCoverUrl,
    setShowCoverUrlModal,
    isCompressingCover,
    coverFileInputRef,
    title,
    setTitle,
    author,
    setAuthor,
    synopsis,
    setSynopsis,
    initialStory,
    editorAvatarUrl,
    setEditorAvatarUrl,
    editorName,
    setEditorName,
    isCompressingAvatar,
    avatarFileInputRef,
    tags,
    newTagInput,
    setNewTagInput,
    handleAddTag,
    handleRemoveTag,
    characters,
    characterWidgetTitle = 'Thông tin nhân vật',
    setCharacterWidgetTitle,
    characterAvatarShape = 'circle',
    setCharacterAvatarShape,
    showCharacterWidget = true,
    setShowCharacterWidget,
    handleOpenAddChar,
    handleOpenEditChar,
    handleDeleteChar,
    handleCompressCharAvatar,
    charAvatarFileInputRef,
    setActiveDrawerTab,
    showProgressWidget,
    setShowProgressWidget,
    progressTitle,
    setProgressTitle,
    progressTotalChapters,
    setProgressTotalChapters,
    storyChapters,
    showCustomWidget,
    setShowCustomWidget,
    customWidgetTitle,
    setCustomWidgetTitle,
    customWidgetContent,
    setCustomWidgetContent,
    showGalleryWidget,
    setShowGalleryWidget,
    galleryWidgetTitle,
    setGalleryWidgetTitle,
    galleryMode,
    setGalleryMode,
    gallerySingleImageUrl,
    setGallerySingleImageUrl,
    gallerySingleImageCaption,
    setGallerySingleImageCaption,
    galleryImages,
    setGalleryImages,
    galleryImageSize = 100,
    setGalleryImageSize,
    galleryAutoScrollSpeed = 'normal',
    setGalleryAutoScrollSpeed,
    gallerySingleFileInputRef,
    galleryAlbumFileInputRef,
    isCompressingGalleryImg,
    handleCompressGallerySingle,
    handleCompressGalleryAlbum,
    chapterListStyle,
    setChapterListStyle,
    storyElements,
    setStoryElements,
    selectedStoryElementId,
    setSelectedStoryElementId,
    handleOpenCreateNewChapter,
    setIsBulkUploading,
    handleOpenEditChapterItem,
    setChapterToDeleteItem,
    handleMoveChapter,
    getStoryBorderStyle,
  } = props;

  const articleRef = useRef<HTMLElement | null>(null);
  const storySubtitleFont = customSubtitleFont || customTitleFont;

  const [isEditingSingleImg, setIsEditingSingleImg] = useState(false);
  const [inlineSingleUrlInput, setInlineSingleUrlInput] = useState('');
  const [inlineSingleCaptionInput, setInlineSingleCaptionInput] = useState('');
  const [isAddingAlbumImg, setIsAddingAlbumImg] = useState(false);
  const [inlineAlbumUrlInput, setInlineAlbumUrlInput] = useState('');
  const [inlineAlbumCaptionInput, setInlineAlbumCaptionInput] = useState('');
  const [editorAlbumIndex, setEditorAlbumIndex] = useState(0);
  const [collapsedVolumes, setCollapsedVolumes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (galleryMode !== 'album' || galleryImages.length <= 1) return;
    let delay = 3000;
    if (galleryAutoScrollSpeed === 'slow') delay = 5000;
    if (galleryAutoScrollSpeed === 'fast') delay = 1500;
    const interval = setInterval(() => {
      setEditorAlbumIndex((prev) => (prev + 1) % galleryImages.length);
    }, delay);
    return () => clearInterval(interval);
  }, [galleryMode, galleryImages.length, galleryAutoScrollSpeed]);

  const renderLiveBlock = (blockId: StoryLayoutBlockId) => {
    switch (blockId) {
      case 'cover':
        return (
          <div
            id="editor-block-cover"
            className="w-full aspect-[3/4] max-w-[220px] mx-auto overflow-hidden flex flex-col justify-center items-center relative group rounded cursor-pointer transition-all shrink-0"
            style={{
              background: currentBtnSecondaryBg,
              ...getStoryBorderStyle(
                {
                  borderStyle: 'solid',
                  borderWidth: 'thin',
                  borderRadius,
                  borderGlow: 'none',
                },
                currentBorder
              ),
            }}
          >
            {coverUrl ? (
              <>
                <img
                  src={coverUrl}
                  alt={title || 'Bìa truyện'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-200 font-mono">
                  <button
                    id="btn-upload-new-cover"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh mới</span>
                  </button>
                  <button
                    id="btn-paste-cover-link"
                    onClick={() => {
                      setTempCoverUrl(coverUrl);
                      setShowCoverUrlModal(true);
                    }}
                    className="w-full py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>Dán link ảnh</span>
                  </button>
                  <button
                    id="btn-remove-cover"
                    onClick={() => setCoverUrl('')}
                    className="w-full py-1 px-2 bg-red-900/60 hover:bg-red-800 text-red-200 rounded text-[10px] transition"
                  >
                    Xóa ảnh bìa
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 text-center space-y-2.5 font-mono">
                <Upload className="w-8 h-8 mx-auto opacity-60" style={{ color: currentTextMuted }} />
                <p className="text-xs font-bold leading-tight" style={{ color: currentText }}>
                  Chưa có ảnh bìa
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    id="btn-upload-cover-empty"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isCompressingCover}
                    className="py-1 px-2.5 rounded border text-[11px] font-bold hover:opacity-90 transition flex items-center justify-center gap-1"
                    style={{
                      background: currentBtnBg,
                      borderColor: currentBtnBorder,
                      color: currentBtnText,
                    }}
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isCompressingCover ? 'Đang nén...' : 'Tải ảnh từ máy'}</span>
                  </button>
                  <button
                    id="btn-paste-cover-empty"
                    onClick={() => {
                      setTempCoverUrl('');
                      setShowCoverUrlModal(true);
                    }}
                    className="py-1 px-2.5 rounded border text-[10px] hover:opacity-90 transition flex items-center justify-center gap-1"
                    style={{
                      background: currentBtnSecondaryBg,
                      borderColor: currentBtnBorder,
                      color: currentText,
                    }}
                  >
                    <Link className="w-3 h-3" />
                    <span>Dán URL ảnh</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'editor_info':
        return (
          <div
            id="editor-block-editor-info"
            className="p-3 rounded border text-xs space-y-2 font-mono"
            style={{
              background: currentCardBg,
              borderColor: currentBorder,
              color: currentText,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] opacity-80" style={{ color: currentTextMuted }}>
                Người đăng / Editor
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative group/avatar shrink-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center"
                  style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}
                >
                  {editorAvatarUrl ? (
                    <img src={editorAvatarUrl} alt={editorName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 opacity-60" style={{ color: currentTextMuted }} />
                  )}
                </div>
                <button
                  id="btn-upload-avatar-overlay"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={isCompressingAvatar}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition"
                  title="Tải avatar mới"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <input
                  id="input-editor-name"
                  type="text"
                  placeholder="Tên Editor..."
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="w-full px-2 py-1 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all font-bold text-xs focus:outline-none"
                  style={{ borderColor: currentBorder, color: currentText }}
                />
                <div className="flex items-center gap-2 mt-1">
                  <button
                    id="btn-upload-avatar"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="text-[10px] opacity-75 hover:opacity-100 flex items-center gap-1 underline"
                    style={{ color: currentTextMuted }}
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>{editorAvatarUrl ? 'Đổi tệp' : 'Tải tệp'}</span>
                  </button>
                  {editorAvatarUrl && (
                    <button
                      id="btn-delete-avatar"
                      onClick={() => setEditorAvatarUrl('')}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'action_buttons':
        return (
          <div id="editor-block-actions" className={`flex flex-col gap-2 ${customBtnFont}`}>
            <button
              id="btn-preview-read-first"
              disabled
              className="w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs opacity-90 cursor-default"
              style={{
                background: currentBtnBg,
                borderColor: currentBtnBorder,
                color: currentBtnText,
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đọc từ đầu</span>
            </button>
            <button
              id="btn-preview-bookmark"
              disabled
              className="w-full py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 border opacity-80 cursor-default"
              style={{
                background: currentBtnSecondaryBg,
                borderColor: currentBorder,
                color: currentText,
              }}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Theo dõi truyện</span>
            </button>
          </div>
        );

      case 'tags':
        return (
          <div id="editor-block-tags" className={`space-y-1.5 ${customBtnFont}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${customMutedFont}`} style={{ color: currentTextMuted }}>
                Thể loại / Thẻ tags:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border"
                  style={{
                    background: currentBtnSecondaryBg,
                    borderColor: currentBorder,
                    color: currentText,
                  }}
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 font-bold ml-0.5"
                    title="Xóa tag này"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1 pt-1">
              <input
                id="input-new-tag"
                type="text"
                placeholder="Thêm tag (VD: Đô thị, Tu tiên)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className={`flex-1 px-2 py-1 bg-transparent rounded border text-[11px] focus:outline-none ${customBodyFont}`}
                style={{ borderColor: currentBorder, color: currentText }}
              />
              <button
                id="btn-add-tag"
                onClick={handleAddTag}
                className="px-2 py-1 rounded border text-[11px] font-bold hover:opacity-90 transition"
                style={{
                  background: currentBtnBg,
                  borderColor: currentBtnBorder,
                  color: currentBtnText,
                }}
              >
                + Thêm
              </button>
            </div>
          </div>
        );

      case 'character_widget':
        return (
          <div id="editor-block-characters" className={`space-y-2.5 ${customBodyFont}`}>
            {/* Header Widget */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Users className="w-3.5 h-3.5 shrink-0" style={{ color: currentTextMuted }} />
                <input
                  type="text"
                  value={characterWidgetTitle}
                  onChange={(e) => setCharacterWidgetTitle && setCharacterWidgetTitle(e.target.value)}
                  placeholder="Tiêu đề widget nhân vật..."
                  className={`bg-transparent font-bold text-xs border-b border-dashed hover:border-solid focus:border-solid focus:outline-none px-1 py-0.5 truncate ${storySubtitleFont}`}
                  style={{ borderColor: currentBorder, color: currentText }}
                />
              </div>

              <div className={`flex items-center gap-1.5 ${customBtnFont}`}>
                {handleOpenAddChar && (
                  <button
                    type="button"
                    onClick={handleOpenAddChar}
                    className="text-[10px] font-bold px-2 py-1 rounded border hover:opacity-90 flex items-center gap-1 cursor-pointer shadow-sm"
                    style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm nhân vật</span>
                  </button>
                )}

                {setShowCharacterWidget && (
                  <button
                    type="button"
                    onClick={() => setShowCharacterWidget(!showCharacterWidget)}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition cursor-pointer flex items-center gap-1 ${
                      showCharacterWidget ? '' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={showCharacterWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
                  >
                    {showCharacterWidget ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{showCharacterWidget ? 'Đang hiện' : 'Ẩn'}</span>
                  </button>
                )}
              </div>
            </div>

            {showCharacterWidget && (
              <div className="p-3 rounded border space-y-3" style={{ background: currentBtnBg, borderColor: currentBorder }}>
                {/* Chọn tỉ lệ / hình dáng ảnh đại diện */}
                <div className="space-y-1.5 pb-2 border-b" style={{ borderColor: currentBorder }}>
                  <label className="text-[11px] font-bold block" style={{ color: currentText }}>
                    Tỉ lệ & Hình dáng ảnh nhân vật:
                  </label>
                  <div className={`flex flex-wrap gap-1 ${customBtnFont}`}>
                    {[
                      { id: 'circle', label: 'Tròn (1:1)' },
                      { id: 'square', label: 'Vuông (1:1)' },
                      { id: 'portrait_34', label: 'Dọc (3:4)' },
                      { id: 'portrait_23', label: 'Dọc (2:3)' },
                      { id: 'landscape_43', label: 'Ngang (4:3)' },
                      { id: 'landscape_169', label: 'Ngang (16:9)' },
                    ].map((shape) => {
                      const isSelected = characterAvatarShape === shape.id;
                      return (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => setCharacterAvatarShape && setCharacterAvatarShape(shape.id as any)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                            isSelected ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                          }`}
                          style={{
                            background: isSelected ? currentBtnBg : currentCardBg,
                            borderColor: isSelected ? (currentText || '#ff99bb') : currentBorder,
                            color: isSelected ? currentBtnText : currentText,
                          }}
                        >
                          {shape.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Danh sách nhân vật */}
                {characters.length === 0 ? (
                  <div className={`p-3 rounded border border-dashed text-[11px] text-center opacity-70 ${customMutedFont}`} style={{ borderColor: currentBorder }}>
                    Chưa có nhân vật nào. Bấm nút <strong>"+ Thêm nhân vật"</strong> để tạo nhân vật mới.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {characters.map((char) => {
                      let shapeClass = 'w-9 h-9 rounded-full aspect-square';
                      if (characterAvatarShape === 'square') shapeClass = 'w-9 h-9 rounded-md aspect-square';
                      else if (characterAvatarShape === 'portrait_34') shapeClass = 'w-10 h-13 rounded-md aspect-[3/4]';
                      else if (characterAvatarShape === 'portrait_23') shapeClass = 'w-10 h-15 rounded-md aspect-[2/3]';
                      else if (characterAvatarShape === 'landscape_43') shapeClass = 'w-14 h-10 rounded-md aspect-[4/3]';
                      else if (characterAvatarShape === 'landscape_169') shapeClass = 'w-16 h-9 rounded-md aspect-[16/9]';

                      return (
                        <div
                          key={char.id}
                          className={`p-2.5 rounded border flex items-center justify-between gap-2.5 text-xs transition hover:bg-black/10 ${customBodyFont}`}
                          style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={`${shapeClass} border overflow-hidden shrink-0 flex items-center justify-center bg-black/20`} style={{ borderColor: currentBorder }}>
                              {char.avatarUrl ? (
                                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 opacity-50" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs truncate">{char.name}</span>
                                {char.role && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border opacity-90 ${customBtnFont}`} style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}>
                                    {char.role}
                                  </span>
                                )}
                              </div>
                              {char.description && (
                                <p className={`text-[10px] opacity-75 truncate leading-tight mt-0.5 ${customMutedFont}`}>{char.description}</p>
                              )}
                            </div>
                          </div>

                          <div className={`flex items-center gap-1 shrink-0 ${customBtnFont}`}>
                            {handleOpenEditChar && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditChar(char)}
                                className="px-2 py-1 rounded text-[10px] border font-bold hover:opacity-80"
                                style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                              >
                                Sửa
                              </button>
                            )}
                            {handleDeleteChar && (
                              <button
                                type="button"
                                onClick={() => handleDeleteChar(char.id)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                                title="Xóa nhân vật"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'title':
        return (
          <div id="editor-block-title" className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70" style={{ color: currentTextMuted, display: isPlacingElements ? 'none' : 'block' }}>
              Tên truyện (Nhấp để sửa trực tiếp):
            </span>
            {isPlacingElements ? (
              <h1
                className={`font-bold tracking-[0.02em] ${customTitleFont}`}
                style={{ color: currentText, fontSize: titleFontSize }}
              >
                {title || 'Tên Truyện Mới'}
              </h1>
            ) : (
              <input
                id="input-story-title"
                type="text"
                placeholder="Nhập tên truyện tại đây..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2.5 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all font-bold tracking-[0.02em] focus:outline-none focus:ring-1 ${customTitleFont}`}
                style={{
                  borderColor: currentBorder,
                  color: currentText,
                  fontSize: titleFontSize,
                }}
              />
            )}
          </div>
        );
      case 'meta':
        return (
          <div
            id="editor-block-meta"
            className={`text-xs space-y-2 border-b pb-3.5 ${customMutedFont}`}
            style={{ borderColor: currentBorder, color: currentTextMuted }}
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-medium">Tác giả:</span>
              {isPlacingElements ? (
                <span className="font-semibold" style={{ color: currentText }}>
                  {author || 'Chưa rõ'}
                </span>
              ) : (
                <input
                  id="input-story-author"
                  type="text"
                  placeholder="Tên tác giả..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="flex-1 px-2 py-1 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all text-xs font-semibold focus:outline-none"
                  style={{ borderColor: currentBorder, color: currentText }}
                />
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] opacity-75 font-mono">
              <p>Ngày tạo: <span>{initialStory?.createdAt || new Date().toISOString().split('T')[0]}</span></p>
              <p>Lượt xem: <span>{initialStory?.viewsCount || 0}</span></p>
            </div>
          </div>
        );

      case 'synopsis':
        return (
          <div id="editor-block-synopsis" className="space-y-1.5">
            <span className={`text-xs font-bold uppercase tracking-wider block ${customBodyFont}`} style={{ color: currentTextMuted, display: isPlacingElements ? 'none' : 'block' }}>
              Giới thiệu truyện (Nhấp để sửa):
            </span>
            {isPlacingElements ? (
              <div
                className={`whitespace-pre-wrap leading-relaxed ${customBodyFont}`}
                style={{ color: currentText, fontSize: bodyFontSize }}
              >
                {synopsis || 'Chưa có giới thiệu.'}
              </div>
            ) : (
              <textarea
                id="textarea-story-synopsis"
                rows={7}
                placeholder="Nhập phần tóm tắt, trích đoạn hoặc giới thiệu nội dung cuốn hút của bộ truyện..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className={`w-full p-3 bg-transparent rounded border border-dashed hover:border-solid focus:border-solid transition-all leading-relaxed focus:outline-none focus:ring-1 resize-y ${customBodyFont}`}
                style={{
                  borderColor: currentBorder,
                  color: currentText,
                  fontSize: bodyFontSize,
                }}
              />
            )}
          </div>
        );

      case 'progress_widget':
        return (
          <div id="editor-block-progress" className={`space-y-2 ${customBodyFont}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" style={{ color: currentTextMuted }} />
                <input
                  type="text"
                  value={progressTitle}
                  onChange={(e) => setProgressTitle && setProgressTitle(e.target.value)}
                  placeholder="Tiêu đề widget tiến độ..."
                  className={`bg-transparent font-bold text-xs border-b border-dashed hover:border-solid focus:border-solid focus:outline-none px-1 py-0.5 truncate ${storySubtitleFont}`}
                  style={{ borderColor: currentBorder, color: currentText }}
                />
              </div>

              <button
                id="btn-toggle-progress-widget"
                type="button"
                onClick={() => setShowProgressWidget(!showProgressWidget)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${customBtnFont} ${
                  showProgressWidget ? '' : 'opacity-60 hover:opacity-100'
                }`}
                style={showProgressWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
              >
                {showProgressWidget ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{showProgressWidget ? 'Đang hiện' : 'Ẩn'}</span>
              </button>
            </div>

            {showProgressWidget && (
              <div className="p-3.5 rounded border space-y-3" style={{ background: currentBtnBg, borderColor: currentBorder }}>
                <div className="flex items-center gap-2 text-xs">
                  <label className="font-bold shrink-0 text-[11px]" style={{ color: currentText }}>
                    Tổng số chương dự kiến:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={progressTotalChapters || ''}
                    onChange={(e) => setProgressTotalChapters && setProgressTotalChapters(parseInt(e.target.value) || 0)}
                    placeholder="VD: 100"
                    className="w-24 p-1 rounded border text-xs font-bold focus:outline-none"
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                  />
                  <span className={`text-[10px] opacity-75 ${customMutedFont}`}>
                    (Đã phát hành: {storyChapters.length} chương)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{progressTitle || 'Tiến độ hoàn thành'}</span>
                    <span>
                      {storyChapters.length} / {progressTotalChapters || storyChapters.length} chương
                      {progressTotalChapters > 0 && ` (${Math.round((storyChapters.length / progressTotalChapters) * 100)}%)`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden bg-black/20 border" style={{ borderColor: currentBorder }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, progressTotalChapters > 0 ? (storyChapters.length / progressTotalChapters) * 100 : 100))}%`,
                        background: currentBtnBg,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'custom_widget':
        return (
          <div id="editor-block-custom-widget" className={`space-y-2 ${customBodyFont}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: currentTextMuted }} />
                <input
                  type="text"
                  value={customWidgetTitle}
                  onChange={(e) => setCustomWidgetTitle && setCustomWidgetTitle(e.target.value)}
                  placeholder="Tiêu đề widget tùy chỉnh / thông báo..."
                  className={`bg-transparent font-bold text-xs border-b border-dashed hover:border-solid focus:border-solid focus:outline-none px-1 py-0.5 truncate ${storySubtitleFont}`}
                  style={{ borderColor: currentBorder, color: currentText }}
                />
              </div>

              <button
                id="btn-toggle-custom-widget"
                type="button"
                onClick={() => setShowCustomWidget(!showCustomWidget)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${customBtnFont} ${
                  showCustomWidget ? '' : 'opacity-60 hover:opacity-100'
                }`}
                style={showProgressWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
              >
                {showCustomWidget ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{showCustomWidget ? 'Đang hiện' : 'Ẩn'}</span>
              </button>
            </div>

            {showCustomWidget && (
              <div className="p-3.5 rounded border space-y-2 text-xs" style={{ borderColor: currentBorder, background: currentBtnBg }}>
                <label className="text-[11px] font-bold block" style={{ color: currentText, display: isPlacingElements ? 'none' : 'block' }}>
                  Nội dung tùy chỉnh / Lời ngỏ / Quy định:
                </label>
                {isPlacingElements ? (
                  <div
                    className={`whitespace-pre-wrap leading-relaxed text-sm ${customBodyFont}`}
                    style={{ color: currentText }}
                  >
                    {customWidgetContent || 'Chưa có nội dung.'}
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    value={customWidgetContent}
                    onChange={(e) => setCustomWidgetContent && setCustomWidgetContent(e.target.value)}
                    placeholder="Nhập thông báo, lịch ra chương hoặc lời ngỏ dành cho người đọc..."
                    className={`w-full p-2.5 rounded border text-xs leading-relaxed focus:outline-none resize-y ${customBodyFont}`}
                    style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                  />
                )}
              </div>
            )}
          </div>
        );

      case 'gallery_widget':
        return (
          <div id="editor-block-gallery" className={`space-y-2.5 ${customBodyFont}`}>
            {/* Header Widget */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Images className="w-3.5 h-3.5 shrink-0" style={{ color: currentTextMuted }} />
                <input
                  type="text"
                  value={galleryWidgetTitle}
                  onChange={(e) => setGalleryWidgetTitle && setGalleryWidgetTitle(e.target.value)}
                  placeholder="Tiêu đề widget ảnh..."
                  className={`bg-transparent font-bold text-xs border-b border-dashed hover:border-solid focus:border-solid focus:outline-none px-1 py-0.5 truncate ${storySubtitleFont}`}
                  style={{ borderColor: currentBorder, color: currentText }}
                />
              </div>

              <button
                id="btn-toggle-gallery-widget"
                type="button"
                onClick={() => setShowGalleryWidget(!showGalleryWidget)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${customBtnFont} ${
                  showGalleryWidget ? '' : 'opacity-60 hover:opacity-100'
                }`}
                style={showGalleryWidget ? { backgroundColor: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText } : { borderColor: currentBorder, color: currentTextMuted }}
              >
                {showGalleryWidget ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{showGalleryWidget ? 'Đang hiện' : 'Ẩn'}</span>
              </button>
            </div>

            {showGalleryWidget && (
              <div className="p-3.5 rounded border space-y-3 text-xs" style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}>
                {/* Chọn Chế độ: Ảnh Đơn vs Album */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b" style={{ borderColor: currentBorder }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color: currentText }}>Kiểu hiển thị:</span>
                    <div className={`flex gap-1.5 ${customBtnFont}`}>
                      <button
                        type="button"
                        onClick={() => setGalleryMode && setGalleryMode('single')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                          galleryMode === 'single' ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: galleryMode === 'single' ? currentBtnBg : currentCardBg,
                          borderColor: galleryMode === 'single' ? (currentText || '#ff99bb') : currentBorder,
                          color: galleryMode === 'single' ? currentBtnText : currentText,
                        }}
                      >
                        Ảnh / GIF đơn
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryMode && setGalleryMode('album')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                          galleryMode === 'album' ? 'ring-2 shadow-sm' : 'hover:opacity-80'
                        }`}
                        style={{
                          background: galleryMode === 'album' ? currentBtnBg : currentCardBg,
                          borderColor: galleryMode === 'album' ? (currentText || '#ff99bb') : currentBorder,
                          color: galleryMode === 'album' ? currentBtnText : currentText,
                        }}
                      >
                        Album chuyển động vòng tròn
                      </button>
                    </div>
                  </div>
                </div>

                {/* NỘI DUNG THEO CHẾ ĐỘ */}
                {galleryMode === 'single' ? (
                  /* ================= CHẾ ĐỘ ẢNH / GIF ĐƠN ================= */
                  <div className="space-y-3">
                    {gallerySingleImageUrl ? (
                      /* ĐÃ CÓ ẢNH: HIỂN THỊ ĐÚNG SIZE THẬT NHƯ NGOÀI TRANG TRUYỆN + THANH KÉO SIZE */
                      <div className="space-y-3">
                        {/* Khung ảnh sạch tinh tế đúng kích thước */}
                        <div className="w-full flex flex-col items-center justify-center p-2 rounded border bg-black/5" style={{ borderColor: currentBorder }}>
                          <div className="w-full flex flex-col items-center justify-center">
                            <img
                              src={gallerySingleImageUrl}
                              alt={gallerySingleImageCaption || 'Ảnh minh họa'}
                              className="h-auto object-contain transition-all duration-150 rounded shadow-md"
                              style={{
                                width: `${galleryImageSize || 100}%`,
                                maxWidth: '100%'
                              }}
                            />
                          </div>
                          {gallerySingleImageCaption && (
                            <p className="mt-2 text-xs italic text-center opacity-85" style={{ color: currentTextMuted }}>
                              {gallerySingleImageCaption}
                            </p>
                          )}
                        </div>

                        {/* THANH KÉO CHỈNH SIZE ẢNH / GIF */}
                        <div className="p-3 rounded border space-y-2.5 bg-black/10" style={{ borderColor: currentBorder }}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: currentText }}>
                              <Sliders className="w-3.5 h-3.5 text-pink-400" />
                              <span>Kích thước hiển thị ảnh/GIF:</span>
                            </div>
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs shadow-xs" style={{ background: currentBtnBg, color: currentBtnText }}>
                              {galleryImageSize || 100}%
                            </span>
                          </div>

                          {/* Slider Range */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setGalleryImageSize && setGalleryImageSize(Math.max(20, (galleryImageSize || 100) - 5))}
                              className="p-1.5 rounded border hover:opacity-80 active:scale-95 transition cursor-pointer"
                              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                              title="Thu nhỏ 5%"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="range"
                              min="20"
                              max="100"
                              step="1"
                              value={galleryImageSize || 100}
                              onChange={(e) => setGalleryImageSize && setGalleryImageSize(Number(e.target.value))}
                              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-pink-500"
                              style={{ background: currentBorder }}
                            />
                            <button
                              type="button"
                              onClick={() => setGalleryImageSize && setGalleryImageSize(Math.min(100, (galleryImageSize || 100) + 5))}
                              className="p-1.5 rounded border hover:opacity-80 active:scale-95 transition cursor-pointer"
                              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                              title="Phóng to 5%"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick % buttons & Action tool buttons */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-dashed" style={{ borderColor: currentBorder }}>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="opacity-70" style={{ color: currentTextMuted }}>Mức nhanh:</span>
                              {[25, 50, 75, 100].map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => setGalleryImageSize && setGalleryImageSize(sz)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                    (galleryImageSize || 100) === sz ? 'ring-2 font-black' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{
                                    background: (galleryImageSize || 100) === sz ? currentBtnBg : currentCardBg,
                                    borderColor: (galleryImageSize || 100) === sz ? currentBtnBorder : currentBorder,
                                    color: (galleryImageSize || 100) === sz ? currentBtnText : currentText
                                  }}
                                >
                                  {sz}%
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingSingleImg(!isEditingSingleImg);
                                  setInlineSingleUrlInput(gallerySingleImageUrl);
                                  setInlineSingleCaptionInput(gallerySingleImageCaption);
                                }}
                                className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 hover:opacity-90 transition cursor-pointer"
                                style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                              >
                                <Pencil className="w-3 h-3 text-pink-400" />
                                <span>{isEditingSingleImg ? 'Đóng sửa' : 'Thay ảnh / Sửa link'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setGallerySingleImageUrl && setGallerySingleImageUrl('')}
                                className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                style={{ borderColor: currentBorder }}
                                title="Xóa ảnh này"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </div>

                          {/* Popover form sửa link / chú thích */}
                          {isEditingSingleImg && (
                            <div className="mt-2 p-2.5 rounded border space-y-2 bg-black/20" style={{ borderColor: currentBorder }}>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={inlineSingleUrlInput}
                                  onChange={(e) => setInlineSingleUrlInput(e.target.value)}
                                  placeholder="Dán URL ảnh hoặc GIF mới..."
                                  className="flex-1 p-1.5 rounded border text-xs focus:outline-none"
                                  style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                />
                                <button
                                  type="button"
                                  onClick={() => gallerySingleFileInputRef?.current?.click()}
                                  className="px-2.5 py-1.5 rounded border text-[11px] font-bold flex items-center gap-1 hover:opacity-90 shrink-0 cursor-pointer"
                                  style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Tải file</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={inlineSingleCaptionInput}
                                  onChange={(e) => setInlineSingleCaptionInput(e.target.value)}
                                  placeholder="Chú thích ảnh (tùy chọn)..."
                                  className="flex-1 p-1.5 rounded border text-xs focus:outline-none"
                                  style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (inlineSingleUrlInput.trim()) {
                                      setGallerySingleImageUrl && setGallerySingleImageUrl(inlineSingleUrlInput.trim());
                                    }
                                    setGallerySingleImageCaption && setGallerySingleImageCaption(inlineSingleCaptionInput.trim());
                                    setIsEditingSingleImg(false);
                                  }}
                                  className="px-3 py-1.5 rounded border text-[11px] font-bold flex items-center gap-1 hover:opacity-90 shrink-0 cursor-pointer"
                                  style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Lưu</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* CHƯA CÓ ẢNH: FORM THÊM ẢNH GỌN GÀNG */
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => gallerySingleFileInputRef?.current?.click()}
                            className="px-3 py-1.5 rounded border font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm cursor-pointer"
                            style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>Tải ảnh / GIF từ máy lên</span>
                          </button>

                          {isCompressingGalleryImg && (
                            <span className="text-[10px] animate-pulse text-amber-400 font-bold">Đang tải và xử lý...</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] block opacity-75 font-semibold mb-0.5" style={{ color: currentTextMuted }}>Hoặc dán URL ảnh / GIF trực tiếp (khuyên dùng để nét nhất):</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={inlineSingleUrlInput}
                                onChange={(e) => setInlineSingleUrlInput(e.target.value)}
                                placeholder="https://i.imgur.com/example.gif hoặc link ảnh..."
                                className="flex-1 p-2 rounded border text-xs focus:outline-none"
                                style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (inlineSingleUrlInput.trim()) {
                                    setGallerySingleImageUrl && setGallerySingleImageUrl(inlineSingleUrlInput.trim());
                                    setInlineSingleUrlInput('');
                                  }
                                }}
                                className="px-3 py-1.5 rounded border text-xs font-bold hover:opacity-90 shrink-0 cursor-pointer"
                                style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                              >
                                Thêm ảnh
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] block opacity-75 font-semibold mb-0.5" style={{ color: currentTextMuted }}>Chú thích ảnh (tùy chọn):</label>
                            <input
                              type="text"
                              value={gallerySingleImageCaption}
                              onChange={(e) => setGallerySingleImageCaption && setGallerySingleImageCaption(e.target.value)}
                              placeholder="Nhập chú thích ngắn cho bức ảnh..."
                              className="w-full p-2 rounded border text-xs focus:outline-none"
                              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= CHẾ ĐỘ ALBUM CHUYỂN ĐỘNG VÒNG TRÒN ================= */
                  <div className="space-y-3">
                    {/* ALBUM PREVIEW HOẠT ĐỘNG THỰC TẾ */}
                    {galleryImages.length > 0 && (
                      <div className="space-y-3">
                        <div
                          className="relative w-full overflow-hidden flex items-center justify-center transition-all duration-300 py-3 rounded border bg-black/10"
                          style={{
                            minHeight: `${Math.max(160, Math.round((galleryImageSize || 100) * 2.2))}px`,
                            borderColor: currentBorder
                          }}
                        >
                          <div className="relative w-full max-w-[500px] h-full flex items-center justify-center" style={{ perspective: '800px' }}>
                            {galleryImages.map((img, idx) => {
                              const total = galleryImages.length;
                              let offset = idx - editorAlbumIndex;
                              if (offset > total / 2) offset -= total;
                              if (offset < -total / 2) offset += total;
                              const isCenter = offset === 0;
                              const isVisible = Math.abs(offset) <= 2;
                              if (!isVisible) return null;

                              const baseCardWidth = Math.round(180 * ((galleryImageSize || 100) / 100));
                              const translateX = offset * (baseCardWidth * 0.72);
                              const translateZ = -Math.abs(offset) * 80;
                              const rotateY = offset * -18;
                              const scale = isCenter ? 1 : Math.max(0.7, 1 - Math.abs(offset) * 0.15);
                              const opacity = isCenter ? 1 : Math.max(0.3, 0.7 - Math.abs(offset) * 0.2);
                              const zIndex = 20 - Math.abs(offset);

                              return (
                                <div
                                  key={img.id}
                                  onClick={() => setEditorAlbumIndex(idx)}
                                  className="absolute cursor-pointer transition-all duration-500 ease-out flex flex-col items-center justify-center select-none"
                                  style={{
                                    width: `${baseCardWidth}px`,
                                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                    opacity,
                                    zIndex,
                                  }}
                                >
                                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border shadow-lg relative group bg-black/40" style={{ borderColor: isCenter ? (currentText || '#ff99bb') : currentBorder }}>
                                    <img src={img.url} alt={img.caption || `Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                                    {isCenter && (
                                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold backdrop-blur-xs">
                                        {idx + 1}/{total}
                                      </div>
                                    )}
                                  </div>
                                  {img.caption && isCenter && (
                                    <p className="mt-1 text-[10px] text-center font-semibold truncate max-w-full px-1" style={{ color: currentText }}>
                                      {img.caption}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* THANH KÉO CHỈNH SIZE ALBUM */}
                        <div className="p-3 rounded border space-y-2.5 bg-black/10" style={{ borderColor: currentBorder }}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: currentText }}>
                              <Sliders className="w-3.5 h-3.5 text-pink-400" />
                              <span>Kích thước Album ảnh:</span>
                            </div>
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs shadow-xs" style={{ background: currentBtnBg, color: currentBtnText }}>
                              {galleryImageSize || 100}%
                            </span>
                          </div>

                          {/* Slider Range */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setGalleryImageSize && setGalleryImageSize(Math.max(30, (galleryImageSize || 100) - 5))}
                              className="p-1.5 rounded border hover:opacity-80 active:scale-95 transition cursor-pointer"
                              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                              title="Thu nhỏ 5%"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="range"
                              min="30"
                              max="100"
                              step="1"
                              value={galleryImageSize || 100}
                              onChange={(e) => setGalleryImageSize && setGalleryImageSize(Number(e.target.value))}
                              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-pink-500"
                              style={{ background: currentBorder }}
                            />
                            <button
                              type="button"
                              onClick={() => setGalleryImageSize && setGalleryImageSize(Math.min(100, (galleryImageSize || 100) + 5))}
                              className="p-1.5 rounded border hover:opacity-80 active:scale-95 transition cursor-pointer"
                              style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                              title="Phóng to 5%"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick % buttons & Speed Controls */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-dashed" style={{ borderColor: currentBorder }}>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="opacity-70" style={{ color: currentTextMuted }}>Mức nhanh:</span>
                              {[35, 50, 75, 100].map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => setGalleryImageSize && setGalleryImageSize(sz)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                    (galleryImageSize || 100) === sz ? 'ring-2 font-black' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{
                                    background: (galleryImageSize || 100) === sz ? currentBtnBg : currentCardBg,
                                    borderColor: (galleryImageSize || 100) === sz ? currentBtnBorder : currentBorder,
                                    color: (galleryImageSize || 100) === sz ? currentBtnText : currentText
                                  }}
                                >
                                  {sz}%
                                </button>
                              ))}
                            </div>

                            {setGalleryAutoScrollSpeed && (
                              <div className="flex items-center gap-1 text-[10px]">
                                <span style={{ color: currentTextMuted }}>Tốc độ xoay:</span>
                                <select
                                  value={galleryAutoScrollSpeed}
                                  onChange={(e) => setGalleryAutoScrollSpeed(e.target.value as any)}
                                  className="p-1 rounded border text-[10px] font-bold focus:outline-none cursor-pointer"
                                  style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                >
                                  <option value="slow">Chậm</option>
                                  <option value="normal">Vừa</option>
                                  <option value="fast">Nhanh</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HÀNH ĐỘNG THÊM ẢNH VÀO ALBUM */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => galleryAlbumFileInputRef?.current?.click()}
                          className="px-3 py-1.5 rounded border font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm cursor-pointer"
                          style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Tải file ảnh vào Album</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsAddingAlbumImg(!isAddingAlbumImg)}
                          className="px-3 py-1.5 rounded border font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-sm cursor-pointer"
                          style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                        >
                          <Link className="w-3.5 h-3.5 text-pink-400" />
                          <span>{isAddingAlbumImg ? 'Đóng' : '+ Dán URL ảnh / GIF'}</span>
                        </button>
                      </div>

                      {isCompressingGalleryImg && (
                        <div className="p-1 text-[10px] text-amber-400 font-bold animate-pulse">
                          Đang xử lý ảnh...
                        </div>
                      )}
                    </div>

                    {/* Popover form dán URL ảnh vào Album */}
                    {isAddingAlbumImg && (
                      <div className="p-2.5 rounded border space-y-2 bg-black/20" style={{ borderColor: currentBorder }}>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={inlineAlbumUrlInput}
                            onChange={(e) => setInlineAlbumUrlInput(e.target.value)}
                            placeholder="Dán link ảnh hoặc GIF vào album..."
                            className="flex-1 p-1.5 rounded border text-xs focus:outline-none"
                            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                          />
                          <input
                            type="text"
                            value={inlineAlbumCaptionInput}
                            onChange={(e) => setInlineAlbumCaptionInput(e.target.value)}
                            placeholder="Chú thích..."
                            className="w-32 p-1.5 rounded border text-xs focus:outline-none"
                            style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (inlineAlbumUrlInput.trim()) {
                                const newImg: StoryGalleryImage = {
                                  id: `gal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                                  url: inlineAlbumUrlInput.trim(),
                                  caption: inlineAlbumCaptionInput.trim() || undefined
                                };
                                setGalleryImages && setGalleryImages((prev) => [...prev, newImg]);
                                setInlineAlbumUrlInput('');
                                setInlineAlbumCaptionInput('');
                                setIsAddingAlbumImg(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded border text-xs font-bold hover:opacity-90 shrink-0 cursor-pointer"
                            style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                          >
                            Thêm
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Danh sách ảnh trong album */}
                    {galleryImages.length === 0 ? (
                      <div className="p-4 rounded border border-dashed text-xs text-center opacity-75" style={{ borderColor: currentBorder }}>
                        Chưa có ảnh trong album. Hãy bấm nút <strong>"Tải file ảnh vào Album"</strong> hoặc <strong>"+ Dán URL ảnh / GIF"</strong> để thêm ảnh!
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        <span className="text-[10px] font-bold block" style={{ color: currentTextMuted }}>Danh sách {galleryImages.length} ảnh trong album:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {galleryImages.map((img, idx) => (
                            <div key={img.id} className="p-2 rounded border flex items-center gap-2 relative bg-black/10" style={{ borderColor: currentBorder }}>
                              <img src={img.url} alt={img.caption || `Ảnh ${idx + 1}`} className="w-10 h-10 object-cover rounded border shrink-0" style={{ borderColor: currentBorder }} />
                              <div className="min-w-0 flex-1">
                                <input
                                  type="text"
                                  value={img.caption || ''}
                                  placeholder="Chú thích ảnh..."
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGalleryImages && setGalleryImages((prev) => prev.map((item) => item.id === img.id ? { ...item, caption: val } : item));
                                  }}
                                  className="w-full p-1 rounded border text-[10px] focus:outline-none"
                                  style={{ background: currentCardBg, borderColor: currentBorder, color: currentText }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setGalleryImages && setGalleryImages((prev) => prev.filter((item) => item.id !== img.id));
                                }}
                                className="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                                title="Xóa ảnh này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'chapter_list':
        return (
          <div id="editor-block-chapters" className={`space-y-3 pt-4 border-t ${customBodyFont}`} style={{ borderColor: currentBorder }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className={`flex items-center gap-2 flex-wrap ${customBtnFont}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${storySubtitleFont}`} style={{ color: currentText }}>
                  <BookOpen className="w-4 h-4 opacity-80" />
                  <span>Danh sách chương ({storyChapters.length})</span>
                </h3>
                <button
                  id="btn-add-new-chapter-inline"
                  type="button"
                  onClick={() => handleOpenCreateNewChapter()}
                  className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                  style={{ background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chương mới</span>
                </button>
                <button
                  id="btn-add-volume-inline"
                  type="button"
                  onClick={() => handleOpenCreateNewChapter('Quyển 1: ...')}
                  className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                  style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Ngắt phần/quyển</span>
                </button>
                <button
                  id="btn-bulk-upload-inline"
                  type="button"
                  onClick={() => setIsBulkUploading(true)}
                  className="px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
                  style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải file tổng</span>
                </button>
              </div>

              {/* Quick Layout Style Switcher */}
              <div className={`flex items-center gap-1 p-0.5 rounded border flex-wrap ${customBtnFont}`} style={{ borderColor: currentBorder, background: currentCardBg }}>
                {[
                  { id: 'standard', label: 'Chuẩn', icon: List },
                  { id: 'grid', label: 'Lưới', icon: LayoutGrid },
                  { id: 'accordion', label: 'Quyển', icon: Folder },
                  { id: 'timeline', label: 'Timeline', icon: GitCommit },
                  { id: 'minimal_table', label: 'Bảng', icon: Table },
                  { id: 'book_catalog', label: 'Mục lục', icon: Columns2 },
                  { id: 'scroll_strip', label: 'Huy hiệu', icon: Tag },
                  { id: 'cards_bento', label: 'Bento', icon: LayoutList },
                  { id: 'modern_compact', label: 'Hiện đại', icon: List },
                  { id: 'numbers_only', label: 'Số tròn', icon: Hash },
                ].map((st) => {
                  const isSelected = chapterListStyle === st.id;
                  const IconComp = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setChapterListStyle(st.id as any)}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        isSelected ? 'shadow-xs' : 'hover:opacity-80 opacity-70'
                      }`}
                      style={{
                        backgroundColor: isSelected ? currentBtnBg : 'transparent',
                        color: isSelected ? currentBtnText : currentText,
                      }}
                      title={`Chuyển kiểu hiển thị: ${st.label}`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RENDER ALL CHAPTERS BY SELECTED STYLE */}
            {(() => {
              if (storyChapters.length === 0) {
                return (
                  <div
                    className="p-8 text-center rounded border border-dashed space-y-3"
                    style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}
                  >
                    <BookOpen className="w-8 h-8 mx-auto opacity-50" style={{ color: currentTextMuted }} />
                    <p className="text-xs" style={{ color: currentTextMuted }}>
                      Truyện chưa có chương nào. Bạn có thể nhấn <strong>Thêm chương mới</strong> hoặc <strong>Tải file tổng</strong> để nhập nhiều chương.
                    </p>
                  </div>
                );
              }

              const renderChapterActions = (chap: Chapter, idx: number) => (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {handleMoveChapter && (
                    <div className="flex items-center gap-0.5 border-r pr-1 opacity-80" style={{ borderColor: currentBorder }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveChapter(chap.id, 'up')}
                        className="p-1 text-xs opacity-70 hover:opacity-100 disabled:opacity-20 transition cursor-pointer disabled:cursor-not-allowed"
                        style={{ color: currentText }}
                        title="Di chuyển lên trên"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === storyChapters.length - 1}
                        onClick={() => handleMoveChapter(chap.id, 'down')}
                        className="p-1 text-xs opacity-70 hover:opacity-100 disabled:opacity-20 transition cursor-pointer disabled:cursor-not-allowed"
                        style={{ color: currentText }}
                        title="Di chuyển xuống dưới"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setChapterToDeleteItem(chap)}
                    className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition cursor-pointer"
                    title="Xóa chương này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );

              // 1. GRID (Lưới ô gọn gàng)
              if (chapterListStyle === 'grid') {
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {storyChapters.map((chap, idx) => (
                      <div
                        key={chap.id}
                        className="p-3 rounded border flex flex-col justify-between gap-2 hover:opacity-95 transition cursor-pointer relative group"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
                        onClick={() => handleOpenEditChapterItem(chap)}
                      >
                        <div className="min-w-0">
                          {chap.volumeTitle && (
                            <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70 truncate mb-0.5" style={{ color: currentTextMuted }}>
                              {chap.volumeTitle}
                            </span>
                          )}
                          <span className="font-bold text-xs line-clamp-2" style={{ color: currentText }}>
                            {chap.title || `Chương ${chap.chapterNumber}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-dashed" style={{ borderColor: `${currentBorder}60` }}>
                          <span className="text-[10px] font-mono opacity-65" style={{ color: currentTextMuted }}>
                            {(chap.content || '').match(/\S+/g)?.length || 0} từ
                          </span>
                          <div className="flex items-center gap-1">
                            {chap.isLocked && (
                              <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setChapterToDeleteItem(chap); }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-300 transition"
                              title="Xóa chương"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // 2. ACCORDION (Gấp gọn theo Quyển)
              if (chapterListStyle === 'accordion') {
                const groupedByVolume: { volume: string; list: Chapter[] }[] = [];
                const unassigned: Chapter[] = [];
                storyChapters.forEach((c) => {
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
                          style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}
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
                              background: currentBtnBg,
                              color: currentBtnText,
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
                            <div className="p-2 space-y-1.5" style={{ background: currentCardBg }}>
                              {grp.list.map((chap, cIdx) => (
                                <div
                                  key={chap.id}
                                  className="p-2 rounded border text-xs flex items-center justify-between gap-2 hover:opacity-95 transition cursor-pointer"
                                  style={{ background: currentBtnSecondaryBg, borderColor: `${currentBorder}70` }}
                                  onClick={() => handleOpenEditChapterItem(chap)}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 opacity-75" style={{ background: `${currentBorder}40`, color: currentText }}>
                                      {cIdx + 1}
                                    </span>
                                    <span className="font-bold text-xs truncate" style={{ color: currentText }}>
                                      {chap.title || `Chương ${chap.chapterNumber}`}
                                    </span>
                                    {chap.isLocked && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                                      </span>
                                    )}
                                  </div>
                                  {renderChapterActions(chap, storyChapters.indexOf(chap))}
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

              // 3. TIMELINE (Dòng thời gian nghệ thuật)
              if (chapterListStyle === 'timeline') {
                return (
                  <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-current before:opacity-30" style={{ color: currentBorder }}>
                    {storyChapters.map((chap, idx) => (
                      <div key={chap.id} className="relative group">
                        {/* Timeline Node Dot */}
                        <div
                          className="absolute -left-6 sm:-left-8 top-3 w-3 h-3 rounded-full border-2 transform -translate-x-1/2 transition-transform group-hover:scale-125 shadow-xs"
                          style={{ background: currentBtnBg, borderColor: currentCardBg }}
                        />
                        <div
                          className="p-3 rounded border text-xs flex items-center justify-between gap-3 hover:opacity-95 transition cursor-pointer shadow-xs"
                          style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
                          onClick={() => handleOpenEditChapterItem(chap)}
                        >
                          <div className="flex-1 min-w-0">
                            {chap.volumeTitle && (
                              <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75" style={{ color: currentTextMuted }}>
                                {chap.volumeTitle}
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs truncate" style={{ color: currentText }}>
                                {chap.title || `Chương ${chap.chapterNumber}`}
                              </span>
                              {chap.isLocked && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono opacity-65 flex items-center gap-2 mt-0.5" style={{ color: currentTextMuted }}>
                              <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
                              <span>•</span>
                              <span>{chap.updatedAt || chap.createdAt}</span>
                            </div>
                          </div>
                          {renderChapterActions(chap, idx)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // 4. MINIMAL_TABLE (Bảng phẳng tối giản)
              if (chapterListStyle === 'minimal_table') {
                return (
                  <div className="border rounded overflow-hidden" style={{ borderColor: currentBorder }}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b text-[10px] font-mono uppercase font-bold" style={{ background: `${currentBorder}25`, borderColor: currentBorder, color: currentTextMuted }}>
                          <th className="p-2.5 w-12 text-center">#</th>
                          <th className="p-2.5">Tên chương</th>
                          <th className="p-2.5 w-24 hidden sm:table-cell text-center">Số từ</th>
                          <th className="p-2.5 w-32 hidden md:table-cell">Ngày đăng</th>
                          <th className="p-2.5 w-20 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: `${currentBorder}40` }}>
                        {storyChapters.map((chap, idx) => (
                          <tr
                            key={chap.id}
                            className="hover:opacity-90 transition cursor-pointer"
                            style={{ background: idx % 2 === 0 ? currentCardBg : currentBtnSecondaryBg }}
                            onClick={() => handleOpenEditChapterItem(chap)}
                          >
                            <td className="p-2.5 text-center font-mono font-bold opacity-70" style={{ color: currentTextMuted }}>
                              {idx + 1}
                            </td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: currentText }}>
                                  {chap.title || `Chương ${chap.chapterNumber}`}
                                </span>
                                {chap.isLocked && (
                                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                              {chap.volumeTitle && (
                                <span className="text-[9px] uppercase tracking-wider opacity-60 block" style={{ color: currentTextMuted }}>
                                  {chap.volumeTitle}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-mono text-[11px] opacity-75 hidden sm:table-cell" style={{ color: currentTextMuted }}>
                              {(chap.content || '').match(/\S+/g)?.length || 0}
                            </td>
                            <td className="p-2.5 text-[11px] font-mono opacity-70 hidden md:table-cell" style={{ color: currentTextMuted }}>
                              {chap.updatedAt || chap.createdAt}
                            </td>
                            <td className="p-2.5 text-right">
                              {renderChapterActions(chap, idx)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // 5. BOOK_CATALOG (Mục lục sách xuất bản)
              if (chapterListStyle === 'book_catalog') {
                return (
                  <div className={`p-4 sm:p-6 rounded border space-y-2.5 ${customBodyFont || ''}`} style={{ borderColor: currentBorder, background: currentBtnSecondaryBg }}>
                    <div className="text-center pb-2 border-b border-dashed mb-4" style={{ borderColor: currentBorder }}>
                      <span className={`text-xs font-bold uppercase tracking-widest ${customSubtitleFont || customBodyFont || ''}`} style={{ color: currentText }}>
                        MỤC LỤC
                      </span>
                    </div>
                    {storyChapters.map((chap, idx) => (
                      <div
                        key={chap.id}
                        className="flex items-baseline justify-between gap-2 hover:opacity-90 transition cursor-pointer group py-1"
                        onClick={() => handleOpenEditChapterItem(chap)}
                      >
                        <div className="flex items-center gap-2 min-w-0 shrink-0 max-w-[70%]">
                          <span className={`font-bold text-xs ${customBodyFont || ''}`} style={{ color: currentText }}>
                            {chap.title || `Chương ${chap.chapterNumber}`}
                          </span>
                          {chap.isLocked && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              <Lock className="w-2.5 h-2.5 inline" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 border-b border-dotted min-w-[20px] mx-1 opacity-50" style={{ borderColor: currentTextMuted }} />
                        <div className={`flex items-center gap-2 shrink-0 font-mono text-[10px] opacity-75 ${customMutedFont || ''}`} style={{ color: currentTextMuted }}>
                          <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
                          {renderChapterActions(chap, idx)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // 6. SCROLL_STRIP (Thẻ con nhộng huy hiệu)
              if (chapterListStyle === 'scroll_strip') {
                return (
                  <div className="flex flex-wrap gap-2">
                    {storyChapters.map((chap, idx) => (
                      <div
                        key={chap.id}
                        className="px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 hover:opacity-90 transition cursor-pointer shadow-xs group"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                        onClick={() => handleOpenEditChapterItem(chap)}
                      >
                        <Tag className="w-3 h-3 opacity-60" />
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">{chap.title || `C.${chap.chapterNumber}`}</span>
                        {chap.isLocked && (
                          <span className="text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setChapterToDeleteItem(chap); }}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              }

              // 7. CARDS_BENTO (Thẻ Bento đa giác quan)
              if (chapterListStyle === 'cards_bento') {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {storyChapters.map((chap, idx) => {
                      const isFeatured = idx === 0 || idx % 5 === 0;
                      return (
                        <div
                          key={chap.id}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 hover:opacity-95 transition cursor-pointer shadow-xs ${
                            isFeatured ? 'sm:col-span-2' : ''
                          }`}
                          style={{
                            background: isFeatured ? `${currentBtnBg}15` : currentBtnSecondaryBg,
                            borderColor: isFeatured ? currentBtnBg : currentBorder,
                          }}
                          onClick={() => handleOpenEditChapterItem(chap)}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: currentBtnBg, color: currentBtnText }}>
                                #{idx + 1}
                              </span>
                              {chap.isLocked && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-xs sm:text-sm line-clamp-2" style={{ color: currentText }}>
                              {chap.title || `Chương ${chap.chapterNumber}`}
                            </span>
                            {chap.volumeTitle && (
                              <span className="text-[10px] uppercase font-bold opacity-60 block mt-1" style={{ color: currentTextMuted }}>
                                {chap.volumeTitle}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed" style={{ borderColor: `${currentBorder}60` }}>
                            <span className="text-[10px] font-mono opacity-70" style={{ color: currentTextMuted }}>
                              {(chap.content || '').match(/\S+/g)?.length || 0} từ • {chap.updatedAt || chap.createdAt}
                            </span>
                            {renderChapterActions(chap, idx)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // 8. MODERN_COMPACT (Hàng ngang số to)
              if (chapterListStyle === 'modern_compact') {
                return (
                  <div className="space-y-2">
                    {storyChapters.map((chap, idx) => (
                      <div
                        key={chap.id}
                        className="p-3 rounded-lg border text-xs flex items-center gap-3 hover:opacity-95 transition cursor-pointer shadow-xs"
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
                        onClick={() => handleOpenEditChapterItem(chap)}
                      >
                        <div
                          className="w-10 h-10 rounded flex items-center justify-center font-mono font-black text-sm shrink-0 border"
                          style={{ background: `${currentBtnBg}20`, borderColor: currentBtnBg, color: currentText }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          {chap.volumeTitle && (
                            <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70" style={{ color: currentTextMuted }}>
                              {chap.volumeTitle}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate" style={{ color: currentText }}>
                              {chap.title || `Chương ${chap.chapterNumber}`}
                            </span>
                            {chap.isLocked && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono opacity-65 block mt-0.5" style={{ color: currentTextMuted }}>
                            {(chap.content || '').match(/\S+/g)?.length || 0} từ • {chap.updatedAt || chap.createdAt}
                          </span>
                        </div>
                        {renderChapterActions(chap, idx)}
                      </div>
                    ))}
                  </div>
                );
              }

              // 9. NUMBERS_ONLY (Chỉ hiện số chương)
              if (chapterListStyle === 'numbers_only') {
                return (
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {storyChapters.map((chap, idx) => (
                      <div
                        key={chap.id}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border font-bold text-xs sm:text-sm flex items-center justify-center relative hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs group ${customBodyFont || ''}`}
                        style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText }}
                        onClick={() => handleOpenEditChapterItem(chap)}
                        title={chap.title || `Chương ${chap.chapterNumber}`}
                      >
                        <span>{idx + 1}</span>
                        {chap.isLocked && (
                          <span className="absolute -top-1 -right-1 bg-amber-500/90 text-white rounded-full p-0.5 shadow-xs">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setChapterToDeleteItem(chap); }}
                          className="opacity-0 group-hover:opacity-100 absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-xs hover:bg-rose-600 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              }

              // 10. STANDARD (Chuẩn / Thẻ truyền thống)
              return (
                <div className="space-y-2">
                  {storyChapters.map((chap, idx) => (
                    <div
                      key={chap.id}
                      className="p-2.5 rounded border text-xs flex items-center justify-between gap-3 hover:opacity-95 transition cursor-pointer"
                      style={{ background: currentBtnSecondaryBg, borderColor: currentBorder }}
                      onClick={() => handleOpenEditChapterItem(chap)}
                    >
                      <div className="flex-1 min-w-0">
                        {chap.volumeTitle && (
                          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70" style={{ color: currentTextMuted }}>
                            {chap.volumeTitle}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate" style={{ color: currentText }}>
                            {chap.title || `Chương ${chap.chapterNumber}`}
                          </span>
                          {chap.isLocked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> {chap.unlockPrice || 1}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono opacity-65 flex items-center gap-2 mt-0.5" style={{ color: currentTextMuted }}>
                          <span>{(chap.content || '').match(/\S+/g)?.length || 0} từ</span>
                          <span>•</span>
                          <span>Cập nhật: {chap.updatedAt || chap.createdAt}</span>
                        </div>
                      </div>

                      {renderChapterActions(chap, idx)}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        );

      case 'comments':
        return (
          <div id="editor-block-comments" className="space-y-3 pt-4 border-t font-mono" style={{ borderColor: currentBorder }}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${customBodyFont}`} style={{ color: currentText }}>
              <MessageSquare className="w-4 h-4 opacity-80" />
              <span>Bình luận & Thảo luận</span>
            </h3>
            <div className="p-3 rounded border text-xs italic opacity-75 text-center" style={{ background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentTextMuted }}>
              Khu vực bình luận độc giả sẽ xuất hiện tại đây khi xem truyện.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article
      ref={articleRef as any}
      id="live-editor-story-article"
      className="p-6 space-y-6 relative transition-all duration-200 overflow-visible"
      style={{
        background: currentCardBg,
        ...getStoryBorderStyle(currentBorderObj, currentBorder),
      }}
    >
      {/* Corner Accents */}
      <StoryCornerAccents accent={activeBCorner} borderStyle={currentBorderObj?.borderStyle} color={currentBorder} />

      {/* Dynamic Layout Rendering with Story Sections */}
      <div className="space-y-6 w-full">
        {storyLayoutSections.map((sec, secIdx) => {
          if (sec.type === '1_column') {
            const blocks = sec.blocks || [];
            if (blocks.length === 0) return null;
            const mobileBlocks = getSortedMobileBlocks(blocks);

            return (
              <div key={sec.id || `sec-1col-${secIdx}`} className="w-full">
                {/* Mobile View */}
                <div className="flex sm:hidden flex-col gap-4 w-full">
                  {mobileBlocks.map((blockId) => (
                    <div key={`m-${blockId}`} className="w-full">
                      {renderLiveBlock(blockId)}
                    </div>
                  ))}
                </div>
                {/* Desktop View */}
                <div className="hidden sm:flex flex-col gap-4 w-full">
                  {blocks.map((blockId) => (
                    <div key={`d-${blockId}`} className="w-full">
                      {renderLiveBlock(blockId)}
                    </div>
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
              {/* Mobile View (< sm): Priority sorted single column (Cover -> Title -> Meta) */}
              <div className="flex sm:hidden flex-col gap-4 w-full">
                {mobileBlocks.map((blockId) => (
                  <div key={`m-${blockId}`} className="w-full">
                    {renderLiveBlock(blockId)}
                  </div>
                ))}
              </div>

              {/* Desktop View (>= sm): 2 columns side-by-side */}
              <div className={`hidden sm:grid ${gridColsClass} gap-6 items-start w-full`}>
                {/* Cột trái */}
                <div className="w-full flex flex-col gap-3.5 min-w-0">
                  {leftBlocks.map((blockId) => (
                    <div key={`d-${blockId}`} className="w-full">
                      {renderLiveBlock(blockId)}
                    </div>
                  ))}
                </div>

                {/* Cột phải */}
                <div className="w-full flex flex-col gap-4 min-w-0">
                  {rightBlocks.map((blockId) => (
                    <div key={`d-${blockId}`} className="w-full">
                      {renderLiveBlock(blockId)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};
