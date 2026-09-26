import React from 'react';
import {
  BellRing,
  MessageSquare,
  Smartphone,
  Mail,
  Cloud,
  Shield,
  StickyNote,
  AlertTriangle,
  Flame,
  Send,
  User,
  Heart,
  Terminal,
  FileText,
  ThumbsUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { ProtectedStoryText } from './ProtectedStoryText';


export type SpecialBlockType =
  | 'system'
  | 'forum'
  | 'netizen'
  | 'chat'
  | 'letter'
  | 'thought'
  | 'status'
  | 'note'
  | 'warning';

export interface ParsedBlock {
  type: 'paragraph' | SpecialBlockType;
  title?: string;
  meta?: string;
  rawText: string;
  lines: string[];
  subItems?: Array<{
    sender?: string;
    avatar?: string;
    time?: string;
    likes?: string;
    text: string;
    side?: 'left' | 'right';
  }>;
}

/**
 * Phân tích nội dung chương truyện thành danh sách các đoạn thường và các khung đặc biệt
 */
export function parseChapterContentBlocks(content: string): ParsedBlock[] {
  if (!content) return [];

  // Normalize Unicode to NFC so decomposed diacritics are properly composed
  const normalizedContent = content.normalize('NFC');
  const lines = normalizedContent.split('\n');
  const blocks: ParsedBlock[] = [];

  let currentBlockType: SpecialBlockType | null = null;
  let currentTitle: string | undefined = undefined;
  let currentMeta: string | undefined = undefined;
  let currentBlockLines: string[] = [];

  const flushNormalParagraphs = (rawLines: string[]) => {
    rawLines.forEach((line) => {
      const cleanP = line.trim();
      if (cleanP) {
        blocks.push({
          type: 'paragraph',
          rawText: cleanP,
          lines: [cleanP],
        });
      }
    });
  };

  let normalBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check mở thẻ block [system], [forum], [chat], [letter], [thought], [status], [note], [warning], [netizen]
    const openMatch = trimmed.match(
      /^\[(system|forum|netizen|chat|letter|thought|status|note|warning)(?::\s*([^\]]*))?\]\s*(.*)$/i
    );

    // Check đóng thẻ [/system], [/forum], etc.
    const closeMatch = trimmed.match(
      /^\[\/(system|forum|netizen|chat|letter|thought|status|note|warning)\]\s*$/i
    );

    if (openMatch && !currentBlockType) {
      // Flush text thường trước đó
      if (normalBuffer.length > 0) {
        flushNormalParagraphs(normalBuffer);
        normalBuffer = [];
      }

      const tag = openMatch[1].toLowerCase() as SpecialBlockType;
      const headerParam = openMatch[2]?.trim() || '';
      const restOfLine = openMatch[3]?.trim() || '';

      // Tách headerParam ra title và meta nếu có dấu |
      let title = headerParam;
      let meta: string | undefined = undefined;
      if (headerParam.includes('|')) {
        const parts = headerParam.split('|').map((p) => p.trim());
        title = parts[0];
        meta = parts.slice(1).join(' | ');
      }

      currentBlockType = tag;
      currentTitle = title || undefined;
      currentMeta = meta;
      currentBlockLines = [];

      // Nếu có nội dung ngay cùng dòng mở thẻ và có thẻ đóng ngay cùng dòng: [tag]Nội dung[/tag]
      const inlineCloseRegex = new RegExp(`\\[\\/${tag}\\]\\s*$`, 'i');
      if (inlineCloseRegex.test(restOfLine)) {
        const inlineContent = restOfLine.replace(inlineCloseRegex, '').trim();
        if (inlineContent) {
          currentBlockLines.push(inlineContent);
        }
        // Đóng block ngay
        blocks.push(buildParsedSpecialBlock(currentBlockType, currentTitle, currentMeta, currentBlockLines));
        currentBlockType = null;
        currentTitle = undefined;
        currentMeta = undefined;
        currentBlockLines = [];
        continue;
      } else if (restOfLine) {
        currentBlockLines.push(restOfLine);
      }
      continue;
    }

    if (closeMatch && currentBlockType && closeMatch[1].toLowerCase() === currentBlockType) {
      // Đóng block hiện tại
      blocks.push(buildParsedSpecialBlock(currentBlockType, currentTitle, currentMeta, currentBlockLines));
      currentBlockType = null;
      currentTitle = undefined;
      currentMeta = undefined;
      currentBlockLines = [];
      continue;
    }

    // Nếu đang trong block đặc biệt
    if (currentBlockType) {
      currentBlockLines.push(line);
    } else {
      // Kiểm tra dòng đơn shorthand ví dụ: [chat-left: Tên]: Nội dung hoặc [chat-right: Tên]: Nội dung
      const shortChatMatch = trimmed.match(/^\[(chat-left|chat-right|left|right)(?::\s*([^\]]*))?\]:\s*(.*)$/i);
      const shortNetizenMatch = trimmed.match(/^\[(netizen)(?::\s*([^\]]*))?\]:\s*(.*)$/i);

      if (shortChatMatch) {
        if (normalBuffer.length > 0) {
          flushNormalParagraphs(normalBuffer);
          normalBuffer = [];
        }
        const side = shortChatMatch[1].toLowerCase().includes('right') ? 'right' : 'left';
        const sender = shortChatMatch[2]?.trim() || (side === 'right' ? 'Bạn' : 'Người gửi');
        const text = shortChatMatch[3]?.trim() || '';
        blocks.push({
          type: 'chat',
          title: undefined,
          rawText: trimmed,
          lines: [text],
          subItems: [{ sender, text, side }],
        });
      } else if (shortNetizenMatch) {
        if (normalBuffer.length > 0) {
          flushNormalParagraphs(normalBuffer);
          normalBuffer = [];
        }
        const header = shortNetizenMatch[2]?.trim() || 'Cư dân mạng';
        let sender = header;
        let meta: string | undefined = undefined;
        if (header.includes('|')) {
          const parts = header.split('|').map((p) => p.trim());
          sender = parts[0];
          meta = parts.slice(1).join(' | ');
        }
        const text = shortNetizenMatch[3]?.trim() || '';
        blocks.push({
          type: 'netizen',
          title: sender,
          meta,
          rawText: trimmed,
          lines: [text],
          subItems: [{ sender, text, time: meta }],
        });
      } else {
        normalBuffer.push(line);
      }
    }
  }

  // Nếu file kết thúc khi đang trong block mà quên đóng thẻ [/tag], tự động đóng
  if (currentBlockType) {
    blocks.push(buildParsedSpecialBlock(currentBlockType, currentTitle, currentMeta, currentBlockLines));
  }

  // Flush buffer còn lại
  if (normalBuffer.length > 0) {
    flushNormalParagraphs(normalBuffer);
  }

  return blocks;
}

function buildParsedSpecialBlock(
  type: SpecialBlockType,
  title: string | undefined,
  meta: string | undefined,
  lines: string[]
): ParsedBlock {
  const rawText = lines.join('\n').trim();
  const subItems: ParsedBlock['subItems'] = [];

  if (type === 'chat') {
    lines.forEach((l) => {
      const trimmed = l.trim();
      if (!trimmed) return;
      // Match [left: Tên]: text hoặc [right: Tên]: text hoặc Tên (left/right): text
      const chatMatch = trimmed.match(/^\[?(left|right|chat-left|chat-right)?(?::\s*([^\]:]+))?\]?:\s*(.*)$/i);
      if (chatMatch) {
        const sideKey = (chatMatch[1] || '').toLowerCase();
        const side = sideKey.includes('right') ? 'right' : 'left';
        const sender = chatMatch[2]?.trim() || (side === 'right' ? 'Tôi' : 'Đối phương');
        const text = chatMatch[3]?.trim() || '';
        subItems.push({ sender, text, side });
      } else {
        // Dòng chat thông thường không có tiền tố
        subItems.push({ sender: title || 'Tin nhắn', text: trimmed, side: 'left' });
      }
    });
  } else if (type === 'forum' || type === 'netizen') {
    lines.forEach((l) => {
      const trimmed = l.trim();
      if (!trimmed) return;
      // Match [netizen: Tên | thời gian | like]: Nội dung hoặc [Tên]: Nội dung
      const cMatch = trimmed.match(/^\[?(?:netizen:)?\s*([^\]:]+)\]?:\s*(.*)$/i);
      if (cMatch) {
        const header = cMatch[1].trim();
        let sender = header;
        let time: string | undefined = undefined;
        let likes: string | undefined = undefined;
        if (header.includes('|')) {
          const parts = header.split('|').map((p) => p.trim());
          sender = parts[0];
          time = parts[1];
          likes = parts[2];
        }
        const text = cMatch[2].trim();
        subItems.push({ sender, text, time, likes });
      } else {
        subItems.push({ sender: 'Cư dân mạng', text: trimmed });
      }
    });
  }

  return {
    type,
    title,
    meta,
    rawText,
    lines: lines.map((l) => l.trim()).filter(Boolean),
    subItems: subItems.length > 0 ? subItems : undefined,
  };
}

interface SpecialBlockRendererProps {
  block: ParsedBlock;
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
  fontFamily?: string;
}

export function getSolidColor(colorOrGradient?: string, fallback = '#141414'): string {
  if (!colorOrGradient || typeof colorOrGradient !== 'string') return fallback;
  if (!colorOrGradient.toLowerCase().includes('gradient')) return colorOrGradient;
  const hexMatch = colorOrGradient.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
  if (hexMatch) return hexMatch[0];
  const rgbMatch = colorOrGradient.match(/rgba?\([^)]+\)/);
  if (rgbMatch) return rgbMatch[0];
  return fallback;
}

const getLuminance = (colorStr: string): number => {
  if (!colorStr || typeof colorStr !== 'string') return 0.5;
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  const cleanHex = colorStr.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length < 3) return 0.5;
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/**
 * Hiển thị khối khung đặc biệt theo từng phong cách chuyên biệt
 */
export const SpecialBlockRenderer: React.FC<SpecialBlockRendererProps> = ({
  block,
  themeColors,
  fontFamily = '',
}) => {
  const tBg = themeColors?.bg || '#18181b';
  const tCardBg = themeColors?.cardBg || '#27272a';
  const tBorder = themeColors?.border || '#3f3f46';
  const tBtnBg = themeColors?.btnBg || '#3f3f46';
  const tBtnText = themeColors?.btnText || '#f4f4f5';
  const tBtnSecBg = themeColors?.btnSecondaryBg || '#27272a';
  const tText = themeColors?.text || '#f4f4f5';
  const tTextMuted = themeColors?.textMuted || '#a1a1aa';
  const rawAccent = themeColors?.accentColor || themeColors?.text || themeColors?.btnText || '#f4f4f5';

  const cardLum = getLuminance(tCardBg);
  const isDark = cardLum < 0.5;

  // Đảm bảo chữ nội dung có độ tương phản cao với màu nền thẻ (tránh theme đen/trắng bị lỗi không đọc được)
  const safeText = isDark
    ? (getLuminance(tText) < 0.4 ? '#f8fafc' : tText)
    : (getLuminance(tText) > 0.6 ? '#0f172a' : tText);

  const safeTextMuted = isDark
    ? (getLuminance(tTextMuted) < 0.35 ? '#cbd5e1' : tTextMuted)
    : (getLuminance(tTextMuted) > 0.65 ? '#475569' : tTextMuted);

  // Đảm bảo safeAccent có độ tương phản cao với tCardBg (tránh theme đen/trắng bị chìm chữ)
  let safeAccent = rawAccent;
  const accentLum = getLuminance(safeAccent);
  if (Math.abs(cardLum - accentLum) < 0.28) {
    safeAccent = isDark ? (safeText || '#f8fafc') : (safeText || '#0f172a');
  }

  // Đảm bảo chữ/icon trên nền tBtnBg có độ tương phản rõ ràng
  const btnBgLum = getLuminance(tBtnBg);
  const safeBtnText = Math.abs(btnBgLum - getLuminance(tBtnText)) >= 0.3
    ? tBtnText
    : (btnBgLum > 0.5 ? '#0f172a' : '#ffffff');

  // 1. THÔNG BÁO HỆ THỐNG (System Alert / Game Panel)
  if (block.type === 'system') {
    const hasHeader = Boolean(block.title || block.meta);
    // Luôn bảo đảm là màu đơn sắc phẳng (Solid), TUYỆT ĐỐI không dùng gradient
    const solidCardBg = getSolidColor(tCardBg, isDark ? '#141414' : '#f8fafc');
    const solidBorder = getSolidColor(tBorder, isDark ? '#262626' : '#e2e8f0');
    const solidBtnBg = getSolidColor(tBtnBg, isDark ? '#1f1f1f' : '#f1f5f9');
    const systemText = isDark
      ? (getLuminance(safeText) < 0.4 ? '#f8fafc' : safeText)
      : (getLuminance(safeText) > 0.6 ? '#0f172a' : safeText);

    return (
      <div
        className="my-5 p-4 sm:p-5 rounded-lg border-2 shadow-sm relative overflow-hidden transition-all duration-200 font-mono"
        style={{
          backgroundColor: solidCardBg,
          borderColor: solidBorder,
          boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header hệ thống */}
        {hasHeader && (
          <div
            className="flex items-center justify-between gap-2 border-b pb-2.5 mb-3"
            style={{ borderColor: `${solidBorder}80` }}
          >
            {block.title ? (
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-md shadow-xs flex items-center justify-center"
                  style={{ backgroundColor: solidBtnBg, color: safeBtnText, border: `1px solid ${solidBorder}` }}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block" style={{ color: safeAccent }}>
                    {block.title}
                  </span>
                </div>
              </div>
            ) : (
              <div />
            )}
            {block.meta && (
              <span
                className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border shadow-xs"
                style={{ borderColor: solidBorder, color: safeBtnText, backgroundColor: solidBtnBg }}
              >
                {block.meta}
              </span>
            )}
          </div>
        )}

        {/* Nội dung thông báo */}
        <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: systemText }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx} className="flex items-start gap-2">
              <span style={{ color: safeAccent }} className="font-bold select-none shrink-0">
                ›
              </span>
              <span><ProtectedStoryText text={line} /></span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  // 2. BÌNH LUẬN CƯ DÂN MẠNG / DIỄN ĐÀN (Forum / Netizen Comments)
  if (block.type === 'forum' || block.type === 'netizen') {
    const hasHeader = Boolean(block.title || block.meta);
    return (
      <div
        className="my-5 p-4 sm:p-5 rounded-xl border shadow-md relative space-y-3 transition-all"
        style={{
          background: tCardBg,
          borderColor: tBorder,
        }}
      >
        {/* Header diễn đàn */}
        {hasHeader && (
          <div
            className="flex items-center justify-between border-b pb-2"
            style={{ borderColor: `${tBorder}60` }}
          >
            {block.title ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                  style={{ background: tBtnBg, color: safeBtnText }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: safeAccent }}>
                  {block.title}
                </span>
              </div>
            ) : (
              <div />
            )}
            {block.meta && (
              <span className="text-[10px] opacity-80 font-mono font-medium" style={{ color: safeTextMuted }}>
                {block.meta}
              </span>
            )}
          </div>
        )}

        {/* Danh sách bình luận */}
        <div className="space-y-2.5 pt-1">
          {block.subItems && block.subItems.length > 0 ? (
            block.subItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg text-xs space-y-1.5 transition-all shadow-xs"
                style={{
                  background: tBtnBg,
                  color: safeBtnText,
                  border: `1px solid ${tBorder || 'transparent'}`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs"
                      style={{ background: tCardBg, color: safeAccent }}
                    >
                      {item.sender ? item.sender.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span className="font-bold text-[11px]" style={{ color: safeBtnText }}>
                      {item.sender || 'Cư dân mạng'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] opacity-80 font-mono" style={{ color: safeBtnText }}>
                    {item.time && <span>{item.time}</span>}
                    {item.likes && <span>♥ {item.likes}</span>}
                  </div>
                </div>
                <p className="pl-7 leading-relaxed text-xs sm:text-sm" style={{ color: safeBtnText }}>
                  <ProtectedStoryText text={item.text} />
                </p>
              </div>
            ))
          ) : (
            <div
              className="p-3.5 rounded-lg text-xs space-y-1.5 shadow-xs"
              style={{ background: tBtnBg, color: safeBtnText, border: `1px solid ${tBorder || 'transparent'}` }}
            >
              {block.title && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold" style={{ color: safeBtnText }}>
                    {block.title}
                  </span>
                  {block.meta && (
                    <span className="text-[10px] opacity-75 font-mono" style={{ color: safeBtnText }}>
                      {block.meta}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed" style={{ color: safeBtnText }}>
                {block.lines.map((line, lIdx) => (
                  <p key={lIdx}><ProtectedStoryText text={line} /></p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. TIN NHẮN CHAT / HỘI THOẠI ĐIỆN THOẠI (Chat Message / SMS / Messenger)
  if (block.type === 'chat') {
    return (
      <div
        className="my-5 p-3 sm:p-4 rounded-2xl border shadow-lg max-w-xl mx-auto space-y-3"
        style={{
          background: tCardBg,
          borderColor: tBorder,
        }}
      >
        {/* Header khung chat */}
        {block.title && (
          <div
            className="flex items-center justify-between border-b pb-2 px-1"
            style={{ borderColor: `${tBorder}60` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ background: safeAccent }}
              />
              <span className="text-xs font-bold" style={{ color: safeAccent }}>
                {block.title}
              </span>
            </div>
            <Smartphone className="w-4 h-4 opacity-70" style={{ color: safeAccent }} />
          </div>
        )}

        {/* Nội dung các bong bóng chat */}
        <div className="space-y-3 py-1">
          {block.subItems && block.subItems.length > 0 ? (
            block.subItems.map((msg, mIdx) => {
              const isRight = msg.side === 'right';
              return (
                <div
                  key={mIdx}
                  className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <span className="text-[10px] px-1 font-semibold opacity-80 font-mono" style={{ color: safeTextMuted }}>
                    {msg.sender}
                  </span>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isRight ? 'rounded-br-xs' : 'rounded-bl-xs'
                    }`}
                    style={{
                      background: isRight ? tBtnBg : (tBtnSecBg || (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')),
                      color: isRight ? safeBtnText : safeText,
                      border: isRight ? `1px solid ${tBorder}` : `1px solid ${tBorder}`,
                    }}
                  >
                    <ProtectedStoryText text={msg.text} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-2">
              {block.lines.map((l, lIdx) => (
                <div key={lIdx} className="flex flex-col items-start space-y-1">
                  <div
                    className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-bl-xs text-xs sm:text-sm leading-relaxed border shadow-xs"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: safeText, borderColor: tBorder }}
                  >
                    <ProtectedStoryText text={l} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. THƯ TỪ / MẬT HÀM / NHẬT KÝ (Letter / Parchment / Secret Note)
  if (block.type === 'letter') {
    const hasHeader = Boolean(block.title || block.meta);
    return (
      <div
        className="my-5 p-5 sm:p-7 rounded-lg border-2 shadow-md relative space-y-3 transition-all"
        style={{
          background: tCardBg,
          borderColor: tBorder,
          boxShadow: isDark ? 'inset 0 0 15px rgba(0,0,0,0.3)' : 'inset 0 0 15px rgba(0,0,0,0.03)',
        }}
      >
        {/* Con dấu thư / Icon phong bì góc */}
        {hasHeader && (
          <div className="flex items-center justify-between border-b pb-2 border-dashed" style={{ borderColor: `${tBorder}80` }}>
            {block.title ? (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-80" style={{ color: safeAccent }} />
                <span className="text-xs font-lora font-serif font-bold italic tracking-wide" style={{ color: safeAccent, fontFamily: "'Lora', 'EB Garamond', 'Noto Serif', serif" }}>
                  {block.title}
                </span>
              </div>
            ) : (
              <div />
            )}
            {block.meta && (
              <span className="text-[10px] italic font-lora font-serif opacity-80" style={{ color: safeTextMuted, fontFamily: "'Lora', 'EB Garamond', 'Noto Serif', serif" }}>
                {block.meta}
              </span>
            )}
          </div>
        )}

        {/* Nội dung thư dạng chữ nghiêng trang nhã */}
        <div className="space-y-2 text-xs sm:text-sm leading-relaxed italic font-lora font-serif pt-1" style={{ color: safeText, fontFamily: "'Lora', 'EB Garamond', 'Noto Serif', serif" }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx} className="indent-4">
              <ProtectedStoryText text={line} />
            </p>
          ))}
        </div>
      </div>
    );
  }

  // 5. ĐỘC THOẠI NỘI TÂM / TÂM LINH (Thought / Telepathy)
  if (block.type === 'thought') {
    return (
      <div
        className="my-4 p-3.5 sm:p-4 rounded-xl border border-dashed shadow-xs relative space-y-1.5"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderColor: tBorder,
        }}
      >
        {block.title && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: safeAccent }}>
            <Cloud className="w-3.5 h-3.5" />
            <span>{block.title}</span>
          </div>
        )}
        <div className={`space-y-1 text-xs sm:text-sm leading-relaxed italic opacity-95 ${block.title ? 'pl-4 border-l-2' : ''}`} style={{ color: safeText, borderColor: safeAccent }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx}><ProtectedStoryText text={line} /></p>
          ))}
        </div>
      </div>
    );
  }

  // 6. BẢNG TRẠNG THÁI RPG / CHỈ SỐ NHÂN VẬT (Status Window / Quest Board)
  if (block.type === 'status') {
    return (
      <div
        className="my-5 p-4 sm:p-5 rounded-lg border-2 shadow-lg space-y-3 font-mono"
        style={{
          background: tCardBg,
          borderColor: tBorder,
        }}
      >
        {block.title && (
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${tBorder}80` }}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: safeAccent }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: safeAccent }}>
                {block.title}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: safeText }}>
          {block.lines.map((line, lIdx) => {
            const hasColon = line.includes(':');
            if (hasColon) {
              const [k, ...v] = line.split(':');
              return (
                <div key={lIdx} className="flex items-start justify-between gap-2 border-b border-dashed pb-1" style={{ borderColor: `${tBorder}60` }}>
                  <span className="font-semibold opacity-80 shrink-0" style={{ color: safeTextMuted }}>
                    {k.trim()}:
                  </span>
                  <span className="font-bold text-right" style={{ color: safeAccent }}>
                    <ProtectedStoryText text={v.join(':').trim()} />
                  </span>
                </div>
              );
            }
            return <p key={lIdx}><ProtectedStoryText text={line} /></p>;
          })}
        </div>
      </div>
    );
  }

  // 7. LỜI TÁC GIẢ / CHÚ THÍCH (Author Note / Footnote)
  if (block.type === 'note') {
    return (
      <div
        className="my-4 p-3.5 rounded-lg border border-dashed text-xs space-y-1.5"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderColor: tBorder,
        }}
      >
        {block.title && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: safeAccent }}>
            <StickyNote className="w-3.5 h-3.5" />
            <span>{block.title}</span>
          </div>
        )}
        <div className={`space-y-1 text-xs leading-relaxed opacity-90 ${block.title ? 'pl-3.5' : ''}`} style={{ color: safeText }}>
          {block.lines.map((line, lIdx) => (
            <p key={lIdx}><ProtectedStoryText text={line} /></p>
          ))}
        </div>
      </div>
    );
  }

  // 8. CẢNH BÁO / BÁO ĐỘNG (Warning / Red Alert)
  if (block.type === 'warning') {
    return (
      <div className="my-5 p-4 rounded-lg border-2 border-rose-500/80 bg-rose-950/30 text-rose-200 shadow-lg space-y-2 font-mono">
        {block.title && (
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400 border-b border-rose-500/30 pb-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{block.title}</span>
          </div>
        )}
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
          {block.lines.map((line, lIdx) => (
            <p key={lIdx}><ProtectedStoryText text={line} /></p>
          ))}
        </div>
      </div>
    );
  }

  // Fallback text
  return (
    <div className="my-3 space-y-1 text-base leading-relaxed" style={{ color: safeText }}>
      {block.lines.map((line, lIdx) => (
        <p key={lIdx}><ProtectedStoryText text={line} /></p>
      ))}
    </div>
  );
};
