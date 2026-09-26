import React, { useState } from 'react';
import { Gamepad2, Play, Trophy, LayoutGrid, Grid3X3, Bomb, Blocks, ArrowLeftRight } from 'lucide-react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { BlockBlastGame } from './BlockBlastGame';
import { Game2048 } from './Game2048';
import { NonogramGame } from './NonogramGame';
import { MinesweeperGame } from './MinesweeperGame';
import { SudokuGame } from './SudokuGame';
import { TetrisGame } from './TetrisGame';
import { SlidingBlockGame } from './SlidingBlockGame';

interface GamesHubProps {
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  selectedGameId?: string | null;
  onSelectGame?: (gameId: string | null) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ 
  currentUser, 
  userProfile,
  selectedGameId: propSelectedGameId,
  onSelectGame
}) => {
  const [internalGameId, setInternalGameId] = useState<string | null>(null);
  const activeGameId = propSelectedGameId !== undefined ? propSelectedGameId : internalGameId;

  const setActiveGameId = (id: string | null) => {
    setInternalGameId(id);
    if (onSelectGame) {
      onSelectGame(id);
    }
  };

  // Lấy kỷ lục điểm Block đã lưu trong localStorage
  const blockHighScore = (() => {
    try {
      const saved = localStorage.getItem('blockblast_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy kỷ lục điểm 2048 đã lưu trong localStorage
  const game2048HighScore = (() => {
    try {
      const saved = localStorage.getItem('game_2048_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy số câu đố Nonogram đã giải trong localStorage
  const nonogramSolvedCount = (() => {
    try {
      const savedRecords = localStorage.getItem('nonogram_size_records');
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        const total = (parsed[5]?.solvedCount || 0) + (parsed[10]?.solvedCount || 0) + (parsed[15]?.solvedCount || 0);
        if (total > 0) return total;
      }
      const legacy = localStorage.getItem('nonogram_completed_puzzles');
      return legacy ? Object.keys(JSON.parse(legacy)).length : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy thống kê game Dò mìn (Minesweeper)
  const minesweeperStats = (() => {
    try {
      const times = localStorage.getItem('minesweeper_best_times');
      const wins = localStorage.getItem('minesweeper_win_stats');
      const parsedTimes: Record<string, number> = times ? JSON.parse(times) : {};
      const parsedWins: Record<string, number> = wins ? JSON.parse(wins) : {};
      const totalWins: number = Object.values(parsedWins).reduce<number>((sum, val) => sum + (Number(val) || 0), 0);
      const bestEasy: number | undefined = parsedTimes.easy;
      return { totalWins, bestEasy };
    } catch {
      return { totalWins: 0, bestEasy: undefined };
    }
  })();

  // Lấy kỷ lục điểm Tetris đã lưu trong localStorage
  const tetrisHighScore = (() => {
    try {
      const saved = localStorage.getItem('tetris_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // Lấy thời gian giải Sudoku nhanh nhất
  const sudokuBestTime = (() => {
    try {
      const saved = localStorage.getItem('sudoku_best_times');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.medium || parsed.easy || parsed.hard || null;
      }
      return null;
    } catch {
      return null;
    }
  })();

  // Lấy kỷ lục game Trượt Khối
  const slideBlockHighScore = (() => {
    try {
      const saved = localStorage.getItem('slide_block_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // Nếu đang chơi game Block
  if (activeGameId === 'block' || activeGameId === 'block_blast') {
    return (
      <BlockBlastGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game 2048
  if (activeGameId === '2048') {
    return (
      <Game2048
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Nonogram
  if (activeGameId === 'nonogram' || activeGameId === 'picross') {
    return (
      <NonogramGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Dò Mìn (Minesweeper)
  if (activeGameId === 'minesweeper' || activeGameId === 'do-min' || activeGameId === 'do_min') {
    return (
      <MinesweeperGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Sudoku
  if (activeGameId === 'sudoku') {
    return (
      <SudokuGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Tetris
  if (activeGameId === 'tetris') {
    return (
      <TetrisGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  // Nếu đang chơi game Trượt Khối (Sliding Block Puzzle)
  if (activeGameId === 'sliding_block' || activeGameId === 'sliding_puzzle' || activeGameId === 'truot_khoi') {
    return (
      <SlidingBlockGame
        onBack={() => setActiveGameId(null)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Banner / Header */}
      <div className="bg-[#25101b] border border-[#4d2138] rounded-xs p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#14080e] border border-[#ff4d79]/30 rounded-xs text-[#ff4d79]">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-mono-code text-[#ffc2d4] tracking-tight">
              TRUNG TÂM TRÒ CHƠI
            </h1>
          </div>
        </div>
      </div>

      {/* Danh sách các trò chơi sẵn có */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card Game Block */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#f472b6] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#f472b6]/20 via-[#ec4899]/20 to-[#fda4af]/20 border border-[#f472b6]/50 flex items-center justify-center text-[#f472b6] group-hover:scale-105 transition shadow-xs">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Block
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kỷ lục cá nhân nếu có */}
              {blockHighScore > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục của bạn: <strong>{blockHighScore.toLocaleString()}</strong> điểm</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('block')}
              className="w-full py-2.5 bg-[#be185d] hover:bg-[#db2777] text-white font-mono-code font-bold text-xs rounded-xs border border-[#f472b6] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game 2048 Vô Tận */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#ffd166] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#ffd166]/20 via-[#f59e0b]/20 to-[#d97706]/10 border border-[#ffd166]/50 flex items-center justify-center text-[#ffd166] group-hover:scale-105 transition shadow-xs">
                    <span className="font-mono-code font-black text-sm tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#ffd166] to-[#f59e0b]">
                      2048
                    </span>
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      2048
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kỷ lục cá nhân nếu có */}
              {game2048HighScore > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục của bạn: <strong>{game2048HighScore.toLocaleString()}</strong> điểm</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('2048')}
              className="w-full py-2.5 bg-[#b45309] hover:bg-[#d97706] text-white font-mono-code font-bold text-xs rounded-xs border border-[#ffd166] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Picross */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#10b981] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#10b981]/20 via-[#059669]/20 to-[#6ee7b7]/20 border border-[#10b981]/50 flex items-center justify-center text-[#10b981] group-hover:scale-105 transition shadow-xs">
                    <Grid3X3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Picross
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tiến độ giải câu đố */}
              {nonogramSolvedCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#4ade80] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>Đã hoàn thành: <strong>{nonogramSolvedCount}</strong> câu đố</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#8a717a] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <span>Tranh số logic</span>
                </div>
              )}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('picross')}
              className="w-full py-2.5 bg-[#059669] hover:bg-[#10b981] text-white font-mono-code font-bold text-xs rounded-xs border border-[#34d399] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Dò Mìn (Minesweeper) */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#ef4444] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#ef4444]/20 via-[#dc2626]/20 to-[#f87171]/20 border border-[#ef4444]/50 flex items-center justify-center text-[#ef4444] group-hover:scale-105 transition shadow-xs">
                    <Bomb className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Dò Mìn
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tiến độ hoặc Kỷ lục */}
              {minesweeperStats.bestEasy ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục: <strong>{minesweeperStats.bestEasy}s</strong> {minesweeperStats.totalWins > 0 && `(${minesweeperStats.totalWins} thắng)`}</span>
                </div>
              ) : null}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('minesweeper')}
              className="w-full py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-white font-mono-code font-bold text-xs rounded-xs border border-[#f87171] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Sudoku */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#38bdf8] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#38bdf8]/20 via-[#0284c7]/20 to-[#818cf8]/20 border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition shadow-xs">
                    <span className="font-mono-code font-black text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#38bdf8] via-[#60a5fa] to-[#818cf8]">
                      123
                    </span>
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Sudoku
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tiến độ hoặc Kỷ lục */}
              {sudokuBestTime ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục: <strong>{Math.floor(sudokuBestTime / 60)}m {sudokuBestTime % 60}s</strong></span>
                </div>
              ) : null}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('sudoku')}
              className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono-code font-bold text-xs rounded-xs border border-[#38bdf8] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Tetris */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#a855f7] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#a855f7]/20 via-[#7c3aed]/20 to-[#c084fc]/20 border border-[#a855f7]/50 flex items-center justify-center text-[#a855f7] group-hover:scale-105 transition shadow-xs">
                    <Blocks className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Tetris
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kỷ lục */}
              {tetrisHighScore > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục của bạn: <strong>{tetrisHighScore.toLocaleString()}</strong> điểm</span>
                </div>
              ) : null}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('tetris')}
              className="w-full py-2.5 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-mono-code font-bold text-xs rounded-xs border border-[#c084fc] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>

          {/* Card Game Trượt Khối */}
          <div className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#f59e0b] rounded-xs p-5 flex flex-col justify-between space-y-4 transition group shadow-sm">
            <div className="space-y-3">
              {/* Game Icon & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xs bg-gradient-to-br from-[#f59e0b]/20 via-[#d97706]/20 to-[#b45309]/20 border border-[#f59e0b]/50 flex items-center justify-center text-[#f59e0b] group-hover:scale-105 transition shadow-xs">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="game-card-title text-base font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                      Trượt Khối
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kỷ lục */}
              {slideBlockHighScore > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#fbbf24] bg-[#14080e] p-2 rounded-xs border border-[#2d1822]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Kỷ lục: <strong>{slideBlockHighScore.toLocaleString()}</strong> điểm</span>
                </div>
              ) : null}
            </div>

            {/* Nút vào chơi */}
            <button
              onClick={() => setActiveGameId('sliding_block')}
              className="w-full py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white font-mono-code font-bold text-xs rounded-xs border border-[#f59e0b] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>CHƠI NGAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

