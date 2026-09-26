import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Sparkles, Undo2, Award, Crown, Medal, RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile, Game2048LeaderboardEntry } from '../types';
import { save2048HighScore, get2048Leaderboard } from '../lib/storage';

interface Game2048Props {
  onBack: () => void;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
}

const GRID_SIZE = 4;
const LOCAL_STORAGE_HIGH_SCORE_KEY = 'game_2048_high_score';
const LOCAL_STORAGE_SAVED_STATE_KEY = 'game_2048_saved_state';

// Màu sắc dạng Pastel dịu nhẹ đồng bộ theo các minigame khác
const TILE_STYLES: Record<number, { bg: string; text: string; shadow: string; border?: string; glow?: string }> = {
  2: { bg: 'bg-[#fce7f3]', text: 'text-[#831843]', shadow: 'shadow-xs', border: 'border border-[#fbcfe8]' },
  4: { bg: 'bg-[#fbcfe8]', text: 'text-[#831843]', shadow: 'shadow-xs', border: 'border border-[#f472b6]' },
  8: { bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]', shadow: 'shadow-sm', border: 'border border-[#7dd3fc]' },
  16: { bg: 'bg-[#bae6fd]', text: 'text-[#0369a1]', shadow: 'shadow-sm', border: 'border border-[#38bdf8]' },
  32: { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', shadow: 'shadow-sm', border: 'border border-[#86efac]' },
  64: { bg: 'bg-[#bbf7d0]', text: 'text-[#166534]', shadow: 'shadow-sm', border: 'border border-[#4ade80]' },
  128: { bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]', shadow: 'shadow-md', border: 'border border-[#fde047]' },
  256: { bg: 'bg-[#ffedd5]', text: 'text-[#9a3412]', shadow: 'shadow-md', border: 'border border-[#fdba74]' },
  512: { bg: 'bg-[#fed7aa]', text: 'text-[#9a3412]', shadow: 'shadow-md', border: 'border border-[#fb923c]' },
  1024: { bg: 'bg-[#ede9fe]', text: 'text-[#581c87]', shadow: 'shadow-lg', border: 'border border-[#c084fc]', glow: 'ring-1 ring-[#c084fc]/50' },
  2048: { bg: 'bg-[#e0e7ff]', text: 'text-[#3730a3]', shadow: 'shadow-lg', border: 'border border-[#818cf8]', glow: 'ring-2 ring-[#818cf8]' },
  4096: { bg: 'bg-[#fdf4ff]', text: 'text-[#701a75]', shadow: 'shadow-lg', border: 'border border-[#f0abfc]', glow: 'ring-2 ring-[#f0abfc]' },
  8192: { bg: 'bg-[#ccfbf1]', text: 'text-[#115e59]', shadow: 'shadow-lg', border: 'border border-[#5eead4]', glow: 'ring-2 ring-[#5eead4]' },
  16384: { bg: 'bg-[#fae8ff]', text: 'text-[#86198f]', shadow: 'shadow-lg', border: 'border border-[#e879f9]', glow: 'ring-2 ring-[#e879f9]' },
  32768: { bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]', shadow: 'shadow-lg', border: 'border border-[#fca5a5]', glow: 'ring-2 ring-[#fca5a5]' },
  65536: { bg: 'bg-[#f1f5f9]', text: 'text-[#0f172a]', shadow: 'shadow-lg', border: 'border border-[#cbd5e1]', glow: 'ring-2 ring-[#94a3b8]' },
};

function getTileStyle(val: number) {
  if (TILE_STYLES[val]) return TILE_STYLES[val];
  return {
    bg: 'bg-[#e2e8f0]',
    text: 'text-[#0f172a] font-black',
    shadow: 'shadow-lg',
    border: 'border-2 border-[#94a3b8]',
    glow: 'ring-2 ring-[#64748b]'
  };
}

interface TileItem {
  id: number;
  val: number;
  r: number;
  c: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export const Game2048: React.FC<Game2048Props> = ({ onBack, currentUser, userProfile }) => {
  // Trạng thái lưới 4x4
  const [board, setBoard] = useState<number[][]>(() => 
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0))
  );
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [maxTile, setMaxTile] = useState<number>(2);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scoreAddAnimation, setScoreAddAnimation] = useState<{ id: number; amount: number } | null>(null);
  
  // Hoàn tác
  const [previousState, setPreviousState] = useState<{ board: number[][]; score: number; maxTile: number } | null>(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<Game2048LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);

  const tileIdCounter = useRef(1);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  // Âm thanh Web Audio API
  const playAudio = useCallback((type: 'move' | 'merge' | 'gameover' | 'milestone') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'merge') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'milestone') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Bỏ qua lỗi audio context trên một số trình duyệt chặn autoplay
    }
  }, [soundEnabled]);

  // Lấy dữ liệu Bảng Xếp Hạng từ Firestore
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await get2048Leaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.warn('Không thể tải BXH 2048:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Thêm 1 tile ngẫu nhiên (90% là 2, 10% là 4)
  const addRandomTile = useCallback((currentBoard: number[][]): { newBoard: number[][]; added: boolean } => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length === 0) {
      return { newBoard: currentBoard, added: false };
    }

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;
    const nextBoard = currentBoard.map(row => [...row]);
    nextBoard[r][c] = val;
    return { newBoard: nextBoard, added: true };
  }, []);

  // Kiểm tra còn nước đi nào không (Game Over)
  const checkHasMoves = useCallback((b: number[][]): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (b[r][c] === 0) return true;
        // Kiểm tra kề phải
        if (c + 1 < GRID_SIZE && b[r][c] === b[r][c + 1]) return true;
        // Kiểm tra kề dưới
        if (r + 1 < GRID_SIZE && b[r][c] === b[r + 1][c]) return true;
      }
    }
    return false;
  }, []);

  // Bắt đầu game mới
  const startNewGame = useCallback(() => {
    let newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    const first = addRandomTile(newGrid);
    const second = addRandomTile(first.newBoard);
    
    setBoard(second.newBoard);
    setScore(0);
    setMaxTile(2);
    setGameOver(false);
    setPreviousState(null);
    localStorage.removeItem(LOCAL_STORAGE_SAVED_STATE_KEY);
  }, [addRandomTile]);

  // Khởi tạo lần đầu
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SAVED_STATE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.board && Array.isArray(parsed.board)) {
          setBoard(parsed.board);
          setScore(parsed.score || 0);
          setMaxTile(parsed.maxTile || 2);
          setGameOver(parsed.gameOver || false);
          return;
        }
      } catch {
        // Lỗi parse thì khởi tạo mới
      }
    }
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lưu điểm cao và đồng bộ lên Leaderboard
  const handleUpdateHighScore = useCallback((newScore: number, highestTile: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE_KEY, newScore.toString());
    }

    const effectiveUser = currentUser ? {
      uid: currentUser.uid,
      displayName: userProfile?.displayName || currentUser.displayName || 'Vô danh',
      photoURL: userProfile?.photoURL || currentUser.photoURL || ''
    } : null;

    if (effectiveUser) {
      save2048HighScore(effectiveUser, Math.max(newScore, highScore), highestTile).then(() => {
        fetchLeaderboard();
      }).catch(() => {});
    }
  }, [highScore, currentUser, userProfile, fetchLeaderboard]);

  // Di chuyển các hàng/cột
  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let changed = false;
    let gainedScore = 0;
    let newMaxTile = maxTile;
    let mergedAny = false;

    // Lưu lại trạng thái để Hoàn tác
    const backupBoard = board.map(row => [...row]);
    const backupScore = score;
    const backupMax = maxTile;

    // Helper: trượt và gộp 1 hàng sang trái
    const slideAndMergeRow = (row: number[]): { newRow: number[]; scoreDelta: number } => {
      let filtered = row.filter(val => val !== 0);
      let rowScore = 0;
      let result: number[] = [];

      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedVal = filtered[i] * 2;
          result.push(mergedVal);
          rowScore += mergedVal;
          if (mergedVal > newMaxTile) {
            newMaxTile = mergedVal;
          }
          mergedAny = true;
          i++; // Bỏ qua phần tử kế tiếp vì đã gộp
        } else {
          result.push(filtered[i]);
        }
      }

      while (result.length < GRID_SIZE) {
        result.push(0);
      }

      return { newRow: result, scoreDelta: rowScore };
    };

    let nextBoard: number[][] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

    if (direction === 'LEFT') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const { newRow, scoreDelta } = slideAndMergeRow(board[r]);
        nextBoard[r] = newRow;
        gainedScore += scoreDelta;
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const reversed = [...board[r]].reverse();
        const { newRow, scoreDelta } = slideAndMergeRow(reversed);
        nextBoard[r] = newRow.reverse();
        gainedScore += scoreDelta;
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const { newRow, scoreDelta } = slideAndMergeRow(col);
        for (let r = 0; r < GRID_SIZE; r++) {
          nextBoard[r][c] = newRow[r];
        }
        gainedScore += scoreDelta;
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
        const { newRow, scoreDelta } = slideAndMergeRow(col);
        const colReversed = newRow.reverse();
        for (let r = 0; r < GRID_SIZE; r++) {
          nextBoard[r][c] = colReversed[r];
        }
        gainedScore += scoreDelta;
      }
    }

    // Kiểm tra xem bàn cờ có thực sự thay đổi không
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (nextBoard[r][c] !== board[r][c]) {
          changed = true;
          break;
        }
      }
      if (changed) break;
    }

    if (!changed) return;

    // Có di chuyển: Lưu backup state
    setPreviousState({
      board: backupBoard,
      score: backupScore,
      maxTile: backupMax
    });

    // Thêm tile mới ngẫu nhiên
    const spawnRes = addRandomTile(nextBoard);
    const finalBoard = spawnRes.newBoard;
    const finalScore = score + gainedScore;

    setBoard(finalBoard);
    setScore(finalScore);
    setMaxTile(newMaxTile);

    // Âm thanh
    if (newMaxTile > maxTile && (newMaxTile === 2048 || newMaxTile === 4096 || newMaxTile === 8192 || newMaxTile === 16384)) {
      playAudio('milestone');
    } else if (mergedAny) {
      playAudio('merge');
    } else {
      playAudio('move');
    }

    // Hiển thị cộng điểm
    if (gainedScore > 0) {
      setScoreAddAnimation({ id: Date.now(), amount: gainedScore });
      setTimeout(() => setScoreAddAnimation(null), 700);
    }

    // Cập nhật kỷ lục
    handleUpdateHighScore(finalScore, newMaxTile);

    // Kiểm tra Game Over
    const hasMoreMoves = checkHasMoves(finalBoard);
    if (!hasMoreMoves) {
      setGameOver(true);
      playAudio('gameover');
      handleUpdateHighScore(finalScore, newMaxTile);
    }

    // Lưu state cục bộ
    localStorage.setItem(LOCAL_STORAGE_SAVED_STATE_KEY, JSON.stringify({
      board: finalBoard,
      score: finalScore,
      maxTile: newMaxTile,
      gameOver: !hasMoreMoves
    }));
  }, [board, score, maxTile, gameOver, addRandomTile, checkHasMoves, handleUpdateHighScore, playAudio]);

  // Hoàn tác nước đi (Undo)
  const handleUndo = useCallback(() => {
    if (!previousState || gameOver) return;
    setBoard(previousState.board);
    setScore(previousState.score);
    setMaxTile(previousState.maxTile);
    setPreviousState(null);
    playAudio('move');
  }, [previousState, gameOver, playAudio]);

  // Xử lý phím mũi tên / WASD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault(); // Tránh cuộn trang
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Xử lý cử chỉ vuốt trên màn hình cảm ứng điện thoại
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const minSwipeDistance = 30; // pixel tối thiểu

    if (Math.max(absDx, absDy) > minSwipeDistance) {
      if (absDx > absDy) {
        // Vuốt ngang
        if (dx > 0) move('RIGHT');
        else move('LEFT');
      } else {
        // Vuốt dọc
        if (dy > 0) move('DOWN');
        else move('UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-start text-[#f2e9e4] pb-16 select-none">
      {/* Header Điều khiển */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b1e2a] hover:bg-[#3d293b] border border-[#ff85a1]/30 text-xs font-mono-code text-[#ffc2d4] transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Thoát</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Nút Undo */}
          <button
            onClick={handleUndo}
            disabled={!previousState || gameOver}
            title="Hoàn tác 1 nước đi"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-mono-code transition ${
              previousState && !gameOver
                ? 'bg-[#2b1e2a] hover:bg-[#3d293b] border-[#ffd166]/40 text-[#ffd166] cursor-pointer'
                : 'bg-[#1a1219] border-white/5 text-[#6c5866] cursor-not-allowed opacity-50'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Hoàn tác</span>
          </button>

          {/* Âm thanh */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-[#2b1e2a] hover:bg-[#3d293b] border border-white/10 text-[#ffc2d4] transition"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#4ade80]" /> : <VolumeX className="w-4 h-4 text-[#a88291]" />}
          </button>

          {/* Nút Chơi lại */}
          <button
            onClick={startNewGame}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff758f] to-[#ff4d6d] text-white text-xs font-mono-code font-bold hover:brightness-110 active:scale-95 transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mới</span>
          </button>
        </div>
      </div>

      {/* Bảng Điểm & Kỷ lục */}
      <div className="w-full max-w-md bg-[#221622]/90 border border-[#ff85a1]/25 rounded-2xl p-4 shadow-xl mb-4 backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-mono-code text-transparent bg-clip-text bg-gradient-to-r from-[#ffc8dd] via-[#ffafcc] to-[#ffd166]">
              2048
            </h1>
          </div>

          <div className="flex gap-2">
            {/* Điểm hiện tại */}
            <div className="relative bg-[#170e17] border border-[#ff85a1]/30 rounded-xl px-3 py-1.5 text-center min-w-[72px]">
              <span className="text-[10px] text-[#a88291] font-mono-code block">ĐIỂM</span>
              <span className="text-base font-black font-mono-code text-white">{score}</span>
              {scoreAddAnimation && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black text-[#4ade80] animate-bounce pointer-events-none">
                  +{scoreAddAnimation.amount}
                </div>
              )}
            </div>

            {/* Kỷ lục */}
            <div className="bg-[#170e17] border border-[#ffd166]/40 rounded-xl px-3 py-1.5 text-center min-w-[72px]">
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#ffd166] font-mono-code">
                <Trophy className="w-3 h-3" />
                <span>KỶ LỤC</span>
              </div>
              <span className="text-base font-black font-mono-code text-[#ffd166]">
                {Math.max(score, highScore)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vùng Bàn Cờ 4x4 */}
      <div 
        ref={boardContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-md aspect-square bg-[#1a111a] border-2 border-[#ff85a1]/30 rounded-2xl p-2.5 shadow-2xl touch-none flex flex-col justify-between"
      >
        {/* Lưới ô cờ nền */}
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-full h-full">
          {board.map((row, r) =>
            row.map((val, c) => {
              const style = val > 0 ? getTileStyle(val) : null;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative rounded-xl flex items-center justify-center transition-all duration-100 select-none ${
                    val === 0 
                      ? 'bg-[#2b1c2b]/50 border border-white/5' 
                      : `${style?.bg} ${style?.shadow} ${style?.glow || ''} border border-white/20 transform active:scale-95`
                  }`}
                >
                  {val > 0 && (
                    <span 
                      className={`font-mono-code font-black transition-all ${style?.text} ${
                        val >= 10000 
                          ? 'text-xs' 
                          : val >= 1000 
                          ? 'text-sm' 
                          : val >= 100 
                          ? 'text-lg' 
                          : 'text-2xl'
                      }`}
                    >
                      {val}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Màn hình Game Over */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#0d070d]/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 z-20 animate-fade-in text-center border-2 border-[#ff4d6d]/50">
            <div className="w-12 h-12 rounded-full bg-[#ff4d6d]/20 border border-[#ff4d6d]/40 flex items-center justify-center text-[#ff4d6d] mb-3">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-2xl font-black font-mono-code text-white mb-1">
              HẾT NƯỚC ĐI!
            </h2>
            <p className="text-xs text-[#a88291] font-mono-code mb-4">
              Không còn ô trống hoặc ô hợp nhất khả dụng trên bàn cờ.
            </p>

            <div className="flex gap-4 mb-6">
              <div className="bg-[#1f131f] border border-white/10 rounded-xl px-4 py-2">
                <span className="text-[10px] text-[#a88291] font-mono-code block">Điểm số</span>
                <span className="text-xl font-black font-mono-code text-white">{score}</span>
              </div>
              <div className="bg-[#1f131f] border border-[#ffd166]/30 rounded-xl px-4 py-2">
                <span className="text-[10px] text-[#ffd166] font-mono-code block">Khối cao nhất</span>
                <span className="text-xl font-black font-mono-code text-[#ffd166]">{maxTile}</span>
              </div>
            </div>

            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff758f] to-[#ff4d6d] hover:brightness-110 text-white font-mono-code font-bold text-sm shadow-lg shadow-[#ff4d6d]/30 transition transform active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi ván mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Hướng dẫn thao tác */}
      <div className="w-full max-w-md mt-3 flex items-center justify-center text-[11px] text-[#a88291] font-mono-code px-2">
        <span className="flex items-center gap-1">
          Phím mũi tên / WASD hoặc vuốt tay
        </span>
      </div>

      {/* BẢNG XẾP HẠNG KỶ LỤC BÊN DƯỚI */}
      <div className="w-full max-w-md mt-8 bg-[#1f141f]/90 border border-[#ff85a1]/25 rounded-2xl p-4 shadow-xl backdrop-blur-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffd166]" />
            <h3 className="font-bold font-mono-code text-sm text-[#ffc2d4]">
              BẢNG XẾP HẠNG 2048
            </h3>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loadingLeaderboard}
            className="flex items-center gap-1 text-[11px] font-mono-code text-[#a88291] hover:text-[#ffc2d4] transition"
          >
            <RefreshCw className={`w-3 h-3 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {loadingLeaderboard ? (
          <div className="py-6 text-center text-xs font-mono-code text-[#a88291]">
            Đang tải bảng xếp hạng...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono-code text-[#a88291]">
            Chưa có ai ghi danh kỷ lục. Hãy là người đầu tiên!
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, index) => {
              const isMe = currentUser?.uid === entry.uid;
              return (
                <div
                  key={entry.uid}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition ${
                    isMe
                      ? 'bg-[#ff758f]/15 border-[#ff758f]/40 text-white'
                      : 'bg-[#150d15] border-white/5 text-[#f2e9e4]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Thứ hạng */}
                    <div className="w-6 text-center font-mono-code font-bold text-xs">
                      {index === 0 ? (
                        <Crown className="w-4 h-4 text-[#ffd166] inline-block" />
                      ) : index === 1 ? (
                        <Medal className="w-4 h-4 text-[#e2e8f0] inline-block" />
                      ) : index === 2 ? (
                        <Medal className="w-4 h-4 text-[#d97706] inline-block" />
                      ) : (
                        <span className="text-[#a88291]">#{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar & Tên */}
                    <div className="flex items-center gap-2">
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt={entry.displayName}
                          className="w-6 h-6 rounded-full object-cover border border-white/20"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#3d293b] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#ffc2d4]">
                          {entry.displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-mono-code font-medium truncate max-w-[120px]">
                        {entry.displayName} {isMe && '(Bạn)'}
                      </span>
                    </div>
                  </div>

                  {/* Max Tile & Điểm số */}
                  <div className="flex items-center gap-2">
                    {entry.maxTile > 0 && (
                      <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded-md bg-[#ffd166]/15 text-[#ffd166] border border-[#ffd166]/30">
                        {entry.maxTile}
                      </span>
                    )}
                    <span className="text-xs font-mono-code font-black text-[#4ade80]">
                      {entry.highScore.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
