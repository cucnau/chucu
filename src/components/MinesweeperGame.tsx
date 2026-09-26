import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, Volume2, VolumeX, Flag, Bomb, 
  Trophy, X, RotateCcw, HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface MinesweeperGameProps {
  onBack: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

interface BoardConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, BoardConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, label: '9x9 (10 Mìn)' },
  medium: { rows: 16, cols: 16, mines: 40, label: '16x16 (40 Mìn)' },
  hard: { rows: 20, cols: 20, mines: 64, label: '20x20 (64 Mìn)' },
  custom: { rows: 12, cols: 12, mines: 20, label: 'Tùy chỉnh' },
};

interface CellState {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  exploded?: boolean;
  wrongFlag?: boolean;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'minesweeper-num-1 text-[#60a5fa]', // Xanh lam
  2: 'minesweeper-num-2 text-[#4ade80]', // Xanh lục
  3: 'minesweeper-num-3 text-[#f87171]', // Đỏ
  4: 'minesweeper-num-4 text-[#c084fc]', // Tím
  5: 'minesweeper-num-5 text-[#fb923c]', // Cam
  6: 'minesweeper-num-6 text-[#2dd4bf]', // Xanh ngọc
  7: 'minesweeper-num-7 text-[#f472b6]', // Hồng
  8: 'minesweeper-num-8 text-[#e2e8f0]', // Trắng xám
};

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({ 
  onBack, 
  currentUser, 
  userProfile 
}) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [customConfig, setCustomConfig] = useState({ rows: 12, cols: 12, mines: 20 });
  const [board, setBoard] = useState<CellState[][]>([]);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [timer, setTimer] = useState<number>(0);
  const [flagsPlaced, setFlagsPlaced] = useState<number>(0);
  const [flagMode, setFlagMode] = useState<boolean>(false); // Dành cho điện thoại: Bật chế độ cắm cờ
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('minesweeper_sound') !== 'false';
    } catch {
      return true;
    }
  });
  const [cellSize, setCellSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Kỷ lục thời gian cho từng cấp độ
  const [bestTimes, setBestTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('minesweeper_best_times');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Số trận thắng
  const [winStats, setWinStats] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('minesweeper_win_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy cấu hình hiện tại
  const currentConfig: BoardConfig = difficulty === 'custom' 
    ? { ...customConfig, label: `Tùy chỉnh ${customConfig.rows}x${customConfig.cols} (${customConfig.mines} Mìn)` }
    : DIFFICULTY_CONFIGS[difficulty];

  // Phát âm thanh đơn giản bằng Web Audio API
  const playSound = useCallback((type: 'click' | 'flag' | 'unflag' | 'explode' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'flag' || type === 'unflag') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(type === 'flag' ? 600 : 400, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'explode') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
        });
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Khởi tạo bảng rỗng
  const createEmptyBoard = useCallback((rows: number, cols: number): CellState[][] => {
    const newBoard: CellState[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: CellState[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(row);
    }
    return newBoard;
  }, []);

  // Khởi động lại ván game
  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameStatus('idle');
    setTimer(0);
    setFlagsPlaced(0);
    const newBoard = createEmptyBoard(currentConfig.rows, currentConfig.cols);
    setBoard(newBoard);
  }, [createEmptyBoard, currentConfig.rows, currentConfig.cols]);

  // Khi thay đổi độ khó hoặc cấu hình thì khởi tạo lại
  useEffect(() => {
    resetGame();
  }, [difficulty, customConfig, resetGame]);

  // Bộ đếm thời gian
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(prev => Math.min(prev + 1, 9999));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStatus]);

  // Tạo mìn ngẫu nhiên (đảm bảo first-click an toàn tuyệt đối và ô đầu tiên có neighborMines === 0)
  const populateMines = (
    initialBoard: CellState[][], 
    firstR: number, 
    firstC: number, 
    totalMines: number
  ): CellState[][] => {
    const rows = initialBoard.length;
    const cols = initialBoard[0].length;
    const newBoard = initialBoard.map(row => row.map(cell => ({ ...cell })));

    // Tập hợp các ô xung quanh first click (bán kính 1 ô) để giữ an toàn tối đa
    const safeZone = new Set<string>();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = firstR + dr;
        const nc = firstC + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          safeZone.add(`${nr},${nc}`);
        }
      }
    }

    // Nếu số mìn quá nhiều khiến không thể giữ nguyên safe zone thì chỉ giữ an toàn ô bấm
    const availableCells: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!safeZone.has(`${r},${c}`)) {
          availableCells.push([r, c]);
        }
      }
    }

    // Nếu không đủ ô ngoài safe zone thì cho phép đặt trong safe zone trừ đúng ô firstR,firstC
    if (availableCells.length < totalMines) {
      availableCells.length = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r !== firstR || c !== firstC) {
            availableCells.push([r, c]);
          }
        }
      }
    }

    // Shuffle và chọn vị trí mìn
    for (let i = availableCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
    }

    const minesToPlace = Math.min(totalMines, availableCells.length);
    for (let i = 0; i < minesToPlace; i++) {
      const [mr, mc] = availableCells[i];
      newBoard[mr][mc].isMine = true;
    }

    // Tính toán neighborMines cho từng ô
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].neighborMines = count;
        }
      }
    }

    return newBoard;
  };

  // Thuật toán lan tỏa mở các ô trống (Flood-fill)
  const floodReveal = (currentBoard: CellState[][], startR: number, startC: number): CellState[][] => {
    const rows = currentBoard.length;
    const cols = currentBoard[0].length;
    const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell })));
    const queue: [number, number][] = [[startR, startC]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const cell = newBoard[r][c];

      if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;

      cell.isRevealed = true;

      // Nếu ô này có 0 mìn xung quanh, tiếp tục lan tỏa 8 hướng
      if (cell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = newBoard[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    return newBoard;
  };

  // Kiểm tra điều kiện chiến thắng
  const checkWinCondition = (currentBoard: CellState[][]): boolean => {
    const rows = currentBoard.length;
    const cols = currentBoard[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = currentBoard[r][c];
        // Nếu có ô không phải mìn mà chưa được mở -> chưa thắng
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Xử lý cắm cờ
  const handleToggleFlag = (r: number, c: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    const cell = board[r][c];
    if (cell.isRevealed) return;

    const newBoard = board.map(row => row.map(cItem => ({ ...cItem })));
    const targetCell = newBoard[r][c];

    if (targetCell.isFlagged) {
      targetCell.isFlagged = false;
      setFlagsPlaced(prev => Math.max(0, prev - 1));
      playSound('unflag');
    } else {
      targetCell.isFlagged = true;
      setFlagsPlaced(prev => prev + 1);
      playSound('flag');
    }

    setBoard(newBoard);
  };

  // Xử lý mở ô
  const handleRevealCell = (r: number, c: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    let activeBoard = board;

    // Nếu là nước đi đầu tiên
    if (gameStatus === 'idle') {
      activeBoard = populateMines(board, r, c, currentConfig.mines);
      setGameStatus('playing');
    }

    const cell = activeBoard[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    // Nếu chạm phải mìn -> THUA
    if (cell.isMine) {
      playSound('explode');
      setGameStatus('lost');

      const lostBoard = activeBoard.map(row => row.map(item => {
        const copy = { ...item };
        if (copy.r === r && copy.c === c) {
          copy.exploded = true;
          copy.isRevealed = true;
        } else if (copy.isMine && !copy.isFlagged) {
          copy.isRevealed = true;
        } else if (!copy.isMine && copy.isFlagged) {
          copy.wrongFlag = true; // Cắm cờ sai
        }
        return copy;
      }));

      setBoard(lostBoard);
      return;
    }

    // Mở ô an toàn
    playSound('click');
    const revealedBoard = floodReveal(activeBoard, r, c);

    // Kiểm tra chiến thắng
    if (checkWinCondition(revealedBoard)) {
      playSound('win');
      setGameStatus('won');

      // Tự động cắm cờ toàn bộ các ô mìn
      const wonBoard = revealedBoard.map(row => row.map(item => {
        if (item.isMine) {
          return { ...item, isFlagged: true };
        }
        return item;
      }));
      setBoard(wonBoard);
      setFlagsPlaced(currentConfig.mines);

      // Cập nhật kỷ lục thời gian tốt nhất
      const finalTime = timer === 0 ? 1 : timer;
      const currentBest = bestTimes[difficulty];
      if (!currentBest || finalTime < currentBest) {
        const updatedTimes = { ...bestTimes, [difficulty]: finalTime };
        setBestTimes(updatedTimes);
        try {
          localStorage.setItem('minesweeper_best_times', JSON.stringify(updatedTimes));
        } catch {
          // ignore
        }
      }

      // Cập nhật số trận thắng
      const currentWins = winStats[difficulty] || 0;
      const updatedWins = { ...winStats, [difficulty]: currentWins + 1 };
      setWinStats(updatedWins);
      try {
        localStorage.setItem('minesweeper_win_stats', JSON.stringify(updatedWins));
      } catch {
        // ignore
      }
    } else {
      setBoard(revealedBoard);
    }
  };

  // Tính năng Chord (Nhấp nhanh vào ô số đã mở khi số cờ xung quanh bằng số mìn)
  const handleChord = (r: number, c: number) => {
    if (gameStatus !== 'playing') return;
    const cell = board[r][c];
    if (!cell.isRevealed || cell.neighborMines === 0) return;

    const rows = board.length;
    const cols = board[0].length;

    // Đếm số cờ xung quanh
    let flaggedCount = 0;
    const neighbors: [number, number][] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push([nr, nc]);
          if (board[nr][nc].isFlagged) {
            flaggedCount++;
          }
        }
      }
    }

    // Nếu số cờ bằng đúng neighborMines, mở tất cả các ô xung quanh chưa cắm cờ
    if (flaggedCount === cell.neighborMines) {
      let hitMine = false;
      let explodedR = -1;
      let explodedC = -1;

      let nextBoard = board.map(row => row.map(item => ({ ...item })));

      for (const [nr, nc] of neighbors) {
        const nCell = nextBoard[nr][nc];
        if (!nCell.isRevealed && !nCell.isFlagged) {
          if (nCell.isMine) {
            hitMine = true;
            explodedR = nr;
            explodedC = nc;
            break;
          } else {
            nextBoard = floodReveal(nextBoard, nr, nc);
          }
        }
      }

      if (hitMine) {
        playSound('explode');
        setGameStatus('lost');
        const lostBoard = nextBoard.map(row => row.map(item => {
          const copy = { ...item };
          if (copy.r === explodedR && copy.c === explodedC) {
            copy.exploded = true;
            copy.isRevealed = true;
          } else if (copy.isMine && !copy.isFlagged) {
            copy.isRevealed = true;
          } else if (!copy.isMine && copy.isFlagged) {
            copy.wrongFlag = true;
          }
          return copy;
        }));
        setBoard(lostBoard);
      } else {
        playSound('click');
        if (checkWinCondition(nextBoard)) {
          playSound('win');
          setGameStatus('won');
          const wonBoard = nextBoard.map(row => row.map(item => {
            if (item.isMine) return { ...item, isFlagged: true };
            return item;
          }));
          setBoard(wonBoard);
          setFlagsPlaced(currentConfig.mines);
        } else {
          setBoard(nextBoard);
        }
      }
    }
  };

  // Xử lý Click ô (Tự động theo chế độ Cắm cờ trên mobile hoặc Đào thông thường)
  const handleCellClick = (r: number, c: number) => {
    const cell = board[r][c];
    if (cell.isRevealed) {
      handleChord(r, c);
      return;
    }

    if (flagMode) {
      handleToggleFlag(r, c);
    } else {
      handleRevealCell(r, c);
    }
  };

  // Chuột phải -> Cắm cờ
  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    handleToggleFlag(r, c);
  };

  // Hỗ trợ Touch Long-Press để cắm cờ trên mobile
  const handleTouchStart = (r: number, c: number) => {
    longPressTimeoutRef.current = setTimeout(() => {
      handleToggleFlag(r, c);
      longPressTimeoutRef.current = null;
    }, 380);
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Lưu trạng thái âm thanh vào localStorage
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('minesweeper_sound', String(next));
    } catch {
      // ignore
    }
  };

  // Biểu tượng nút chơi lại ván mới (thay thế emoji)
  const renderResetButtonIcon = () => {
    if (gameStatus === 'won') {
      return <Trophy className="w-5 h-5 text-[#4ade80]" />;
    }
    if (gameStatus === 'lost') {
      return <X className="w-5 h-5 text-[#ef4444] stroke-[2.5]" />;
    }
    return <RotateCcw className={`w-5 h-5 text-[#ff4d79] transition-transform duration-200 ${isPressing ? '-rotate-90' : ''}`} />;
  };

  // Kích thước ô vuông chính xác (pixel) theo từng map để 20x20 và Tùy chỉnh luôn là các ô vuông nhỏ đẹp mắt
  const cols = board[0]?.length || currentConfig.cols;
  const rows = board.length || currentConfig.rows;
  const maxDim = Math.max(cols, rows);

  // Kích cỡ cơ sở (pixel): 9x9 -> ô to; 16x16 -> ô vừa; 20x20 và tùy chỉnh -> ô vuông nhỏ
  const baseCellPx = (() => {
    if (maxDim <= 9) return 38;      // 9x9 (Dễ): ô to
    if (maxDim <= 16) return 26;     // 16x16 (Vừa): ô vừa
    if (maxDim <= 20) return 21;     // 20x20 (Khó): ô vuông nhỏ
    if (maxDim <= 25) return 18;     // Tùy chỉnh 21-25: ô vuông nhỏ
    return 16;                       // Tùy chỉnh > 25: ô vuông nhỏ gọn
  })();

  const scaleMultiplier = cellSize === 'sm' ? 0.85 : cellSize === 'lg' ? 1.25 : 1.0;
  const finalCellPx = Math.round(baseCellPx * scaleMultiplier);
  const iconSizeClass = finalCellPx <= 20 ? 'w-3 h-3' : finalCellPx <= 26 ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const fontSizePx = Math.max(10, Math.floor(finalCellPx * 0.58));

  const remainingMines = Math.max(-99, currentConfig.mines - flagsPlaced);

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2 font-mono-code select-none">
      {/* Thanh Header Điều hướng & Trạng thái */}
      <div className="bg-[#25101b] border border-[#4d2138] rounded-xs p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 bg-[#14080e] hover:bg-[#341525] border border-[#ff4d79]/30 rounded-xs text-[#ffc2d4] hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Quay lại danh sách game"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff4d79]" />
            <span className="hidden sm:inline">Trở về</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#14080e] border border-[#ff4d79]/40 rounded-xs text-[#ff4d79]">
              <Bomb className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#ffc2d4] tracking-tight flex items-center gap-2">
                DÒ MÌN
              </h1>
            </div>
          </div>
        </div>

        {/* Các nút công cụ phụ trợ */}
        <div className="flex items-center gap-2">
          {/* Nút bật/tắt âm thanh */}
          <button
            onClick={toggleSound}
            className="p-2 bg-[#14080e] hover:bg-[#341525] border border-[#4d2138] rounded-xs text-[#ffc2d4] hover:text-white transition cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#ff4d79]" /> : <VolumeX className="w-4 h-4 text-[#8a717a]" />}
          </button>

          {/* Nút xem hướng dẫn */}
          <button
            onClick={() => setShowHowToPlay(true)}
            className="p-2 bg-[#14080e] hover:bg-[#341525] border border-[#4d2138] rounded-xs text-[#ffc2d4] hover:text-white transition cursor-pointer"
            title="Hướng dẫn chơi"
          >
            <HelpCircle className="w-4 h-4 text-[#fbbf24]" />
          </button>

          {/* Thu nhỏ / Phóng to ô */}
          <div className="hidden sm:flex items-center bg-[#14080e] border border-[#4d2138] rounded-xs p-0.5">
            <button
              onClick={() => setCellSize('sm')}
              className={`px-2 py-1 text-xs font-bold rounded-2xs transition ${cellSize === 'sm' ? 'bg-[#ff4d79] text-white' : 'text-[#8a717a] hover:text-white'}`}
              title="Cỡ ô nhỏ"
            >
              S
            </button>
            <button
              onClick={() => setCellSize('md')}
              className={`px-2 py-1 text-xs font-bold rounded-2xs transition ${cellSize === 'md' ? 'bg-[#ff4d79] text-white' : 'text-[#8a717a] hover:text-white'}`}
              title="Cỡ ô vừa"
            >
              M
            </button>
            <button
              onClick={() => setCellSize('lg')}
              className={`px-2 py-1 text-xs font-bold rounded-2xs transition ${cellSize === 'lg' ? 'bg-[#ff4d79] text-white' : 'text-[#8a717a] hover:text-white'}`}
              title="Cỡ ô lớn"
            >
              L
            </button>
          </div>
        </div>
      </div>

      {/* Chọn độ khó */}
      <div className="flex flex-wrap items-center gap-2 bg-[#1c0c16] border border-[#3b1f2d] p-2.5 rounded-xs">
        <span className="text-xs text-[#8a717a] font-bold px-1">Độ khó:</span>
        {(['easy', 'medium', 'hard', 'custom'] as DifficultyLevel[]).map((lvl) => {
          const isSelected = difficulty === lvl;
          const label = {
            easy: '9x9 (Dễ)',
            medium: '16x16 (Vừa)',
            hard: '20x20 (Khó)',
            custom: 'Tùy chỉnh'
          }[lvl];

          return (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xs border transition cursor-pointer ${
                isSelected
                  ? 'bg-[#881337] border-[#ff4d79] text-white shadow-xs'
                  : 'bg-[#14080e] border-[#2d1822] text-[#8a717a] hover:text-[#ffc2d4] hover:border-[#4d2138]'
              }`}
            >
              {label}
            </button>
          );
        })}

        {/* Thống kê kỷ lục thời gian */}
        {bestTimes[difficulty] && (
          <div className="ml-auto flex items-center gap-1 text-xs text-[#fbbf24] bg-[#14080e] px-2.5 py-1 rounded-xs border border-[#2d1822]">
            <Trophy className="w-3.5 h-3.5" />
            <span>Kỷ lục: <strong>{bestTimes[difficulty]}s</strong></span>
            {winStats[difficulty] ? (
              <span className="text-[#4ade80] ml-1.5">({winStats[difficulty]} thắng)</span>
            ) : null}
          </div>
        )}
      </div>

      {/* Bảng tùy chỉnh nếu chọn custom */}
      {difficulty === 'custom' && (
        <div className="bg-[#1c0c16] border border-[#4d2138] p-3 rounded-xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8a717a]">Hàng (8-24):</span>
            <input
              type="number"
              min={8}
              max={24}
              value={customConfig.rows}
              onChange={(e) => setCustomConfig({ ...customConfig, rows: Math.max(8, Math.min(24, parseInt(e.target.value) || 8)) })}
              className="w-16 bg-[#14080e] border border-[#3b1f2d] p-1 text-center text-[#ffc2d4] font-bold rounded-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8a717a]">Cột (8-30):</span>
            <input
              type="number"
              min={8}
              max={30}
              value={customConfig.cols}
              onChange={(e) => setCustomConfig({ ...customConfig, cols: Math.max(8, Math.min(30, parseInt(e.target.value) || 8)) })}
              className="w-16 bg-[#14080e] border border-[#3b1f2d] p-1 text-center text-[#ffc2d4] font-bold rounded-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8a717a]">Số mìn:</span>
            <input
              type="number"
              min={5}
              max={Math.floor(customConfig.rows * customConfig.cols * 0.8)}
              value={customConfig.mines}
              onChange={(e) => setCustomConfig({ ...customConfig, mines: Math.max(5, Math.min(Math.floor(customConfig.rows * customConfig.cols * 0.8), parseInt(e.target.value) || 5)) })}
              className="w-16 bg-[#14080e] border border-[#3b1f2d] p-1 text-center text-[#ffc2d4] font-bold rounded-xs"
            />
          </div>

          <button
            onClick={resetGame}
            className="px-3 py-1 bg-[#881337] hover:bg-[#9f1239] text-white text-xs font-bold rounded-xs border border-[#ff4d79] transition cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      )}

      {/* KHUNG MÁY CHƠI DÒ MÌN CHÍNH (RETRO CLASSIC CHẤT LƯỢNG CAO) */}
      <div className="minesweeper-machine bg-[#14080e] border-2 border-[#4d2138] rounded-xs p-3 sm:p-5 shadow-2xl flex flex-col items-center">
        {/* Bảng điều khiển cổ điển: Đếm mìn | Nút reset | Đồng hồ bấm giờ */}
        <div className="minesweeper-dashboard w-full max-w-2xl bg-[#1c0c16] border-2 border-[#3b1f2d] p-2.5 sm:p-3 rounded-xs flex items-center justify-between mb-4 shadow-inner">
          {/* Màn hình hiển thị số mìn còn lại dạng LED kỹ thuật số */}
          <div className="minesweeper-led bg-[#0c0408] border border-[#4d2138] px-3 py-1 rounded-2xs text-[#ff4d79] font-black text-xl sm:text-2xl tracking-widest min-w-[72px] text-center shadow-inner">
            {String(remainingMines).padStart(3, '0')}
          </div>

          {/* Nút reset game */}
          <button
            onClick={resetGame}
            className="minesweeper-reset-btn w-11 h-11 bg-[#25101b] hover:bg-[#341525] border-2 border-[#ff4d79]/60 active:border-[#ff4d79] rounded-xs flex items-center justify-center shadow-md active:translate-y-0.5 transition cursor-pointer"
            title="Chơi ván mới"
          >
            {renderResetButtonIcon()}
          </button>

          {/* Màn hình hiển thị thời gian trôi qua */}
          <div className="minesweeper-led bg-[#0c0408] border border-[#4d2138] px-3 py-1 rounded-2xs text-[#ff4d79] font-black text-xl sm:text-2xl tracking-widest min-w-[72px] text-center shadow-inner">
            {String(timer).padStart(3, '0')}
          </div>
        </div>

        {/* Thanh công cụ thao tác Mobile (Chuyển chế độ Đào mìn / Cắm cờ) */}
        <div className="w-full max-w-2xl mb-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlagMode(false)}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                !flagMode
                  ? 'bg-[#881337] border-[#ff4d79] text-white shadow-xs'
                  : 'bg-[#1c0c16] border-[#3b1f2d] text-[#8a717a] hover:text-[#ffc2d4]'
              }`}
            >
              <Bomb className="w-3.5 h-3.5 text-[#ff4d79]" />
              <span>Chế độ Đào</span>
            </button>

            <button
              onClick={() => setFlagMode(true)}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                flagMode
                  ? 'bg-[#e11d48] border-[#fb7185] text-white shadow-xs animate-pulse'
                  : 'bg-[#1c0c16] border-[#3b1f2d] text-[#8a717a] hover:text-[#ffc2d4]'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-[#fb7185] fill-current" />
              <span>Chế độ Cắm cờ</span>
            </button>
          </div>

          <span className="text-[11px] text-[#8a717a] hidden sm:inline">
            Chuột phải hoặc giữ lâu để cắm cờ
          </span>
        </div>

        {/* Vùng bàn cờ lưới mìn */}
        <div 
          className="minesweeper-board-wrapper max-w-full overflow-auto p-2 sm:p-3 bg-[#0c0408] border-2 border-[#3b1f2d] rounded-xs shadow-inner flex justify-center"
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
        >
          <div 
            className="minesweeper-grid grid gap-[1px] bg-[#3b1f2d] p-[2px] rounded-xs select-none w-max mx-auto shadow-md"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${finalCellPx}px)`,
              gridTemplateRows: `repeat(${rows}, ${finalCellPx}px)`,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isEven = (r + c) % 2 === 0;

                // 1. Ô ĐÃ ĐƯỢC MỞ
                if (cell.isRevealed) {
                  if (cell.isMine) {
                    return (
                      <div
                        key={`${r}-${c}`}
                        style={{ width: `${finalCellPx}px`, height: `${finalCellPx}px` }}
                        className={`shrink-0 flex items-center justify-center font-bold select-none ${
                          cell.exploded 
                            ? 'bg-[#ef4444] text-white animate-pulse' 
                            : 'minesweeper-cell-mine-unexploded bg-[#2b101e] text-[#ff4d79]'
                        }`}
                      >
                        <Bomb className={`${iconSizeClass} fill-current animate-bounce`} />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      style={{ width: `${finalCellPx}px`, height: `${finalCellPx}px` }}
                      className={`shrink-0 flex items-center justify-center font-black select-none transition-colors duration-75 cursor-default ${
                        isEven ? 'minesweeper-cell-revealed-even bg-[#180a13]' : 'minesweeper-cell-revealed-odd bg-[#12070d]'
                      } hover:bg-[#25101b]`}
                    >
                      {cell.neighborMines > 0 ? (
                        <span 
                          style={{ fontSize: `${fontSizePx}px`, lineHeight: 1 }}
                          className={NUMBER_COLORS[cell.neighborMines] || 'text-[#e2e8f0]'}
                        >
                          {cell.neighborMines}
                        </span>
                      ) : null}
                    </div>
                  );
                }

                // 2. Ô CHƯA MỞ NHƯNG CẮM CỜ SAI KHI THUA
                if (cell.wrongFlag) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      style={{ width: `${finalCellPx}px`, height: `${finalCellPx}px` }}
                      className="minesweeper-cell-mine-wrong shrink-0 bg-[#38101e] flex items-center justify-center text-[#ef4444] relative"
                    >
                      <Bomb className={`${iconSizeClass} opacity-40`} />
                      <X className={`${iconSizeClass} text-[#ef4444] absolute stroke-[3]`} />
                    </div>
                  );
                }

                // 3. Ô ĐANG CẮM CỜ
                if (cell.isFlagged) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleContextMenu(e, r, c)}
                      onTouchStart={() => handleTouchStart(r, c)}
                      onTouchEnd={handleTouchEnd}
                      style={{ width: `${finalCellPx}px`, height: `${finalCellPx}px` }}
                      className="minesweeper-cell-flagged shrink-0 bg-[#25101b] hover:bg-[#341525] border border-[#ff4d79]/40 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-transform"
                    >
                      <Flag className={`${iconSizeClass} text-[#ff4d79] fill-current animate-in zoom-in-75 duration-100`} />
                    </div>
                  );
                }

                // 4. Ô CHƯA MỞ BÌNH THƯỜNG
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                    onTouchStart={() => handleTouchStart(r, c)}
                    onTouchEnd={handleTouchEnd}
                    style={{ width: `${finalCellPx}px`, height: `${finalCellPx}px` }}
                    className={`shrink-0 ${
                      isEven ? 'minesweeper-cell-unrevealed bg-[#291220]' : 'minesweeper-cell-unrevealed-alt bg-[#220e1a]'
                    } hover:bg-[#3d192e] border-t border-l border-[#4d2138] border-b border-r border-[#14080e] active:border-[#220e1a] active:bg-[#180a13] flex items-center justify-center cursor-pointer shadow-xs transition-colors duration-75`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Bảng trạng thái thông báo Thắng / Thua */}
        {gameStatus === 'won' && (
          <div className="mt-4 p-4 bg-[#142e1d]/80 border border-[#22c55e] rounded-xs text-center space-y-2 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-center gap-2 text-[#4ade80]">
              <Trophy className="w-5 h-5 animate-bounce" />
              <h3 className="text-base font-bold">XUẤT SẮC! BẠN ĐÃ CHIẾN THẮNG!</h3>
            </div>
            <p className="text-xs text-[#bbf7d0]">
              Thời gian phá đảo: <strong className="text-white text-sm">{timer} giây</strong>
            </p>
            <button
              onClick={resetGame}
              className="mt-2 px-4 py-2 bg-[#15803d] hover:bg-[#16a34a] text-white font-bold text-xs rounded-xs border border-[#4ade80] transition cursor-pointer"
            >
              Chơi ván tiếp theo
            </button>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="mt-4 p-4 bg-[#38101e]/80 border border-[#ef4444] rounded-xs text-center space-y-2 max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-center gap-2 text-[#f87171]">
              <Bomb className="w-5 h-5 text-[#ef4444]" />
              <h3 className="text-base font-bold">BÙM! BẠN ĐÃ ĐẠP PHẢI MÌN!</h3>
            </div>
            <p className="text-xs text-[#fca5a5]">
              Đừng nản lòng, hãy thử lại bằng cách bấm vào nút mặt cười hoặc nút bên dưới!
            </p>
            <button
              onClick={resetGame}
              className="mt-2 px-4 py-2 bg-[#881337] hover:bg-[#9f1239] text-white font-bold text-xs rounded-xs border border-[#ff4d79] transition cursor-pointer"
            >
              Thử lại ván mới
            </button>
          </div>
        )}
      </div>

      {/* Modal Hướng Dẫn Chơi */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#1c0c16] border border-[#ff4d79] max-w-md w-full p-5 rounded-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3b1f2d] pb-3">
              <div className="flex items-center gap-2 text-[#ffc2d4]">
                <HelpCircle className="w-5 h-5 text-[#ff4d79]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Luật Chơi Dò Mìn (Minesweeper)</h3>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="p-1 hover:bg-[#2d1822] rounded-xs text-[#8a717a] hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#e0c0cc] leading-relaxed">
              <p>
                <strong>Mục tiêu:</strong> Mở hết tất cả các ô không có mìn trên bàn cờ trong thời gian ngắn nhất!
              </p>
              
              <div className="space-y-1.5 bg-[#14080e] p-3 rounded-xs border border-[#2d1822]">
                <div className="flex items-start gap-2">
                  <span className="text-[#ff4d79] font-bold">1.</span>
                  <span><strong>Nước đầu tiên an toàn:</strong> Ô bạn chạm đầu tiên không bao giờ có mìn.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#ff4d79] font-bold">2.</span>
                  <span><strong>Con số chỉ dẫn:</strong> Mỗi con số trên ô cho biết có đúng bấy nhiêu quả mìn ở 8 ô xung quanh nó.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#ff4d79] font-bold">3.</span>
                  <span><strong>Cắm cờ:</strong> Dùng <strong>chuột phải</strong> (trên máy tính) hoặc chuyển sang <strong>Chế độ Cắm cờ / Nhấn giữ</strong> (trên điện thoại) để đánh dấu nghi ngờ có mìn.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#ff4d79] font-bold">4.</span>
                  <span><strong>Mẹo mở nhanh (Chord):</strong> Khi một ô đã mở có đủ số cờ xung quanh, bấm vào ô đó sẽ tự động mở tất cả các ô còn lại xung quanh!</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-2 bg-[#881337] hover:bg-[#9f1239] border border-[#ff4d79] text-white text-xs font-bold rounded-xs transition cursor-pointer"
              >
                Đã hiểu, bắt đầu chơi!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
