import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, RotateCcw, Undo2, Lightbulb, Volume2, VolumeX, 
  Trophy, X, Timer, Heart, Pencil, 
  ChevronRight, Play, Shuffle, Flame, Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

export interface NonogramPuzzle {
  id: string;
  name: string;
  size: 5 | 10 | 15;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
  solution: number[][];
}

// Bộ sưu tập câu đố mẫu thủ công đa dạng
const CURATED_PUZZLES: NonogramPuzzle[] = [
  // --- 5x5 ---
  {
    id: 'c-heart-5',
    name: 'Trái Tim Đỏ',
    size: 5,
    difficulty: 'easy',
    color: '#ff4d79',
    solution: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]
  },
  {
    id: 'c-music-5',
    name: 'Nốt Nhạc',
    size: 5,
    difficulty: 'easy',
    color: '#38bdf8',
    solution: [
      [0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [1, 1, 0, 0, 0],
    ]
  },
  {
    id: 'c-mushroom-5',
    name: 'Nấm Nhỏ',
    size: 5,
    difficulty: 'easy',
    color: '#fb7185',
    solution: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
    ]
  },
  {
    id: 'c-cup-5',
    name: 'Tách Trà Nóng',
    size: 5,
    difficulty: 'easy',
    color: '#fb923c',
    solution: [
      [1, 0, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 0, 0, 1, 0],
      [0, 1, 1, 0, 0],
    ]
  },
  {
    id: 'c-tree-5',
    name: 'Cây Thông',
    size: 5,
    difficulty: 'easy',
    color: '#4ade80',
    solution: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ]
  },
  {
    id: 'c-duck-5',
    name: 'Vịt Con Vàng',
    size: 5,
    difficulty: 'easy',
    color: '#facc15',
    solution: [
      [0, 1, 1, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1],
      [0, 0, 1, 1, 0],
    ]
  },
  {
    id: 'c-sword-5',
    name: 'Kiếm Gỗ',
    size: 5,
    difficulty: 'easy',
    color: '#c084fc',
    solution: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 1, 1, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 1, 0, 0, 0],
    ]
  },
  {
    id: 'c-smile-5',
    name: 'Nụ Cười Vui',
    size: 5,
    difficulty: 'easy',
    color: '#f43f5e',
    solution: [
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ]
  },
  {
    id: 'c-diamond-5',
    name: 'Viên Kim Cương',
    size: 5,
    difficulty: 'easy',
    color: '#2dd4bf',
    solution: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]
  },
  {
    id: 'c-house-5',
    name: 'Ngôi Lều Nhỏ',
    size: 5,
    difficulty: 'easy',
    color: '#f97316',
    solution: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
    ]
  },

  // --- 10x10 ---
  {
    id: 'c-cat-10',
    name: 'Mèo Con Đáng Yêu',
    size: 10,
    difficulty: 'medium',
    color: '#f472b6',
    solution: [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ]
  },
  {
    id: 'c-coffee-10',
    name: 'Ly Cà Phê Sữa',
    size: 10,
    difficulty: 'medium',
    color: '#d97706',
    solution: [
      [0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    ]
  },
  {
    id: 'c-diamond-10',
    name: 'Kim Cương Xanh',
    size: 10,
    difficulty: 'medium',
    color: '#38bdf8',
    solution: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  },
  {
    id: 'c-boat-10',
    name: 'Thuyền Buồm Ra Khơi',
    size: 10,
    difficulty: 'medium',
    color: '#60a5fa',
    solution: [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  },
  {
    id: 'c-dino-10',
    name: 'Khủng Long Con',
    size: 10,
    difficulty: 'medium',
    color: '#4ade80',
    solution: [
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [1, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    ]
  },
  {
    id: 'c-house-10',
    name: 'Ngôi Nhà Nhỏ',
    size: 10,
    difficulty: 'medium',
    color: '#fbbf24',
    solution: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ]
  },
  {
    id: 'c-ghost-10',
    name: 'Hồn Ma Pixel',
    size: 10,
    difficulty: 'medium',
    color: '#a78bfa',
    solution: [
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    ]
  },
  {
    id: 'c-butterfly-10',
    name: 'Bướm Đêm',
    size: 10,
    difficulty: 'medium',
    color: '#e879f9',
    solution: [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  },

  // --- 15x15 ---
  {
    id: 'c-owl-15',
    name: 'Cú Mèo Tri Thức',
    size: 15,
    difficulty: 'hard',
    color: '#e879f9',
    solution: [
      [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ]
  },
  {
    id: 'c-castle-15',
    name: 'Lâu Đài Cổ',
    size: 15,
    difficulty: 'hard',
    color: '#38bdf8',
    solution: [
      [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    id: 'c-rocket-15',
    name: 'Tàu Vũ Trụ',
    size: 15,
    difficulty: 'hard',
    color: '#f97316',
    solution: [
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
      [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    ]
  },
  {
    id: 'c-shield-15',
    name: 'Khiên Chiến Thần',
    size: 15,
    difficulty: 'hard',
    color: '#eab308',
    solution: [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    ]
  }
];

const PROCEDURAL_COLORS = [
  '#ff4d79', '#38bdf8', '#fb7185', '#fb923c', '#4ade80', 
  '#facc15', '#c084fc', '#f472b6', '#a78bfa', '#2dd4bf', 
  '#e879f9', '#f97316', '#60a5fa', '#34d399', '#f43f5e'
];

const PROCEDURAL_NAMES_5 = [
  'Huy Hiệu Pixel', 'Nốt Đàn Thần', 'Lá Cỏ May Mắn', 'Hộp Quà Nhỏ', 
  'Vương Miện Mini', 'Kỳ Thạch Nhỏ', 'Chiếc Nơ Tím', 'Mũi Tên Vàng', 
  'Ngôi Sao Lùn', 'Lưỡi Kiếm', 'Ấn Tín Bí Ẩn', 'Thạch Anh Đỏ', 'Gương Thần'
];

const PROCEDURAL_NAMES_10 = [
  'Mặt Nạ Hoàng Gia', 'Chiến Hạm Không Gian', 'Bảo Vật Rừng Xanh', 'Phù Hiệu Cổ Xưa',
  'Thủ Lĩnh Hải Tặc', 'Đôi Cánh Thiên Thần', 'Rồng Lửa Cổ Đại', 'Bạch Hổ Tinh Anh',
  'Đài Quan Sát', 'Trái Tim Pha Lê', 'Cổng Không Gian', 'Huy Hiệu Dũng Sĩ'
];

const PROCEDURAL_NAMES_15 = [
  'Lâu Đài Bầu Trời', 'Phi Thuyền Khám Phá', 'Đại Bàng Sải Cánh', 'Cổ Thần Thức Tỉnh',
  'Kim Tự Tháp Cổ', 'Phượng Hoàng Tái Sinh', 'Thành Phố Tương Lai', 'Thiên Hà Rực Rỡ',
  'Bảo Kiếm Truyền Thuyết', 'Áo Giáp Thánh Thần', 'Quái Vật Biển Sâu', 'Vương Triều Ánh Sáng'
];

// Hàm sinh câu đố ngẫu nhiên vô hạn (Procedural Generation)
function generateProceduralPuzzle(size: 5 | 10 | 15): NonogramPuzzle {
  const color = PROCEDURAL_COLORS[Math.floor(Math.random() * PROCEDURAL_COLORS.length)];
  const nameList = size === 5 ? PROCEDURAL_NAMES_5 : size === 10 ? PROCEDURAL_NAMES_10 : PROCEDURAL_NAMES_15;
  const baseName = nameList[Math.floor(Math.random() * nameList.length)];
  const code = Math.floor(100 + Math.random() * 900);
  const name = `${baseName} #${code}`;

  const solution: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  const half = Math.ceil(size / 2);

  // Sinh mẫu pixel đối xứng ngang tự nhiên
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < half; c++) {
      const distRow = Math.abs(r - (size - 1) / 2) / (size / 2);
      const distCol = Math.abs(c - (half - 1)) / half;
      const centerDist = (distRow + distCol) / 2;
      
      const baseProb = 0.65 - centerDist * 0.35;
      const isFilled = Math.random() < Math.max(0.25, Math.min(0.75, baseProb)) ? 1 : 0;
      solution[r][c] = isFilled;
      solution[r][size - 1 - c] = isFilled;
    }
  }

  // Đảm bảo mỗi hàng đều có ít nhất 1 ô tô
  for (let r = 0; r < size; r++) {
    if (!solution[r].some(val => val === 1)) {
      const mid = Math.floor(size / 2);
      solution[r][mid] = 1;
      if (size % 2 === 0) solution[r][mid - 1] = 1;
    }
  }

  // Đảm bảo mỗi cột đều có ít nhất 1 ô tô
  for (let c = 0; c < half; c++) {
    let hasFilled = false;
    for (let r = 0; r < size; r++) {
      if (solution[r][c] === 1) {
        hasFilled = true;
        break;
      }
    }
    if (!hasFilled) {
      const midR = Math.floor(size / 2);
      solution[midR][c] = 1;
      solution[midR][size - 1 - c] = 1;
    }
  }

  return {
    id: `gen-${size}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
    size,
    difficulty: size === 5 ? 'easy' : size === 10 ? 'medium' : 'hard',
    color,
    solution
  };
}

// Hàm tính clues (đầu mối số)
function computeClues(solution: number[][]): { rowClues: number[][]; colClues: number[][] } {
  const height = solution.length;
  const width = solution[0].length;
  
  const rowClues: number[][] = [];
  for (let r = 0; r < height; r++) {
    const clues: number[] = [];
    let count = 0;
    for (let c = 0; c < width; c++) {
      if (solution[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    rowClues.push(clues.length > 0 ? clues : [0]);
  }

  const colClues: number[][] = [];
  for (let c = 0; c < width; c++) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < height; r++) {
      if (solution[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    colClues.push(clues.length > 0 ? clues : [0]);
  }

  return { rowClues, colClues };
}

interface NonogramGameProps {
  onBack: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
}

export const NonogramGame: React.FC<NonogramGameProps> = ({ onBack }) => {
  // Trạng thái câu đố đang chơi
  const [activePuzzle, setActivePuzzle] = useState<NonogramPuzzle | null>(null);

  // Danh sách ID các câu đố gần đây để đảm bảo mỗi lần vào là một câu đố khác nhau
  const [recentPlayedIds, setRecentPlayedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nonogram_recent_played');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Kỷ lục thống kê theo từng kích cỡ: 5x5, 10x10, 15x15
  const [sizeRecords, setSizeRecords] = useState<Record<number, { solvedCount: number; bestTime: number | null }>>(() => {
    try {
      const saved = localStorage.getItem('nonogram_size_records');
      if (saved) return JSON.parse(saved);
      // Migration từ completed_puzzles cũ nếu có
      const legacy = localStorage.getItem('nonogram_completed_puzzles');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const count = Object.keys(parsed).length;
        return {
          5: { solvedCount: Math.min(count, 5), bestTime: null },
          10: { solvedCount: Math.max(0, count - 5), bestTime: null },
          15: { solvedCount: 0, bestTime: null }
        };
      }
      return {
        5: { solvedCount: 0, bestTime: null },
        10: { solvedCount: 0, bestTime: null },
        15: { solvedCount: 0, bestTime: null }
      };
    } catch {
      return {
        5: { solvedCount: 0, bestTime: null },
        10: { solvedCount: 0, bestTime: null },
        15: { solvedCount: 0, bestTime: null }
      };
    }
  });

  // Trạng thái bàn cờ hiện tại: 0 = trống, 1 = tô màu, 2 = đánh dấu X
  const [board, setBoard] = useState<number[][]>([]);
  const [history, setHistory] = useState<number[][][]>([]);
  const [activeTool, setActiveTool] = useState<'fill' | 'cross'>('fill');
  
  // Trạng thái màn chơi
  const [isVictory, setIsVictory] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes] = useState(3);
  const [isClassicMode, setIsClassicMode] = useState(false); // Thư giãn hoặc Cổ điển (3 mạng)
  const [isGameOver, setIsGameOver] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Kéo rê chuột (drag paint)
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<number | null>(null);

  // Hàm chọn câu đố tiếp theo đảm bảo KHÁC BIỆT so với các lần trước
  const getNextPuzzleForSize = useCallback((size: 5 | 10 | 15, excludeId?: string): NonogramPuzzle => {
    // Lọc các puzzle mẫu của size này chưa chơi gần đây
    const availableCurated = CURATED_PUZZLES.filter(
      p => p.size === size && p.id !== excludeId && !recentPlayedIds.includes(p.id)
    );

    let chosen: NonogramPuzzle;

    // Nếu còn puzzle thủ công chưa chơi và ngẫu nhiên chọn, hoặc sinh ngẫu nhiên mới
    if (availableCurated.length > 0 && Math.random() < 0.65) {
      chosen = availableCurated[Math.floor(Math.random() * availableCurated.length)];
    } else {
      chosen = generateProceduralPuzzle(size);
    }

    // Cập nhật danh sách câu đố gần đây (tối đa 25 id)
    setRecentPlayedIds(prev => {
      const next = [chosen.id, ...prev.filter(id => id !== chosen.id)].slice(0, 25);
      try {
        localStorage.setItem('nonogram_recent_played', JSON.stringify(next));
      } catch {}
      return next;
    });

    return chosen;
  }, [recentPlayedIds]);

  // Bắt đầu chơi một size cụ thể (luôn sinh/chọn một câu đố khác)
  const handleSelectSize = (size: 5 | 10 | 15) => {
    const puzzle = getNextPuzzleForSize(size, activePuzzle?.id);
    startPuzzleGame(puzzle);
  };

  // Thiết lập bàn cờ cho câu đố
  const startPuzzleGame = (puzzle: NonogramPuzzle) => {
    setActivePuzzle(puzzle);
    const emptyBoard = Array(puzzle.size).fill(0).map(() => Array(puzzle.size).fill(0));
    setBoard(emptyBoard);
    setHistory([]);
    setIsVictory(false);
    setIsGameOver(false);
    setMistakes(0);
    setElapsedSeconds(0);
    setTimerActive(true);
    setHintsRemaining(3);
    setActiveTool('fill');
  };

  // Đổi sang câu đố khác của cùng kích cỡ hiện tại
  const handleShufflePuzzle = () => {
    if (!activePuzzle) return;
    const next = getNextPuzzleForSize(activePuzzle.size, activePuzzle.id);
    startPuzzleGame(next);
  };

  // Âm thanh Web Audio API
  const playSound = useCallback((type: 'fill' | 'cross' | 'clear' | 'error' | 'win' | 'hint') => {
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

      if (type === 'fill') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.07);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'cross') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'clear') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(110, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + i * 0.09);
          noteGain.gain.setValueAtTime(0.18, now + i * 0.09);
          noteGain.gain.linearRampToValueAtTime(0.001, now + i * 0.09 + 0.2);
          noteOsc.start(now + i * 0.09);
          noteOsc.stop(now + i * 0.09 + 0.2);
        });
      } else if (type === 'hint') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {}
  }, [soundEnabled]);

  // Bộ đếm thời gian
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && !isVictory && !isGameOver) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isVictory, isGameOver]);

  // Dừng drag khi nhả chuột
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragAction(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Kiểm tra điều kiện thắng
  const checkVictory = (currentBoard: number[][], puzzle: NonogramPuzzle) => {
    const size = puzzle.size;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const shouldBeFilled = puzzle.solution[r][c] === 1;
        const isFilled = currentBoard[r][c] === 1;
        if (shouldBeFilled !== isFilled) {
          return false;
        }
      }
    }
    return true;
  };

  // Tác động lên ô
  const handleCellInteraction = (r: number, c: number, overrideTool?: 'fill' | 'cross') => {
    if (!activePuzzle || isVictory || isGameOver) return;

    const tool = overrideTool || activeTool;
    const currentVal = board[r][c];
    let nextVal = 0;

    if (tool === 'fill') {
      nextVal = currentVal === 1 ? 0 : 1;
    } else {
      nextVal = currentVal === 2 ? 0 : 2;
    }

    // Kiểm tra lỗi nếu ở chế độ cổ điển
    if (isClassicMode && nextVal === 1 && activePuzzle.solution[r][c] !== 1) {
      playSound('error');
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      
      const newBoard = board.map((row, rowIdx) =>
        row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? 2 : cell))
      );
      setBoard(newBoard);

      if (newMistakes >= maxMistakes) {
        setIsGameOver(true);
        setTimerActive(false);
      }
      return;
    }

    if (nextVal === 1) playSound('fill');
    else if (nextVal === 2) playSound('cross');
    else playSound('clear');

    setHistory((prev) => [...prev.slice(-15), board.map((row) => [...row])]);

    const newBoard = board.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? nextVal : cell))
    );
    setBoard(newBoard);

    // Kiểm tra thắng màn
    if (checkVictory(newBoard, activePuzzle)) {
      setIsVictory(true);
      setTimerActive(false);
      playSound('win');

      // Cập nhật kỷ lục cho kích cỡ này
      const currentStats = sizeRecords[activePuzzle.size] || { solvedCount: 0, bestTime: null };
      const newBestTime = currentStats.bestTime === null ? elapsedSeconds : Math.min(currentStats.bestTime, elapsedSeconds);
      const updatedRecords = {
        ...sizeRecords,
        [activePuzzle.size]: {
          solvedCount: currentStats.solvedCount + 1,
          bestTime: newBestTime
        }
      };
      setSizeRecords(updatedRecords);
      try {
        localStorage.setItem('nonogram_size_records', JSON.stringify(updatedRecords));
      } catch {}
    }
  };

  const handleMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    const isRightClick = e.button === 2;
    const tool = isRightClick ? 'cross' : activeTool;
    const currentVal = board[r][c];
    const targetVal = tool === 'fill' ? (currentVal === 1 ? 0 : 1) : (currentVal === 2 ? 0 : 2);

    setIsDragging(true);
    setDragAction(targetVal);
    handleCellInteraction(r, c, tool);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isDragging || dragAction === null || !activePuzzle || isVictory || isGameOver) return;
    if (board[r][c] === dragAction) return;

    setBoard((prev) =>
      prev.map((row, rowIdx) =>
        row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? dragAction : cell))
      )
    );

    if (dragAction === 1) playSound('fill');
    else if (dragAction === 2) playSound('cross');
    else playSound('clear');

    setTimeout(() => {
      setBoard((currentBoard) => {
        if (checkVictory(currentBoard, activePuzzle)) {
          setIsVictory(true);
          setTimerActive(false);
          playSound('win');
        }
        return currentBoard;
      });
    }, 10);
  };

  const handleUndo = () => {
    if (history.length === 0 || isVictory || isGameOver) return;
    const previous = history[history.length - 1];
    setBoard(previous);
    setHistory((prev) => prev.slice(0, -1));
    playSound('clear');
  };

  const handleReset = () => {
    if (!activePuzzle) return;
    const emptyBoard = Array(activePuzzle.size).fill(0).map(() => Array(activePuzzle.size).fill(0));
    setBoard(emptyBoard);
    setHistory([]);
    setIsVictory(false);
    setIsGameOver(false);
    setMistakes(0);
    setElapsedSeconds(0);
    setTimerActive(true);
    playSound('clear');
  };

  const handleUseHint = () => {
    if (!activePuzzle || hintsRemaining <= 0 || isVictory || isGameOver) return;

    const candidateCells: [number, number][] = [];
    for (let r = 0; r < activePuzzle.size; r++) {
      for (let c = 0; c < activePuzzle.size; c++) {
        const shouldBeFilled = activePuzzle.solution[r][c] === 1;
        const currentVal = board[r][c];
        if (shouldBeFilled && currentVal !== 1) {
          candidateCells.push([r, c]);
        }
      }
    }

    if (candidateCells.length === 0) return;

    const randomCell = candidateCells[Math.floor(Math.random() * candidateCells.length)];
    const [hr, hc] = randomCell;

    setHistory((prev) => [...prev, board.map((row) => [...row])]);
    const newBoard = board.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === hr && colIdx === hc ? 1 : cell))
    );
    setBoard(newBoard);
    setHintsRemaining((prev) => prev - 1);
    playSound('hint');

    if (checkVictory(newBoard, activePuzzle)) {
      setIsVictory(true);
      setTimerActive(false);
      playSound('win');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const clues = activePuzzle ? computeClues(activePuzzle.solution) : null;

  const isRowComplete = (r: number) => {
    if (!activePuzzle) return false;
    for (let c = 0; c < activePuzzle.size; c++) {
      const isFilled = board[r][c] === 1;
      const shouldBeFilled = activePuzzle.solution[r][c] === 1;
      if (isFilled !== shouldBeFilled) return false;
    }
    return true;
  };

  const isColComplete = (c: number) => {
    if (!activePuzzle) return false;
    for (let r = 0; r < activePuzzle.size; r++) {
      const isFilled = board[r][c] === 1;
      const shouldBeFilled = activePuzzle.solution[r][c] === 1;
      if (isFilled !== shouldBeFilled) return false;
    }
    return true;
  };

  // --- MÀN HÌNH CHƠI GAME NONOGRAM ---
  if (activePuzzle && clues) {
    const maxRowClues = Math.max(...clues.rowClues.map((r) => r.length), 1);
    const maxColClues = Math.max(...clues.colClues.map((c) => c.length), 1);

    const cellWidthClass =
      activePuzzle.size === 5
        ? 'w-11 sm:w-13'
        : activePuzzle.size === 10
        ? 'w-7 sm:w-9'
        : 'w-5 sm:w-6';

    const cellHeightClass =
      activePuzzle.size === 5
        ? 'h-11 sm:h-13'
        : activePuzzle.size === 10
        ? 'h-7 sm:h-9'
        : 'h-5 sm:h-6';

    const rowSlotWClass =
      activePuzzle.size === 5
        ? 'w-5 sm:w-6'
        : activePuzzle.size === 10
        ? 'w-4 sm:w-5'
        : 'w-3.5 sm:w-4';

    const colSlotHClass =
      activePuzzle.size === 5
        ? 'h-5 sm:h-6'
        : activePuzzle.size === 10
        ? 'h-4 sm:h-5'
        : 'h-3.5 sm:h-4';

    const fontSizeClass =
      activePuzzle.size === 5
        ? 'text-xs sm:text-sm'
        : activePuzzle.size === 10
        ? 'text-[11px] sm:text-xs'
        : 'text-[9px] sm:text-[10px]';

    return (
      <div className="max-w-4xl mx-auto py-2 px-2 sm:px-4 space-y-4 font-mono-code select-none">
        {/* Thanh công cụ trên cùng */}
        <div className="bg-[#1c0c16] border border-[#3b1f2d] p-3 rounded-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActivePuzzle(null)}
              className="p-1.5 bg-[#25101b] hover:bg-[#3b1f2d] border border-[#4d2138] rounded-xs text-[#ffc2d4] hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Quay lại chọn kích cỡ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Chọn Cỡ</span>
            </button>

            {/* Nút Đổi câu đố khác (Shuffle/New Puzzle) */}
            <button
              onClick={handleShufflePuzzle}
              className="px-2 py-1.5 bg-[#14080e] hover:bg-[#25101b] border border-[#3b1f2d] hover:border-[#ff4d79] rounded-xs text-[#ffc2d4] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Đổi sang một câu đố khác cùng kích cỡ"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#ff4d79]" />
              <span className="hidden sm:inline">Đổi câu đố khác</span>
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#ffc2d4] flex items-center gap-2">
                <span>{activePuzzle.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#2b1620] border border-[#5e2f46] text-[#ffd6e2]">
                  {activePuzzle.size}x{activePuzzle.size}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Đồng hồ */}
            <div className="flex items-center gap-1.5 bg-[#14080e] px-2.5 py-1.5 border border-[#2d1822] rounded-xs text-[#ffd6e2]">
              <Timer className="w-3.5 h-3.5 text-[#ff4d79]" />
              <span className="font-bold">{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Mạng sống nếu ở chế độ cổ điển */}
            {isClassicMode && (
              <div className="flex items-center gap-1 bg-[#14080e] px-2.5 py-1.5 border border-[#2d1822] rounded-xs">
                {Array.from({ length: maxMistakes }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < maxMistakes - mistakes ? 'fill-[#ff4d79] text-[#ff4d79]' : 'text-[#4d2138]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Âm thanh */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 bg-[#14080e] hover:bg-[#25101b] border border-[#2d1822] rounded-xs text-[#8a717a] hover:text-[#ffc2d4] transition cursor-pointer"
              title={soundEnabled ? 'Tắt âm' : 'Bật âm'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Khung chơi Nonogram */}
        <div className="bg-[#11090c] border border-[#2d1822] p-3 sm:p-6 rounded-xs flex flex-col items-center justify-center overflow-x-auto shadow-md">
          <div className="inline-block">
            {/* Hàng Clues Cột (trên cùng) */}
            <div className="flex items-end">
              {/* Góc trên bên trái: Khớp hoàn toàn với độ rộng của các ô số hàng ngang */}
              <div className="shrink-0 pr-1 sm:pr-2 flex items-end justify-end pb-1 text-[#6e5860] select-none">
                <div className="flex items-center justify-end">
                  {Array.from({ length: maxRowClues }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`${rowSlotWClass} text-center shrink-0 flex items-center justify-center`}
                    >
                      {idx === maxRowClues - 1 ? (
                        <span className="text-[9px] opacity-70 font-bold">{activePuzzle.size}²</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Các cột số gợi ý (Col Clues) */}
              <div className="flex border-b-2 border-b-[#ff4d79]/60">
                {clues.colClues.map((col, cIdx) => {
                  const completed = isColComplete(cIdx);
                  const is5DividerCol = (cIdx + 1) % 5 === 0 && cIdx < activePuzzle.size - 1;
                  const isLastCol = cIdx === activePuzzle.size - 1;
                  const paddedColClues: (number | null)[] = [
                    ...Array(maxColClues - col.length).fill(null),
                    ...col,
                  ];

                  return (
                    <div
                      key={cIdx}
                      className={`${cellWidthClass} shrink-0 border-r ${
                        isLastCol
                          ? 'border-r-2 border-r-[#ff4d79]/60'
                          : is5DividerCol
                          ? 'border-r-2 border-r-[#ff4d79]/60'
                          : 'border-r border-transparent'
                      } flex flex-col justify-end items-center pb-1 ${fontSizeClass} font-bold transition select-none ${
                        completed ? 'text-[#4ade80]/50 line-through' : 'text-[#e0c0cc]'
                      }`}
                    >
                      {paddedColClues.map((num, nIdx) => (
                        <div
                          key={nIdx}
                          className={`${cellWidthClass} ${colSlotHClass} flex items-center justify-center shrink-0 leading-none`}
                        >
                          {num !== null ? <span>{num}</span> : null}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thân bảng: Clues Hàng (bên trái) + Lưới ô (bên phải) */}
            {board.map((row, rIdx) => {
              const rowCompleted = isRowComplete(rIdx);
              const rowClueList = clues.rowClues[rIdx];
              const paddedClues: (number | null)[] = [
                ...Array(maxRowClues - rowClueList.length).fill(null),
                ...rowClueList,
              ];
              const is5DividerRow = (rIdx + 1) % 5 === 0 && rIdx < activePuzzle.size - 1;
              const isLastRow = rIdx === activePuzzle.size - 1;

              return (
                <div key={rIdx} className="flex items-center">
                  {/* Khối gợi ý hàng ngang (Row Clues) */}
                  <div
                    className={`${cellHeightClass} shrink-0 pr-1 sm:pr-2 flex items-center justify-end ${fontSizeClass} font-bold transition select-none ${
                      rowCompleted ? 'text-[#4ade80]/50 line-through' : 'text-[#e0c0cc]'
                    }`}
                  >
                    {paddedClues.map((num, idx) => (
                      <div
                        key={idx}
                        className={`${rowSlotWClass} ${cellHeightClass} flex items-center justify-center shrink-0 text-center leading-none`}
                      >
                        {num !== null ? <span>{num}</span> : null}
                      </div>
                    ))}
                  </div>

                  {/* Các ô lưới trong hàng */}
                  <div className="flex border-l-2 border-l-[#ff4d79]/60">
                    {row.map((cell, cIdx) => {
                      const is5DividerCol = (cIdx + 1) % 5 === 0 && cIdx < activePuzzle.size - 1;
                      const isLastCol = cIdx === activePuzzle.size - 1;

                      return (
                        <div
                          key={cIdx}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            handleCellInteraction(rIdx, cIdx);
                          }}
                          onMouseDown={(e) => handleMouseDown(rIdx, cIdx, e)}
                          onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleCellInteraction(rIdx, cIdx, 'cross');
                          }}
                          className={`${cellWidthClass} ${cellHeightClass} border-r border-b ${
                            isLastCol
                              ? 'border-r-2 border-r-[#ff4d79]/60'
                              : is5DividerCol
                              ? 'border-r-2 border-r-[#ff4d79]/60'
                              : 'border-r border-[#2d1822]'
                          } ${
                            isLastRow
                              ? 'border-b-2 border-b-[#ff4d79]/60'
                              : is5DividerRow
                              ? 'border-b-2 border-b-[#ff4d79]/60'
                              : 'border-b border-[#2d1822]'
                          } touch-manipulation flex items-center justify-center cursor-pointer transition-all duration-75 select-none shrink-0 ${
                            cell === 1
                              ? 'shadow-inner'
                              : cell === 2
                              ? 'bg-[#180e14]'
                              : 'bg-[#14080e] hover:bg-[#200d18]'
                          }`}
                          style={{
                            backgroundColor: cell === 1 ? (activePuzzle.color || '#ff4d79') : undefined,
                          }}
                        >
                          {cell === 2 && (
                            <X className="w-3.5 h-3.5 text-[#ff4d79] stroke-[3]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thanh công cụ thao tác nhanh */}
        <div className="bg-[#1c0c16] border border-[#3b1f2d] p-3 rounded-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTool('fill')}
              className={`px-3.5 py-2 rounded-xs border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTool === 'fill'
                  ? 'bg-[#881337] border-[#ff4d79] text-white shadow-xs'
                  : 'bg-[#14080e] border-[#2d1822] text-[#8a717a] hover:text-[#ffd6e2]'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>TÔ Ô (FILL)</span>
            </button>

            <button
              onClick={() => setActiveTool('cross')}
              className={`px-3.5 py-2 rounded-xs border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTool === 'cross'
                  ? 'bg-[#4c1d95] border-[#a78bfa] text-white shadow-xs'
                  : 'bg-[#14080e] border-[#2d1822] text-[#8a717a] hover:text-[#ffd6e2]'
              }`}
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ĐÁNH X (CROSS)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="px-3 py-2 bg-[#14080e] hover:bg-[#25101b] disabled:opacity-40 border border-[#2d1822] rounded-xs text-[#ffc2d4] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Hoàn tác bước trước"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hoàn tác</span>
            </button>

            <button
              onClick={handleUseHint}
              disabled={hintsRemaining <= 0 || isVictory || isGameOver}
              className="px-3 py-2 bg-[#14080e] hover:bg-[#25101b] disabled:opacity-40 border border-[#2d1822] rounded-xs text-[#facc15] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title={`Gợi ý 1 ô đúng (còn ${hintsRemaining})`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Gợi ý ({hintsRemaining})</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 bg-[#14080e] hover:bg-[#25101b] border border-[#2d1822] rounded-xs text-[#8a717a] hover:text-[#ffc2d4] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Làm mới bàn cờ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Modal Thắng Màn Chơi */}
        {isVictory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#1c0c16] border border-[#ff4d79] max-w-sm w-full p-6 rounded-xs space-y-5 text-center shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-mono-code text-[#ffc2d4] tracking-tight">
                  XUẤT SẮC! HOÀN THÀNH!
                </h3>
                <p className="text-xs text-[#8a717a]">
                  Bức tranh: <strong className="text-white">{activePuzzle.name}</strong>
                </p>
              </div>

              {/* Bức tranh Pixel Art hoàn thiện */}
              <div className="p-3 bg-[#11090c] border border-[#2d1822] rounded-xs inline-block mx-auto">
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${activePuzzle.size}, minmax(0, 1fr))` }}>
                  {activePuzzle.solution.flat().map((val, idx) => (
                    <div
                      key={idx}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xxs transition"
                      style={{
                        backgroundColor: val === 1 ? activePuzzle.color : '#180e14',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-[#14080e] p-3 border border-[#2d1822] rounded-xs flex items-center justify-around text-xs">
                <div>
                  <span className="text-[#8a717a] block text-[10px]">Thời gian</span>
                  <span className="font-bold text-[#ffc2d4]">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="w-px h-6 bg-[#2d1822]" />
                <div>
                  <span className="text-[#8a717a] block text-[10px]">Kích thước</span>
                  <span className="font-bold text-[#ffd6e2]">{activePuzzle.size}x{activePuzzle.size}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivePuzzle(null)}
                  className="flex-1 py-2.5 bg-[#25101b] hover:bg-[#3b1f2d] border border-[#4d2138] text-[#ffc2d4] text-xs font-bold rounded-xs transition cursor-pointer"
                >
                  Chọn cỡ khác
                </button>
                <button
                  onClick={handleShufflePuzzle}
                  className="flex-1 py-2.5 bg-[#881337] hover:bg-[#9f1239] border border-[#ff4d79] text-white text-xs font-bold rounded-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Câu đố mới</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Game Over */}
        {isGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-[#1c0c16] border border-[#ef4444] max-w-xs w-full p-6 rounded-xs space-y-4 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/20 border border-[#ef4444] mx-auto flex items-center justify-center text-[#ef4444]">
                <X className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">HẾT MẠNG RỒI!</h3>
                <p className="text-xs text-[#8a717a]">Bạn đã mắc quá {maxMistakes} lỗi.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActivePuzzle(null)}
                  className="flex-1 py-2 bg-[#25101b] border border-[#4d2138] text-xs font-bold text-[#ffc2d4] rounded-xs"
                >
                  Thoát
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 bg-[#881337] border border-[#ff4d79] text-xs font-bold text-white rounded-xs flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chơi lại</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MÀN HÌNH CHỌN KÍCH CỠ (MỖI SIZE CHỈ 1 CÁI DUY NHẤT, MỖI LẦN BẤM SẼ RA CÂU ĐỐ KHÁC) ---
  const sizeOptions: { size: 5 | 10 | 15; title: string; tag: string; tagColor: string }[] = [
    {
      size: 5,
      title: '5x5',
      tag: 'DỄ',
      tagColor: 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/30'
    },
    {
      size: 10,
      title: '10x10',
      tag: 'VỪA',
      tagColor: 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/30'
    },
    {
      size: 15,
      title: '15x15',
      tag: 'KHÓ',
      tagColor: 'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/30'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-mono-code">
      {/* Header Banner */}
      <div className="bg-[#25101b] border border-[#4d2138] rounded-xs p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#14080e] hover:bg-[#25101b] border border-[#4d2138] rounded-xs text-[#ffc2d4] hover:text-white transition cursor-pointer"
            title="Quay lại danh sách trò chơi"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#ffc2d4] tracking-tight mt-1">
              PICROSS
            </h1>
          </div>
        </div>

        {/* Chế độ chơi: Thư giãn vs 3 Mạng */}
        <div className="flex items-center gap-3 bg-[#14080e] border border-[#3b1f2d] p-1.5 rounded-xs text-xs">
          <span className="text-[#8a717a] text-[11px] px-2 hidden sm:inline">Chế độ:</span>
          <button
            onClick={() => setIsClassicMode(false)}
            className={`px-3 py-1.5 rounded-xs transition font-bold cursor-pointer ${
              !isClassicMode
                ? 'bg-[#881337] text-white border border-[#ff4d79]'
                : 'text-[#8a717a] hover:text-[#ffc2d4]'
            }`}
          >
            Thư giãn
          </button>
          <button
            onClick={() => setIsClassicMode(true)}
            className={`px-3 py-1.5 rounded-xs transition font-bold cursor-pointer ${
              isClassicMode
                ? 'bg-[#881337] text-white border border-[#ff4d79]'
                : 'text-[#8a717a] hover:text-[#ffc2d4]'
            }`}
          >
            Cổ điển (3 Tim)
          </button>
        </div>
      </div>


      {/* 3 CARD ĐẠI DIỆN CHO 3 SIZE: 5x5, 10x10, 15x15 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sizeOptions.map((opt) => {
          const stats = sizeRecords[opt.size] || { solvedCount: 0, bestTime: null };

          return (
            <div
              key={opt.size}
              onClick={() => handleSelectSize(opt.size)}
              className="bg-[#1c0c16] border border-[#3b1f2d] hover:border-[#ff4d79] rounded-xs p-5 flex flex-col justify-between space-y-5 transition group cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header Card với Tiêu đề và Tag */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-mono-code text-[#ffc2d4] group-hover:text-white transition">
                    {opt.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xs border ${opt.tagColor}`}>
                    {opt.tag}
                  </span>
                </div>

                {/* Thống kê câu đố đã giải và Kỷ lục */}
                <div className="bg-[#14080e] p-3 rounded-xs border border-[#2d1822] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#e0c0cc]">
                    <span className="flex items-center gap-1.5 text-[#8a717a]">
                      <Award className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>Đã giải:</span>
                    </span>
                    <span className="font-bold text-[#4ade80]">{stats.solvedCount} câu đố</span>
                  </div>

                  <div className="flex items-center justify-between text-[#e0c0cc]">
                    <span className="flex items-center gap-1.5 text-[#8a717a]">
                      <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                      <span>Kỷ lục:</span>
                    </span>
                    <span className="font-bold text-[#fbbf24]">
                      {stats.bestTime !== null ? formatTime(stats.bestTime) : '--:--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút bấm bắt đầu */}
              <button className="w-full py-2.5 bg-[#25101b] group-hover:bg-[#881337] border border-[#4d2138] group-hover:border-[#ff4d79] text-[#ffc2d4] group-hover:text-white text-xs font-bold rounded-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>BẮT ĐẦU CÂU ĐỐ MỚI</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
