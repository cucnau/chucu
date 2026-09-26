import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, RotateCcw, Trophy, Volume2, VolumeX, Flame, Zap, Medal, Crown, User as UserIcon, RefreshCw
} from 'lucide-react';
import { UserProfile, BlockLeaderboardEntry } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { saveBlockBlastHighScore, getBlockBlastLeaderboard } from '../lib/storage';

interface BlockBlastGameProps {
  onBack: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
}

// 8x8 Grid Constants
const BOARD_SIZE = 8;

// Các loại màu khối block phong cách Pastel dịu mắt, sang trọng
export interface BlockColor {
  id: string;
  name: string;
  bg: string;
  border: string;
  glow: string;
  light: string;
}

export const PASTEL_BLOCK_COLORS: BlockColor[] = [
  { 
    id: 'pastel-mint', 
    name: 'Mint Pastel',
    bg: '#6ee7b7', // Xanh bạc hà pastel
    border: '#a7f3d0', 
    glow: 'rgba(110, 231, 183, 0.4)', 
    light: '#ecfdf5',
  },
  { 
    id: 'pastel-butter', 
    name: 'Butter Pastel',
    bg: '#fde047', // Vàng bơ mềm pastel
    border: '#fef08a', 
    glow: 'rgba(253, 224, 71, 0.4)', 
    light: '#fefce8',
  },
  { 
    id: 'pastel-peach', 
    name: 'Peach Pastel',
    bg: '#fca5a5', // Cam đào / Hồng đào pastel
    border: '#fecaca', 
    glow: 'rgba(252, 165, 165, 0.4)', 
    light: '#fff1f2',
  },
  { 
    id: 'pastel-lavender', 
    name: 'Lavender Pastel',
    bg: '#c084fc', // Tím hoa oải hương pastel
    border: '#e9d5ff', 
    glow: 'rgba(192, 132, 252, 0.4)', 
    light: '#faf5ff',
  },
  { 
    id: 'pastel-sky', 
    name: 'Sky Pastel',
    bg: '#7dd3fc', // Xanh da trời pastel dịu
    border: '#bae6fd', 
    glow: 'rgba(125, 211, 252, 0.4)', 
    light: '#f0f9ff',
  },
  { 
    id: 'pastel-pink', 
    name: 'Sakura Pink Pastel',
    bg: '#f472b6', // Hồng phấn hoa anh đào pastel
    border: '#fbcfe8', 
    glow: 'rgba(244, 114, 182, 0.4)', 
    light: '#fdf2f8',
  },
  { 
    id: 'pastel-apricot', 
    name: 'Apricot Pastel',
    bg: '#fdba74', // Cam mơ pastel
    border: '#fed7aa', 
    glow: 'rgba(253, 186, 116, 0.4)', 
    light: '#fff7ed',
  },
  { 
    id: 'pastel-sage', 
    name: 'Sage Green Pastel',
    bg: '#86efac', // Xanh ngọc bích non pastel
    border: '#bbf7d0', 
    glow: 'rgba(134, 239, 172, 0.4)', 
    light: '#f0fdf4',
  },
];

// Khai báo các hình khối (Block shapes)
export interface ShapeDef {
  id: string;
  name: string;
  matrix: number[][]; // 1: có ô, 0: trống
}

export const SHAPES: ShapeDef[] = [
  // 1x1
  { id: 'dot', name: '1x1', matrix: [[1]] },
  
  // Lines
  { id: 'h2', name: '1x2', matrix: [[1, 1]] },
  { id: 'v2', name: '2x1', matrix: [[1], [1]] },
  { id: 'h3', name: '1x3', matrix: [[1, 1, 1]] },
  { id: 'v3', name: '3x1', matrix: [[1], [1], [1]] },
  { id: 'h4', name: '1x4', matrix: [[1, 1, 1, 1]] },
  { id: 'v4', name: '4x1', matrix: [[1], [1], [1], [1]] },
  { id: 'h5', name: '1x5', matrix: [[1, 1, 1, 1, 1]] },
  { id: 'v5', name: '5x1', matrix: [[1], [1], [1], [1], [1]] },

  // Squares
  { id: 'sq2', name: '2x2', matrix: [[1, 1], [1, 1]] },
  { id: 'sq3', name: '3x3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },

  // L-Shapes (2x2)
  { id: 'l2_1', name: 'L2-1', matrix: [[1, 0], [1, 1]] },
  { id: 'l2_2', name: 'L2-2', matrix: [[0, 1], [1, 1]] },
  { id: 'l2_3', name: 'L2-3', matrix: [[1, 1], [1, 0]] },
  { id: 'l2_4', name: 'L2-4', matrix: [[1, 1], [0, 1]] },

  // L-Shapes (3x3)
  { id: 'l3_1', name: 'L3-1', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  { id: 'l3_2', name: 'L3-2', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
  { id: 'l3_3', name: 'L3-3', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
  { id: 'l3_4', name: 'L3-4', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },

  // T-Shapes
  { id: 't_down', name: 'T1', matrix: [[1, 1, 1], [0, 1, 0]] },
  { id: 't_up', name: 'T2', matrix: [[0, 1, 0], [1, 1, 1]] },
  { id: 't_right', name: 'T3', matrix: [[1, 0], [1, 1], [1, 0]] },
  { id: 't_left', name: 'T4', matrix: [[0, 1], [1, 1], [0, 1]] },

  // Z / S Shapes
  { id: 'z_h', name: 'Z1', matrix: [[1, 1, 0], [0, 1, 1]] },
  { id: 's_h', name: 'S1', matrix: [[0, 1, 1], [1, 1, 0]] },
  { id: 'z_v', name: 'Z2', matrix: [[0, 1], [1, 1], [1, 0]] },
  { id: 's_v', name: 'S2', matrix: [[1, 0], [1, 1], [0, 1]] },

  // Rectangles 2x3 & 3x2
  { id: 'rect_2x3', name: '2x3', matrix: [[1, 1, 1], [1, 1, 1]] },
  { id: 'rect_3x2', name: '3x2', matrix: [[1, 1], [1, 1], [1, 1]] },
];

export interface HandBlock {
  uid: string;
  shape: ShapeDef;
  color: BlockColor;
}

// Audio Engine với Web Audio API phong cách Block Blast
let globalAudioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  try {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioCtx = new AudioContextClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
};

const playSoundEffect = (type: 'place' | 'clear' | 'combo' | 'gameover' | 'select', comboCount = 1) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'place') {
      // Âm Pop mộc dày dặn ấm áp khi đặt viên gạch pastel
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'clear') {
      // Âm thanh pha lê thủy tinh blast vang ngân trong trẻo
      const baseNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      baseNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.2, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.23);
      });
    } else if (type === 'combo') {
      // Chuỗi nốt combo vui nhộn phấn khích tăng tiến theo combo level
      const baseScale = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      const startIdx = Math.min(comboCount, 4);
      const notes = [
        baseScale[startIdx % baseScale.length],
        baseScale[(startIdx + 2) % baseScale.length],
        baseScale[(startIdx + 4) % baseScale.length] * 1.2
      ];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.26, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } else if (type === 'gameover') {
      const freqs = [440, 370, 311, 220];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.22);
      });
    }
  } catch {
    // Ignore audio errors
  }
};

export const BlockBlastGame: React.FC<BlockBlastGameProps> = ({ onBack, currentUser, userProfile }) => {
  // Board: 8x8. Cell value là null hoặc BlockColor
  const [board, setBoard] = useState<(BlockColor | null)[][]>(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const currentBoardRef = useRef<(BlockColor | null)[][]>(board);
  useEffect(() => {
    currentBoardRef.current = board;
  }, [board]);

  // 3 khối đang có trong tay để đặt
  const [handBlocks, setHandBlocks] = useState<(HandBlock | null)[]>([null, null, null]);
  
  // Khối đang được chọn/kéo
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  
  // Vị trí con trỏ khi kéo
  const [draggingPos, setDraggingPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Hover preview position trên lưới (row, col của top-left shape)
  const [hoverPos, setHoverPos] = useState<{ r: number; c: number } | null>(null);
  const [isHoverValid, setIsHoverValid] = useState<boolean>(false);

  // Điểm số, Điểm cao, Combo
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('blockblast_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [combo, setCombo] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Hiệu ứng nổ / xóa hàng cột
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);
  const [comboBanner, setComboBanner] = useState<{ count: number; text: string } | null>(null);

  // Cài đặt âm thanh
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // BẢNG XẾP HẠNG (LEADERBOARD)
  const [leaderboard, setLeaderboard] = useState<BlockLeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);

  // Ref tới bảng để tính toán tọa độ
  const boardRef = useRef<HTMLDivElement>(null);
  const activeHandIndexRef = useRef<number | null>(null);

  // Tải danh sách Bảng xếp hạng từ Firestore
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await getBlockBlastLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.warn('Lỗi khi tải bảng xếp hạng:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Kiểm tra xem 1 shape có thể đặt tại (r, c) trên board hay không
  const canPlaceShape = useCallback((grid: (BlockColor | null)[][], shapeMatrix: number[][], r: number, c: number): boolean => {
    const rows = shapeMatrix.length;
    const cols = shapeMatrix[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (shapeMatrix[i][j] === 1) {
          const boardR = r + i;
          const boardC = c + j;
          // Vượt biên
          if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE) {
            return false;
          }
          // Ô đã có khối
          if (grid[boardR][boardC] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Kiểm tra xem 1 block có vị trí nào đặt được trên board hay không
  const canBlockBePlacedAnywhere = useCallback((grid: (BlockColor | null)[][], block: HandBlock): boolean => {
    const rows = block.shape.matrix.length;
    const cols = block.shape.matrix[0].length;

    for (let r = 0; r <= BOARD_SIZE - rows; r++) {
      for (let c = 0; c <= BOARD_SIZE - cols; c++) {
        if (canPlaceShape(grid, block.shape.matrix, r, c)) {
          return true;
        }
      }
    }
    return false;
  }, [canPlaceShape]);

  // Thuật toán sinh khối thông minh phong cách Block Blast (Bao gồm Cơ chế ngầm cứu nguy khi sắp thua)
  const generateHandBlocks = useCallback((currentBoard?: (BlockColor | null)[][]): (HandBlock | null)[] => {
    const activeGrid = currentBoard || currentBoardRef.current;

    // 1. Phân tích độ đầy của bảng và số ô trống
    let filledCells = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (activeGrid[r][c] !== null) filledCells++;
      }
    }
    const fillRatio = filledCells / (BOARD_SIZE * BOARD_SIZE);

    // 2. Tìm tất cả các shape có thể đặt được trên bảng hiện tại
    const placeableShapes = SHAPES.filter(shape => {
      const rows = shape.matrix.length;
      const cols = shape.matrix[0].length;
      for (let r = 0; r <= BOARD_SIZE - rows; r++) {
        for (let c = 0; c <= BOARD_SIZE - cols; c++) {
          if (canPlaceShape(activeGrid, shape.matrix, r, c)) {
            return true;
          }
        }
      }
      return false;
    });

    // 3. Tìm các shape có tiềm năng kích nổ (clear) ít nhất 1 hàng hoặc 1 cột
    const clearingShapes: ShapeDef[] = [];
    for (const shape of placeableShapes) {
      let canClear = false;
      const rows = shape.matrix.length;
      const cols = shape.matrix[0].length;

      for (let r = 0; r <= BOARD_SIZE - rows && !canClear; r++) {
        for (let c = 0; c <= BOARD_SIZE - cols && !canClear; c++) {
          if (canPlaceShape(activeGrid, shape.matrix, r, c)) {
            // Giả lập đặt khối để kiểm tra xem có dòng nào đầy không
            let willClear = false;
            // Kiểm tra các hàng bị ảnh hưởng
            for (let i = 0; i < rows; i++) {
              const rowIdx = r + i;
              let rowComplete = true;
              for (let colIdx = 0; colIdx < BOARD_SIZE; colIdx++) {
                const cellFilled = activeGrid[rowIdx][colIdx] !== null || 
                  (colIdx >= c && colIdx < c + cols && shape.matrix[i][colIdx - c] === 1);
                if (!cellFilled) {
                  rowComplete = false;
                  break;
                }
              }
              if (rowComplete) { willClear = true; break; }
            }
            // Kiểm tra các cột bị ảnh hưởng
            if (!willClear) {
              for (let j = 0; j < cols; j++) {
                const colIdx = c + j;
                let colComplete = true;
                for (let rowIdx = 0; rowIdx < BOARD_SIZE; rowIdx++) {
                  const cellFilled = activeGrid[rowIdx][colIdx] !== null || 
                    (rowIdx >= r && rowIdx < r + rows && shape.matrix[rowIdx - r][j] === 1);
                  if (!cellFilled) {
                    colComplete = false;
                    break;
                  }
                }
                if (colComplete) { willClear = true; break; }
              }
            }

            if (willClear) {
              canClear = true;
            }
          }
        }
      }

      if (canClear) {
        clearingShapes.push(shape);
      }
    }

    // 4. Cơ chế Cứu nguy khi sắp thua (Độ phủ ô > 55% hoặc số shape vừa vặn ít)
    const isUnderPressure = fillRatio >= 0.55 || placeableShapes.length <= 8;

    const chosenShapes: ShapeDef[] = [];

    if (isUnderPressure && placeableShapes.length > 0) {
      // Khi gặp nguy:
      // Khối 1: Ưu tiên chọn 1 khối CÓ KHẢ NĂNG NỔ DÒNG nếu người chơi tính toán đặt đúng chỗ
      if (clearingShapes.length > 0 && Math.random() < 0.85) {
        chosenShapes.push(clearingShapes[Math.floor(Math.random() * clearingShapes.length)]);
      } else {
        chosenShapes.push(placeableShapes[Math.floor(Math.random() * placeableShapes.length)]);
      }

      // Khối 2: Chọn 1 khối nằm trong nhóm đặt được (thử thách tư duy)
      chosenShapes.push(placeableShapes[Math.floor(Math.random() * placeableShapes.length)]);

      // Khối 3: 70% là khối đặt được, 30% là khối bất kỳ tạo độ khó chiến thuật
      if (Math.random() < 0.70) {
        chosenShapes.push(placeableShapes[Math.floor(Math.random() * placeableShapes.length)]);
      } else {
        chosenShapes.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
      }
    } else {
      // Khi bàn cờ còn rộng rãi: Sinh phân bổ ngẫu nhiên thông thường
      for (let i = 0; i < 3; i++) {
        // Đảm bảo luôn có ít nhất 1 hoặc 2 khối đặt được để tránh thua vô lý ngay đầu
        if (i === 0 && placeableShapes.length > 0 && Math.random() < 0.9) {
          chosenShapes.push(placeableShapes[Math.floor(Math.random() * placeableShapes.length)]);
        } else {
          chosenShapes.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
        }
      }
    }

    // Trộn ngẫu nhiên thứ tự 3 khối trên tay
    const shuffledShapes = chosenShapes.sort(() => Math.random() - 0.5);

    // Gán màu pastel ngẫu nhiên cho từng khối
    return shuffledShapes.map((shape, idx) => {
      const color = PASTEL_BLOCK_COLORS[Math.floor(Math.random() * PASTEL_BLOCK_COLORS.length)];
      return {
        uid: `${Date.now()}_${idx}_${Math.random()}`,
        shape,
        color,
      };
    });
  }, [canPlaceShape]);

  // Bắt đầu game mới
  const startNewGame = useCallback(() => {
    const emptyBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    currentBoardRef.current = emptyBoard;
    setBoard(emptyBoard);
    setScore(0);
    setCombo(0);
    setIsGameOver(false);
    setSelectedHandIndex(null);
    activeHandIndexRef.current = null;
    setHoverPos(null);
    setDraggingPos(null);
    isDraggingRef.current = false;
    setClearingRows([]);
    setClearingCols([]);
    setComboBanner(null);
    setHandBlocks(generateHandBlocks(emptyBoard));
  }, [generateHandBlocks]);

  // Khởi tạo lần đầu
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kiểm tra Game Over khi các khối còn lại không thể đặt được ở bất kỳ đâu
  const checkGameOver = useCallback((grid: (BlockColor | null)[][], remainingBlocks: (HandBlock | null)[]) => {
    const activeBlocks = remainingBlocks.filter((b): b is HandBlock => b !== null);
    if (activeBlocks.length === 0) return false;

    for (const block of activeBlocks) {
      if (canBlockBePlacedAnywhere(grid, block)) {
        return false; // Vẫn còn ít nhất 1 khối đặt được
      }
    }
    return true; // Tất cả các khối đều không thể đặt được -> Game Over
  }, [canBlockBePlacedAnywhere]);

  // Xử lý lưu kỷ lục lên Firestore khi kết thúc lượt hoặc phá kỷ lục
  const handleRecordSync = useCallback(async (finalScore: number) => {
    if (currentUser?.uid) {
      const name = userProfile?.displayName || currentUser.displayName || 'Vô danh';
      const photo = userProfile?.photoURL || currentUser.photoURL || '';
      await saveBlockBlastHighScore(
        { uid: currentUser.uid, displayName: name, photoURL: photo },
        finalScore
      );
      fetchLeaderboard();
    }
  }, [currentUser, userProfile, fetchLeaderboard]);

  // Đặt khối vào bảng và tính điểm, xóa hàng cột
  const placeBlockAt = useCallback((handIndex: number, r: number, c: number) => {
    const block = handBlocks[handIndex];
    if (!block) return;

    if (!canPlaceShape(board, block.shape.matrix, r, c)) {
      return;
    }

    // 1. Sao chép và cập nhật board
    const newBoard = board.map(row => [...row]);
    let placedCellCount = 0;

    for (let i = 0; i < block.shape.matrix.length; i++) {
      for (let j = 0; j < block.shape.matrix[0].length; j++) {
        if (block.shape.matrix[i][j] === 1) {
          newBoard[r + i][c + j] = block.color;
          placedCellCount++;
        }
      }
    }

    // Điểm đặt khối cơ bản
    let earnedScore = placedCellCount * 10;

    // 2. Tìm các hàng và cột đầy
    const fullRows: number[] = [];
    const fullCols: number[] = [];

    for (let rowIdx = 0; rowIdx < BOARD_SIZE; rowIdx++) {
      if (newBoard[rowIdx].every(cell => cell !== null)) {
        fullRows.push(rowIdx);
      }
    }

    for (let colIdx = 0; colIdx < BOARD_SIZE; colIdx++) {
      let isColFull = true;
      for (let rowIdx = 0; rowIdx < BOARD_SIZE; rowIdx++) {
        if (newBoard[rowIdx][colIdx] === null) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) {
        fullCols.push(colIdx);
      }
    }

    const totalLinesCleared = fullRows.length + fullCols.length;

    // Cập nhật khối trên tay
    const nextHandBlocks = [...handBlocks];
    nextHandBlocks[handIndex] = null;
    setSelectedHandIndex(null);
    activeHandIndexRef.current = null;
    setHoverPos(null);
    setDraggingPos(null);
    isDraggingRef.current = false;

    // Nếu xóa được hàng/cột
    if (totalLinesCleared > 0) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);

      // Điểm nổ hàng/cột + thưởng combo
      const lineScore = totalLinesCleared * 100 * (1 + totalLinesCleared * 0.5);
      const comboBonus = nextCombo > 1 ? nextCombo * 60 : 0;
      earnedScore += Math.round(lineScore + comboBonus);

      // Âm thanh
      if (soundEnabled) {
        if (nextCombo > 1) {
          playSoundEffect('combo', nextCombo);
        } else {
          playSoundEffect('clear');
        }
      }

      // Kích hoạt banner combo
      let comboMsg = '';
      if (nextCombo >= 5) comboMsg = 'UNBELIEVABLE!';
      else if (nextCombo >= 4) comboMsg = 'AMAZING BLAST!';
      else if (nextCombo >= 3) comboMsg = 'EXCELLENT COMBO!';
      else if (nextCombo >= 2) comboMsg = 'GREAT COMBO!';
      else if (totalLinesCleared >= 3) comboMsg = 'TRIPLE BLAST!';
      else if (totalLinesCleared === 2) comboMsg = 'DOUBLE BLAST!';
      else comboMsg = 'PERFECT BLAST!';

      setComboBanner({ count: nextCombo, text: comboMsg });
      setTimeout(() => setComboBanner(null), 1000);

      // Hiệu ứng nhấp nháy dòng/cột
      setClearingRows(fullRows);
      setClearingCols(fullCols);

      setTimeout(() => {
        // Xóa thực sự các ô trên bảng
        const clearedBoard = newBoard.map((row, rowIdx) => {
          return row.map((cell, colIdx) => {
            if (fullRows.includes(rowIdx) || fullCols.includes(colIdx)) {
              return null;
            }
            return cell;
          });
        });

        setClearingRows([]);
        setClearingCols([]);
        setBoard(clearedBoard);

        // Kiểm tra nếu hết 3 khối thì sinh bộ 3 khối mới với thuật toán giải cứu thông minh
        let finalHandBlocks = nextHandBlocks;
        if (nextHandBlocks.every(b => b === null)) {
          finalHandBlocks = generateHandBlocks(clearedBoard);
          setHandBlocks(finalHandBlocks);
        } else {
          setHandBlocks(nextHandBlocks);
        }

        // Kiểm tra Game Over
        if (checkGameOver(clearedBoard, finalHandBlocks)) {
          setIsGameOver(true);
          if (soundEnabled) playSoundEffect('gameover');
          handleRecordSync(score + earnedScore);
        }
      }, 200);

    } else {
      // Không nổ hàng nào -> Reset combo
      setCombo(0);
      setBoard(newBoard);
      if (soundEnabled) playSoundEffect('place');

      // Kiểm tra nếu hết 3 khối thì sinh 3 khối mới với thuật toán giải cứu thông minh
      let finalHandBlocks = nextHandBlocks;
      if (nextHandBlocks.every(b => b === null)) {
        finalHandBlocks = generateHandBlocks(newBoard);
        setHandBlocks(finalHandBlocks);
      } else {
        setHandBlocks(nextHandBlocks);
      }

      // Kiểm tra Game Over
      if (checkGameOver(newBoard, finalHandBlocks)) {
        setIsGameOver(true);
        if (soundEnabled) playSoundEffect('gameover');
        handleRecordSync(score + earnedScore);
      }
    }

    // Cập nhật điểm
    setScore(prev => {
      const newScore = prev + earnedScore;
      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('blockblast_highscore', newScore.toString());
        } catch {
          // Ignore
        }
        // Đồng bộ kỷ lục mới
        handleRecordSync(newScore);
      }
      return newScore;
    });

  }, [board, handBlocks, canPlaceShape, combo, soundEnabled, checkGameOver, generateHandBlocks, highScore, score, handleRecordSync]);

  // Tính tọa độ ô trên lưới từ tọa độ client pos
  const calculateBoardCellFromClientPos = useCallback((clientX: number, clientY: number, shape: ShapeDef) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();

    // Vị trí con trỏ so với bảng
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const cellSize = rect.width / BOARD_SIZE;

    // Chiều dài khối
    const shapeWidth = shape.matrix[0].length * cellSize;
    const shapeHeight = shape.matrix.length * cellSize;

    // Khi chạm trên di động nâng tâm khối lên 65px để ngón tay không che mất ô
    const touchLift = 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 65 : 0;
    const targetX = relativeX - shapeWidth / 2;
    const targetY = relativeY - shapeHeight / 2 - touchLift;

    const targetCol = Math.round(targetX / cellSize);
    const targetRow = Math.round(targetY / cellSize);

    return { r: targetRow, c: targetCol };
  }, []);

  // Xử lý Bắt đầu Kéo (Pointer Down) trên Khối trong khay
  const handleBlockPointerDown = (index: number, e: React.PointerEvent) => {
    if (isGameOver || !handBlocks[index]) return;
    
    // Resume audio context on user gesture
    getAudioContext();

    if (soundEnabled) {
      playSoundEffect('select');
    }

    const block = handBlocks[index]!;
    setSelectedHandIndex(index);
    activeHandIndexRef.current = index;
    isDraggingRef.current = true;
    setDraggingPos({ x: e.clientX, y: e.clientY });

    const pos = calculateBoardCellFromClientPos(e.clientX, e.clientY, block.shape);
    if (pos) {
      setHoverPos(pos);
      setIsHoverValid(canPlaceShape(board, block.shape.matrix, pos.r, pos.c));
    } else {
      setHoverPos(null);
      setIsHoverValid(false);
    }
  };

  // Lắng nghe di chuyển toàn cục trên window khi đang kéo
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || activeHandIndexRef.current === null) return;
      const block = handBlocks[activeHandIndexRef.current];
      if (!block) return;

      setDraggingPos({ x: e.clientX, y: e.clientY });

      const pos = calculateBoardCellFromClientPos(e.clientX, e.clientY, block.shape);
      if (pos) {
        setHoverPos(pos);
        setIsHoverValid(canPlaceShape(board, block.shape.matrix, pos.r, pos.c));
      } else {
        setHoverPos(null);
        setIsHoverValid(false);
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current || activeHandIndexRef.current === null) return;
      const index = activeHandIndexRef.current;
      const block = handBlocks[index];

      if (block) {
        const pos = calculateBoardCellFromClientPos(e.clientX, e.clientY, block.shape);
        if (pos && canPlaceShape(board, block.shape.matrix, pos.r, pos.c)) {
          placeBlockAt(index, pos.r, pos.c);
        } else {
          // Thả trượt ra ngoài
          setHoverPos(null);
          setIsHoverValid(false);
        }
      }

      isDraggingRef.current = false;
      setDraggingPos(null);
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [handBlocks, board, canPlaceShape, placeBlockAt, calculateBoardCellFromClientPos]);

  // Click trực tiếp vào ô lưới khi đã chọn khối (chế độ click)
  const handleCellClick = (r: number, c: number) => {
    if (selectedHandIndex === null || isGameOver) return;
    const block = handBlocks[selectedHandIndex];
    if (!block) return;

    if (canPlaceShape(board, block.shape.matrix, r, c)) {
      placeBlockAt(selectedHandIndex, r, c);
    }
  };

  // Hover qua ô lưới khi đã chọn khối
  const handleCellMouseEnter = (r: number, c: number) => {
    if (selectedHandIndex === null || isGameOver || isDraggingRef.current) return;
    const block = handBlocks[selectedHandIndex];
    if (!block) return;

    setHoverPos({ r, c });
    setIsHoverValid(canPlaceShape(board, block.shape.matrix, r, c));
  };

  // Kiểm tra ô (r, c) có thuộc hover preview hay không
  const isCellInHoverPreview = (r: number, c: number) => {
    if (!hoverPos || selectedHandIndex === null) return false;
    const block = handBlocks[selectedHandIndex];
    if (!block) return false;

    const localR = r - hoverPos.r;
    const localC = c - hoverPos.c;

    if (
      localR >= 0 && 
      localR < block.shape.matrix.length && 
      localC >= 0 && 
      localC < block.shape.matrix[0].length
    ) {
      return block.shape.matrix[localR][localC] === 1;
    }
    return false;
  };

  const activeDraggingBlock = selectedHandIndex !== null ? handBlocks[selectedHandIndex] : null;

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto py-1 px-2 select-none flex flex-col items-center justify-between min-h-0">
      
      {/* 1. Header Game nhỏ gọn */}
      <div className="w-full flex items-center justify-between gap-2 bg-[#25101b] border border-[#4d2138] p-2 rounded-xs shadow-xs mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 bg-[#14080e] hover:bg-[#2d1822] text-[#ffc2d4] text-[11px] font-mono-code font-bold rounded-xs border border-[#3b1f2d] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>DANH SÁCH</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              getAudioContext();
              setSoundEnabled(!soundEnabled);
            }}
            className="p-1.5 bg-[#14080e] hover:bg-[#2d1822] text-[#ffc2d4] rounded-xs border border-[#3b1f2d] transition cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#86efac]" /> : <VolumeX className="w-3.5 h-3.5 text-[#8a717a]" />}
          </button>

          <button
            onClick={startNewGame}
            className="flex items-center gap-1 px-2 py-1 bg-[#881337] hover:bg-[#9f1239] text-white text-[11px] font-mono-code font-bold rounded-xs border border-[#ff4d79] transition shadow-xs cursor-pointer"
            title="Chơi ván mới"
          >
            <RotateCcw className="w-3 h-3" />
            <span>CHƠI LẠI</span>
          </button>
        </div>
      </div>

      {/* 2. Bảng điểm & Combo Header nhỏ gọn */}
      <div className="w-full grid grid-cols-3 gap-1.5 text-center font-mono-code mb-2">
        {/* Điểm hiện tại */}
        <div className="bg-[#14080e] border border-[#3b1f2d] py-1.5 px-2 rounded-xs">
          <span className="text-[9px] text-[#8a717a] uppercase font-bold block leading-tight">ĐIỂM</span>
          <span className="text-lg sm:text-xl font-black text-[#f472b6] tracking-wider leading-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Combo */}
        <div className="bg-[#14080e] border border-[#3b1f2d] py-1.5 px-2 rounded-xs flex flex-col justify-center items-center">
          <span className="text-[9px] text-[#8a717a] uppercase font-bold flex items-center gap-0.5 leading-tight">
            <Flame className={`w-2.5 h-2.5 ${combo > 0 ? 'text-[#fca5a5] animate-bounce' : 'text-[#8a717a]'}`} />
            COMBO
          </span>
          <span className={`text-lg sm:text-xl font-black leading-tight ${combo > 0 ? 'text-[#fde047]' : 'text-[#543b46]'}`}>
            {combo > 0 ? `x${combo}` : '-'}
          </span>
        </div>

        {/* Kỷ lục cao nhất */}
        <div className="bg-[#14080e] border border-[#3b1f2d] py-1.5 px-2 rounded-xs">
          <span className="text-[9px] text-[#8a717a] uppercase font-bold flex items-center justify-center gap-0.5 leading-tight">
            <Trophy className="w-2.5 h-2.5 text-[#fde047]" />
            KỶ LỤC
          </span>
          <span className="text-lg sm:text-xl font-black text-[#fde047] tracking-wider leading-tight">
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. KHU VỰC BẢNG LƯỚI 8x8 CHÍNH */}
      <div className="relative w-full aspect-square max-w-[320px] sm:max-w-[340px] bg-[#1c0c16] border-2 border-[#4d2138] p-1.5 sm:p-2 rounded-xs shadow-lg mb-2">
        {/* Banner Combo Animation Popup */}
        {comboBanner && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center animate-ping duration-300">
            <div className="bg-gradient-to-r from-[#f472b6] via-[#fde047] to-[#7dd3fc] text-black font-black text-base sm:text-lg px-4 py-1.5 rounded-xs shadow-2xl border-2 border-white uppercase tracking-widest text-center">
              {comboBanner.text}
              {comboBanner.count > 1 && (
                <div className="text-[10px] font-bold text-neutral-900 tracking-normal">
                  COMBO x{comboBanner.count} (+{comboBanner.count * 60} pts)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lưới 8x8 */}
        <div 
          ref={boardRef}
          className="grid grid-cols-8 gap-0.5 sm:gap-1 aspect-square w-full bg-[#12070d] p-1 rounded-xs border border-[#2d1822] touch-none"
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isHovered = isCellInHoverPreview(r, c);
              const isClearing = clearingRows.includes(r) || clearingCols.includes(c);
              const selectedColor = selectedHandIndex !== null ? handBlocks[selectedHandIndex]?.color : null;

              return (
                <div
                  key={`${r}_${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  className={`relative aspect-square rounded-[2px] flex items-center justify-center transition-all duration-75 ${
                    isClearing
                      ? 'scale-110 brightness-200 z-20 animate-pulse bg-white border border-white'
                      : cell
                      ? 'shadow-xs border'
                      : isHovered
                      ? isHoverValid
                        ? 'opacity-90 scale-95 border z-10'
                        : 'bg-red-500/25 border border-red-500/50 z-10'
                      : 'bg-[#180a12] border border-[#25101b]'
                  }`}
                  style={
                    cell && !isClearing
                      ? {
                          backgroundColor: cell.bg,
                          borderColor: cell.border,
                          boxShadow: `inset 0 1px 1px ${cell.light}, 0 1px 2px ${cell.glow}`,
                        }
                      : isHovered && isHoverValid && selectedColor
                      ? {
                          backgroundColor: selectedColor.bg,
                          borderColor: selectedColor.border,
                          boxShadow: `0 0 6px ${selectedColor.glow}`,
                        }
                      : {}
                  }
                >
                  {/* Bóng sáng gạch pastel */}
                  {cell && !isClearing && (
                    <div className="absolute inset-0.5 rounded-[1px] bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
                  )}
                  {/* Chấm tâm ô trống */}
                  {!cell && !isHovered && (
                    <div className="w-1 h-1 rounded-full bg-[#2a131f]" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xs rounded-xs flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="p-2 bg-[#25101b] border border-[#ff4d79] rounded-full text-[#ff4d79]">
              <Zap className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-lg font-black font-mono-code text-white tracking-wide">
                HẾT NƯỚC ĐI!
              </h3>
              <p className="text-[10px] font-mono-code text-[#a88291]">
                Không còn vị trí vừa vặn cho các khối còn lại.
              </p>
            </div>

            <div className="bg-[#14080e] border border-[#3b1f2d] p-2 rounded-xs w-full max-w-[220px] space-y-0.5 font-mono-code text-xs">
              <div className="flex justify-between text-[#8a717a]">
                <span>Điểm:</span>
                <span className="font-bold text-[#f472b6]">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#8a717a]">
                <span>Kỷ lục:</span>
                <span className="font-bold text-[#fde047]">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={startNewGame}
              className="w-full max-w-[220px] py-2 bg-[#881337] hover:bg-[#9f1239] text-white font-mono-code font-bold text-xs rounded-xs border border-[#ff4d79] transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CHƠI LẠI NGAY</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. KHU VỰC 3 KHỐI TRÊN TAY (HAND BLOCKS) */}
      <div className="w-full bg-[#14080e] border border-[#3b1f2d] p-2 rounded-xs mb-3">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-center min-h-[75px] sm:min-h-[85px]">
          {handBlocks.map((block, idx) => {
            if (!block) {
              return (
                <div 
                  key={idx}
                  className="h-16 sm:h-20 rounded-xs border border-dashed border-[#2d1822] bg-[#10060b] flex items-center justify-center opacity-30"
                >
                  <span className="text-[9px] font-mono-code text-[#523d46]">Trống</span>
                </div>
              );
            }

            const isSelected = selectedHandIndex === idx;
            const canPlace = !isGameOver && canBlockBePlacedAnywhere(board, block);

            return (
              <div
                key={block.uid}
                onPointerDown={(e) => handleBlockPointerDown(idx, e)}
                className={`h-16 sm:h-20 p-1.5 rounded-xs border flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform touch-none select-none ${
                  isSelected && !draggingPos
                    ? 'bg-[#25101b] border-[#f472b6] scale-105 ring-1 ring-[#f472b6]'
                    : canPlace
                    ? 'bg-[#1c0c16] border-[#3b1f2d] hover:border-[#634854] hover:bg-[#220e1b]'
                    : 'bg-[#12060c] border-[#220d18] opacity-35 grayscale cursor-not-allowed'
                }`}
                style={{
                  opacity: isSelected && draggingPos ? 0.35 : 1,
                }}
                title={canPlace ? 'Chạm giữ để kéo vào bảng' : 'Không có chỗ đặt trên bảng'}
              >
                {/* Render Shape Matrix */}
                <div 
                  className="grid gap-0.5 pointer-events-none"
                  style={{
                    gridTemplateColumns: `repeat(${block.shape.matrix[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {block.shape.matrix.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}_${c}`}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[1px] ${
                          val === 1
                            ? 'border shadow-xs'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        style={
                          val === 1
                            ? {
                                backgroundColor: block.color.bg,
                                borderColor: block.color.border,
                                boxShadow: `inset 0 1px 1px ${block.color.light}`,
                              }
                            : {}
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. BẢNG XẾP HẠNG KỶ LỤC BLOCK BLAST Ở DƯỚI */}
      <div className="w-full bg-[#1c0c16] border border-[#4d2138] rounded-xs p-3 font-mono-code shadow-md">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3b1f2d]">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#fde047]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              BẢNG XẾP HẠNG KỶ LỤC
            </span>
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loadingLeaderboard}
            className="flex items-center gap-1 text-[10px] text-[#ffc2d4] hover:text-white px-2 py-0.5 bg-[#14080e] rounded-xs border border-[#3b1f2d] transition cursor-pointer disabled:opacity-50"
            title="Làm mới bảng xếp hạng"
          >
            <RefreshCw className={`w-3 h-3 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Danh sách kỷ lục */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {loadingLeaderboard && leaderboard.length === 0 ? (
            <div className="py-4 text-center text-xs text-[#8a717a]">
              Đang tải bảng xếp hạng...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-3 text-center text-xs text-[#8a717a]">
              Chưa có kỷ lục nào được ghi nhận. Hãy là người đầu tiên!
            </div>
          ) : (
            leaderboard.map((item, index) => {
              const isCurrentUser = currentUser?.uid === item.uid;
              let rankBadge = null;
              if (index === 0) {
                rankBadge = <Crown className="w-3.5 h-3.5 text-[#fde047]" />;
              } else if (index === 1) {
                rankBadge = <Medal className="w-3.5 h-3.5 text-[#cbd5e1]" />;
              } else if (index === 2) {
                rankBadge = <Medal className="w-3.5 h-3.5 text-[#fdba74]" />;
              }

              return (
                <div
                  key={item.uid || index}
                  className={`flex items-center justify-between p-1.5 rounded-xs text-xs transition ${
                    isCurrentUser 
                      ? 'bg-[#3b1226] border border-[#ff4d79]' 
                      : index < 3 
                      ? 'bg-[#14080e] border border-[#3b1f2d]' 
                      : 'bg-[#12060c] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 text-center font-black flex items-center justify-center">
                      {rankBadge || <span className="text-[#8a717a] text-[11px]">#{index + 1}</span>}
                    </div>

                    {/* Avatar */}
                    {item.photoURL ? (
                      <img
                        src={item.photoURL}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover border border-[#4d2138]"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#25101b] border border-[#4d2138] flex items-center justify-center text-[#ffc2d4]">
                        <UserIcon className="w-3 h-3" />
                      </div>
                    )}

                    <span className={`truncate text-xs ${isCurrentUser ? 'font-bold text-[#ffc2d4]' : 'text-neutral-300'}`}>
                      {item.displayName || 'Vô danh'}
                      {isCurrentUser && ' (Bạn)'}
                    </span>
                  </div>

                  <span className={`font-black text-xs shrink-0 ${index === 0 ? 'text-[#fde047]' : index === 1 ? 'text-[#cbd5e1]' : index === 2 ? 'text-[#fdba74]' : 'text-[#f472b6]'}`}>
                    {item.highScore.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. GHOST FLOATING DRAG OVERLAY: Khối bay lơ lửng theo ngón tay khi đang kéo */}
      {draggingPos && activeDraggingBlock && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-none"
          style={{
            left: `${draggingPos.x}px`,
            top: `${draggingPos.y - ('ontouchstart' in window || navigator.maxTouchPoints > 0 ? 65 : 0)}px`,
          }}
        >
          <div 
            className="grid gap-1 scale-110 drop-shadow-2xl opacity-90"
            style={{
              gridTemplateColumns: `repeat(${activeDraggingBlock.shape.matrix[0].length}, minmax(0, 1fr))`,
            }}
          >
            {activeDraggingBlock.shape.matrix.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`drag_${r}_${c}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[2px] ${
                    val === 1
                      ? 'border shadow-lg ring-1 ring-white/40'
                      : 'opacity-0 pointer-events-none'
                  }`}
                  style={
                    val === 1
                      ? {
                          backgroundColor: activeDraggingBlock.color.bg,
                          borderColor: activeDraggingBlock.color.border,
                          boxShadow: `0 0 10px ${activeDraggingBlock.color.glow}, inset 0 1px 2px ${activeDraggingBlock.color.light}`,
                        }
                      : {}
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
