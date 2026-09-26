import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, RotateCcw, Trophy, Volume2, VolumeX, Undo2, 
  Lightbulb, Eraser, Edit3, Play, Pause, AlertCircle, Sparkles,
  Grid2X2, ZoomIn, ZoomOut
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';

interface SudokuGameProps {
  onBack: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
}

export type SudokuSize = 4 | 6 | 9;
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type DisplaySize = 'small' | 'medium' | 'large';

interface SizeSpec {
  label: string;
  boxRows: number;
  boxCols: number;
  subgridLabel: string;
  difficulties: Record<Difficulty, { label: string; emptyCells: number }>;
}

const SIZE_SPECS: Record<SudokuSize, SizeSpec> = {
  4: {
    label: '4x4',
    boxRows: 2,
    boxCols: 2,
    subgridLabel: 'Khối 2x2',
    difficulties: {
      easy: { label: 'Dễ', emptyCells: 4 },
      medium: { label: 'Trung bình', emptyCells: 6 },
      hard: { label: 'Khó', emptyCells: 8 },
      expert: { label: 'Chuyên gia', emptyCells: 10 },
    },
  },
  6: {
    label: '6x6',
    boxRows: 2,
    boxCols: 3,
    subgridLabel: 'Khối 2x3',
    difficulties: {
      easy: { label: 'Dễ', emptyCells: 10 },
      medium: { label: 'Trung bình', emptyCells: 15 },
      hard: { label: 'Khó', emptyCells: 19 },
      expert: { label: 'Chuyên gia', emptyCells: 23 },
    },
  },
  9: {
    label: '9x9',
    boxRows: 3,
    boxCols: 3,
    subgridLabel: 'Khối 3x3',
    difficulties: {
      easy: { label: 'Dễ', emptyCells: 34 },
      medium: { label: 'Trung bình', emptyCells: 44 },
      hard: { label: 'Khó', emptyCells: 52 },
      expert: { label: 'Chuyên gia', emptyCells: 58 },
    },
  },
};

// Hàm kiểm tra hợp lệ
function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  size: SudokuSize,
  boxRows: number,
  boxCols: number
): boolean {
  for (let c = 0; c < size; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === num) return false;
  }
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;
  for (let r = 0; r < boxRows; r++) {
    for (let c = 0; c < boxCols; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

// Giải Sudoku bằng Backtracking
function solveSudoku(
  grid: number[][],
  size: SudokuSize,
  boxRows: number,
  boxCols: number
): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const nums = Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValidPlacement(grid, r, c, num, size, boxRows, boxCols)) {
            grid[r][c] = num;
            if (solveSudoku(grid, size, boxRows, boxCols)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Tạo câu đố Sudoku hoàn chỉnh và đục lỗ theo kích thước và độ khó
function generateSudoku(size: SudokuSize, difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const spec = SIZE_SPECS[size];
  const solution: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  solveSudoku(solution, size, spec.boxRows, spec.boxCols);

  const puzzle: number[][] = solution.map(row => [...row]);
  const emptyCount = spec.difficulties[difficulty].emptyCells;
  
  const coords: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      coords.push([r, c]);
    }
  }
  coords.sort(() => Math.random() - 0.5);

  let removed = 0;
  for (const [r, c] of coords) {
    if (removed >= emptyCount) break;
    puzzle[r][c] = 0;
    removed++;
  }

  return { puzzle, solution };
}

interface MoveHistory {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevNotes: number[];
  newNotes: number[];
}

export const SudokuGame: React.FC<SudokuGameProps> = ({ onBack }) => {
  const [gridSize, setGridSize] = useState<SudokuSize>(() => {
    try {
      const saved = localStorage.getItem('sudoku_preferred_grid_size');
      if (saved && (saved === '4' || saved === '6' || saved === '9')) {
        return parseInt(saved, 10) as SudokuSize;
      }
    } catch {}
    return 9;
  });

  const [displaySize, setDisplaySize] = useState<DisplaySize>(() => {
    try {
      const saved = localStorage.getItem('sudoku_preferred_display_size');
      if (saved && (saved === 'small' || saved === 'medium' || saved === 'large')) {
        return saved as DisplaySize;
      }
    } catch {}
    return 'medium';
  });

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [notes, setNotes] = useState<number[][][]>([]);
  
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [notesMode, setNotesMode] = useState<boolean>(false);
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Kỷ lục theo kích thước và độ khó
  const [bestTimes, setBestTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sudoku_best_times_by_size');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Khởi tạo trò chơi mới
  const startNewGame = useCallback((size: SudokuSize, diff: Difficulty) => {
    const { puzzle: p, solution: s } = generateSudoku(size, diff);
    setGridSize(size);
    setDifficulty(diff);
    setPuzzle(p);
    setSolution(s);
    setBoard(p.map(row => [...row]));
    setNotes(Array(size).fill(0).map(() => Array(size).fill(0).map(() => [])));
    setSelectedCell(null);
    setHistory([]);
    setMistakes(0);
    setIsWon(false);
    setIsGameOver(false);
    setIsPaused(false);
    setTimer(0);

    try {
      localStorage.setItem('sudoku_preferred_grid_size', String(size));
    } catch {}
  }, []);

  // Bắt đầu game lần đầu tiên
  useEffect(() => {
    startNewGame(gridSize, 'medium');
  }, [gridSize, startNewGame]);

  // Lưu tùy chọn cỡ hiển thị
  const handleDisplaySizeChange = (size: DisplaySize) => {
    setDisplaySize(size);
    try {
      localStorage.setItem('sudoku_preferred_display_size', size);
    } catch {}
  };

  // Bộ đếm thời gian
  useEffect(() => {
    if (isWon || isGameOver || isPaused || board.length === 0) return;
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon, isGameOver, isPaused, board.length]);

  // Phát âm thanh đơn giản
  const playSound = useCallback((type: 'click' | 'place' | 'error' | 'erase' | 'win') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'place') {
        osc.frequency.setValueAtTime(587, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'erase') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'win') {
        const notesFreq = [523.25, 659.25, 783.99, 1046.5];
        notesFreq.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          g.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
          o.start(ctx.currentTime + idx * 0.1);
          o.stop(ctx.currentTime + idx * 0.1 + 0.25);
        });
      }
    } catch {
      // AudioContext có thể bị chặn bởi browser nếu chưa tương tác
    }
  }, [soundEnabled]);

  // Kiểm tra thắng
  const checkWin = useCallback((currentBoard: number[][]) => {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (currentBoard[r][c] === 0 || currentBoard[r][c] !== solution[r]?.[c]) {
          return false;
        }
      }
    }
    return true;
  }, [gridSize, solution]);

  // Nhập số vào ô được chọn
  const handleInputNumber = useCallback((num: number) => {
    if (!selectedCell || isWon || isGameOver || isPaused) return;
    const { r, c } = selectedCell;

    // Không được sửa các ô đề bài cho trước
    if (puzzle[r]?.[c] !== 0) return;

    if (notesMode) {
      // Chế độ ghi chú
      const currentCellNotes = notes[r]?.[c] || [];
      const newCellNotes = currentCellNotes.includes(num)
        ? currentCellNotes.filter(n => n !== num)
        : [...currentCellNotes, num].sort((a, b) => a - b);

      setNotes(prev => {
        const next = prev.map(row => row.map(cell => [...cell]));
        next[r][c] = newCellNotes;
        return next;
      });

      setHistory(prev => [
        ...prev,
        {
          row: r,
          col: c,
          prevValue: board[r][c],
          newValue: board[r][c],
          prevNotes: currentCellNotes,
          newNotes: newCellNotes,
        }
      ]);
      playSound('click');
      return;
    }

    // Nếu cùng số với ô hiện tại thì không làm gì
    if (board[r][c] === num) return;

    const isCorrect = solution[r][c] === num;
    const prevVal = board[r][c];
    const prevCellNotes = notes[r][c] || [];

    // Cập nhật giá trị
    const nextBoard = board.map(row => [...row]);
    nextBoard[r][c] = num;
    setBoard(nextBoard);

    // Xóa ghi chú của ô này và loại trừ số này khỏi cùng hàng, cùng cột, cùng khối
    const spec = SIZE_SPECS[gridSize];
    setNotes(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[r][c] = [];
      for (let i = 0; i < gridSize; i++) {
        next[r][i] = next[r][i].filter(n => n !== num);
        next[i][c] = next[i][c].filter(n => n !== num);
      }
      const bR = Math.floor(r / spec.boxRows) * spec.boxRows;
      const bC = Math.floor(c / spec.boxCols) * spec.boxCols;
      for (let dr = 0; dr < spec.boxRows; dr++) {
        for (let dc = 0; dc < spec.boxCols; dc++) {
          next[bR + dr][bC + dc] = next[bR + dr][bC + dc].filter(n => n !== num);
        }
      }
      return next;
    });

    setHistory(prev => [
      ...prev,
      {
        row: r,
        col: c,
        prevValue: prevVal,
        newValue: num,
        prevNotes: prevCellNotes,
        newNotes: [],
      }
    ]);

    if (!isCorrect) {
      playSound('error');
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (nextMistakes >= 3) {
        setIsGameOver(true);
      }
    } else {
      playSound('place');
      if (checkWin(nextBoard)) {
        setIsWon(true);
        playSound('win');
        // Lưu kỷ lục thời gian tốt nhất theo kích thước + độ khó
        const recordKey = `${gridSize}x${gridSize}_${difficulty}`;
        const curBest = bestTimes[recordKey];
        if (!curBest || timer < curBest) {
          const updated = { ...bestTimes, [recordKey]: timer };
          setBestTimes(updated);
          try {
            localStorage.setItem('sudoku_best_times_by_size', JSON.stringify(updated));
          } catch {}
        }
      }
    }
  }, [selectedCell, isWon, isGameOver, isPaused, puzzle, notesMode, board, notes, solution, gridSize, playSound, mistakes, checkWin, bestTimes, difficulty, timer]);

  // Xóa số ở ô hiện tại
  const handleErase = useCallback(() => {
    if (!selectedCell || isWon || isGameOver || isPaused) return;
    const { r, c } = selectedCell;
    if (puzzle[r]?.[c] !== 0) return;

    if (board[r][c] === 0 && notes[r][c].length === 0) return;

    const prevVal = board[r][c];
    const prevCellNotes = notes[r][c] || [];

    setBoard(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = 0;
      return next;
    });

    setNotes(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[r][c] = [];
      return next;
    });

    setHistory(prev => [
      ...prev,
      {
        row: r,
        col: c,
        prevValue: prevVal,
        newValue: 0,
        prevNotes: prevCellNotes,
        newNotes: [],
      }
    ]);
    playSound('erase');
  }, [selectedCell, isWon, isGameOver, isPaused, puzzle, board, notes, playSound]);

  // Hoàn tác bước đi
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isWon || isGameOver || isPaused) return;
    const lastMove = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    setBoard(prev => {
      const next = prev.map(row => [...row]);
      next[lastMove.row][lastMove.col] = lastMove.prevValue;
      return next;
    });

    setNotes(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[lastMove.row][lastMove.col] = lastMove.prevNotes;
      return next;
    });

    setSelectedCell({ r: lastMove.row, c: lastMove.col });
    playSound('click');
  }, [history, isWon, isGameOver, isPaused, playSound]);

  // Gợi ý 1 ô trống ngẫu nhiên
  const handleHint = useCallback(() => {
    if (isWon || isGameOver || isPaused) return;
    const candidates: [number, number][] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (puzzle[r][c] === 0 && board[r][c] !== solution[r][c]) {
          candidates.push([r, c]);
        }
      }
    }
    if (candidates.length === 0) return;
    const [hintR, hintC] = candidates[Math.floor(Math.random() * candidates.length)];
    const correctVal = solution[hintR][hintC];

    const nextBoard = board.map(row => [...row]);
    nextBoard[hintR][hintC] = correctVal;
    setBoard(nextBoard);

    setNotes(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[hintR][hintC] = [];
      return next;
    });

    setSelectedCell({ r: hintR, c: hintC });
    playSound('place');

    if (checkWin(nextBoard)) {
      setIsWon(true);
      playSound('win');
    }
  }, [isWon, isGameOver, isPaused, gridSize, puzzle, board, solution, playSound, checkWin]);

  // Lắng nghe bàn phím vật lý
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon || isGameOver || isPaused) return;

      if (e.key >= '1' && e.key <= String(gridSize)) {
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesMode(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        handleUndo();
      } else if (e.key.startsWith('Arrow') && selectedCell) {
        e.preventDefault();
        let { r, c } = selectedCell;
        if (e.key === 'ArrowUp') r = (r + gridSize - 1) % gridSize;
        if (e.key === 'ArrowDown') r = (r + 1) % gridSize;
        if (e.key === 'ArrowLeft') c = (c + gridSize - 1) % gridSize;
        if (e.key === 'ArrowRight') c = (c + 1) % gridSize;
        setSelectedCell({ r, c });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWon, isGameOver, isPaused, gridSize, handleInputNumber, handleErase, handleUndo, selectedCell]);

  // Đếm số lần xuất hiện của từng số (1-gridSize)
  const numberCounts = Array(gridSize + 1).fill(0);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const val = board[r]?.[c];
      if (val && val >= 1 && val <= gridSize && val === solution[r]?.[c]) {
        numberCounts[val]++;
      }
    }
  }

  // Định dạng thời gian mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedValue = selectedCell ? board[selectedCell.r]?.[selectedCell.c] : null;
  const spec = SIZE_SPECS[gridSize];
  const recordKey = `${gridSize}x${gridSize}_${difficulty}`;
  const currentBest = bestTimes[recordKey];

  // Tính class kích thước cho ô cờ dựa theo kích cỡ lưới và tùy chọn hiển thị
  const getCellSizeClass = () => {
    if (gridSize === 4) {
      if (displaySize === 'small') return 'w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl';
      if (displaySize === 'large') return 'w-18 h-18 sm:w-22 sm:h-22 text-3xl sm:text-4xl';
      return 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-2xl sm:text-3xl';
    }
    if (gridSize === 6) {
      if (displaySize === 'small') return 'w-10 h-10 sm:w-11 sm:h-11 text-base sm:text-lg';
      if (displaySize === 'large') return 'w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 text-xl sm:text-2xl';
      return 'w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 text-lg sm:text-xl';
    }
    // 9x9
    if (displaySize === 'small') return 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-xs sm:text-sm md:text-base';
    if (displaySize === 'large') return 'w-10 h-10 sm:w-13 sm:h-13 md:w-15 md:h-15 text-base sm:text-xl md:text-2xl';
    return 'w-8 h-8 sm:w-11 sm:h-11 md:w-13 md:h-13 text-sm sm:text-lg md:text-xl';
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-3 font-mono-code select-none">
      {/* Header bar */}
      <div className="bg-[#1c0c16] border border-[#3b1f2d] rounded-xs p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#14080e] hover:bg-[#25101b] border border-[#ff4d79]/40 rounded-xs text-[#ffc2d4] hover:text-white transition flex items-center gap-1.5 cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xs bg-gradient-to-br from-[#38bdf8]/20 to-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center select-none shadow-xs">
              <span className="font-mono-code font-black text-xs text-[#38bdf8]">
                123
              </span>
            </div>
            <h1 className="text-xl font-black text-[#ffc2d4] tracking-tight">SUDOKU</h1>
          </div>
        </div>

        {/* Cụm chỉnh kích thước hiển thị và âm thanh */}
        <div className="flex items-center gap-2">
          {/* Chỉnh kích cỡ ô (Nhỏ / Vừa / Lớn) */}
          <div className="hidden sm:flex items-center bg-[#14080e] border border-[#3b1f2d] rounded-xs p-0.5 text-[11px]">
            <button
              onClick={() => handleDisplaySizeChange('small')}
              className={`px-2 py-1 rounded-2xs font-bold transition cursor-pointer flex items-center gap-1 ${
                displaySize === 'small' ? 'bg-[#38bdf8] text-black' : 'text-[#a08090] hover:text-white'
              }`}
              title="Cỡ ô nhỏ"
            >
              <ZoomOut className="w-3 h-3" />
              <span>Nhỏ</span>
            </button>
            <button
              onClick={() => handleDisplaySizeChange('medium')}
              className={`px-2 py-1 rounded-2xs font-bold transition cursor-pointer ${
                displaySize === 'medium' ? 'bg-[#38bdf8] text-black' : 'text-[#a08090] hover:text-white'
              }`}
              title="Cỡ ô vừa"
            >
              <span>Vừa</span>
            </button>
            <button
              onClick={() => handleDisplaySizeChange('large')}
              className={`px-2 py-1 rounded-2xs font-bold transition cursor-pointer flex items-center gap-1 ${
                displaySize === 'large' ? 'bg-[#38bdf8] text-black' : 'text-[#a08090] hover:text-white'
              }`}
              title="Cỡ ô lớn"
            >
              <ZoomIn className="w-3 h-3" />
              <span>Lớn</span>
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 bg-[#14080e] hover:bg-[#25101b] border border-[#3b1f2d] text-[#ffc2d4] rounded-xs transition cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Thanh điều khiển: Chọn Kích Thước Lưới & Chọn Độ Khó */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#14080e] border border-[#2d1822] p-2.5 rounded-xs text-xs">
        {/* Bộ chọn Kích thước lưới Sudoku (4x4, 6x6, 9x9) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#a08090] hidden md:inline">Lưới:</span>
          {([4, 6, 9] as SudokuSize[]).map(sz => (
            <button
              key={sz}
              onClick={() => startNewGame(sz, difficulty)}
              className={`px-2.5 py-1 rounded-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                gridSize === sz
                  ? 'bg-[#0284c7] border-[#38bdf8] text-white shadow-xs'
                  : 'bg-[#1c0c16] border-[#3b1f2d] text-[#a08090] hover:text-white'
              }`}
            >
              <Grid2X2 className="w-3 h-3" />
              <span>{sz}x{sz}</span>
            </button>
          ))}
        </div>

        {/* Chọn độ khó */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => startNewGame(gridSize, diff)}
              className={`px-2 py-1 rounded-xs font-bold transition cursor-pointer border ${
                difficulty === diff
                  ? 'bg-[#881337] border-[#ff4d79] text-white'
                  : 'bg-[#1c0c16] border-[#3b1f2d] text-[#a08090] hover:text-white'
              }`}
            >
              {spec.difficulties[diff].label}
            </button>
          ))}
        </div>

        {/* Thông số: Lỗi | Thời gian | Tạm dừng */}
        <div className="flex items-center gap-3 text-xs font-bold ml-auto">
          <div className="flex items-center gap-1 text-[#f43f5e]">
            <span>Lỗi:</span>
            <span className="bg-[#25101b] px-1.5 py-0.5 rounded-2xs border border-[#f43f5e]/40">
              {mistakes}/3
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#ffc2d4]">
            <span>TG:</span>
            <span className="bg-[#25101b] px-2 py-0.5 rounded-2xs border border-[#3b1f2d]">
              {formatTime(timer)}
            </span>
          </div>

          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1 bg-[#1c0c16] hover:bg-[#25101b] border border-[#3b1f2d] text-[#ffc2d4] rounded-xs transition cursor-pointer"
            title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Thanh phụ hiển thị trên mobile để chỉnh zoom */}
      <div className="flex sm:hidden items-center justify-between bg-[#14080e] border border-[#2d1822] px-3 py-1.5 rounded-xs text-xs">
        <span className="text-[11px] text-[#a08090]">Cỡ ô:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDisplaySizeChange('small')}
            className={`px-2 py-0.5 rounded-2xs text-[11px] font-bold ${displaySize === 'small' ? 'bg-[#38bdf8] text-black' : 'text-[#a08090]'}`}
          >
            Nhỏ
          </button>
          <button
            onClick={() => handleDisplaySizeChange('medium')}
            className={`px-2 py-0.5 rounded-2xs text-[11px] font-bold ${displaySize === 'medium' ? 'bg-[#38bdf8] text-black' : 'text-[#a08090]'}`}
          >
            Vừa
          </button>
          <button
            onClick={() => handleDisplaySizeChange('large')}
            className={`px-2 py-0.5 rounded-2xs text-[11px] font-bold ${displaySize === 'large' ? 'bg-[#38bdf8] text-black' : 'text-[#a08090]'}`}
          >
            Lớn
          </button>
        </div>
      </div>

      {/* Kỷ lục nếu có */}
      {currentBest ? (
        <div className="flex items-center gap-2 text-xs text-[#fbbf24] px-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Kỷ lục ({gridSize}x{gridSize} - {spec.difficulties[difficulty].label}): <strong>{formatTime(currentBest)}</strong></span>
        </div>
      ) : null}

      {/* Vùng Bàn cờ Sudoku */}
      <div className="flex flex-col items-center justify-center relative my-1">
        {/* Tạm dừng overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 bg-[#12070d]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xs border border-[#ff4d79]/40">
            <Pause className="w-10 h-10 text-[#ff4d79] animate-pulse" />
            <p className="text-base font-bold text-[#ffc2d4]">Đang tạm dừng</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-4 py-2 bg-[#881337] hover:bg-[#9f1239] text-white font-bold text-xs rounded-xs border border-[#ff4d79] transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Tiếp tục chơi</span>
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-20 bg-[#12070d]/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xs border border-[#f43f5e] p-6 text-center shadow-xl">
            <AlertCircle className="w-12 h-12 text-[#f43f5e]" />
            <h3 className="text-lg font-black text-white">Bạn đã phạm quá 3 lỗi!</h3>
            <p className="text-xs text-[#a08090] max-w-xs">Đừng nản lòng, hãy thử lại một ván mới để rèn luyện trí óc nhé.</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => startNewGame(gridSize, difficulty)}
                className="px-4 py-2 bg-[#881337] hover:bg-[#9f1239] text-white font-bold text-xs rounded-xs border border-[#ff4d79] transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi ván mới</span>
              </button>
            </div>
          </div>
        )}

        {/* Chiến thắng overlay */}
        {isWon && (
          <div className="absolute inset-0 z-20 bg-[#12070d]/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xs border border-[#4ade80] p-6 text-center shadow-xl">
            <Sparkles className="w-12 h-12 text-[#4ade80] animate-bounce" />
            <h3 className="text-lg font-black text-[#4ade80]">XUẤT SẮC! BẠN ĐÃ THẮNG</h3>
            <p className="text-xs text-[#e0d0d5]">
              Thời gian hoàn thành ({gridSize}x{gridSize}): <strong className="text-white font-bold">{formatTime(timer)}</strong>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => startNewGame(gridSize, difficulty)}
                className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold text-xs rounded-xs border border-[#4ade80] transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ván tiếp theo</span>
              </button>
            </div>
          </div>
        )}

        {/* Lưới Sudoku tương thích kích thước (4x4, 6x6, 9x9) */}
        <div className="sudoku-board-box bg-[#3b1f2d] p-[2px] rounded-xs border-2 border-[#4d2138] shadow-xl max-w-full overflow-hidden">
          <div 
            className="grid bg-[#3b1f2d] gap-0"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {board.map((row, r) =>
              row.map((val, c) => {
                const isInitial = puzzle[r]?.[c] !== 0;
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                const inSameBlock = selectedCell && 
                  Math.floor(selectedCell.r / spec.boxRows) === Math.floor(r / spec.boxRows) &&
                  Math.floor(selectedCell.c / spec.boxCols) === Math.floor(c / spec.boxCols);
                const isSameGroup = selectedCell && (selectedCell.r === r || selectedCell.c === c || inSameBlock);
                const isSameNumber = selectedValue && selectedValue !== 0 && val === selectedValue;
                const isWrong = val !== 0 && !isInitial && val !== solution[r]?.[c];

                // Biên phân tách các khối nhỏ
                const borderRight = (c + 1) % spec.boxCols === 0 && c !== gridSize - 1 
                  ? 'border-r-2 border-r-[#ff4d79]/50' 
                  : 'border-r border-r-[#2d1822]';
                const borderBottom = (r + 1) % spec.boxRows === 0 && r !== gridSize - 1 
                  ? 'border-b-2 border-b-[#ff4d79]/50' 
                  : 'border-b border-b-[#2d1822]';

                // Màu nền ô
                let bgClass = 'sudoku-cell-default bg-[#180a13]';
                if (isSelected) {
                  bgClass = 'sudoku-cell-selected bg-[#881337]';
                } else if (isWrong) {
                  bgClass = 'sudoku-cell-wrong bg-[#4c0519] text-[#f43f5e]';
                } else if (isSameNumber) {
                  bgClass = 'sudoku-cell-same-number bg-[#3e1428]';
                } else if (isSameGroup) {
                  bgClass = 'sudoku-cell-same-group bg-[#220d1c]';
                }

                // Màu chữ
                let textClass = 'sudoku-text-user text-[#ffc2d4]';
                if (isInitial) {
                  textClass = 'sudoku-text-initial text-white font-black';
                } else if (isWrong) {
                  textClass = 'sudoku-text-wrong text-[#f43f5e] font-black animate-pulse';
                } else if (val !== 0) {
                  textClass = 'sudoku-text-user text-[#38bdf8] font-bold';
                }

                // Cấu hình hiển thị ô ghi chú theo kích thước
                const noteColumns = gridSize === 4 ? 2 : 3;

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => setSelectedCell({ r, c })}
                    className={`sudoku-cell ${getCellSizeClass()} flex items-center justify-center transition-colors relative cursor-pointer ${borderRight} ${borderBottom} ${bgClass} ${textClass}`}
                  >
                    {val !== 0 ? (
                      <span>{val}</span>
                    ) : notes[r]?.[c]?.length > 0 ? (
                      <div 
                        className="grid gap-0 w-full h-full p-0.5 text-[8px] sm:text-[10px] text-[#a08090] leading-none pointer-events-none"
                        style={{ gridTemplateColumns: `repeat(${noteColumns}, minmax(0, 1fr))` }}
                      >
                        {Array.from({ length: gridSize }, (_, idx) => idx + 1).map(n => (
                          <div key={n} className="flex items-center justify-center">
                            {notes[r][c].includes(n) ? n : ''}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bảng công cụ điều khiển (Hoàn tác, Xóa, Ghi chú, Gợi ý) */}
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto pt-1">
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xs border transition cursor-pointer ${
            history.length > 0
              ? 'bg-[#1c0c16] border-[#3b1f2d] text-[#ffc2d4] hover:bg-[#25101b]'
              : 'bg-[#14080e] border-[#220d19] text-[#604550] cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span className="text-[11px] font-bold">Hoàn tác</span>
        </button>

        <button
          onClick={handleErase}
          className="flex flex-col items-center justify-center gap-1 py-2.5 bg-[#1c0c16] hover:bg-[#25101b] border border-[#3b1f2d] text-[#ffc2d4] rounded-xs transition cursor-pointer"
        >
          <Eraser className="w-4 h-4" />
          <span className="text-[11px] font-bold">Xóa</span>
        </button>

        <button
          onClick={() => setNotesMode(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xs border transition cursor-pointer relative ${
            notesMode
              ? 'bg-[#881337] border-[#ff4d79] text-white shadow-sm'
              : 'bg-[#1c0c16] border-[#3b1f2d] text-[#ffc2d4] hover:bg-[#25101b]'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span className="text-[11px] font-bold">Ghi chú {notesMode ? '(BẬT)' : ''}</span>
          {notesMode && (
            <span className="w-2 h-2 rounded-full bg-[#ff4d79] absolute top-1.5 right-2 animate-ping" />
          )}
        </button>

        <button
          onClick={handleHint}
          className="flex flex-col items-center justify-center gap-1 py-2.5 bg-[#1c0c16] hover:bg-[#25101b] border border-[#3b1f2d] text-[#fbbf24] rounded-xs transition cursor-pointer"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-[11px] font-bold">Gợi ý</span>
        </button>
      </div>

      {/* Bàn phím số tự động tương ứng theo kích thước lưới (1-4, 1-6, 1-9) */}
      <div 
        className="grid gap-1.5 max-w-md mx-auto pt-1"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: gridSize }, (_, idx) => idx + 1).map(num => {
          const isCompleted = numberCounts[num] >= gridSize;
          return (
            <button
              key={num}
              onClick={() => handleInputNumber(num)}
              disabled={isCompleted}
              className={`h-12 sm:h-14 flex flex-col items-center justify-center rounded-xs font-black text-base sm:text-lg border transition cursor-pointer relative ${
                isCompleted
                  ? 'bg-[#12070d] border-[#220d19] text-[#553a45] cursor-not-allowed opacity-40'
                  : 'bg-[#1c0c16] hover:bg-[#2e1222] active:bg-[#881337] border-[#3b1f2d] hover:border-[#ff4d79] text-[#ffc2d4] hover:text-white shadow-sm'
              }`}
            >
              <span>{num}</span>
              {!isCompleted && (
                <span className="text-[9px] font-normal text-[#a08090]">
                  {gridSize - numberCounts[num]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
