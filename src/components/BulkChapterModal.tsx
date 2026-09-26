import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { Chapter, Story } from '../types';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle,
  Edit3,
  Layers,
  Check,
  RefreshCw,
  FileType,
  BookOpen
} from 'lucide-react';

export interface ParsedChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  selected: boolean;
  volumeTitle?: string;
}

interface BulkChapterModalProps {
  story: Story;
  existingChapters: Chapter[];
  onClose: () => void;
  onSaveBatch: (chapters: Chapter[]) => Promise<void>;
}

// Regex patterns to detect chapter heading lines in Vietnamese & international formats
const CHAPTER_REGEX_PATTERNS = [
  // "Chương 1: Tiêu đề", "Chương 1 - Tiêu đề", "Chương 1. Tiêu đề", "Chương 1"
  /^\s*(?:#{1,3}\s*)?(?:chương|chapter|chap|tiết|hồi)\s+([0-9ivxlcdm一二三四五六七八九十百千万]+)?\s*([:.\-–—]\s*.*|\s+.*)?$/i,
  // "Chương [0-9]+" without separator
  /^\s*(?:#{1,3}\s*)?(?:chương|chapter|chap|hồi)\s*([0-9ivxlcdm]+)\b\s*(.*)$/i,
  // "Hồi thứ [0-9]+"
  /^\s*(?:#{1,3}\s*)?(?:hồi\s+thứ|chương\s+thứ)\s+([0-9ivxlcdm一二三四五六七八九十百千万]+)\s*([:.\-–—]\s*.*|\s+.*)?$/i
];

function isChapterHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 150) return false;
  return CHAPTER_REGEX_PATTERNS.some(regex => regex.test(trimmed));
}

function parseChaptersFromRawText(rawText: string, startingChapterNum: number): ParsedChapterItem[] {
  if (!rawText || !rawText.trim()) return [];

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const headerIndices: { lineIndex: number; title: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (isChapterHeaderLine(line)) {
      headerIndices.push({
        lineIndex: i,
        title: line.replace(/^#+\s*/, '').trim(),
      });
    }
  }

  const results: ParsedChapterItem[] = [];

  // If no chapter headers were matched at all
  if (headerIndices.length === 0) {
    const wordCount = normalized.trim().split(/\s+/).filter(Boolean).length;
    results.push({
      id: 'bulk-' + Date.now() + '-0',
      chapterNumber: startingChapterNum,
      title: `Chương ${startingChapterNum}: Nội dung tải lên`,
      content: normalized.trim(),
      wordCount,
      selected: true,
    });
    return results;
  }

  // If there is opening content before the first chapter header
  if (headerIndices[0].lineIndex > 0) {
    const preLines = lines.slice(0, headerIndices[0].lineIndex);
    const preContent = preLines.join('\n').trim();
    if (preContent.length > 25) {
      results.push({
        id: 'bulk-' + Date.now() + '-pre',
        chapterNumber: startingChapterNum,
        title: 'Lời Mở Đầu / Giới Thiệu',
        content: preContent,
        wordCount: preContent.split(/\s+/).filter(Boolean).length,
        selected: true,
      });
    }
  }

  // Parse each chapter
  for (let i = 0; i < headerIndices.length; i++) {
    const current = headerIndices[i];
    const next = headerIndices[i + 1];

    const startLine = current.lineIndex + 1;
    const endLine = next ? next.lineIndex : lines.length;

    const chapterContent = lines.slice(startLine, endLine).join('\n').trim();
    const wordCount = chapterContent.split(/\s+/).filter(Boolean).length;

    const chapIndex = results.length;
    results.push({
      id: `bulk-${Date.now()}-${i}`,
      chapterNumber: startingChapterNum + chapIndex,
      title: current.title,
      content: chapterContent,
      wordCount,
      selected: true,
    });
  }

  return results;
}

export const BulkChapterModal: React.FC<BulkChapterModalProps> = ({
  story,
  existingChapters,
  onClose,
  onSaveBatch,
}) => {
  const storyChapters = (existingChapters || []).filter(c => c && story && c.storyId === story?.id);
  const defaultStartNum = storyChapters.length + 1;

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [startChapterNumber, setStartChapterNumber] = useState<number>(defaultStartNum);
  const [parsedChapters, setParsedChapters] = useState<ParsedChapterItem[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ current: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Lock Chapter with Chucu options
  const [isBulkLocked, setIsBulkLocked] = useState(false);
  const [bulkUnlockPrice, setBulkUnlockPrice] = useState(1);

  // Manual Volume assignment state by Editor
  const [manualVolumeInput, setManualVolumeInput] = useState('');
  const [editingVolumeItemId, setEditingVolumeItemId] = useState<string | null>(null);
  const [editingVolumeItemValue, setEditingVolumeItemValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setParseError(null);

    const isWordFile = 
      file.name.toLowerCase().endsWith('.docx') || 
      file.name.toLowerCase().endsWith('.doc') || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword';

    if (isWordFile) {
      setIsParsingFile(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const content = result.value;

        if (!content || !content.trim()) {
          throw new Error('File Word trống hoặc không trích xuất được văn bản.');
        }

        setRawText(content);
        const parsed = parseChaptersFromRawText(content, startChapterNumber);
        setParsedChapters(parsed);
        setHasParsed(true);
      } catch (err: any) {
        console.error('Word parse error:', err);
        setParseError('Không thể trích xuất văn bản từ file Word này. Hãy đảm bảo file ở định dạng .docx tiêu chuẩn hoặc copy văn bản dán vào ô bên dưới.');
      } finally {
        setIsParsingFile(false);
      }
    } else {
      // Plain text or markdown
      setIsParsingFile(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setRawText(content);
          const parsed = parseChaptersFromRawText(content, startChapterNumber);
          setParsedChapters(parsed);
          setHasParsed(true);
        }
        setIsParsingFile(false);
      };
      reader.onerror = () => {
        setParseError('Lỗi đọc file văn bản. Vui lòng thử lại.');
        setIsParsingFile(false);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleParseText = () => {
    if (!rawText.trim()) return;
    const parsed = parseChaptersFromRawText(rawText, startChapterNumber);
    setParsedChapters(parsed);
    setHasParsed(true);
  };

  const handleReorderAndRenumber = (newStart: number) => {
    setStartChapterNumber(newStart);
    setParsedChapters(prev =>
      prev.map((c, idx) => ({
        ...c,
        chapterNumber: newStart + idx,
      }))
    );
  };

  const handleToggleSelect = (id: string) => {
    setParsedChapters(prev =>
      prev.map(c => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedChapters(prev => prev.map(c => ({ ...c, selected: select })));
  };

  const handleDeleteChapterItem = (id: string) => {
    setParsedChapters(prev => {
      const filtered = prev.filter(c => c.id !== id);
      return filtered.map((c, idx) => ({
        ...c,
        chapterNumber: startChapterNumber + idx,
      }));
    });
  };

  const handleStartEditTitle = (item: ParsedChapterItem) => {
    setEditingTitleId(item.id);
    setEditingTitleValue(item.title);
  };

  const handleSaveEditTitle = (id: string) => {
    if (editingTitleValue.trim()) {
      setParsedChapters(prev =>
        prev.map(c => (c.id === id ? { ...c, title: editingTitleValue.trim() } : c))
      );
    }
    setEditingTitleId(null);
    setEditingTitleValue('');
  };

  const handleApplyManualVolume = () => {
    if (!manualVolumeInput.trim()) return;
    const vol = manualVolumeInput.trim();
    setParsedChapters(prev =>
      prev.map(c => (c.selected ? { ...c, volumeTitle: vol } : c))
    );
  };

  const handleClearManualVolume = () => {
    setParsedChapters(prev =>
      prev.map(c => (c.selected ? { ...c, volumeTitle: undefined } : c))
    );
  };

  const handleStartEditItemVolume = (item: ParsedChapterItem) => {
    setEditingVolumeItemId(item.id);
    setEditingVolumeItemValue(item.volumeTitle || '');
  };

  const handleSaveEditItemVolume = (id: string) => {
    const val = editingVolumeItemValue.trim();
    setParsedChapters(prev =>
      prev.map(c => (c.id === id ? { ...c, volumeTitle: val || undefined } : c))
    );
    setEditingVolumeItemId(null);
    setEditingVolumeItemValue('');
  };

  const selectedCount = parsedChapters.filter(c => c.selected).length;
  const totalWords = parsedChapters
    .filter(c => c.selected)
    .reduce((acc, curr) => acc + curr.wordCount, 0);

  const handleSaveAll = async () => {
    const toSave = parsedChapters.filter(c => c.selected);
    if (toSave.length === 0) return;

    setIsSubmitting(true);
    setSaveProgress({ current: 0, total: toSave.length });

    const today = new Date().toISOString().split('T')[0];
    const newChaptersToSave: Chapter[] = toSave.map((item, idx) => ({
      id: 'chap-' + (Date.now() + idx),
      storyId: story?.id || '',
      chapterNumber: item.chapterNumber,
      title: item.title,
      volumeTitle: item.volumeTitle || undefined,
      content: item.content,
      views: 0,
      createdAt: today,
      updatedAt: today,
      isLocked: isBulkLocked,
      unlockPrice: isBulkLocked ? Math.max(1, bulkUnlockPrice) : undefined,
    }));

    try {
      await onSaveBatch(newChaptersToSave);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#11090c] border border-[#2d1822] w-full max-w-4xl max-h-[92vh] flex flex-col font-mono-code text-[#e0d0d5] shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#23151b] flex items-center justify-between bg-[#150b10]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#221019] border border-[#5e2f46] text-[#ffd6e2]">
              <Layers className="w-5 h-5 text-[#d0a0b0]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#e0c0cc] flex items-center gap-2">
                <span>Tải File Tổng & Tự Động Chia Chương</span>
                <span className="text-[10px] bg-[#2b1620] border border-[#5e2f46] px-2 py-0.5 text-[#ffd6e2]">
                  Auto Split
                </span>
              </h2>
              <p className="text-[11px] text-[#8a717a] mt-0.5">
                Truyện: <span className="text-[#ffd6e2] font-semibold">{story?.title || 'Truyện mới'}</span> (Đang có {storyChapters.length} chương)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-[#8a717a] hover:text-[#e0c0cc] transition disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Step 1: Input Source (File upload or direct paste) */}
          {!hasParsed ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drag & Drop File Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 min-h-[160px] relative ${
                    dragOver
                      ? 'border-[#8d4766] bg-[#221019]'
                      : 'border-[#2d1822] bg-[#160c10] hover:border-[#5e2f46] hover:bg-[#1a0e14]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc,.txt,.md,.text"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="p-3 bg-[#221019] rounded-full border border-[#5e2f46]">
                    {isParsingFile ? (
                      <RefreshCw className="w-6 h-6 text-[#ffd6e2] animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#d0a0b0]" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-[#e0c0cc] block">
                      {isParsingFile
                        ? 'Đang đọc và giải mã file...'
                        : fileName
                        ? `Đã chọn: ${fileName}`
                        : 'Chọn hoặc Kéo thả File vào đây'}
                    </span>
                    <span className="text-[11px] text-[#8a717a] block mt-1">
                      Hỗ trợ file Word (<strong className="text-[#ffd6e2]">.docx</strong>, <strong className="text-[#ffd6e2]">.doc</strong>), file văn bản (<strong className="text-[#ffd6e2]">.txt</strong>, <strong className="text-[#ffd6e2]">.md</strong>)
                    </span>
                  </div>
                </div>

                {/* Configuration box */}
                <div className="bg-[#160c10] border border-[#2d1822] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-[#e0c0cc] flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd6e2]" />
                      <span>Cơ chế tự động nhận diện</span>
                    </span>
                    <p className="text-[11px] text-[#8a717a] leading-relaxed">
                      Hệ thống tự động quét và phân tách các chương khi gặp định dạng như:
                    </p>
                    <ul className="text-[11px] text-[#c0a0aa] space-y-1 bg-[#10070a] p-2.5 border border-[#24111a]">
                      <li>• <code className="text-[#ffd6e2]">Chương 1: Tiêu đề</code> hoặc <code className="text-[#ffd6e2]">Chương 1 - Tiêu đề</code></li>
                      <li>• <code className="text-[#ffd6e2]">Chương 01</code>, <code className="text-[#ffd6e2]">Chương I</code>, <code className="text-[#ffd6e2]">Hồi 1</code>, <code className="text-[#ffd6e2]">Chapter 1</code></li>
                      <li>• Phần mở đầu trước Chương 1 sẽ được xếp thành <code className="text-[#ffd6e2]">Lời mở đầu</code>.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#23151b] pt-2">
                    <label className="text-[11px] text-[#8a717a]">Bắt đầu từ số chương:</label>
                    <input
                      type="number"
                      min={1}
                      value={startChapterNumber}
                      onChange={(e) => setStartChapterNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-[#10070a] border border-[#2d1822] p-1.5 text-center text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46]"
                    />
                  </div>
                </div>
              </div>

              {/* Parse Error Alert */}
              {parseError && (
                <div className="bg-[#241018] border border-[#f87171]/50 p-3 text-[#fca5a5] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
                  <span className="text-[11px]">{parseError}</span>
                </div>
              )}

              {/* Paste Direct Text Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#8a717a] text-[11px] font-bold uppercase tracking-wider">
                    Hoặc Dán toàn bộ nội dung file truyện vào đây:
                  </label>
                  {rawText && (
                    <span className="text-[11px] text-[#8a717a]">
                      {rawText.length.toLocaleString()} ký tự
                    </span>
                  )}
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán toàn bộ văn bản truyện (có chứa các đầu mục Chương 1, Chương 2,...) vào đây..."
                  rows={10}
                  className="w-full bg-[#160c10] border border-[#2d1822] p-3 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46] leading-relaxed resize-y font-mono-code"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#160c10] border border-[#2d1822] text-[#8a717a] hover:text-[#e0c0cc] transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={!rawText.trim()}
                  className="px-6 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#ffd6e2] font-bold uppercase tracking-wider disabled:opacity-40 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Quét & Tách chương ngay</span>
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Review and Edit Parsed Chapters */
            <div className="space-y-4">
              {/* Summary Stats Bar */}
              <div className="bg-[#160c10] border border-[#2d1822] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#221019] border border-[#5e2f46] text-[#ffd6e2]">
                    <CheckCircle2 className="w-4 h-4 text-[#d0a0b0]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#e0c0cc] text-xs sm:text-sm block">
                      Đã nhận diện: {parsedChapters.length} chương
                    </span>
                    <span className="text-[11px] text-[#8a717a]">
                      Đang chọn: <span className="text-[#ffd6e2] font-semibold">{selectedCount}</span> / {parsedChapters.length} chương • Tổng cộng: ~{totalWords.toLocaleString()} từ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasParsed(false);
                      setParsedChapters([]);
                    }}
                    className="px-3 py-1.5 bg-[#12090c] border border-[#2d1822] text-[#8a717a] hover:text-[#e0c0cc] transition flex items-center gap-1.5 text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tải lại nội dung khác</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23151b] pb-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="px-2 py-1 bg-[#1a0e14] border border-[#2d1822] hover:border-[#5e2f46] text-[#e0c0cc] transition"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="px-2 py-1 bg-[#1a0e14] border border-[#2d1822] hover:border-[#5e2f46] text-[#8a717a] hover:text-[#e0c0cc] transition"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#8a717a]">Đánh số lại từ:</span>
                  <input
                    type="number"
                    min={1}
                    value={startChapterNumber}
                    onChange={(e) => handleReorderAndRenumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-[#10070a] border border-[#2d1822] p-1 text-center text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46]"
                  />
                </div>
              </div>

              {/* Lock with Chucu Configuration for Batch */}
              <div className="p-3 bg-[#170c12] border border-[#3a1d2c] flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBulkLocked}
                    onChange={(e) => setIsBulkLocked(e.target.checked)}
                    className="cursor-pointer accent-[#5e2f46] w-4 h-4"
                  />
                  <span className="font-bold text-[#ffd6e2] flex items-center gap-1.5">
                    <span>Khóa tất cả các chương này</span>
                    <span className="text-[10px] text-[#8a717a] font-normal">(Yêu cầu Chucu để mở khóa)</span>
                  </span>
                </label>

                {isBulkLocked && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#ffd6e2]">Giá mở khóa mỗi chương:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={bulkUnlockPrice}
                        onChange={(e) => setBulkUnlockPrice(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-[#10070a] border border-[#5e2f46] p-1 text-center text-xs text-[#ffd6e2] font-bold focus:outline-none"
                      />
                      <span className="text-[#ffd6e2] font-bold">Chucu</span>
                    </div>
                    <span className="text-[10px] text-[#8a717a] italic">(Tối thiểu 1 Chucu)</span>
                  </div>
                )}
              </div>

              {/* Manual Volume / Section Setter by Editor */}
              <div className="p-3 bg-[#160a11] border border-[#3d1f2e] space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[#ffd6e2] font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-[#ff99bb]" />
                    <span>Gán Phần / Quyển cho các chương đang chọn (Editor tự đặt tên):</span>
                  </div>
                  <span className="text-[11px] text-[#8a717a]">
                    Đã chọn: <span className="text-[#ffd6e2] font-bold">{selectedCount}</span> chương
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={manualVolumeInput}
                    onChange={(e) => setManualVolumeInput(e.target.value)}
                    placeholder="Nhập tên phần/quyển (Ví dụ: Quyển 1: Đêm đông sống lại)..."
                    className="flex-1 min-w-[220px] bg-[#10070a] border border-[#2d1822] px-2.5 py-1.5 text-xs text-[#e0c0cc] focus:outline-none focus:border-[#5e2f46]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyManualVolume}
                    disabled={!manualVolumeInput.trim() || selectedCount === 0}
                    className="px-3 py-1.5 bg-[#2b1620] border border-[#5e2f46] hover:bg-[#3d1e2c] text-[#ffd6e2] font-bold disabled:opacity-40 transition text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Gán cho {selectedCount} chương</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearManualVolume}
                    disabled={selectedCount === 0}
                    className="px-2.5 py-1.5 bg-[#180b12] border border-[#2d1822] hover:border-[#5e2f46] text-[#8a717a] hover:text-[#ffd6e2] disabled:opacity-40 transition text-xs"
                  >
                    Xóa quyển khỏi {selectedCount} chương
                  </button>
                </div>
              </div>

              {/* Parsed Chapters List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {parsedChapters.map((item, idx) => {
                  const prevItem = idx > 0 ? parsedChapters[idx - 1] : null;
                  const isNewVolume = !!(item.volumeTitle && (!prevItem || prevItem.volumeTitle !== item.volumeTitle));
                  const isTransitionToNoVolume = !item.volumeTitle && !!(prevItem && prevItem.volumeTitle);

                  const isExpanded = expandedPreviewId === item.id;
                  const isEditing = editingTitleId === item.id;
                  const isEditingVolume = editingVolumeItemId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Section Break / Ngắt Phần Header */}
                      {isNewVolume && (
                        <div className="pt-2 pb-0.5">
                          <div className="bg-[#1f0f18] border border-[#5e2f46] px-3.5 py-1.5 flex items-center justify-between text-xs font-bold text-[#ffd6e2] rounded-xs shadow-xs">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-[#ff99bb]" />
                              <span>{item.volumeTitle}</span>
                            </div>
                            <span className="text-[11px] font-normal text-[#c492a5]">
                              {parsedChapters.filter((c) => c.volumeTitle === item.volumeTitle).length} chương
                            </span>
                          </div>
                        </div>
                      )}

                      {isTransitionToNoVolume && (
                        <div className="pt-2 pb-0.5">
                          <div className="bg-[#12080d] border border-dashed border-[#3b1f2d] px-3 py-1 flex items-center gap-2 text-xs text-[#8a717a] rounded-xs">
                            <BookOpen className="w-3 h-3 text-[#8a717a]" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">Các chương tiếp theo</span>
                          </div>
                        </div>
                      )}

                      <div
                        className={`border transition duration-150 ${
                          item.selected
                            ? 'bg-[#170d12] border-[#3a1d2c]'
                            : 'bg-[#12090c] border-[#201017] opacity-60'
                        }`}
                      >
                        <div className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => handleToggleSelect(item.id)}
                              className="cursor-pointer accent-[#5e2f46] w-4 h-4 shrink-0"
                            />

                            {/* Chapter Badge */}
                            <span className="shrink-0 px-2 py-0.5 bg-[#221019] border border-[#5e2f46] text-[10px] text-[#ffd6e2] font-bold">
                              Chương #{item.chapterNumber}
                            </span>

                            {/* Volume Tag / Inline Volume Editor */}
                            {isEditingVolume ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="text"
                                  value={editingVolumeItemValue}
                                  onChange={(e) => setEditingVolumeItemValue(e.target.value)}
                                  placeholder="Tên Quyển..."
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditItemVolume(item.id);
                                    if (e.key === 'Escape') setEditingVolumeItemId(null);
                                  }}
                                  className="w-32 bg-[#10070a] border border-[#5e2f46] px-1.5 py-0.5 text-[10px] text-[#ffd6e2]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditItemVolume(item.id)}
                                  className="p-0.5 bg-[#2b1620] border border-[#5e2f46] text-[#ffd6e2]"
                                  title="Lưu quyển"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingVolumeItemId(null)}
                                  className="p-0.5 bg-[#160c10] border border-[#2d1822] text-[#8a717a]"
                                  title="Hủy"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : item.volumeTitle ? (
                              <button
                                type="button"
                                onClick={() => handleStartEditItemVolume(item)}
                                className="shrink-0 px-1.5 py-0.5 bg-[#200d18] border border-[#4d2138] hover:border-[#ff99bb] text-[9px] text-[#e0a8be] font-medium hidden sm:inline-flex items-center gap-1 transition"
                                title="Bấm để sửa tên quyển"
                              >
                                <BookOpen className="w-2.5 h-2.5 text-[#ff99bb]" />
                                <span>{item.volumeTitle}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditItemVolume(item)}
                                className="shrink-0 px-1.5 py-0.5 bg-[#140a0f] border border-dashed border-[#2d1822] hover:border-[#5e2f46] text-[9px] text-[#8a717a] hover:text-[#ffd6e2] hidden sm:inline-flex items-center gap-1 transition"
                                title="Đặt quyển cho chương này"
                              >
                                <span>+ Quyển</span>
                              </button>
                            )}

                            {/* Chapter Title (Editable) */}
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingTitleValue}
                                    onChange={(e) => setEditingTitleValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEditTitle(item.id);
                                      if (e.key === 'Escape') setEditingTitleId(null);
                                    }}
                                    autoFocus
                                    className="w-full bg-[#10070a] border border-[#5e2f46] px-2 py-1 text-xs text-[#ffd6e2] focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveEditTitle(item.id)}
                                    className="p-1 bg-[#2b1620] border border-[#5e2f46] text-[#ffd6e2] hover:bg-[#3d1e2c]"
                                    title="Lưu"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingTitleId(null)}
                                    className="p-1 bg-[#160c10] border border-[#2d1822] text-[#8a717a]"
                                    title="Hủy"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 group/title">
                                  <span className="font-bold text-[#e0c0cc] truncate text-xs">
                                    {item.title}
                                  </span>
                                  <button
                                    onClick={() => handleStartEditTitle(item)}
                                    className="opacity-0 group-hover/title:opacity-100 text-[#8a717a] hover:text-[#ffd6e2] transition p-0.5"
                                    title="Đổi tiêu đề"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              <span className="text-[10px] text-[#8a717a] block mt-0.5">
                                {item.wordCount.toLocaleString()} từ • ~{Math.ceil(item.wordCount / 200)} phút đọc
                              </span>
                            </div>
                          </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setExpandedPreviewId(isExpanded ? null : item.id)}
                            className="p-1.5 text-[#8a717a] hover:text-[#e0c0cc] transition"
                            title={isExpanded ? 'Thu gọn' : 'Xem trước nội dung'}
                          >
                            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteChapterItem(item.id)}
                            className="p-1.5 text-[#8a717a] hover:text-[#f87171] transition"
                            title="Xóa chương này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Preview Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#23151b] bg-[#0e070a]">
                          <div className="p-3 bg-[#140a0f] border border-[#24111a] text-[11px] text-[#c0a0aa] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-mono-code">
                            {item.content.slice(0, 1500)}
                            {item.content.length > 1500 && (
                              <span className="italic text-[#8a717a]">
                                {'\n\n'}... [Còn tiếp {item.content.length - 1500} ký tự nữa]
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              </div>

              {/* Footer Save Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#23151b]">
                <div className="text-[11px] text-[#8a717a]">
                  Sẵn sàng đăng <span className="text-[#ffd6e2] font-bold">{selectedCount}</span> chương vào truyện "{story?.title || 'Truyện mới'}".
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#160c10] border border-[#2d1822] text-[#8a717a] hover:text-[#e0c0cc] transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={selectedCount === 0 || isSubmitting}
                    className="px-6 py-2 bg-[#2b1620] hover:bg-[#3d1e2c] border border-[#5e2f46] text-[#ffd6e2] font-bold uppercase tracking-wider disabled:opacity-40 transition flex items-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang lưu ({selectedCount} chương)...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Lưu {selectedCount} chương</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
