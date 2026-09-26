// Anti-Enable-Copy & Multi-Layer Dynamic Chaotic Clipboard Scrambler Engine
// Vô hiệu hóa triệt để tiện ích Enable Copy, SuperCopy, Absolute Copy và thao tác sao chép lậu.
// Mỗi lần copy (lần 1, lần 2, lần 3...) BẮT BUỘC sinh ra một kết quả hỗn loạn hoàn toàn khác nhau 100%.

const RUNIC_CUNEIFORM = [
  '§', '¶', '⁂', '₪', '⍼', '⧫', '⟡', '⊘', '⊗', '░', '▒', '▓', '█', '▄', '▀',
  '𒀱', '𒈙', '𒐫', '𒍼', '𓆩', '𓆪', '𓍢', '𓍲', '𓍱', '𓏵', '𓇽', '𖣘', '𖤍', '𑁍', '௵', 'ꙮ',
  'ᚠ', 'ᚡ', 'ᚢ', 'ᚣ', 'ᚤ', 'ᚥ', 'ᚦ', 'ᚧ', 'ᚨ', 'ᚩ', 'ᚪ', 'ᚫ', 'ᚬ', 'ᚭ', 'ᚮ', 'ᚯ', 'ᚰ', 'ᚱ',
  'ᚲ', 'ᚳ', 'ᚴ', 'ᚵ', 'ᚶ', 'ᚷ', 'ᚸ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᚼ', 'ᚽ', 'ᚾ', 'ᚿ', 'ᛀ', 'ᛁ', 'ᛂ', 'ᛃ',
  '𝔄', '𝔅', 'ℭ', '𝔇', '𝔈', '𝔉', '𝔊', 'ℌ', 'ℑ', '𝔍', '𝔎', '𝔏', '𝔐', '𝔑', '𝔒', '𝔓', '𝔔', 'ℜ',
  '𝔞', '𝔟', '𝔠', '𝔡', '𝔢', '𝔣', '𝔤', '𝔥', '𝔦', '𝔧', '𝔨', '𝔩', '𝔪', '𝔫', '𝔬', '𝔭', '𝔮', '𝔯',
  'ɐ', 'ɓ', 'ɔ', 'ɕ', 'ɖ', 'ɗ', 'ɘ', 'ə', 'ɚ', 'ɛ', 'ɜ', 'ɝ', 'ɞ', 'ɟ', 'ɠ', 'ɡ', 'ɢ', 'ɣ',
  '⚔', '☠', '⚡', '✦', '✧', '❖', '☣', '☢', '☯', '༒', '☬', '࿇', '֍', '֎', '۞', '۝',
  '≈', '≠', '≡', '≢', '≤', '≥', '≦', '≧', '≨', '≩', '≪', '≫', '≬', '≭', '≮', '≯', '≰', '≱',
  '∆', '∇', '∈', '∉', '∊', '∋', '∌', '∍', '∎', '∏', '∐', '∑', '−', '∓', '∔', '∕', '∖', '∗',
  '⊞', '⊟', '⊠', '⊡', '⊢', '⊣', '⊤', '⊥', '⊦', '⊧', '⊨', '⊩', '⊪', '⊫', '⊬', '⊭', '⊮', '⊯'
];

const GLITCH_TAGS = [
  '[§*#]', '[?¿!]', '[⌀_0x8F]', '[𝕏_ERR]', '[▓▒_ERR]', '[𖣘_INTERCEPT]', '[~*~]', '[#§_LOCK]',
  '[MÃ_BẢN_QUYỀN_VÔ_HIỆU]', '[CORRUPTED_CLIPBOARD]', '[DATA_OBFUSCATED]', '[PROTECTED_TEXT]',
  '[0x7F4A_MUTATION]', '[ERR_PROTECT_0x9B]', '[BẢN_QUYỀN_CHOCO_HOUSE]', '[GLITCH_INTERCEPT_5C]'
];

const ZALGO_MARKS = [
  '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309',
  '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F', '\u0310', '\u0311', '\u0312', '\u0313',
  '\u0314', '\u0315', '\u0316', '\u0317', '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D',
  '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329',
  '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0339', '\u033A', '\u033B', '\u033C', '\u033D',
  '\u0340', '\u0341', '\u0342', '\u0343', '\u0344', '\u0345', '\u0346', '\u0347', '\u0348', '\u0349'
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Tạo văn bản xáo trộn sâu, băm nát cấu trúc câu, thay thế chữ bằng cổ ngữ & zalgo ngẫu nhiên.
 * Đảm bảo 100% mỗi lần gọi sẽ sinh ra chuỗi biến dị hoàn toàn khác nhau.
 */
export function generateChaoticScramble(rawText: string = ''): string {
  const clean = (rawText || '').trim();
  const now = Date.now().toString(36).toUpperCase();
  const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();

  const lines = clean ? clean.split('\n') : ['Nội dung truyện'];

  const scrambledLines = lines.map((line) => {
    if (!line.trim()) {
      return Math.random() > 0.5 ? pick(GLITCH_TAGS) : '';
    }

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';

    // Xáo trộn ngẫu nhiên thứ tự các từ (Fisher-Yates)
    const shuffledWords = [...words];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }

    // Biến đổi từng từ thành chuỗi ký tự hỗn loạn ma trận
    const mutatedWords = shuffledWords.map((word) => {
      // 20% thay thế hoàn toàn từ bằng Glitch Tag hoặc Hex Code
      if (Math.random() < 0.2) {
        return Math.random() < 0.5
          ? pick(GLITCH_TAGS)
          : `0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}`;
      }

      const chars = Array.from(word);
      const mutatedChars = chars.map((char) => {
        const r = Math.random();
        // 50% biến thành cổ ngữ / ký tự hỗn loạn
        if (r < 0.5) {
          return pick(RUNIC_CUNEIFORM);
        }
        // 30% chèn Zalgo đè nát ký tự
        if (r < 0.8) {
          const zCount = Math.floor(Math.random() * 3) + 1;
          const zMarks = Array.from({ length: zCount }, () => pick(ZALGO_MARKS)).join('');
          return char + zMarks;
        }
        // 20% chèn kèm ký hiệu nhiễu
        return char + pick(RUNIC_CUNEIFORM);
      });

      // Đảo trật tự chữ cái trong từ
      if (mutatedChars.length > 2 && Math.random() < 0.6) {
        mutatedChars.reverse();
      }

      return mutatedChars.join('');
    });

    // Chèn ngẫu nhiên các ký tự cổ và phù hiệu giữa các từ
    const resultWords: string[] = [];
    for (const w of mutatedWords) {
      resultWords.push(w);
      if (Math.random() < 0.35) {
        resultWords.push(pick(RUNIC_CUNEIFORM));
      }
      if (Math.random() < 0.1) {
        resultWords.push(pick(GLITCH_TAGS));
      }
    }

    return resultWords.join(' ');
  });

  const baseResult = scrambledLines.join('\n');
  const footerGlitch = `\n[⊘_ERR_MUTATION_${now}_${randomHex}_PROTECTED]`;
  return baseResult + footerGlitch;
}

/**
 * Kiểm tra xem người dùng có đang thực hiện thao tác trong các ô nhập liệu của tác giả hay không
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!target) return false;
  if (target instanceof HTMLElement) {
    const tagName = target.tagName.toUpperCase();
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable) {
      return true;
    }
    if (target.closest('input, textarea, [contenteditable="true"], .monaco-editor, .story-editor-input')) {
      return true;
    }
  }
  const activeEl = document.activeElement;
  if (activeEl instanceof HTMLElement) {
    const activeTag = activeEl.tagName.toUpperCase();
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeEl.isContentEditable) {
      return true;
    }
    if (activeEl.closest('input, textarea, [contenteditable="true"], .monaco-editor, .story-editor-input')) {
      return true;
    }
  }
  return false;
}

/**
 * Lấy văn bản đang bôi đen trên trình duyệt
 */
function getNativeSelectedText(): string {
  try {
    if (window.getSelection) {
      const sel = window.getSelection();
      return sel ? sel.toString() : '';
    }
    if ((document as any).selection && (document as any).selection.type !== 'Control') {
      return (document as any).selection.createRange().text || '';
    }
  } catch (err) {
    // Ignore
  }
  return '';
}

/**
 * Khởi tạo hệ thống chặn Enable Copy & xáo trộn Clipboard đa tầng (Multi-Layer Scrambler)
 */
export function initAntiCopyProtection(): () => void {
  // 1. Hook đè API navigator.clipboard.writeText
  let originalWriteText: ((data: string) => Promise<void>) | null = null;
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async function (text: string) {
        if (!isEditableElement(document.activeElement)) {
          const scrambled = generateChaoticScramble(text);
          return originalWriteText ? originalWriteText(scrambled) : Promise.resolve();
        }
        return originalWriteText ? originalWriteText(text) : Promise.resolve();
      };
    } catch (e) {
      // Ignore
    }
  }

  // 2. Hook đè Selection.prototype.toString & Range.prototype.toString
  // Khi extension Enable Copy gọi window.getSelection().toString() để lấy text, kết quả trả về sẽ bị xáo trộn tức thì
  let originalSelectionToString: (() => string) | null = null;
  let originalRangeToString: (() => string) | null = null;

  if (typeof Selection !== 'undefined' && Selection.prototype && Selection.prototype.toString) {
    try {
      originalSelectionToString = Selection.prototype.toString;
      Selection.prototype.toString = function () {
        const real = originalSelectionToString ? originalSelectionToString.call(this) : '';
        if (!real || isEditableElement(document.activeElement)) {
          return real;
        }
        return generateChaoticScramble(real);
      };
    } catch (e) {
      // Ignore
    }
  }

  if (typeof Range !== 'undefined' && Range.prototype && Range.prototype.toString) {
    try {
      originalRangeToString = Range.prototype.toString;
      Range.prototype.toString = function () {
        const real = originalRangeToString ? originalRangeToString.call(this) : '';
        if (!real || isEditableElement(document.activeElement)) {
          return real;
        }
        return generateChaoticScramble(real);
      };
    } catch (e) {
      // Ignore
    }
  }

  // 3. Xử lý sự kiện Copy & Cut trên Capture Phase
  const handleCopy = (e: ClipboardEvent) => {
    if (isEditableElement(e.target)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }

    const rawSelected = getNativeSelectedText();
    const scrambled = generateChaoticScramble(rawSelected || 'Nội dung truyện được bảo vệ bản quyền.');

    if (e.clipboardData) {
      try {
        e.clipboardData.clearData();
        e.clipboardData.setData('text/plain', scrambled);
        e.clipboardData.setData('text/html', `<div style="font-family: monospace;">${scrambled}</div>`);
      } catch (err) {
        // Ignore
      }
    }

    if (originalWriteText) {
      try {
        originalWriteText(scrambled).catch(() => {});
      } catch (err) {
        // Ignore
      }
    }
  };

  const handleCut = (e: ClipboardEvent) => {
    if (isEditableElement(e.target)) return;
    handleCopy(e);
  };

  const handleDragStart = (e: DragEvent) => {
    if (isEditableElement(e.target)) return;
    e.preventDefault();
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (isEditableElement(e.target)) return;
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (!isCtrlOrCmd) return;

    const key = e.key ? e.key.toLowerCase() : '';
    const target = e.target;

    // Nếu người dùng ấn Ctrl+C hoặc Ctrl+X ngoài ô nhập liệu
    if (['c', 'x'].includes(key) && !isEditableElement(target)) {
      const rawSelected = getNativeSelectedText();
      const scrambled = generateChaoticScramble(rawSelected || 'Nội dung truyện được bảo vệ bản quyền.');
      if (originalWriteText) {
        try {
          originalWriteText(scrambled).catch(() => {});
        } catch (err) {
          // Ignore
        }
      }
    }

    // Chặn phím xem mã nguồn và in ấn
    if (['u', 's', 'p'].includes(key) && !isEditableElement(target)) {
      e.preventDefault();
    }
  };

  // Đăng ký ở Capture Phase trên Window, Document và Document Body
  window.addEventListener('copy', handleCopy, true);
  document.addEventListener('copy', handleCopy, true);
  document.body?.addEventListener('copy', handleCopy, true);

  window.addEventListener('cut', handleCut, true);
  document.addEventListener('cut', handleCut, true);
  document.body?.addEventListener('cut', handleCut, true);

  document.addEventListener('dragstart', handleDragStart, true);
  document.addEventListener('contextmenu', handleContextMenu, true);
  window.addEventListener('keydown', handleKeyDown, true);

  return () => {
    window.removeEventListener('copy', handleCopy, true);
    document.removeEventListener('copy', handleCopy, true);
    document.body?.removeEventListener('copy', handleCopy, true);

    window.removeEventListener('cut', handleCut, true);
    document.removeEventListener('cut', handleCut, true);
    document.body?.removeEventListener('cut', handleCut, true);

    document.removeEventListener('dragstart', handleDragStart, true);
    document.removeEventListener('contextmenu', handleContextMenu, true);
    window.removeEventListener('keydown', handleKeyDown, true);

    if (originalWriteText && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        navigator.clipboard.writeText = originalWriteText;
      } catch (e) {
        // Ignore
      }
    }

    if (originalSelectionToString && typeof Selection !== 'undefined' && Selection.prototype) {
      try {
        Selection.prototype.toString = originalSelectionToString;
      } catch (e) {
        // Ignore
      }
    }

    if (originalRangeToString && typeof Range !== 'undefined' && Range.prototype) {
      try {
        Range.prototype.toString = originalRangeToString;
      } catch (e) {
        // Ignore
      }
    }
  };
}
