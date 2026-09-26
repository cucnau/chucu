import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../lib/firebase';
import { Story, Chapter, Comment, UserProfile } from '../types';
import { StoryLayoutContainer } from './StoryBlocks';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Layers, Palette, Check } from 'lucide-react';
import { getReadingProgress } from '../lib/readingProgress';
import { getUserUnlockedPasswordChaptersLocal } from '../lib/storage';
import { ReadingEffects } from './ReadingEffects';
import {
  getStoryBorderStyle,
  StoryCornerAccents,
} from '../lib/borderStyles';
import { StoryElementsLayer } from './StoryElementsLayer';
import { getEffectiveStory } from '../lib/storyUtils';
import { PRESET_THEME_COLORS, resolveStoryColors } from '../lib/themeConstants';

const THEME_TONES: Record<string, {
  containerBg: string;
  gradientBg?: string;
  cardBg: string;
  border: string;
  text: string;
  textMuted: string;
  inputBg: string;
  buttonBgPrimary: string;
  buttonBgSecondary: string;
  buttonBorderPrimary: string;
  buttonBorderSecondary: string;
  headerBorder: string;
  badgeLocked: string;
  badgeLockedBorder: string;
  badgeLockedText: string;
  badgeLockedIcon: string;
  badgeFree: string;
  badgeFreeBorder: string;
  badgeFreeText: string;
}> = {
  'dark-rose': {
    containerBg: 'bg-[#080406]',
    cardBg: 'bg-[#11090c]',
    border: 'border-[#2d1822]',
    text: 'text-[#e0d0d5]',
    textMuted: 'text-[#8a717a]',
    inputBg: 'bg-[#170d12]',
    buttonBgPrimary: 'bg-[#2b1620] hover:bg-[#3d1e2c]',
    buttonBgSecondary: 'bg-[#170d12] hover:bg-[#2b1620]',
    buttonBorderPrimary: 'border-[#5e2f46]',
    buttonBorderSecondary: 'border-[#2d1822]',
    headerBorder: 'border-[#23151b]',
    badgeLocked: 'bg-[#2b1620]',
    badgeLockedBorder: 'border-[#5e2f46]',
    badgeLockedText: 'text-[#ffd6e2]',
    badgeLockedIcon: 'text-[#ff99bb]',
    badgeFree: 'bg-[#12090c]',
    badgeFreeBorder: 'border-[#2d1822]',
    badgeFreeText: 'text-[#8a717a]'
  },
  'choco-light': {
    containerBg: 'bg-[#fcf8f5]',
    cardBg: 'bg-[#fffcf9]',
    border: 'border-[#e8d5c8]',
    text: 'text-[#3d2314]',
    textMuted: 'text-[#8c5e42]',
    inputBg: 'bg-[#f5ebe3]',
    buttonBgPrimary: 'bg-[#f0e2d8] hover:bg-[#e4d1c3]',
    buttonBgSecondary: 'bg-[#f8f2ec] hover:bg-[#f0e2d8]',
    buttonBorderPrimary: 'border-[#cbb3a3]',
    buttonBorderSecondary: 'border-[#e8d5c8]',
    headerBorder: 'border-[#e8d5c8]',
    badgeLocked: 'bg-[#f0e2d8]',
    badgeLockedBorder: 'border-[#cbb3a3]',
    badgeLockedText: 'text-[#3d2314]',
    badgeLockedIcon: 'text-[#8c5e42]',
    badgeFree: 'bg-[#f8f2ec]',
    badgeFreeBorder: 'border-[#e8d5c8]',
    badgeFreeText: 'text-[#8c5e42]'
  },
  'gradient-choco-light': {
    containerBg: 'bg-[#fcf5ee]',
    cardBg: 'bg-[#ffffff]',
    border: 'border-[#d9beab]',
    text: 'text-[#3d2314]',
    textMuted: 'text-[#8c5e42]',
    inputBg: 'bg-[#f7ebe1]',
    buttonBgPrimary: 'bg-[#e8d3c3] hover:bg-[#dbbfab]',
    buttonBgSecondary: 'bg-[#f7ebe1] hover:bg-[#e8d3c3]',
    buttonBorderPrimary: 'border-[#cbb3a3]',
    buttonBorderSecondary: 'border-[#d9beab]',
    headerBorder: 'border-[#d9beab]',
    badgeLocked: 'bg-[#e8d3c3]',
    badgeLockedBorder: 'border-[#cbb3a3]',
    badgeLockedText: 'text-[#3d2314]',
    badgeLockedIcon: 'text-[#8c5e42]',
    badgeFree: 'bg-[#f7ebe1]',
    badgeFreeBorder: 'border-[#d9beab]',
    badgeFreeText: 'text-[#8c5e42]'
  },
  'classic-black': {
    containerBg: 'bg-[#0a0a0a]',
    cardBg: 'bg-[#141414]',
    border: 'border-[#262626]',
    text: 'text-[#f5f5f5]',
    textMuted: 'text-[#a3a3a3]',
    inputBg: 'bg-[#171717]',
    buttonBgPrimary: 'bg-[#1f1f1f] hover:bg-[#2e2e2e]',
    buttonBgSecondary: 'bg-[#171717] hover:bg-[#262626]',
    buttonBorderPrimary: 'border-[#404040]',
    buttonBorderSecondary: 'border-[#262626]',
    headerBorder: 'border-[#262626]',
    badgeLocked: 'bg-[#1f1f1f]',
    badgeLockedBorder: 'border-[#404040]',
    badgeLockedText: 'text-[#ffffff]',
    badgeLockedIcon: 'text-[#a3a3a3]',
    badgeFree: 'bg-[#141414]',
    badgeFreeBorder: 'border-[#262626]',
    badgeFreeText: 'text-[#a3a3a3]'
  },
  'classic-white': {
    containerBg: 'bg-[#ffffff]',
    cardBg: 'bg-[#f8fafc]',
    border: 'border-[#e2e8f0]',
    text: 'text-[#0f172a]',
    textMuted: 'text-[#64748b]',
    inputBg: 'bg-[#f1f5f9]',
    buttonBgPrimary: 'bg-[#0f172a] hover:bg-[#1e293b]',
    buttonBgSecondary: 'bg-[#f1f5f9] hover:bg-[#e2e8f0]',
    buttonBorderPrimary: 'border-[#0f172a]',
    buttonBorderSecondary: 'border-[#cbd5e1]',
    headerBorder: 'border-[#e2e8f0]',
    badgeLocked: 'bg-[#f1f5f9]',
    badgeLockedBorder: 'border-[#cbd5e1]',
    badgeLockedText: 'text-[#0f172a]',
    badgeLockedIcon: 'text-[#64748b]',
    badgeFree: 'bg-[#f8fafc]',
    badgeFreeBorder: 'border-[#e2e8f0]',
    badgeFreeText: 'text-[#64748b]'
  },
  'sepia': {
    containerBg: 'bg-[#f4ecd8]',
    cardBg: 'bg-[#fcf8ed]',
    border: 'border-[#d3c29f]',
    text: 'text-[#4a3525]',
    textMuted: 'text-[#8c7460]',
    inputBg: 'bg-[#f0e6cb]',
    buttonBgPrimary: 'bg-[#e2d5b6] hover:bg-[#d8cba8]',
    buttonBgSecondary: 'bg-[#faf6eb] hover:bg-[#e2d5b6]',
    buttonBorderPrimary: 'border-[#bca883]',
    buttonBorderSecondary: 'border-[#d3c29f]',
    headerBorder: 'border-[#dfd0b4]',
    badgeLocked: 'bg-[#e2d5b6]',
    badgeLockedBorder: 'border-[#bca883]',
    badgeLockedText: 'text-[#4a3525]',
    badgeLockedIcon: 'text-[#8c5e3c]',
    badgeFree: 'bg-[#faf6eb]',
    badgeFreeBorder: 'border-[#d3c29f]',
    badgeFreeText: 'text-[#8c7460]'
  },
  'emerald': {
    containerBg: 'bg-[#06100c]',
    cardBg: 'bg-[#0b1a14]',
    border: 'border-[#153327]',
    text: 'text-[#d1e7dd]',
    textMuted: 'text-[#628f7a]',
    inputBg: 'bg-[#0e251c]',
    buttonBgPrimary: 'bg-[#163f2d] hover:bg-[#1e543c]',
    buttonBgSecondary: 'bg-[#0e251c] hover:bg-[#163f2d]',
    buttonBorderPrimary: 'border-[#2a6b4e]',
    buttonBorderSecondary: 'border-[#153327]',
    headerBorder: 'border-[#122c20]',
    badgeLocked: 'bg-[#163f2d]',
    badgeLockedBorder: 'border-[#2a6b4e]',
    badgeLockedText: 'text-[#d1e7dd]',
    badgeLockedIcon: 'text-[#5eead4]',
    badgeFree: 'bg-[#0e251c]',
    badgeFreeBorder: 'border-[#153327]',
    badgeFreeText: 'text-[#628f7a]'
  },
  'slate': {
    containerBg: 'bg-[#0f172a]',
    cardBg: 'bg-[#1e293b]',
    border: 'border-[#334155]',
    text: 'text-[#f1f5f9]',
    textMuted: 'text-[#94a3b8]',
    inputBg: 'bg-[#0f172a]',
    buttonBgPrimary: 'bg-[#334155] hover:bg-[#475569]',
    buttonBgSecondary: 'bg-[#1e293b] hover:bg-[#334155]',
    buttonBorderPrimary: 'border-[#475569]',
    buttonBorderSecondary: 'border-[#334155]',
    headerBorder: 'border-[#1e293b]',
    badgeLocked: 'bg-[#334155]',
    badgeLockedBorder: 'border-[#475569]',
    badgeLockedText: 'text-[#f1f5f9]',
    badgeLockedIcon: 'text-[#93c5fd]',
    badgeFree: 'bg-[#1e293b]',
    badgeFreeBorder: 'border-[#334155]',
    badgeFreeText: 'text-[#94a3b8]'
  },
  'classic-dark': {
    containerBg: 'bg-[#0a0a0a]',
    cardBg: 'bg-[#121212]',
    border: 'border-[#242424]',
    text: 'text-[#e5e5e5]',
    textMuted: 'text-[#737373]',
    inputBg: 'bg-[#1a1a1a]',
    buttonBgPrimary: 'bg-[#262626] hover:bg-[#404040]',
    buttonBgSecondary: 'bg-[#171717] hover:bg-[#262626]',
    buttonBorderPrimary: 'border-[#404040]',
    buttonBorderSecondary: 'border-[#262626]',
    headerBorder: 'border-[#1f1f1f]',
    badgeLocked: 'bg-[#262626]',
    badgeLockedBorder: 'border-[#404040]',
    badgeLockedText: 'text-[#e5e5e5]',
    badgeLockedIcon: 'text-[#d4d4d4]',
    badgeFree: 'bg-[#171717]',
    badgeFreeBorder: 'border-[#262626]',
    badgeFreeText: 'text-[#737373]'
  },
  'gradient-rose': {
    containerBg: 'bg-[#0c0408]',
    gradientBg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: 'bg-[#1c0a13]/90 backdrop-blur-xs',
    border: 'border-[#682542]',
    text: 'text-[#fce7f0]',
    textMuted: 'text-[#f4a6c1]',
    inputBg: 'bg-[#280c1b]',
    buttonBgPrimary: 'bg-[#521930] hover:bg-[#6e2241]',
    buttonBgSecondary: 'bg-[#280c1b] hover:bg-[#521930]',
    buttonBorderPrimary: 'border-[#832e55]',
    buttonBorderSecondary: 'border-[#682542]',
    headerBorder: 'border-[#521930]',
    badgeLocked: 'bg-[#521930]',
    badgeLockedBorder: 'border-[#832e55]',
    badgeLockedText: 'text-[#ffc2d4]',
    badgeLockedIcon: 'text-[#ff99bb]',
    badgeFree: 'bg-[#280c1b]',
    badgeFreeBorder: 'border-[#682542]',
    badgeFreeText: 'text-[#f4a6c1]'
  },
  'gradient-midnight': {
    containerBg: 'bg-[#080314]',
    gradientBg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: 'bg-[#170b33]/90 backdrop-blur-xs',
    border: 'border-[#581c87]',
    text: 'text-[#f3e8ff]',
    textMuted: 'text-[#c084fc]',
    inputBg: 'bg-[#210f47]',
    buttonBgPrimary: 'bg-[#3b1278] hover:bg-[#521ab0]',
    buttonBgSecondary: 'bg-[#210f47] hover:bg-[#3b1278]',
    buttonBorderPrimary: 'border-[#7e22ce]',
    buttonBorderSecondary: 'border-[#581c87]',
    headerBorder: 'border-[#3b1278]',
    badgeLocked: 'bg-[#3b1278]',
    badgeLockedBorder: 'border-[#7e22ce]',
    badgeLockedText: 'text-[#e9d5ff]',
    badgeLockedIcon: 'text-[#c084fc]',
    badgeFree: 'bg-[#210f47]',
    badgeFreeBorder: 'border-[#581c87]',
    badgeFreeText: 'text-[#c084fc]'
  },
  'gradient-ocean': {
    containerBg: 'bg-[#030d17]',
    gradientBg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: 'bg-[#081d2c]/90 backdrop-blur-xs',
    border: 'border-[#0284c7]',
    text: 'text-[#e0f2fe]',
    textMuted: 'text-[#38bdf8]',
    inputBg: 'bg-[#0c273a]',
    buttonBgPrimary: 'bg-[#0369a1] hover:bg-[#0284c7]',
    buttonBgSecondary: 'bg-[#0c273a] hover:bg-[#0369a1]',
    buttonBorderPrimary: 'border-[#38bdf8]',
    buttonBorderSecondary: 'border-[#0284c7]',
    headerBorder: 'border-[#0369a1]',
    badgeLocked: 'bg-[#0369a1]',
    badgeLockedBorder: 'border-[#38bdf8]',
    badgeLockedText: 'text-[#bae6fd]',
    badgeLockedIcon: 'text-[#38bdf8]',
    badgeFree: 'bg-[#0c273a]',
    badgeFreeBorder: 'border-[#0284c7]',
    badgeFreeText: 'text-[#38bdf8]'
  },
  'gradient-emerald': {
    containerBg: 'bg-[#02120d]',
    gradientBg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: 'bg-[#082119]/90 backdrop-blur-xs',
    border: 'border-[#059669]',
    text: 'text-[#ecfdf5]',
    textMuted: 'text-[#34d399]',
    inputBg: 'bg-[#0d3327]',
    buttonBgPrimary: 'bg-[#047857] hover:bg-[#059669]',
    buttonBgSecondary: 'bg-[#0d3327] hover:bg-[#047857]',
    buttonBorderPrimary: 'border-[#10b981]',
    buttonBorderSecondary: 'border-[#059669]',
    headerBorder: 'border-[#047857]',
    badgeLocked: 'bg-[#047857]',
    badgeLockedBorder: 'border-[#10b981]',
    badgeLockedText: 'text-[#a7f3d0]',
    badgeLockedIcon: 'text-[#34d399]',
    badgeFree: 'bg-[#0d3327]',
    badgeFreeBorder: 'border-[#059669]',
    badgeFreeText: 'text-[#34d399]'
  },
  'gradient-sunset': {
    containerBg: 'bg-[#120307]',
    gradientBg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: 'bg-[#24080e]/90 backdrop-blur-xs',
    border: 'border-[#9f1239]',
    text: 'text-[#fff1f2]',
    textMuted: 'text-[#fb7185]',
    inputBg: 'bg-[#380b15]',
    buttonBgPrimary: 'bg-[#881337] hover:bg-[#9f1239]',
    buttonBgSecondary: 'bg-[#380b15] hover:bg-[#881337]',
    buttonBorderPrimary: 'border-[#e11d48]',
    buttonBorderSecondary: 'border-[#9f1239]',
    headerBorder: 'border-[#881337]',
    badgeLocked: 'bg-[#881337]',
    badgeLockedBorder: 'border-[#e11d48]',
    badgeLockedText: 'text-[#fecdd3]',
    badgeLockedIcon: 'text-[#fb7185]',
    badgeFree: 'bg-[#380b15]',
    badgeFreeBorder: 'border-[#9f1239]',
    badgeFreeText: 'text-[#fb7185]'
  },
  'gradient-cyber': {
    containerBg: 'bg-[#100220]',
    gradientBg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: 'bg-[#210638]/90 backdrop-blur-xs',
    border: 'border-[#a21caf]',
    text: 'text-[#fae8ff]',
    textMuted: 'text-[#e879f9]',
    inputBg: 'bg-[#320a52]',
    buttonBgPrimary: 'bg-[#7e22ce] hover:bg-[#9333ea]',
    buttonBgSecondary: 'bg-[#320a52] hover:bg-[#7e22ce]',
    buttonBorderPrimary: 'border-[#c084fc]',
    buttonBorderSecondary: 'border-[#a21caf]',
    headerBorder: 'border-[#7e22ce]',
    badgeLocked: 'bg-[#7e22ce]',
    badgeLockedBorder: 'border-[#c084fc]',
    badgeLockedText: 'text-[#f5d0fe]',
    badgeLockedIcon: 'text-[#e879f9]',
    badgeFree: 'bg-[#320a52]',
    badgeFreeBorder: 'border-[#a21caf]',
    badgeFreeText: 'text-[#e879f9]'
  },
  'gradient-gold': {
    containerBg: 'bg-[#180801]',
    gradientBg: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #180801 100%)',
    cardBg: 'bg-[#2a1205]/90 backdrop-blur-xs',
    border: 'border-[#b45309]',
    text: 'text-[#fef3c7]',
    textMuted: 'text-[#fbbf24]',
    inputBg: 'bg-[#3d1a04]',
    buttonBgPrimary: 'bg-[#92400e] hover:bg-[#b45309]',
    buttonBgSecondary: 'bg-[#3d1a04] hover:bg-[#92400e]',
    buttonBorderPrimary: 'border-[#f59e0b]',
    buttonBorderSecondary: 'border-[#b45309]',
    headerBorder: 'border-[#92400e]',
    badgeLocked: 'bg-[#92400e]',
    badgeLockedBorder: 'border-[#f59e0b]',
    badgeLockedText: 'text-[#fef3c7]',
    badgeLockedIcon: 'text-[#fbbf24]',
    badgeFree: 'bg-[#3d1a04]',
    badgeFreeBorder: 'border-[#b45309]',
    badgeFreeText: 'text-[#fbbf24]'
  },
  'dark-violet': {
    containerBg: 'bg-[#06030a]',
    cardBg: 'bg-[#0f0817]',
    border: 'border-[#28153b]',
    text: 'text-[#f2e8f8]',
    textMuted: 'text-[#b690d4]',
    inputBg: 'bg-[#130a1f]',
    buttonBgPrimary: 'bg-[#28133b] hover:bg-[#3d1c5a]',
    buttonBgSecondary: 'bg-[#130a1f] hover:bg-[#28133b]',
    buttonBorderPrimary: 'border-[#562c7e]',
    buttonBorderSecondary: 'border-[#28153b]',
    headerBorder: 'border-[#28153b]',
    badgeLocked: 'bg-[#28133b]',
    badgeLockedBorder: 'border-[#562c7e]',
    badgeLockedText: 'text-[#ebd6fb]',
    badgeLockedIcon: 'text-[#d6a8f7]',
    badgeFree: 'bg-[#130a1f]',
    badgeFreeBorder: 'border-[#28153b]',
    badgeFreeText: 'text-[#b690d4]'
  },
  'navy-blue': {
    containerBg: 'bg-[#03080d]',
    cardBg: 'bg-[#08121d]',
    border: 'border-[#152a40]',
    text: 'text-[#e6eff8]',
    textMuted: 'text-[#8dafcb]',
    inputBg: 'bg-[#0b1b2b]',
    buttonBgPrimary: 'bg-[#13283e] hover:bg-[#1d3c5c]',
    buttonBgSecondary: 'bg-[#0b1b2b] hover:bg-[#13283e]',
    buttonBorderPrimary: 'border-[#295480]',
    buttonBorderSecondary: 'border-[#152a40]',
    headerBorder: 'border-[#152a40]',
    badgeLocked: 'bg-[#13283e]',
    badgeLockedBorder: 'border-[#295480]',
    badgeLockedText: 'text-[#cce2f8]',
    badgeLockedIcon: 'text-[#82baf0]',
    badgeFree: 'bg-[#0b1b2b]',
    badgeFreeBorder: 'border-[#152a40]',
    badgeFreeText: 'text-[#8dafcb]'
  },
};

interface StoryDetailProps {
  story: Story;
  chapters: Chapter[];
  comments: Comment[];
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  isEditor?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (storyId: string) => void;
  onToggleCommentReaction?: (commentId: string, emojiId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const StoryDetail: React.FC<StoryDetailProps> = ({
  story,
  chapters,
  comments,
  onBack,
  onSelectChapter,
  onAddComment,
  currentUser,
  userProfile,
  isAdmin = false,
  isEditor = false,
  isBookmarked = false,
  onToggleBookmark = () => {},
  onToggleCommentReaction,
  onDeleteComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<any[] | null>(null);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0);
  const [isStripPaused, setIsStripPaused] = useState(false);
  const [searchChapterQuery, setSearchChapterQuery] = useState('');
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState<string | null>(null);
  const [expandedVolumes, setExpandedVolumes] = useState<Record<string, boolean>>({});

  const toggleVolume = (vol: string) => {
    setExpandedVolumes((prev) => ({
      ...prev,
      [vol]: prev[vol] !== undefined ? !prev[vol] : false,
    }));
  };

  const [selectedThemeId, setSelectedThemeId] = useState<string>(story.activeThemeId || '');

  useEffect(() => {
    if (story.activeThemeId) {
      setSelectedThemeId(story.activeThemeId);
    }
  }, [story.activeThemeId]);

  const effectiveStory = getEffectiveStory(story, selectedThemeId);

  const [liveEditorProfile, setLiveEditorProfile] = useState<{ displayName?: string; photoURL?: string } | null>(null);
  const [lastReadProgress, setLastReadProgress] = useState<{ chapterId: string; chapterNumber: number; scrollPercentage: number; updatedAt: string } | null>(null);

  useEffect(() => {
    if (effectiveStory.id) {
      const progress = getReadingProgress(effectiveStory.id);
      setLastReadProgress(progress as any);
    }
  }, [effectiveStory.id, currentUser]);

  useEffect(() => {
    if (effectiveStory.authorUid) {
      const unsub = onSnapshot(doc(db, 'users', effectiveStory.authorUid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLiveEditorProfile({
            displayName: data.displayName,
            photoURL: data.photoURL,
          });
        }
      });
      return () => unsub();
    }
  }, [effectiveStory.authorUid]);

  const lastReadChapter = (lastReadProgress && chapters.find(c => c.id === lastReadProgress.chapterId)) || null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment({
      storyId: effectiveStory.id,
      userId: currentUser?.uid || 'guest',
      userName: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Khách',
      userEmail: currentUser?.email || '',
      content: commentText.trim(),
    });
    setCommentText('');
  };

  const toneKey = effectiveStory.themeTone || 'dark-rose';
  const isCustomTheme = toneKey === 'custom';
  const tone = THEME_TONES[toneKey] || THEME_TONES['dark-rose'];
  const resolvedColors = resolveStoryColors(effectiveStory);

  const currentBg = resolvedColors.bg;
  const currentCardBg = resolvedColors.cardBg;
  const currentText = resolvedColors.text;
  const currentTextMuted = resolvedColors.textMuted;
  const currentBorder = resolvedColors.border;
  const currentBtnBg = resolvedColors.btnBg;
  const currentBtnSecondaryBg = resolvedColors.btnSecondaryBg;
  const currentBtnBorder = resolvedColors.btnBorder;
  const currentBtnText = resolvedColors.btnText;

  const storyTitleFont = effectiveStory.customTitleFont || effectiveStory.defaultFont || 'font-mono';
  const storySubtitleFont = effectiveStory.customSubtitleFont || effectiveStory.customTitleFont || effectiveStory.defaultFont || 'font-mono';
  const storyBodyFont = effectiveStory.customBodyFont || effectiveStory.defaultFont || 'font-mono';
  const storyMutedFont = effectiveStory.customMutedFont || effectiveStory.defaultFont || 'font-mono';
  const storyBtnFont = effectiveStory.customBtnFont || effectiveStory.defaultFont || 'font-mono';

  const activeBorderColor = currentBorder;
  const activeBtnBorderColor = currentBtnBorder;
  const activeBtnBgColor = currentBtnBg;
  const cardBgColor = currentCardBg;

  const storyBorderObj = {
    borderStyle: effectiveStory.borderStyle || 'solid',
    borderWidth: effectiveStory.borderWidth || 'thin',
    borderRadius: effectiveStory.borderRadius || 'none',
    borderCornerAccent: effectiveStory.borderCornerAccent || 'none',
    borderGlow: effectiveStory.borderGlow || 'none',
    customCardBgColor: effectiveStory.customCardBgColor,
    customBorderGradientColor2: effectiveStory.customBorderGradientColor2,
    customBorderGlowColor1: effectiveStory.customBorderGlowColor1,
    customBorderGlowColor2: effectiveStory.customBorderGlowColor2,
  };

  const customStyles = {
    container: { background: currentBg, color: currentText },
    card: { background: currentCardBg, color: currentText, borderColor: currentBorder },
    textMuted: { color: currentTextMuted },
    text: { color: currentText },
    border: { borderColor: currentBorder },
    input: { background: currentCardBg, color: currentText, borderColor: currentBorder },
    btnPrimary: { background: currentBtnBg, borderColor: currentBtnBorder, color: currentBtnText },
    btnSecondary: { background: currentBtnSecondaryBg, borderColor: currentBorder, color: currentText },
  };

  const editorDisplayName = 
    effectiveStory.editorName ||
    liveEditorProfile?.displayName ||
    (userProfile && effectiveStory.authorUid && userProfile.uid === effectiveStory.authorUid ? userProfile.displayName : undefined) ||
    (currentUser && effectiveStory.authorUid && currentUser.uid === effectiveStory.authorUid ? currentUser.displayName || currentUser.email?.split('@')[0] : undefined) ||
    (userProfile?.displayName ? userProfile.displayName : undefined) ||
    (effectiveStory.authorEmail ? effectiveStory.authorEmail.split('@')[0] : 'Cục Nâu');

  const isCustomEditor = !!(
    effectiveStory.editorName && 
    effectiveStory.editorName !== (liveEditorProfile?.displayName || userProfile?.displayName || currentUser?.displayName)
  );

  const editorAvatarUrl =
    effectiveStory.editorPhoto ||
    (isCustomEditor ? '' : (
      liveEditorProfile?.photoURL ||
      (userProfile && effectiveStory.authorUid && userProfile.uid === effectiveStory.authorUid ? userProfile.photoURL : undefined) ||
      (currentUser && effectiveStory.authorUid && currentUser.uid === effectiveStory.authorUid ? currentUser.photoURL : undefined) ||
      (userProfile?.photoURL ? userProfile.photoURL : undefined) ||
      ''
    ));

  const firstChapter = chapters.length > 0 ? (chapters.find(c => c.chapterNumber === 1) || chapters[0]) : null;

  const getChapterStatus = (chap: Chapter) => {
    const isUnlocked = !!(userProfile?.unlockedChapters && userProfile.unlockedChapters.includes(chap.id));
    const unlockedPassLocal = getUserUnlockedPasswordChaptersLocal(currentUser?.uid);
    const isPassUnlocked = !!(
      unlockedPassLocal.includes(chap.id) ||
      (userProfile?.unlockedPasswordChapters && userProfile.unlockedPasswordChapters.includes(chap.id))
    );
    const isAuthorOrOwner = 
      (currentUser?.uid && effectiveStory.authorUid && currentUser.uid === effectiveStory.authorUid) ||
      (currentUser?.email && effectiveStory.authorEmail && currentUser.email.toLowerCase() === effectiveStory.authorEmail.toLowerCase()) ||
      isAdmin;
    const isReading = lastReadProgress && lastReadProgress.chapterId === chap.id;

    return { isUnlocked, isPassUnlocked, isAuthorOrOwner, isReading };
  };

  const currentBgVal = currentBg;
  const isDarkTheme = !currentBgVal.toLowerCase().includes('#fff') && !currentBgVal.toLowerCase().includes('255, 255, 255');

  return (
    <div 
      className={`story-detail-root preserve-story-theme max-w-4xl mx-auto px-4 py-6 space-y-6 relative ${storyBodyFont}`}
      style={customStyles.container}
    >
      {/* Dynamic selection style based on story theme */}
      <style>{`
        .story-detail-root ::selection,
        .story-detail-root *::selection {
          background-color: ${activeBtnBgColor} !important;
          color: ${isCustomTheme ? (story.customTextColor || '#ffffff') : '#ffffff'} !important;
        }
      `}</style>

      {effectiveStory.readingEffect && effectiveStory.readingEffect !== 'none' && (
        <ReadingEffects effect={effectiveStory.readingEffect} effectColor={effectiveStory.readingEffectColor} isDarkTheme={isDarkTheme} />
      )}
      
      {/* Back Button & Theme Switcher Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs hover:opacity-85 transition cursor-pointer"
          style={customStyles.textMuted}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>

        {/* Theme Switcher Bar */}
        {story.storyThemes && story.storyThemes.length > 0 && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg border text-xs font-mono backdrop-blur-xs shadow-xs" style={{ background: cardBgColor, borderColor: activeBorderColor }}>
            <span className="font-bold flex items-center gap-1 text-[11px] opacity-90 px-1" style={{ color: customStyles.card.color || activeBorderColor }}>
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Theme:</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {story.storyThemes.map((t) => {
                const isSel = (selectedThemeId || story.activeThemeId || story.storyThemes![0].id) === t.id;
                const isMain = story.activeThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                      isSel ? 'ring-2 ring-amber-400 scale-105 shadow-xs' : 'opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      background: isSel ? activeBtnBgColor : customStyles.card.background,
                      borderColor: isSel ? activeBtnBorderColor : activeBorderColor,
                      color: isSel ? '#ffffff' : customStyles.card.color,
                    }}
                    title={t.description || t.name}
                  >
                    <span>{t.name}</span>
                    {isMain && <span className="text-[8px] bg-amber-500 text-black px-1 rounded font-black">Chính</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Post Header */}
      <article 
        className={`${isCustomTheme ? '' : `${tone.cardBg}`} p-6 space-y-6 relative overflow-visible transition-all duration-200`}
        style={{
          ...(isCustomTheme ? { background: effectiveStory.customCardBgColor } : {}),
          ...getStoryBorderStyle(storyBorderObj, activeBorderColor),
        }}
      >
        {/* Corner Accents */}
        <StoryCornerAccents
          accent={effectiveStory.borderCornerAccent}
          borderStyle={storyBorderObj.borderStyle}
          color={activeBorderColor}
        />

        {/* Story Decorative Elements */}
        {effectiveStory.storyElements && effectiveStory.storyElements.length > 0 && (
          <StoryElementsLayer
            elements={effectiveStory.storyElements}
            isEditable={false}
            themeColors={{
              bg: isCustomTheme ? effectiveStory.customBgColor : undefined,
              cardBg: isCustomTheme ? effectiveStory.customCardBgColor : undefined,
              border: activeBorderColor,
              accentColor: activeBorderColor,
              text: isCustomTheme ? effectiveStory.customTextColor : undefined,
              textMuted: isCustomTheme ? effectiveStory.customTextMutedColor : undefined,
            }}
          />
        )}

        <StoryLayoutContainer
          story={effectiveStory}
          chapters={chapters}
          lastReadChapter={lastReadChapter}
          lastReadProgress={lastReadProgress}
          firstChapter={firstChapter}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
          onSelectChapter={onSelectChapter}
          getChapterStatus={getChapterStatus}
          customStyles={customStyles}
          isCustomTheme={isCustomTheme}
          tone={tone}
          storyTitleFont={storyTitleFont}
          storySubtitleFont={storySubtitleFont}
          storyBodyFont={storyBodyFont}
          storyMutedFont={storyMutedFont}
          storyBtnFont={storyBtnFont}
          activeBorderColor={activeBorderColor}
          activeBtnBorderColor={activeBtnBorderColor}
          activeBtnBgColor={activeBtnBgColor}
          cardBgColor={cardBgColor}
          storyBorderObj={storyBorderObj}
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          handleCommentSubmit={handleCommentSubmit}
          setLightboxImages={setLightboxImages}
          setLightboxCurrentIndex={setLightboxCurrentIndex}
          isStripPaused={isStripPaused}
          setIsStripPaused={setIsStripPaused}
          isSynopsisExpanded={isSynopsisExpanded}
          setIsSynopsisExpanded={setIsSynopsisExpanded}
          searchChapterQuery={searchChapterQuery}
          setSearchChapterQuery={setSearchChapterQuery}
          selectedVolumeFilter={selectedVolumeFilter}
          setSelectedVolumeFilter={setSelectedVolumeFilter}
          expandedVolumes={expandedVolumes}
          toggleVolume={toggleVolume}
          editorAvatarUrl={editorAvatarUrl}
          editorDisplayName={editorDisplayName}
          currentUserUid={currentUser?.uid}
          onToggleCommentReaction={onToggleCommentReaction}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          isEditor={isEditor}
        />

      </article>

      {/* Lightbox Modal Xem Ảnh Phóng To & Chuyển Ảnh Album */}
      {lightboxImages && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-mono"
          onClick={() => setLightboxImages(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center rounded-lg overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setLightboxImages(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Nút lùi ảnh nếu xem album */}
            {lightboxImages.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxCurrentIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                title="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Nút tiến ảnh nếu xem album */}
            {lightboxImages.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxCurrentIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                title="Ảnh tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Khung hiển thị ảnh */}
            <div className="relative max-h-[78vh] flex items-center justify-center">
              <img
                src={lightboxImages[lightboxCurrentIndex]?.url}
                alt={lightboxImages[lightboxCurrentIndex]?.caption || 'Preview image'}
                className="max-h-[78vh] max-w-full object-contain rounded shadow-2xl border border-white/10 select-none"
              />
            </div>

            {/* Chú thích & đếm số ảnh */}
            <div className="mt-2 text-center text-white/90 space-y-0.5">
              {lightboxImages[lightboxCurrentIndex]?.caption && (
                <p className="text-xs font-medium">
                  {lightboxImages[lightboxCurrentIndex].caption}
                </p>
              )}
              {lightboxImages.length > 1 && (
                <p className="text-[10px] text-white/60 font-mono">
                  {lightboxCurrentIndex + 1} / {lightboxImages.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hiệu ứng đọc truyện hiển thị trực tiếp ở trang chi tiết truyện */}
      <ReadingEffects 
        effect={story.readingEffect} 
        effectColor={story.readingEffectColor}
        isDarkTheme={
          isCustomTheme 
            ? !(story.customBgColor && (
                story.customBgColor.toLowerCase().includes('#fff') || 
                story.customBgColor.toLowerCase().includes('255, 255, 255') ||
                story.customBgColor.toLowerCase() === '#f4ecd8' ||
                story.customBgColor.toLowerCase() === '#ffffff'
              ))
            : toneKey !== 'sepia'
        } 
      />
    </div>
  );
};
