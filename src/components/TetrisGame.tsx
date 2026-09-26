import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, Trophy, Volume2, VolumeX, Play, Pause,
  ChevronLeft, ChevronRight, RotateCw, ArrowDown, ArrowDownToLine, Hand
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';

interface TetrisGameProps {
  onBack: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Các loại khối và màu sắc tương ứng
type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface TetrominoDef {
  shape: number[][];
  bg: string;
  border: string;
  glow: string;
  light: string;
  name: string;
}

// Bảng màu Pastel đồng bộ chuẩn phong cách của Block Blast
const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    bg: '#7dd3fc', // Sky Pastel (Xanh da trời)
    border: '#bae6fd',
    glow: 'rgba(125, 211, 252, 0.45)',
    light: '#f0f9ff',
    name: 'Sky',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    bg: '#a5b4fc', // Periwinkle / Lavender Blue Pastel
    border: '#c7d2fe',
    glow: 'rgba(165, 180, 252, 0.45)',
    light: '#eef2ff',
    name: 'Periwinkle',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    bg: '#fdba74', // Apricot Pastel (Cam mơ)
    border: '#fed7aa',
    glow: 'rgba(253, 186, 116, 0.45)',
    light: '#fff7ed',
    name: 'Apricot',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    bg: '#fde047', // Butter Pastel (Vàng bơ mềm)
    border: '#fef08a',
    glow: 'rgba(253, 224, 71, 0.45)',
    light: '#fefce8',
    name: 'Butter',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    bg: '#6ee7b7', // Mint Pastel (Xanh bạc hà)
    border: '#a7f3d0',
    glow: 'rgba(110, 231, 183, 0.45)',
    light: '#ecfdf5',
    name: 'Mint',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    bg: '#c084fc', // Lavender Pastel (Tím hoa oải hương)
    border: '#e9d5ff',
    glow: 'rgba(192, 132, 252, 0.45)',
    light: '#faf5ff',
    name: 'Lavender',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    bg: '#f472b6', // Sakura Pink Pastel (Hồng phấn anh đào)
    border: '#fbcfe8',
    glow: 'rgba(244, 114, 182, 0.45)',
    light: '#fdf2f8',
    name: 'Sakura Pink',
  },
};

const TETROMINO_KEYS: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// Hàm xoay ma trận 90 độ theo chiều kim đồng hồ
function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// Tạo bảng trống 20 hàng x 10 cột
function createEmptyBoard(): (string | null)[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}

// Lấy ngẫu nhiên một loại khối
function getRandomTetromino(): TetrominoType {
  const index = Math.floor(Math.random() * TETROMINO_KEYS.length);
  return TETROMINO_KEYS[index];
}

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

export const TetrisGame: React.FC<TetrisGameProps> = ({ onBack }) => {
  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>(getRandomTetromino);
  const [holdPieceType, setHoldPieceType] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tetris_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Âm thanh
  const playSound = useCallback((type: 'move' | 'rotate' | 'drop' | 'clear' | 'gameover') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'rotate') {
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else if (type === 'drop') {
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'clear') {
        const freqs = [523, 659, 783, 1046];
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
          g.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.15);
          o.start(ctx.currentTime + i * 0.06);
          o.stop(ctx.currentTime + i * 0.06 + 0.15);
        });
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  }, [soundEnabled]);

  // Kiểm tra va chạm
  const checkCollision = useCallback((piece: Piece, b: (string | null)[][], offsetX = 0, offsetY = 0, customShape?: number[][]): boolean => {
    const shape = customShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const nextX = piece.x + c + offsetX;
          const nextY = piece.y + r + offsetY;

          // Ngoài biên trái/phải hoặc đáy
          if (nextX < 0 || nextX >= BOARD_WIDTH || nextY >= BOARD_HEIGHT) {
            return true;
          }

          // Va chạm với khối đã khóa trên bàn cờ
          if (nextY >= 0 && b[nextY]?.[nextX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Sinh khối mới
  const spawnPiece = useCallback((typeToSpawn?: TetrominoType, currentBoard?: (string | null)[][]) => {
    const targetBoard = currentBoard || board;
    const type = typeToSpawn || nextPieceType;
    const nextType = getRandomTetromino();
    setNextPieceType(nextType);

    const def = TETROMINOES[type];
    const newPiece: Piece = {
      type,
      shape: def.shape,
      x: Math.floor((BOARD_WIDTH - def.shape[0].length) / 2),
      y: 0,
    };

    if (checkCollision(newPiece, targetBoard)) {
      // Game Over nếu vừa sinh ra đã va chạm
      setIsGameOver(true);
      playSound('gameover');
      return null;
    }

    setCurrentPiece(newPiece);
    setCanHold(true);
    return newPiece;
  }, [board, nextPieceType, checkCollision, playSound]);

  // Khởi động ván mới
  const resetGame = useCallback(() => {
    const empty = createEmptyBoard();
    setBoard(empty);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    setHoldPieceType(null);
    setCanHold(true);

    const first = getRandomTetromino();
    const next = getRandomTetromino();
    setNextPieceType(next);

    const def = TETROMINOES[first];
    const piece: Piece = {
      type: first,
      shape: def.shape,
      x: Math.floor((BOARD_WIDTH - def.shape[0].length) / 2),
      y: 0,
    };
    setCurrentPiece(piece);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Khóa khối hiện tại vào bàn cờ và xử lý xóa hàng
  const lockPiece = useCallback((piece: Piece) => {
    const newBoard = board.map(row => [...row]);

    // Gắn khối vào bàn
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const boardY = piece.y + r;
          const boardX = piece.x + c;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.type;
          }
        }
      }
    }

    // Kiểm tra và xóa hàng đầy
    let clearedLines = 0;
    const filteredBoard = newBoard.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) {
        clearedLines++;
        return false;
      }
      return true;
    });

    // Bổ sung các hàng trống phía trên
    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    setBoard(filteredBoard);

    if (clearedLines > 0) {
      playSound('clear');
      // Điểm: 1=100, 2=300, 3=500, 4=800 * level
      const points = [0, 100, 300, 500, 800][clearedLines] * level;
      const newScore = score + points;
      const newLines = lines + clearedLines;
      const newLevel = Math.floor(newLines / 10) + 1;

      setScore(newScore);
      setLines(newLines);
      setLevel(newLevel);

      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('tetris_high_score', newScore.toString());
        } catch {}
      }
    } else {
      playSound('drop');
    }

    // Sinh khối tiếp theo
    spawnPiece(undefined, filteredBoard);
  }, [board, level, score, lines, highScore, playSound, spawnPiece]);

  // Di chuyển ngang
  const moveHorizontal = useCallback((direction: number) => {
    if (!currentPiece || isGameOver || isPaused) return;
    if (!checkCollision(currentPiece, board, direction, 0)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + direction } : null);
      playSound('move');
    }
  }, [currentPiece, isGameOver, isPaused, checkCollision, board, playSound]);

  // Xoay khối
  const rotatePiece = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;
    const rotated = rotateMatrix(currentPiece.shape);

    // Wall kick cơ bản (thử tại chỗ, rồi thử dịch trái 1, dịch phải 1, dịch trái 2, dịch phải 2)
    const offsets = [0, -1, 1, -2, 2];
    for (const offset of offsets) {
      if (!checkCollision(currentPiece, board, offset, 0, rotated)) {
        setCurrentPiece(prev => prev ? { ...prev, shape: rotated, x: prev.x + offset } : null);
        playSound('rotate');
        return;
      }
    }
  }, [currentPiece, isGameOver, isPaused, checkCollision, board, playSound]);

  // Hạ mềm (Soft drop)
  const dropPiece = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;
    if (!checkCollision(currentPiece, board, 0, 1)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
      setScore(s => s + 1); // Thưởng 1 điểm khi hạ mềm
    } else {
      lockPiece(currentPiece);
    }
  }, [currentPiece, isGameOver, isPaused, checkCollision, board, lockPiece]);

  // Thả tức thì (Hard drop)
  const hardDrop = useCallback(() => {
    if (!currentPiece || isGameOver || isPaused) return;
    let dropDistance = 0;
    while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
      dropDistance++;
    }

    const droppedPiece = { ...currentPiece, y: currentPiece.y + dropDistance };
    setScore(s => s + dropDistance * 2); // Thưởng 2 điểm mỗi hàng thả tức thì
    lockPiece(droppedPiece);
  }, [currentPiece, isGameOver, isPaused, checkCollision, board, lockPiece]);

  // Giữ khối (Hold piece)
  const handleHold = useCallback(() => {
    if (!currentPiece || !canHold || isGameOver || isPaused) return;

    const currentType = currentPiece.type;
    setCanHold(false);
    playSound('rotate');

    if (holdPieceType === null) {
      setHoldPieceType(currentType);
      spawnPiece();
    } else {
      setHoldPieceType(currentType);
      const def = TETROMINOES[holdPieceType];
      const newPiece: Piece = {
        type: holdPieceType,
        shape: def.shape,
        x: Math.floor((BOARD_WIDTH - def.shape[0].length) / 2),
        y: 0,
      };
      if (checkCollision(newPiece, board)) {
        setIsGameOver(true);
        playSound('gameover');
      } else {
        setCurrentPiece(newPiece);
      }
    }
  }, [currentPiece, canHold, isGameOver, isPaused, holdPieceType, playSound, spawnPiece, checkCollision, board]);

  // Game loop rơi tự động theo thời gian
  useEffect(() => {
    if (isGameOver || isPaused) return;
    // Tốc độ rơi nhanh dần theo level: từ 800ms xuống tối thiểu 100ms
    const speed = Math.max(100, 800 - (level - 1) * 70);
    const interval = setInterval(() => {
      dropPiece();
    }, speed);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, level, dropPiece]);

  // Lắng nghe bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveHorizontal(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        rotatePiece();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        dropPiece();
      } else if (e.key === ' ') {
        e.preventDefault();
        hardDrop();
      } else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') {
        e.preventDefault();
        handleHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, moveHorizontal, rotatePiece, dropPiece, hardDrop, handleHold]);

  // Tính vị trí bóng khối (Ghost piece projection)
  let ghostY = 0;
  if (currentPiece && !isGameOver) {
    while (!checkCollision(currentPiece, board, 0, ghostY + 1)) {
      ghostY++;
    }
  }

  // Kết xuất hiển thị ô xem trước (Next hoặc Hold)
  const renderMiniPreview = (type: TetrominoType | null) => {
    if (!type) {
      return (
        <div className="w-16 h-16 flex items-center justify-center text-[10px] tetris-text-muted text-[#604550]">
          Trống
        </div>
      );
    }
    const def = TETROMINOES[type];
    const shape = def.shape;
    return (
      <div className="tetris-board-grid grid gap-[2px] p-2 bg-[#12070d] rounded-xs border border-[#2d1822] items-center justify-center">
        {shape.map((row, r) => (
          <div key={r} className="flex gap-[2px]">
            {row.map((val, c) => (
              <div
                key={c}
                className="w-3.5 h-3.5 rounded-[1px] relative overflow-hidden flex items-center justify-center"
                style={
                  val !== 0
                    ? {
                        backgroundColor: def.bg,
                        border: `1px solid ${def.border}`,
                        boxShadow: `inset 0 1px 1px ${def.light}, 0 1px 2px ${def.glow}`,
                      }
                    : { backgroundColor: 'transparent' }
                }
              >
                {val !== 0 && (
                  <div className="absolute inset-0.5 rounded-[1px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-4 font-mono-code select-none">
      {/* Header bar */}
      <div className="tetris-panel bg-[#1c0c16] border border-[#3b1f2d] rounded-xs p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="tetris-btn p-2 bg-[#14080e] hover:bg-[#25101b] border border-[#ff4d79]/40 rounded-xs text-[#ffc2d4] hover:text-white transition flex items-center gap-1.5 cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về</span>
          </button>
          <div>
            <h1 className="tetris-text-main text-xl font-black text-[#ffc2d4] tracking-tight">TETRIS</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="tetris-btn p-2 bg-[#14080e] hover:bg-[#25101b] border border-[#3b1f2d] text-[#ffc2d4] rounded-xs transition cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={resetGame}
            className="tetris-btn p-2 bg-[#14080e] hover:bg-[#25101b] border border-[#3b1f2d] text-[#ffc2d4] rounded-xs transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Chơi lại"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Thân trò chơi: Bảng Hold | Bàn chơi 10x20 | Bảng Next & Điểm */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4">
        {/* Cột Trái: Khối đang giữ (Hold) & Cấp độ */}
        <div className="w-full md:w-36 flex flex-row md:flex-col justify-between md:justify-start gap-3 order-2 md:order-1">
          {/* Box Giữ (Hold) */}
          <div className="tetris-panel flex-1 md:w-full bg-[#14080e] border border-[#2d1822] p-3 rounded-xs flex flex-col items-center gap-2 shadow-sm">
            <span className="tetris-text-muted text-[11px] font-bold text-[#a08090]">GIỮ (HOLD)</span>
            {renderMiniPreview(holdPieceType)}
            <button
              onClick={handleHold}
              disabled={!canHold || isGameOver || isPaused}
              className={`tetris-btn w-full py-1 text-[10px] font-bold rounded-2xs border transition cursor-pointer flex items-center justify-center gap-1 ${
                canHold && !isGameOver && !isPaused
                  ? 'bg-[#1c0c16] hover:bg-[#25101b] border-[#3b1f2d] text-[#ffc2d4]'
                  : 'bg-[#12070d] border-[#1d0f17] text-[#553a45] cursor-not-allowed opacity-60'
              }`}
            >
              <Hand className="w-3 h-3" />
              <span>Đổi khối (C)</span>
            </button>
          </div>

          {/* Cấp độ (Level) */}
          <div className="tetris-panel flex-1 md:w-full bg-[#14080e] border border-[#2d1822] p-3 rounded-xs flex flex-col items-center gap-1 shadow-sm">
            <span className="tetris-text-muted text-[11px] font-bold text-[#a08090]">CẤP ĐỘ</span>
            <span className="tetris-text-main text-xl font-black text-[#ffc2d4]">{level}</span>
          </div>

          {/* Số hàng đã xóa */}
          <div className="tetris-panel flex-1 md:w-full bg-[#14080e] border border-[#2d1822] p-3 rounded-xs flex flex-col items-center gap-1 shadow-sm">
            <span className="tetris-text-muted text-[11px] font-bold text-[#a08090]">SỐ HÀNG</span>
            <span className="text-xl font-black text-[#0284c7]">{lines}</span>
          </div>
        </div>

        {/* Cột Giữa: Bàn cờ chính 10x20 */}
        <div className="relative order-1 md:order-2">
          {/* Pause overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-20 bg-[#12070d]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xs border border-[#ff4d79]/40">
              <Pause className="w-10 h-10 text-[#ff4d79] animate-pulse" />
              <p className="tetris-text-main text-base font-bold text-[#ffc2d4]">Tạm dừng</p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-4 py-2 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-bold text-xs rounded-xs border border-[#c084fc] transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tiếp tục</span>
              </button>
            </div>
          )}

          {/* Game Over overlay */}
          {isGameOver && (
            <div className="absolute inset-0 z-20 bg-[#12070d]/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xs border border-[#f43f5e] p-6 text-center shadow-xl">
              <h3 className="text-xl font-black text-[#f43f5e]">TRÒ CHƠI KẾT THÚC</h3>
              <p className="tetris-text-muted text-xs text-[#a08090]">Điểm của bạn</p>
              <p className="text-2xl font-black text-white">{score.toLocaleString()}</p>
              {score >= highScore && score > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#fbbf24] font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục mới!</span>
                </div>
              )}
              <button
                onClick={resetGame}
                className="mt-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-bold text-xs rounded-xs border border-[#c084fc] transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi lại</span>
              </button>
            </div>
          )}

          {/* Khung bàn chơi */}
          <div className="tetris-board-frame bg-[#12070d] p-1.5 rounded-xs border-2 border-[#4d2138] shadow-2xl">
            <div className="tetris-board-grid grid grid-cols-10 gap-[1px] bg-[#1a0c15] border border-[#2d1822] p-0.5 rounded-[2px]">
              {board.map((row, r) =>
                row.map((cellType, c) => {
                  let isCurrent = false;
                  let currentType: TetrominoType | null = null;
                  let isGhost = false;

                  // Kiểm tra khối hiện tại
                  if (currentPiece) {
                    const py = r - currentPiece.y;
                    const px = c - currentPiece.x;
                    if (
                      py >= 0 &&
                      py < currentPiece.shape.length &&
                      px >= 0 &&
                      px < currentPiece.shape[0].length &&
                      currentPiece.shape[py][px] !== 0
                    ) {
                      isCurrent = true;
                      currentType = currentPiece.type;
                    }

                    // Kiểm tra bóng khối (ghost piece)
                    const gy = r - (currentPiece.y + ghostY);
                    if (
                      !isCurrent &&
                      gy >= 0 &&
                      gy < currentPiece.shape.length &&
                      px >= 0 &&
                      px < currentPiece.shape[0].length &&
                      currentPiece.shape[gy][px] !== 0
                    ) {
                      isGhost = true;
                    }
                  }

                  const activeType = (cellType as TetrominoType) || (isCurrent ? currentType : null);
                  const def = activeType ? TETROMINOES[activeType] : null;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[1px] relative flex items-center justify-center transition-all duration-75 ${
                        def
                          ? 'border z-10'
                          : isGhost
                          ? 'tetris-cell-ghost border border-dashed border-[#c084fc]/50 bg-[#c084fc]/15 z-5'
                          : 'tetris-cell-empty bg-[#180a13] border border-[#25101b]'
                      }`}
                      style={
                        def
                          ? {
                              backgroundColor: def.bg,
                              borderColor: def.border,
                              boxShadow: `inset 0 1px 1px ${def.light}, 0 1px 2px ${def.glow}`,
                            }
                          : undefined
                      }
                    >
                      {/* Lớp phủ ánh sáng pastel đặc trưng giống Block Blast */}
                      {def && (
                        <div className="absolute inset-0.5 rounded-[1px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                      )}
                      {/* Chấm tâm ô trống */}
                      {!def && !isGhost && (
                        <div className="tetris-dot w-1 h-1 rounded-full bg-[#2a131f]" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Cột Phải: Khối tiếp theo (Next) & Điểm số */}
        <div className="w-full md:w-36 flex flex-row md:flex-col justify-between md:justify-start gap-3 order-3">
          {/* Khối tiếp theo (Next) */}
          <div className="tetris-panel flex-1 md:w-full bg-[#14080e] border border-[#2d1822] p-3 rounded-xs flex flex-col items-center gap-2 shadow-sm">
            <span className="tetris-text-muted text-[11px] font-bold text-[#a08090]">TIẾP THEO</span>
            {renderMiniPreview(nextPieceType)}
          </div>

          {/* Điểm số (Score) */}
          <div className="tetris-panel flex-1 md:w-full bg-[#14080e] border border-[#2d1822] p-3 rounded-xs flex flex-col items-center gap-1 shadow-sm">
            <span className="tetris-text-muted text-[11px] font-bold text-[#a08090]">ĐIỂM SỐ</span>
            <span className="tetris-text-main text-xl font-black text-white">{score.toLocaleString()}</span>
          </div>

          {/* Kỷ lục (High Score) */}
          <div className="tetris-panel flex-1 md:w-full bg-[#14080e] border border-[#2d1822] p-3 rounded-xs flex flex-col items-center gap-1 shadow-sm">
            <span className="text-[11px] font-bold text-[#fbbf24] flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>KỶ LỤC</span>
            </span>
            <span className="text-lg font-black text-[#fbbf24]">{highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bảng điều khiển cảm ứng cho di động / màn hình nhỏ */}
      <div className="tetris-panel max-w-md mx-auto bg-[#14080e] border border-[#2d1822] p-3 rounded-xs space-y-2">
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => moveHorizontal(-1)}
            disabled={isGameOver || isPaused}
            className="tetris-btn py-3 bg-[#1c0c16] hover:bg-[#25101b] active:bg-[#7c3aed] border border-[#3b1f2d] text-[#ffc2d4] hover:text-white rounded-xs flex items-center justify-center cursor-pointer shadow-xs transition active:scale-95"
            title="Sang trái (A / Mũi tên trái)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => moveHorizontal(1)}
            disabled={isGameOver || isPaused}
            className="tetris-btn py-3 bg-[#1c0c16] hover:bg-[#25101b] active:bg-[#7c3aed] border border-[#3b1f2d] text-[#ffc2d4] hover:text-white rounded-xs flex items-center justify-center cursor-pointer shadow-xs transition active:scale-95"
            title="Sang phải (D / Mũi tên phải)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={rotatePiece}
            disabled={isGameOver || isPaused}
            className="tetris-btn py-3 bg-[#1c0c16] hover:bg-[#25101b] active:bg-[#7c3aed] border border-[#3b1f2d] text-[#ffc2d4] hover:text-white rounded-xs flex items-center justify-center cursor-pointer shadow-xs transition active:scale-95"
            title="Xoay khối (W / Mũi tên lên)"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            onClick={dropPiece}
            disabled={isGameOver || isPaused}
            className="tetris-btn py-3 bg-[#1c0c16] hover:bg-[#25101b] active:bg-[#7c3aed] border border-[#3b1f2d] text-[#ffc2d4] hover:text-white rounded-xs flex items-center justify-center cursor-pointer shadow-xs transition active:scale-95"
            title="Hạ nhanh (S / Mũi tên xuống)"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            onClick={hardDrop}
            disabled={isGameOver || isPaused}
            className="py-3 bg-[#7c3aed] hover:bg-[#8b5cf6] active:bg-[#a855f7] border border-[#c084fc] text-white rounded-xs flex items-center justify-center cursor-pointer shadow-xs transition active:scale-95"
            title="Thả tức thì (Space)"
          >
            <ArrowDownToLine className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
