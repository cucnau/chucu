import React, { useMemo, useState, useEffect } from 'react';

// Bộ ký tự cổ ngữ, phù hiệu ma trận, mã lỗi bản quyền
const PHANTOM_CHAOS_POOL = [
  '§*#', '𒀱', 'ᚠᚢᚦ', '0x8F', '𒈙⁂', '𖣘~', 'C0PY_ERR',
  '⊘_ERR', '𓆩𓆪', 'ᚱᚲ', '9A_PROTECT', 'ℭ𝔇', '≈≠≡',
  '𖤍', '𑁍', '௵', 'ꙮ', '⧫⟡', '░▒▓', '█▄▀', '֍֎',
  '⚡☠', '𒍼', 'ᛀᛁᛂ', '𝔞𝔟𝔠', 'ɘəɚ', '∊∋∌', '⊞⊟⊠',
  '𝕏', '※', '⍼', '⟦BẢN_QUYỀN_0x', '⟧', '⁜', '⊗', '۞',
  'ᚷᚸ', '𓍲𓍱', '𝔈𝔉', '≢≤', '⊦⊧', '༒☬'
];

interface ProtectedStoryTextProps {
  text: string;
  className?: string;
}

function getRandomNoise(): string {
  const sym1 = PHANTOM_CHAOS_POOL[Math.floor(Math.random() * PHANTOM_CHAOS_POOL.length)];
  const sym2 = PHANTOM_CHAOS_POOL[Math.floor(Math.random() * PHANTOM_CHAOS_POOL.length)];
  const hex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase();
  return ` [${sym1}_${hex}_${sym2}] `;
}

/**
 * Component hiển thị văn bản chương truyện:
 * 1. Trên màn hình: 100% bình thường, khoảng cách chuẩn xác giữa mọi từ, không bao giờ dính chữ hay lệch dòng.
 * 2. Khi bị bôi đen sao chép (kể cả bởi Extension Enable Copy trích xuất DOM):
 *    DOM Selection bắt buộc phải bao gồm các thẻ Phantom Noise ẩn, tạo ra văn bản đan xen mã lỗi,
 *    cổ ngữ và ký tự ma trận lộn xộn, hoàn toàn khác nhau sau mỗi lần copy.
 */
export const ProtectedStoryText: React.FC<ProtectedStoryTextProps> = ({ text, className = '' }) => {
  // Trigger làm mới seed ngẫu nhiên khi người dùng tương tác / bôi đen
  const [seed, setSeed] = useState(() => Date.now());

  useEffect(() => {
    const handleSelectionOrAction = () => {
      // Làm mới token ngẫu nhiên để mỗi lần copy sau đó đều sinh ra biến dị khác
      setSeed(Date.now());
    };

    document.addEventListener('selectionchange', handleSelectionOrAction, { passive: true });
    return () => {
      document.removeEventListener('selectionchange', handleSelectionOrAction);
    };
  }, []);

  const renderedContent = useMemo(() => {
    if (!text) return null;

    // Tách theo dòng trước để giữ nguyên cấu trúc xuống dòng
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <br key={`br-${lineIdx}`} />;
      }

      // Tách thành từng từ (bỏ qua khoảng trắng thừa)
      const words = line.split(/\s+/).filter(Boolean);

      return (
        <React.Fragment key={`line-${lineIdx}`}>
          {words.map((word, wordIdx) => {
            // Cách mỗi 2-3 từ chèn 1 thẻ Phantom Noise
            const shouldAddNoise = wordIdx % 2 === 0 || wordIdx % 3 === 0;
            const noise = shouldAddNoise ? getRandomNoise() : null;

            return (
              <React.Fragment key={`w-${wordIdx}`}>
                <span>{word}</span>
                {noise && (
                  <span
                    aria-hidden="true"
                    className="story-phantom-noise"
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      padding: 0,
                      margin: '-1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 0,
                      userSelect: 'text',
                      WebkitUserSelect: 'text',
                    }}
                  >
                    {noise}
                  </span>
                )}
                {/* Luôn luôn có khoảng trắng chuẩn giữa các từ để không bao giờ bị dính chữ */}
                {wordIdx < words.length - 1 ? ' ' : ''}
              </React.Fragment>
            );
          })}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  }, [text, seed]);

  return <span className={`protected-story-text ${className}`}>{renderedContent}</span>;
};
