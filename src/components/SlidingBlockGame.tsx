import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, Trophy, Volume2, VolumeX, 
  HelpCircle, ChevronLeft, ChevronRight, Flame
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';

interface SlidingBlockGameProps {
  onBack: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
}

export type BlockColorId = 'blue' | 'orange' | 'green' | 'purple' | 'yellow' | 'pink';

export interface Block {
  id: string;
  row: number; // 0 (trên cùng) đến 9 (dưới cùng)
  col: number; // 0 đến 7
  width: number; // 1 đến 4
  colorId: BlockColorId;
}

const BOARD_COLS = 8;
const BOARD_ROWS = 10;

// Bảng 6 màu khối Pastel đồng bộ hoàn hảo với phong cách của Block Blast & Tetris
const BLOCK_COLORS: Record<BlockColorId, {
  name: string;
  bg: string;
  border: string;
  glow: string;
  light: string;
}> = {
  blue: {
    name: 'Sky Pastel',
    bg: '#7dd3fc', // Xanh da trời pastel dịu
    border: '#bae6fd',
    glow: 'rgba(125, 211, 252, 0.45)',
    light: '#f0f9ff',
  },
  orange: {
    name: 'Apricot Pastel',
    bg: '#fdba74', // Cam mơ pastel dịu
    border: '#fed7aa',
    glow: 'rgba(253, 186, 116, 0.45)',
    light: '#fff7ed',
  },
  green: {
    name: 'Mint Pastel',
    bg: '#6ee7b7', // Xanh bạc hà pastel mát mắt
    border: '#a7f3d0',
    glow: 'rgba(110, 231, 183, 0.45)',
    light: '#ecfdf5',
  },
  purple: {
    name: 'Lavender Pastel',
    bg: '#c084fc', // Tím hoa oải hương pastel
    border: '#e9d5ff',
    glow: 'rgba(192, 132, 252, 0.45)',
    light: '#faf5ff',
  },
  yellow: {
    name: 'Butter Pastel',
    bg: '#fde047', // Vàng bơ mềm pastel
    border: '#fef08a',
    glow: 'rgba(253, 224, 71, 0.45)',
    light: '#fefce8',
  },
  pink: {
    name: 'Sakura Pink Pastel',
    bg: '#f472b6', // Hồng phấn hoa anh đào pastel
    border: '#fbcfe8',
    glow: 'rgba(244, 114, 182, 0.45)',
    light: '#fdf2f8',
  },
};

const COLOR_KEYS: BlockColorId[] = ['blue', 'orange', 'green', 'purple', 'yellow', 'pink'];

let globalBlockCounter = 1;

// Sinh khối ngẫu nhiên cho một hàng, ĐẢM BẢO KHÔNG BAO GIỜ TRÙNG MÀU CÁC KHỐI KỀ NHAU
function generateRandomRowBlocks(row: number): Block[] {
  const blocks: Block[] = [];
  const targetFilled = Math.floor(Math.random() * 3) + 4; // Điền 4, 5 hoặc 6 ô

  const sizes: (1 | 2 | 3 | 4)[] = [];
  let currentFilled = 0;
  while (currentFilled < targetFilled) {
    const remain = targetFilled - currentFilled;
    const maxSz = Math.min(remain, 3) as 1 | 2 | 3;
    const sz = (Math.floor(Math.random() * maxSz) + 1) as 1 | 2 | 3;
    sizes.push(sz);
    currentFilled += sz;
  }

  const emptySpaces = BOARD_COLS - currentFilled;
  const gaps: number[] = new Array(sizes.length + 1).fill(0);
  for (let i = 0; i < emptySpaces; i++) {
    const idx = Math.floor(Math.random() * gaps.length);
    gaps[idx]++;
  }

  let currentCol = gaps[0];
  let lastColor: BlockColorId | null = null;

  for (let i = 0; i < sizes.length; i++) {
    const w = sizes[i];
    // Chọn màu khác hoàn toàn khối liền trước
    const candidates = lastColor ? COLOR_KEYS.filter(c => c !== lastColor) : COLOR_KEYS;
    const assignedColor = candidates[Math.floor(Math.random() * candidates.length)];
    lastColor = assignedColor;

    blocks.push({
      id: `blk-${Date.now()}-${globalBlockCounter++}`,
      row,
      col: currentCol,
      width: w,
      colorId: assignedColor,
    });
    currentCol += w + gaps[i + 1];
  }

  return blocks;
}

function createInitialBlocks(): Block[] {
  const initial: Block[] = [];
  for (let r = 7; r <= 9; r++) {
    initial.push(...generateRandomRowBlocks(r));
  }
  return initial;
}

export const SlidingBlockGame: React.FC<SlidingBlockGameProps> = ({ onBack }) => {
  const [blocks, setBlocks] = useState<Block[]>(() => createInitialBlocks());
  const [nextRowBlocks, setNextRowBlocks] = useState<Block[]>(() => generateRandomRowBlocks(9));
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('slide_block_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Hiệu ứng nổ hàng đơn giản
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [floatingScore, setFloatingScore] = useState<{ id: number; text: string; combo?: number } | null>(null);

  // Kéo trượt khối
  const [dragging, setDragging] = useState<{
    blockId: string;
    startCol: number;
    startX: number;
    currentOffsetPx: number;
    minOffsetPx: number;
    maxOffsetPx: number;
    colWidthPx: number;
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Âm thanh đơn giản nhẹ nhàng phong cách Block Blast
  const playSound = useCallback((type: 'slide' | 'drop' | 'clear' | 'gameover' | 'combo') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const now = ctx.currentTime;

      if (type === 'slide') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'clear') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.15, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.2);
        });
      } else if (type === 'combo') {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.22);
        });
      } else if (type === 'gameover') {
        const notes = [370, 311, 260, 196];
        notes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + idx * 0.1);
          gain.gain.setValueAtTime(0.12, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.16);
        });
      }
    } catch {}
  }, [soundEnabled]);

  const isCellOccupied = useCallback((r: number, c: number, currentBlocks: Block[], ignoreId?: string) => {
    return currentBlocks.some(b => 
      b.id !== ignoreId && b.row === r && c >= b.col && c < b.col + b.width
    );
  }, []);

  const getBlockSlideBounds = useCallback((block: Block, currentBlocks: Block[]) => {
    let minCol = block.col;
    while (minCol > 0) {
      if (isCellOccupied(block.row, minCol - 1, currentBlocks, block.id)) break;
      minCol--;
    }

    let maxCol = block.col;
    while (maxCol + block.width < BOARD_COLS) {
      if (isCellOccupied(block.row, maxCol + block.width, currentBlocks, block.id)) break;
      maxCol++;
    }

    return { minCol, maxCol };
  }, [isCellOccupied]);

  const applyGravity = useCallback((currentBlocks: Block[]): { blocks: Block[]; fell: boolean } => {
    let changed = false;
    let list = [...currentBlocks];
    let hasAnyFallen = false;

    do {
      changed = false;
      list.sort((a, b) => b.row - a.row);

      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        if (b.row >= BOARD_ROWS - 1) continue;

        const targetRow = b.row + 1;
        let canFall = true;
        for (let c = b.col; c < b.col + b.width; c++) {
          if (isCellOccupied(targetRow, c, list, b.id)) {
            canFall = false;
            break;
          }
        }

        if (canFall) {
          list[i] = { ...b, row: targetRow };
          changed = true;
          hasAnyFallen = true;
        }
      }
    } while (changed);

    return { blocks: list, fell: hasAnyFallen };
  }, [isCellOccupied]);

  const clearFullRows = useCallback((currentBlocks: Block[]): { blocks: Block[]; clearedIndices: number[] } => {
    const fullRowIndices: number[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      let filled = 0;
      for (let c = 0; c < BOARD_COLS; c++) {
        if (isCellOccupied(r, c, currentBlocks)) {
          filled++;
        }
      }
      if (filled === BOARD_COLS) {
        fullRowIndices.push(r);
      }
    }

    if (fullRowIndices.length === 0) {
      return { blocks: currentBlocks, clearedIndices: [] };
    }

    const remaining = currentBlocks.filter(b => !fullRowIndices.includes(b.row));
    return { blocks: remaining, clearedIndices: fullRowIndices };
  }, [isCellOccupied]);

  const updateHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem('slide_block_high_score', String(newScore));
      } catch {}
    }
  }, [highScore]);

  const processTurn = useCallback((afterSlideBlocks: Block[]) => {
    let { blocks: gravityBlocks, fell } = applyGravity(afterSlideBlocks);
    if (fell) playSound('drop');

    let current = gravityBlocks;
    let turnLinesCleared = 0;
    let comboStreak = combo;
    const allClearedRows: number[] = [];

    while (true) {
      const { blocks: remaining, clearedIndices } = clearFullRows(current);
      if (clearedIndices.length === 0) break;

      allClearedRows.push(...clearedIndices);
      turnLinesCleared += clearedIndices.length;
      comboStreak += 1;
      current = remaining;

      const gResult = applyGravity(current);
      current = gResult.blocks;
    }

    if (turnLinesCleared > 0) {
      setClearingRows(allClearedRows);
      setTimeout(() => setClearingRows([]), 250);

      const basePoints = turnLinesCleared === 1 ? 100 : turnLinesCleared === 2 ? 300 : turnLinesCleared === 3 ? 600 : 1000;
      const comboBonus = comboStreak > 1 ? (comboStreak - 1) * 60 : 0;
      const turnScore = basePoints + comboBonus;

      setScore(s => {
        const nextScore = s + turnScore;
        updateHighScore(nextScore);
        return nextScore;
      });

      setCombo(comboStreak);
      setMaxCombo(mc => Math.max(mc, comboStreak));

      if (comboStreak > 1) {
        playSound('combo');
        setFloatingScore({ id: Date.now(), text: `+${turnScore}`, combo: comboStreak });
      } else {
        playSound('clear');
        setFloatingScore({ id: Date.now(), text: `+${turnScore}` });
      }
      setTimeout(() => setFloatingScore(null), 1000);
    } else {
      setCombo(0);
    }

    // Đẩy hàng lên từ đáy
    const pushedUpBlocks = current.map(b => ({ ...b, row: b.row - 1 }));
    const overflow = pushedUpBlocks.some(b => b.row < 0);
    if (overflow) {
      setIsGameOver(true);
      playSound('gameover');
      return;
    }

    const newBornBlocks = nextRowBlocks.map(b => ({ ...b, row: BOARD_ROWS - 1 }));
    let combined = [...pushedUpBlocks, ...newBornBlocks];
    setNextRowBlocks(generateRandomRowBlocks(BOARD_ROWS - 1));

    let postGravity = applyGravity(combined).blocks;
    const postClear = clearFullRows(postGravity);
    if (postClear.clearedIndices.length > 0) {
      postGravity = applyGravity(postClear.blocks).blocks;
      const autoScore = postClear.clearedIndices.length * 100;
      setScore(s => {
        const ns = s + autoScore;
        updateHighScore(ns);
        return ns;
      });
      playSound('clear');
    }

    const hitTop = postGravity.some(b => b.row <= 0);
    if (hitTop) {
      setIsGameOver(true);
      playSound('gameover');
    }

    setBlocks(postGravity);
    setSelectedBlockId(null);
  }, [applyGravity, clearFullRows, combo, playSound, updateHighScore, nextRowBlocks]);

  const slideBlock = useCallback((blockId: string, newCol: number) => {
    const target = blocks.find(b => b.id === blockId);
    if (!target || target.col === newCol) return;

    const updated = blocks.map(b => b.id === blockId ? { ...b, col: newCol } : b);
    setBlocks(updated);
    playSound('slide');

    processTurn(updated);
  }, [blocks, playSound, processTurn]);

  const handlePointerDown = (e: React.PointerEvent, block: Block) => {
    if (isGameOver) return;

    setSelectedBlockId(block.id);
    const boardEl = boardRef.current;
    if (!boardEl) return;

    const boardRect = boardEl.getBoundingClientRect();
    const colWidth = boardRect.width / BOARD_COLS;
    const bounds = getBlockSlideBounds(block, blocks);

    const minOffset = (bounds.minCol - block.col) * colWidth;
    const maxOffset = (bounds.maxCol - block.col) * colWidth;

    setDragging({
      blockId: block.id,
      startCol: block.col,
      startX: e.clientX,
      currentOffsetPx: 0,
      minOffsetPx: minOffset,
      maxOffsetPx: maxOffset,
      colWidthPx: colWidth,
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const deltaX = e.clientX - dragging.startX;
    const clamped = Math.max(dragging.minOffsetPx, Math.min(dragging.maxOffsetPx, deltaX));
    setDragging(prev => prev ? { ...prev, currentOffsetPx: clamped } : null);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    const { blockId, startCol, currentOffsetPx, colWidthPx } = dragging;
    const colShift = Math.round(currentOffsetPx / colWidthPx);
    const targetCol = startCol + colShift;

    setDragging(null);

    if (colShift !== 0) {
      slideBlock(blockId, targetCol);
    }
  };

  const restartGame = useCallback(() => {
    setBlocks(createInitialBlocks());
    setNextRowBlocks(generateRandomRowBlocks(BOARD_ROWS - 1));
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsGameOver(false);
    setSelectedBlockId(null);
    setClearingRows([]);
  }, []);

  const moveSelectedBlock = useCallback((dir: 'left' | 'right') => {
    if (!selectedBlockId || isGameOver) return;
    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block) return;

    const bounds = getBlockSlideBounds(block, blocks);
    if (dir === 'left' && block.col > bounds.minCol) {
      slideBlock(block.id, block.col - 1);
    } else if (dir === 'right' && block.col < bounds.maxCol) {
      slideBlock(block.id, block.col + 1);
    }
  }, [selectedBlockId, isGameOver, blocks, getBlockSlideBounds, slideBlock]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        moveSelectedBlock('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        moveSelectedBlock('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveSelectedBlock]);

  return (
    <div className="max-w-[360px] mx-auto py-2 space-y-2.5 font-mono-code select-none">
      {/* 1. Header bar phong cách đồng bộ, hỗ trợ hoàn hảo chế độ sáng/tối */}
      <div className="slideblock-panel bg-[#1c0c16] border border-[#3b1f2d] rounded-xs p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="slideblock-btn p-1.5 bg-[#14080e] hover:bg-[#25101b] border border-[#f59e0b]/40 rounded-xs slideblock-text-main text-[#fed7aa] hover:text-white transition flex items-center gap-1 cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Trở về</span>
          </button>
          <div className="flex items-center gap-1.5">
            <h1 className="slideblock-text-main text-sm font-black text-[#fed7aa] tracking-tight">TRƯỢT KHỐI</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(p => !p)}
            className="slideblock-btn p-1.5 bg-[#14080e] hover:bg-[#25101b] border border-[#3b1f2d] slideblock-text-main text-[#fed7aa] rounded-xs transition cursor-pointer"
            title="Hướng dẫn"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSoundEnabled(p => !p)}
            className="slideblock-btn p-1.5 bg-[#14080e] hover:bg-[#25101b] border border-[#3b1f2d] slideblock-text-main text-[#fed7aa] rounded-xs transition cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#86efac]" /> : <VolumeX className="w-3.5 h-3.5 text-[#8a717a]" />}
          </button>

          <button
            onClick={restartGame}
            className="flex items-center gap-1 px-2 py-1 bg-[#b45309] hover:bg-[#d97706] text-white text-[11px] font-bold rounded-xs border border-[#f59e0b] transition shadow-xs cursor-pointer"
            title="Chơi ván mới"
          >
            <RotateCcw className="w-3 h-3" />
            <span>LẠI</span>
          </button>
        </div>
      </div>

      {/* 2. Bảng điểm & Kỷ lục dạng 3 ô nhỏ gọn */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {/* Điểm hiện tại */}
        <div className="slideblock-panel bg-[#14080e] border border-[#3b1f2d] py-1.5 px-2 rounded-xs">
          <span className="slideblock-text-muted text-[9px] text-[#8a717a] uppercase font-bold block leading-tight">ĐIỂM</span>
          <span className="text-lg font-black text-[#fb923c] tracking-wider leading-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Combo */}
        <div className="slideblock-panel bg-[#14080e] border border-[#3b1f2d] py-1.5 px-2 rounded-xs flex flex-col justify-center items-center">
          <span className="slideblock-text-muted text-[9px] text-[#8a717a] uppercase font-bold flex items-center gap-0.5 leading-tight">
            <Flame className={`w-2.5 h-2.5 ${combo > 1 ? 'text-[#fca5a5] animate-bounce' : 'text-[#8a717a]'}`} />
            COMBO
          </span>
          <span className={`text-lg font-black leading-tight ${combo > 1 ? 'text-[#fde047]' : 'text-[#543b46]'}`}>
            {combo > 1 ? `x${combo}` : '-'}
          </span>
        </div>

        {/* Kỷ lục */}
        <div className="slideblock-panel bg-[#14080e] border border-[#3b1f2d] py-1.5 px-2 rounded-xs">
          <span className="slideblock-text-muted text-[9px] text-[#8a717a] uppercase font-bold flex items-center justify-center gap-0.5 leading-tight">
            <Trophy className="w-2.5 h-2.5 text-[#fde047]" />
            KỶ LỤC
          </span>
          <span className="text-lg font-black text-[#fde047] tracking-wider leading-tight">
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Hướng dẫn nhanh khi bấm Help */}
      {showHelp && (
        <div className="slideblock-panel bg-[#180a13] border border-[#f59e0b]/40 p-2.5 rounded-xs text-[11px] space-y-1 slideblock-text-main text-[#fed7aa]">
          <p className="font-bold slideblock-text-main text-white">Cách chơi:</p>
          <ul className="list-disc pl-4 space-y-0.5 slideblock-text-muted text-[#d4b0bd]">
            <li>Kéo trượt các khối sang trái hoặc phải để lấp đầy hàng ngang.</li>
            <li>Khối không có điểm tựa sẽ tự động rơi xuống.</li>
            <li>Xếp đủ 8 ô của một hàng để nổ xóa hàng và ghi điểm.</li>
            <li>Sau mỗi lượt trượt, một hàng mới sẽ đẩy lên từ đáy.</li>
            <li>Đừng để các khối chạm vạch trên cùng!</li>
          </ul>
        </div>
      )}

      {/* 3. KHU VỰC BÀN CỜ 8x10 ĐƠN GIẢN */}
      <div className="relative">
        {/* Điểm bay lên khi ăn hàng */}
        {floatingScore && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500 animate-bounce">
            <div className="bg-[#b45309] text-white px-3 py-1 rounded-xs font-black text-xs shadow-lg border border-[#f59e0b] flex items-center gap-1">
              <span>{floatingScore.text}</span>
              {floatingScore.combo && <span className="text-[#fde047]">(x{floatingScore.combo}!)</span>}
            </div>
          </div>
        )}

        {/* Màn hình Game Over đơn giản */}
        {isGameOver && (
          <div className="slideblock-gameover-modal absolute inset-0 z-50 bg-[#12070d]/95 flex flex-col items-center justify-center gap-3 rounded-xs border-2 border-[#f59e0b] p-4 text-center">
            <h3 className="text-lg font-black text-[#f59e0b]">KẾT THÚC!</h3>
            <p className="slideblock-text-muted text-xs text-[#a08090]">Khối đã chạm vạch trên cùng</p>

            <div className="slideblock-gameover-card bg-[#1c0c16] border border-[#3b1f2d] p-2.5 rounded-xs w-full max-w-[200px] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="slideblock-text-muted text-[#a08090]">Điểm:</span>
                <span className="slideblock-gameover-val font-bold text-white">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="slideblock-text-muted text-[#a08090]">Kỷ lục:</span>
                <span className="font-bold text-[#fde047]">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="mt-1 px-4 py-2 bg-[#b45309] hover:bg-[#d97706] text-white font-bold text-xs rounded-xs border border-[#f59e0b] transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CHƠI LẠI</span>
            </button>
          </div>
        )}

        {/* Khung ngoài bàn cờ */}
        <div className="slideblock-board-frame bg-[#1c0c16] border-2 border-[#3b1f2d] p-1.5 rounded-xs shadow-lg">
          {/* Vạch nguy hiểm trên cùng (Hàng 0) */}
          <div className="h-4 flex items-center justify-center border-b border-dashed border-[#ef4444]/60 mb-1 text-[9px] text-[#ef4444] font-bold">
            VẠCH NGUY HIỂM
          </div>

          {/* Lưới 8x10 chính */}
          <div
            ref={boardRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="slideblock-board-grid relative w-full aspect-[8/10] bg-[#12070d] p-1 rounded-xs border border-[#2d1822] touch-none"
          >
            {/* 80 ô rỗng làm nền */}
            <div className="absolute inset-1 grid grid-cols-8 grid-rows-10 gap-0.5 pointer-events-none">
              {Array.from({ length: 80 }).map((_, i) => {
                const r = Math.floor(i / BOARD_COLS);
                const isClearing = clearingRows.includes(r);
                return (
                  <div
                    key={i}
                    className={`rounded-2xs transition-colors ${
                      isClearing
                        ? 'bg-white/90'
                        : 'slideblock-cell-empty bg-[#180a13] border border-[#25101b]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Các khối đa dạng màu sắc, tương phản cao, không trùng màu */}
            {blocks.map(block => {
              const color = BLOCK_COLORS[block.colorId] || BLOCK_COLORS.blue;
              const isSelected = selectedBlockId === block.id;
              const isCurrentDragging = dragging?.blockId === block.id;

              const leftPercent = (block.col / BOARD_COLS) * 100;
              const topPercent = (block.row / BOARD_ROWS) * 100;
              const widthPercent = (block.width / BOARD_COLS) * 100;
              const heightPercent = (1 / BOARD_ROWS) * 100;

              const transformStyle = isCurrentDragging
                ? `translateX(${dragging.currentOffsetPx}px)`
                : undefined;

              return (
                <div
                  key={block.id}
                  onPointerDown={e => handlePointerDown(e, block)}
                  onClick={() => setSelectedBlockId(block.id)}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    transform: transformStyle,
                    touchAction: 'none',
                  }}
                  className={`
                    absolute p-[1.5px] select-none cursor-grab active:cursor-grabbing
                    ${isCurrentDragging ? 'z-30 scale-[1.02]' : 'z-10'}
                  `}
                >
                  <div
                    className={`
                      relative w-full h-full rounded-2xs border transition-all flex items-center justify-center overflow-hidden
                      ${isSelected ? 'ring-2 ring-white shadow-lg z-20' : ''}
                    `}
                    style={{
                      backgroundColor: color.bg,
                      borderColor: color.border,
                      boxShadow: `0 0 6px ${color.glow}, inset 0 1px 0 rgba(255,255,255,0.7)`,
                    }}
                  >
                    {/* Bóng sáng gạch pastel mượt mà đồng bộ với Block Blast & Tetris */}
                    <div className="absolute inset-0.5 rounded-[1px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                    {/* Vạch chia ô con tinh tế khi khối có chiều rộng > 1 */}
                    {block.width > 1 && (
                      <div 
                        className="absolute inset-0 grid pointer-events-none"
                        style={{ gridTemplateColumns: `repeat(${block.width}, minmax(0, 1fr))` }}
                      >
                        {Array.from({ length: block.width }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-full h-full ${idx < block.width - 1 ? 'border-r border-white/35' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hàng tiếp theo sẽ đẩy lên */}
          <div className="mt-2 pt-1.5 border-t border-[#2d1822]">
            <div className="slideblock-text-muted flex items-center justify-between text-[10px] text-[#8a717a] font-bold mb-1 px-1">
              <span>Hàng tiếp theo chờ ở đáy:</span>
            </div>
            <div className="slideblock-board-grid relative w-full h-5 bg-[#12070d] rounded-xs border border-[#2d1822] p-0.5">
              {nextRowBlocks.map(block => {
                const color = BLOCK_COLORS[block.colorId] || BLOCK_COLORS.blue;
                const leftPercent = (block.col / BOARD_COLS) * 100;
                const widthPercent = (block.width / BOARD_COLS) * 100;

                return (
                  <div
                    key={`next-${block.id}`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    className="absolute top-0.5 bottom-0.5 p-[1px]"
                  >
                    <div
                      className="w-full h-full rounded-[1px] border relative overflow-hidden"
                      style={{
                        backgroundColor: color.bg,
                        borderColor: color.border,
                        boxShadow: `0 0 4px ${color.glow}`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nút điều khiển trái / phải khi chọn khối (hỗ trợ thêm phím) */}
        {selectedBlockId && !isGameOver && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => moveSelectedBlock('left')}
              className="slideblock-btn px-3 py-1 bg-[#1c0c16] hover:bg-[#25101b] border border-[#f59e0b] slideblock-text-main text-[#fed7aa] hover:text-white rounded-xs transition flex items-center gap-1 cursor-pointer font-bold text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trái</span>
            </button>
            <button
              onClick={() => moveSelectedBlock('right')}
              className="slideblock-btn px-3 py-1 bg-[#1c0c16] hover:bg-[#25101b] border border-[#f59e0b] slideblock-text-main text-[#fed7aa] hover:text-white rounded-xs transition flex items-center gap-1 cursor-pointer font-bold text-xs"
            >
              <span>Phải</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="slideblock-text-muted text-center text-[10px] text-[#8a717a]">
        Kéo hoặc vuốt khối sang hai bên để chơi
      </div>
    </div>
  );
};
