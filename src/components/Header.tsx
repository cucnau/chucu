import React, { useState } from 'react';
import { Search, Users, BookOpen, Bookmark, PlusCircle, User, LogOut, LogIn, Settings, Flame, Calendar, Check, Loader2, Home, Gamepad2, Bell, MessageSquare, Sun, Moon, Trophy } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Story, UserProfile, Notification } from '../types';
import { checkInDaily, getLocalDateString } from '../lib/storage';
import { resolveStoryColors } from '../lib/themeConstants';

const HEADER_THEME_TONES: Record<string, {
  headerBg: string;
  gradientBg?: string;
  headerBorder: string;
  brandText: string;
  brandHoverText: string;
  text: string;
  textMuted: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputPlaceholder: string;
  buttonBg: string;
  buttonBorder: string;
  dropdownBg: string;
  dropdownBorder: string;
  dropdownItemHover: string;
  dropdownActiveBg: string;
  iconColor: string;
}> = {
  'dark-rose': {
    headerBg: 'bg-[#080406]/85 backdrop-blur-xl',
    headerBorder: 'border-[#2d1822]',
    brandText: 'text-[#e0c0cc]',
    brandHoverText: 'hover:text-[#d0a0b0]',
    text: 'text-[#e0d0d5]',
    textMuted: 'text-[#8a717a]',
    inputBg: 'bg-[#12090c]/80 backdrop-blur-md',
    inputBorder: 'border-[#2d1822]',
    inputFocusBorder: 'focus:border-[#522d3d]',
    inputPlaceholder: 'placeholder-[#6e5860]',
    buttonBg: 'bg-[#160c10]/90 hover:bg-[#2a1621] backdrop-blur-md',
    buttonBorder: 'border-[#3a1e2d]',
    dropdownBg: 'bg-[#11090c]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#3d202e]',
    dropdownItemHover: 'hover:bg-[#1f1017]/80',
    dropdownActiveBg: 'bg-[#2b1620]/90',
    iconColor: 'text-[#d0a0b0]',
  },
  'choco-light': {
    headerBg: 'bg-[#fcf8f5]/90 backdrop-blur-xl',
    headerBorder: 'border-[#e8d5c8]',
    brandText: 'text-[#3d2314]',
    brandHoverText: 'hover:text-[#6e3e23]',
    text: 'text-[#3d2314]',
    textMuted: 'text-[#8c5e42]',
    inputBg: 'bg-[#fffcf9]/90 backdrop-blur-md',
    inputBorder: 'border-[#e8d5c8]',
    inputFocusBorder: 'focus:border-[#cbb3a3]',
    inputPlaceholder: 'placeholder-[#b08b73]',
    buttonBg: 'bg-[#f0e2d8]/90 hover:bg-[#e4d1c3] backdrop-blur-md',
    buttonBorder: 'border-[#cbb3a3]',
    dropdownBg: 'bg-[#fffcf9]/95 backdrop-blur-xl',
    dropdownBorder: 'border-[#e8d5c8]',
    dropdownItemHover: 'hover:bg-[#f5ebe3]',
    dropdownActiveBg: 'bg-[#ebdcd0]',
    iconColor: 'text-[#8c5e42]',
  },
  'gradient-choco-light': {
    headerBg: 'bg-[#fcf5ee]/90 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(255, 252, 250, 0.95) 0%, rgba(247, 235, 225, 0.95) 50%, rgba(235, 215, 200, 0.95) 100%)',
    headerBorder: 'border-[#d9beab]',
    brandText: 'text-[#3d2314]',
    brandHoverText: 'hover:text-[#6e3e23]',
    text: 'text-[#3d2314]',
    textMuted: 'text-[#8c5e42]',
    inputBg: 'bg-[#ffffff]/90 backdrop-blur-md',
    inputBorder: 'border-[#d9beab]',
    inputFocusBorder: 'focus:border-[#cbb3a3]',
    inputPlaceholder: 'placeholder-[#b08b73]',
    buttonBg: 'bg-[#e8d3c3]/90 hover:bg-[#dbbfab] backdrop-blur-md',
    buttonBorder: 'border-[#cbb3a3]',
    dropdownBg: 'bg-[#ffffff]/95 backdrop-blur-xl',
    dropdownBorder: 'border-[#d9beab]',
    dropdownItemHover: 'hover:bg-[#f7ebe1]',
    dropdownActiveBg: 'bg-[#e8d3c3]',
    iconColor: 'text-[#8c5e42]',
  },
  'sepia': {
    headerBg: 'bg-[#f4ecd8]/85 backdrop-blur-xl',
    headerBorder: 'border-[#d3c29f]',
    brandText: 'text-[#4a3525]',
    brandHoverText: 'hover:text-[#6e5038]',
    text: 'text-[#4a3525]',
    textMuted: 'text-[#8c7460]',
    inputBg: 'bg-[#fcf8ed]/80 backdrop-blur-md',
    inputBorder: 'border-[#d3c29f]',
    inputFocusBorder: 'focus:border-[#bca883]',
    inputPlaceholder: 'placeholder-[#a6917d]',
    buttonBg: 'bg-[#e2d5b6]/90 hover:bg-[#d8cba8] backdrop-blur-md',
    buttonBorder: 'border-[#bca883]',
    dropdownBg: 'bg-[#fcf8ed]/92 backdrop-blur-xl',
    dropdownBorder: 'border-[#d3c29f]',
    dropdownItemHover: 'hover:bg-[#f4ecd8]',
    dropdownActiveBg: 'bg-[#e2d5b6]',
    iconColor: 'text-[#8c7460]',
  },
  'emerald': {
    headerBg: 'bg-[#06100c]/85 backdrop-blur-xl',
    headerBorder: 'border-[#153327]',
    brandText: 'text-[#d1e7dd]',
    brandHoverText: 'hover:text-[#a3cfbb]',
    text: 'text-[#d1e7dd]',
    textMuted: 'text-[#628f7a]',
    inputBg: 'bg-[#0b1a14]/80 backdrop-blur-md',
    inputBorder: 'border-[#153327]',
    inputFocusBorder: 'focus:border-[#2a6b4e]',
    inputPlaceholder: 'placeholder-[#3e6855]',
    buttonBg: 'bg-[#163f2d]/90 hover:bg-[#1e543c] backdrop-blur-md',
    buttonBorder: 'border-[#2a6b4e]',
    dropdownBg: 'bg-[#0b1a14]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#153327]',
    dropdownItemHover: 'hover:bg-[#102a20]',
    dropdownActiveBg: 'bg-[#163f2d]',
    iconColor: 'text-[#628f7a]',
  },
  'slate': {
    headerBg: 'bg-[#0f172a]/85 backdrop-blur-xl',
    headerBorder: 'border-[#334155]',
    brandText: 'text-[#f1f5f9]',
    brandHoverText: 'hover:text-[#cbd5e1]',
    text: 'text-[#f1f5f9]',
    textMuted: 'text-[#94a3b8]',
    inputBg: 'bg-[#1e293b]/80 backdrop-blur-md',
    inputBorder: 'border-[#334155]',
    inputFocusBorder: 'focus:border-[#475569]',
    inputPlaceholder: 'placeholder-[#64748b]',
    buttonBg: 'bg-[#334155]/90 hover:bg-[#475569] backdrop-blur-md',
    buttonBorder: 'border-[#475569]',
    dropdownBg: 'bg-[#1e293b]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#334155]',
    dropdownItemHover: 'hover:bg-[#334155]',
    dropdownActiveBg: 'bg-[#475569]',
    iconColor: 'text-[#94a3b8]',
  },
  'classic-dark': {
    headerBg: 'bg-[#0a0a0a]/85 backdrop-blur-xl',
    headerBorder: 'border-[#242424]',
    brandText: 'text-[#e5e5e5]',
    brandHoverText: 'hover:text-white',
    text: 'text-[#e5e5e5]',
    textMuted: 'text-[#737373]',
    inputBg: 'bg-[#141414]/80 backdrop-blur-md',
    inputBorder: 'border-[#242424]',
    inputFocusBorder: 'focus:border-[#404040]',
    inputPlaceholder: 'placeholder-[#555555]',
    buttonBg: 'bg-[#262626]/90 hover:bg-[#404040] backdrop-blur-md',
    buttonBorder: 'border-[#404040]',
    dropdownBg: 'bg-[#141414]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#242424]',
    dropdownItemHover: 'hover:bg-[#262626]',
    dropdownActiveBg: 'bg-[#333333]',
    iconColor: 'text-[#737373]',
  },
  'classic-black': {
    headerBg: 'bg-[#0a0a0a]/90 backdrop-blur-xl',
    headerBorder: 'border-[#262626]',
    brandText: 'text-[#f5f5f5]',
    brandHoverText: 'hover:text-white',
    text: 'text-[#f5f5f5]',
    textMuted: 'text-[#a3a3a3]',
    inputBg: 'bg-[#141414]/90 backdrop-blur-md',
    inputBorder: 'border-[#262626]',
    inputFocusBorder: 'focus:border-[#525252]',
    inputPlaceholder: 'placeholder-[#737373]',
    buttonBg: 'bg-[#1f1f1f]/90 hover:bg-[#2e2e2e] backdrop-blur-md',
    buttonBorder: 'border-[#404040]',
    dropdownBg: 'bg-[#141414]/95 backdrop-blur-xl',
    dropdownBorder: 'border-[#262626]',
    dropdownItemHover: 'hover:bg-[#262626]',
    dropdownActiveBg: 'bg-[#333333]',
    iconColor: 'text-[#a3a3a3]',
  },
  'classic-white': {
    headerBg: 'bg-[#ffffff]/90 backdrop-blur-xl',
    headerBorder: 'border-[#e2e8f0]',
    brandText: 'text-[#0f172a]',
    brandHoverText: 'hover:text-[#0284c7]',
    text: 'text-[#0f172a]',
    textMuted: 'text-[#64748b]',
    inputBg: 'bg-[#f8fafc]/90 backdrop-blur-md',
    inputBorder: 'border-[#e2e8f0]',
    inputFocusBorder: 'focus:border-[#94a3b8]',
    inputPlaceholder: 'placeholder-[#94a3b8]',
    buttonBg: 'bg-[#f1f5f9]/90 hover:bg-[#e2e8f0] backdrop-blur-md',
    buttonBorder: 'border-[#cbd5e1]',
    dropdownBg: 'bg-[#ffffff]/95 backdrop-blur-xl',
    dropdownBorder: 'border-[#e2e8f0]',
    dropdownItemHover: 'hover:bg-[#f1f5f9]',
    dropdownActiveBg: 'bg-[#e2e8f0]',
    iconColor: 'text-[#64748b]',
  },
  'gradient-rose': {
    headerBg: 'bg-[#0c0408]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(74, 21, 40, 0.9) 0%, rgba(35, 11, 21, 0.9) 50%, rgba(12, 4, 8, 0.9) 100%)',
    headerBorder: 'border-[#682542]',
    brandText: 'text-[#fce7f0]',
    brandHoverText: 'hover:text-[#ffc2d4]',
    text: 'text-[#fce7f0]',
    textMuted: 'text-[#f4a6c1]',
    inputBg: 'bg-[#1c0a13]/80 backdrop-blur-md',
    inputBorder: 'border-[#682542]',
    inputFocusBorder: 'focus:border-[#832e55]',
    inputPlaceholder: 'placeholder-[#f4a6c1]/70',
    buttonBg: 'bg-[#280c1b]/90 hover:bg-[#521930] backdrop-blur-md',
    buttonBorder: 'border-[#682542]',
    dropdownBg: 'bg-[#1c0a13]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#682542]',
    dropdownItemHover: 'hover:bg-[#280c1b]',
    dropdownActiveBg: 'bg-[#521930]',
    iconColor: 'text-[#ff99bb]',
  },
  'gradient-midnight': {
    headerBg: 'bg-[#080314]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(46, 16, 101, 0.9) 0%, rgba(22, 8, 51, 0.9) 50%, rgba(8, 3, 20, 0.9) 100%)',
    headerBorder: 'border-[#581c87]',
    brandText: 'text-[#f3e8ff]',
    brandHoverText: 'hover:text-[#e9d5ff]',
    text: 'text-[#f3e8ff]',
    textMuted: 'text-[#c084fc]',
    inputBg: 'bg-[#170b33]/80 backdrop-blur-md',
    inputBorder: 'border-[#581c87]',
    inputFocusBorder: 'focus:border-[#7e22ce]',
    inputPlaceholder: 'placeholder-[#c084fc]/70',
    buttonBg: 'bg-[#210f47]/90 hover:bg-[#3b1278] backdrop-blur-md',
    buttonBorder: 'border-[#581c87]',
    dropdownBg: 'bg-[#170b33]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#581c87]',
    dropdownItemHover: 'hover:bg-[#210f47]',
    dropdownActiveBg: 'bg-[#3b1278]',
    iconColor: 'text-[#c084fc]',
  },
  'gradient-ocean': {
    headerBg: 'bg-[#030d17]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(12, 74, 110, 0.9) 0%, rgba(7, 39, 60, 0.9) 50%, rgba(3, 13, 23, 0.9) 100%)',
    headerBorder: 'border-[#0284c7]',
    brandText: 'text-[#e0f2fe]',
    brandHoverText: 'hover:text-[#bae6fd]',
    text: 'text-[#e0f2fe]',
    textMuted: 'text-[#38bdf8]',
    inputBg: 'bg-[#081d2c]/80 backdrop-blur-md',
    inputBorder: 'border-[#0284c7]',
    inputFocusBorder: 'focus:border-[#38bdf8]',
    inputPlaceholder: 'placeholder-[#38bdf8]/70',
    buttonBg: 'bg-[#0c273a]/90 hover:bg-[#0369a1] backdrop-blur-md',
    buttonBorder: 'border-[#0284c7]',
    dropdownBg: 'bg-[#081d2c]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#0284c7]',
    dropdownItemHover: 'hover:bg-[#0c273a]',
    dropdownActiveBg: 'bg-[#0369a1]',
    iconColor: 'text-[#38bdf8]',
  },
  'gradient-emerald': {
    headerBg: 'bg-[#02120d]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(4, 41, 31, 0.9) 50%, rgba(2, 18, 13, 0.9) 100%)',
    headerBorder: 'border-[#059669]',
    brandText: 'text-[#ecfdf5]',
    brandHoverText: 'hover:text-[#a7f3d0]',
    text: 'text-[#ecfdf5]',
    textMuted: 'text-[#34d399]',
    inputBg: 'bg-[#082119]/80 backdrop-blur-md',
    inputBorder: 'border-[#059669]',
    inputFocusBorder: 'focus:border-[#10b981]',
    inputPlaceholder: 'placeholder-[#34d399]/70',
    buttonBg: 'bg-[#0d3327]/90 hover:bg-[#047857] backdrop-blur-md',
    buttonBorder: 'border-[#059669]',
    dropdownBg: 'bg-[#082119]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#059669]',
    dropdownItemHover: 'hover:bg-[#0d3327]',
    dropdownActiveBg: 'bg-[#047857]',
    iconColor: 'text-[#34d399]',
  },
  'gradient-sunset': {
    headerBg: 'bg-[#120307]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(104, 18, 18, 0.9) 0%, rgba(59, 9, 20, 0.9) 50%, rgba(18, 3, 7, 0.9) 100%)',
    headerBorder: 'border-[#9f1239]',
    brandText: 'text-[#fff1f2]',
    brandHoverText: 'hover:text-[#fecdd3]',
    text: 'text-[#fff1f2]',
    textMuted: 'text-[#fb7185]',
    inputBg: 'bg-[#24080e]/80 backdrop-blur-md',
    inputBorder: 'border-[#9f1239]',
    inputFocusBorder: 'focus:border-[#e11d48]',
    inputPlaceholder: 'placeholder-[#fb7185]/70',
    buttonBg: 'bg-[#380b15]/90 hover:bg-[#881337] backdrop-blur-md',
    buttonBorder: 'border-[#9f1239]',
    dropdownBg: 'bg-[#24080e]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#9f1239]',
    dropdownItemHover: 'hover:bg-[#380b15]',
    dropdownActiveBg: 'bg-[#881337]',
    iconColor: 'text-[#fb7185]',
  },
  'gradient-cyber': {
    headerBg: 'bg-[#100220]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9) 0%, rgba(46, 8, 84, 0.9) 50%, rgba(16, 2, 32, 0.9) 100%)',
    headerBorder: 'border-[#a21caf]',
    brandText: 'text-[#fae8ff]',
    brandHoverText: 'hover:text-[#f5d0fe]',
    text: 'text-[#fae8ff]',
    textMuted: 'text-[#e879f9]',
    inputBg: 'bg-[#210638]/80 backdrop-blur-md',
    inputBorder: 'border-[#a21caf]',
    inputFocusBorder: 'focus:border-[#c084fc]',
    inputPlaceholder: 'placeholder-[#e879f9]/70',
    buttonBg: 'bg-[#320a52]/90 hover:bg-[#7e22ce] backdrop-blur-md',
    buttonBorder: 'border-[#a21caf]',
    dropdownBg: 'bg-[#210638]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#a21caf]',
    dropdownItemHover: 'hover:bg-[#320a52]',
    dropdownActiveBg: 'bg-[#7e22ce]',
    iconColor: 'text-[#e879f9]',
  },
  'cyberpunk': {
    headerBg: 'bg-[#0f0c29]/85 backdrop-blur-xl',
    headerBorder: 'border-[#ff007f]',
    brandText: 'text-[#ff71ce]',
    brandHoverText: 'hover:text-[#01cdfe]',
    text: 'text-[#05ffa1]',
    textMuted: 'text-[#b967ff]',
    inputBg: 'bg-[#180e29]/80 backdrop-blur-md',
    inputBorder: 'border-[#ff007f]',
    inputFocusBorder: 'focus:border-[#01cdfe]',
    inputPlaceholder: 'placeholder-[#b967ff]/70',
    buttonBg: 'bg-[#24143d]/90 hover:bg-[#ff007f] backdrop-blur-md',
    buttonBorder: 'border-[#ff007f]',
    dropdownBg: 'bg-[#180e29]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#ff007f]',
    dropdownItemHover: 'hover:bg-[#24143d]',
    dropdownActiveBg: 'bg-[#ff007f]',
    iconColor: 'text-[#01cdfe]',
  },
  'forest-dark': {
    headerBg: 'bg-[#05130b]/85 backdrop-blur-xl',
    headerBorder: 'border-[#1b4332]',
    brandText: 'text-[#d8f3dc]',
    brandHoverText: 'hover:text-[#b7e4c7]',
    text: 'text-[#d8f3dc]',
    textMuted: 'text-[#74c69d]',
    inputBg: 'bg-[#081c10]/80 backdrop-blur-md',
    inputBorder: 'border-[#1b4332]',
    inputFocusBorder: 'focus:border-[#2d6a4f]',
    inputPlaceholder: 'placeholder-[#52b788]',
    buttonBg: 'bg-[#1b4332]/90 hover:bg-[#2d6a4f] backdrop-blur-md',
    buttonBorder: 'border-[#2d6a4f]',
    dropdownBg: 'bg-[#081c10]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#1b4332]',
    dropdownItemHover: 'hover:bg-[#1b4332]',
    dropdownActiveBg: 'bg-[#2d6a4f]',
    iconColor: 'text-[#74c69d]',
  },
  'warm-coffee': {
    headerBg: 'bg-[#18110b]/85 backdrop-blur-xl',
    headerBorder: 'border-[#43281c]',
    brandText: 'text-[#f5ebe0]',
    brandHoverText: 'hover:text-[#e6ccb2]',
    text: 'text-[#f5ebe0]',
    textMuted: 'text-[#b08968]',
    inputBg: 'bg-[#24180f]/80 backdrop-blur-md',
    inputBorder: 'border-[#43281c]',
    inputFocusBorder: 'focus:border-[#7f4f24]',
    inputPlaceholder: 'placeholder-[#936639]',
    buttonBg: 'bg-[#3b2416]/90 hover:bg-[#58311a] backdrop-blur-md',
    buttonBorder: 'border-[#7f4f24]',
    dropdownBg: 'bg-[#24180f]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#43281c]',
    dropdownItemHover: 'hover:bg-[#3b2416]',
    dropdownActiveBg: 'bg-[#58311a]',
    iconColor: 'text-[#b08968]',
  },
  'gradient-gold': {
    headerBg: 'bg-[#180801]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(120, 53, 15, 0.9) 0%, rgba(69, 26, 3, 0.9) 50%, rgba(24, 8, 1, 0.9) 100%)',
    headerBorder: 'border-[#b45309]',
    brandText: 'text-[#fef3c7]',
    brandHoverText: 'hover:text-[#fde68a]',
    text: 'text-[#fef3c7]',
    textMuted: 'text-[#fbbf24]',
    inputBg: 'bg-[#290e02]/80 backdrop-blur-md',
    inputBorder: 'border-[#b45309]',
    inputFocusBorder: 'focus:border-[#d97706]',
    inputPlaceholder: 'placeholder-[#fbbf24]/70',
    buttonBg: 'bg-[#3d1703]/90 hover:bg-[#92400e] backdrop-blur-md',
    buttonBorder: 'border-[#b45309]',
    dropdownBg: 'bg-[#290e02]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#b45309]',
    dropdownItemHover: 'hover:bg-[#3d1703]',
    dropdownActiveBg: 'bg-[#92400e]',
    iconColor: 'text-[#fbbf24]',
  },
  'gradient-cherry': {
    headerBg: 'bg-[#1f020d]/85 backdrop-blur-xl',
    gradientBg: 'linear-gradient(135deg, rgba(131, 24, 67, 0.9) 0%, rgba(80, 7, 36, 0.9) 50%, rgba(31, 2, 13, 0.9) 100%)',
    headerBorder: 'border-[#be185d]',
    brandText: 'text-[#fce7f0]',
    brandHoverText: 'hover:text-[#fbcfe8]',
    text: 'text-[#fce7f0]',
    textMuted: 'text-[#f4a6c1]',
    inputBg: 'bg-[#2e0516]/80 backdrop-blur-md',
    inputBorder: 'border-[#be185d]',
    inputFocusBorder: 'focus:border-[#e11d48]',
    inputPlaceholder: 'placeholder-[#f4a6c1]/70',
    buttonBg: 'bg-[#42081f]/90 hover:bg-[#9d174d] backdrop-blur-md',
    buttonBorder: 'border-[#be185d]',
    dropdownBg: 'bg-[#2e0516]/90 backdrop-blur-xl',
    dropdownBorder: 'border-[#be185d]',
    dropdownItemHover: 'hover:bg-[#42081f]',
    dropdownActiveBg: 'bg-[#9d174d]',
    iconColor: 'text-[#f472b6]',
  },
};

interface HeaderProps {
  activeTab: 'browse' | 'news' | 'library' | 'studio' | 'games' | 'rankings';
  setActiveTab: (tab: 'browse' | 'news' | 'library' | 'studio' | 'games' | 'rankings') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  bookmarkCount: number;
  currentUser: FirebaseUser | null;
  canPost: boolean;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onLogout: () => void;
  onCheckInSuccess?: (reward: number, newStreak: number, newBalance: number) => void;
  userProfile: UserProfile | null;
  currentStory?: Story | null;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigateNotification: (notif: Notification) => void;
  siteTheme?: 'choco-dark' | 'choco-light';
  onToggleSiteTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  bookmarkCount,
  currentUser,
  canPost,
  onOpenAuthModal,
  onOpenSettingsModal,
  onLogout,
  onCheckInSuccess,
  userProfile,
  currentStory,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateNotification,
  siteTheme = 'choco-dark',
  onToggleSiteTheme,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [headerNotice, setHeaderNotice] = useState<string | null>(null);

  const today = getLocalDateString();
  const hasCheckedInToday = userProfile?.lastCheckInDate === today;

  // Compute theme styles
  const toneKey = currentStory?.themeTone 
    ? currentStory.themeTone 
    : (siteTheme === 'choco-light' ? 'choco-light' : 'dark-rose');
  const isCustomTheme = currentStory && toneKey === 'custom';
  const tone = HEADER_THEME_TONES[toneKey] || HEADER_THEME_TONES[siteTheme === 'choco-light' ? 'choco-light' : 'dark-rose'];
  const resolvedStoryColors = currentStory ? resolveStoryColors(currentStory) : null;

  const hexToRgba = (hex?: string, alpha: number = 0.9) => {
    if (!hex) return `rgba(17, 9, 12, ${alpha})`;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16);
      const g = parseInt(cleanHex[1] + cleanHex[1], 16);
      const b = parseInt(cleanHex[2] + cleanHex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
  };

  const customHeaderStyle = isCustomTheme && resolvedStoryColors ? {
    background: resolvedStoryColors.bg,
    borderColor: resolvedStoryColors.border,
    color: resolvedStoryColors.text,
  } : (tone.gradientBg ? { background: tone.gradientBg } : {});

  const customInputStyle = isCustomTheme && resolvedStoryColors ? {
    backgroundColor: resolvedStoryColors.cardBg,
    borderColor: resolvedStoryColors.border,
    color: resolvedStoryColors.text,
  } : {};

  const customButtonStyle = isCustomTheme && resolvedStoryColors ? {
    backgroundColor: resolvedStoryColors.btnSecondaryBg,
    borderColor: resolvedStoryColors.btnBorder,
    color: resolvedStoryColors.btnText,
  } : {};

  const customDropdownStyle: React.CSSProperties = isCustomTheme && resolvedStoryColors ? {
    backgroundColor: hexToRgba(resolvedStoryColors.cardBg, 0.95),
    borderColor: resolvedStoryColors.border,
    color: resolvedStoryColors.text,
  } : {};

  const handleHeaderCheckIn = async () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (hasCheckedInToday) {
      setHeaderNotice('Bạn đã điểm danh hôm nay!');
      setTimeout(() => setHeaderNotice(null), 3000);
      return;
    }

    setIsCheckingIn(true);
    try {
      const res = await checkInDaily(currentUser.uid, userProfile || undefined);
      if (res.success) {
        setHeaderNotice(`+${res.reward} Chucu!`);
        onCheckInSuccess?.(res.reward, res.streak, res.newBalance);
        setTimeout(() => setHeaderNotice(null), 3000);
      } else {
        setHeaderNotice(res.message);
        setTimeout(() => setHeaderNotice(null), 3000);
      }
    } catch (err: any) {
      setHeaderNotice(err?.message || 'Lỗi điểm danh');
      setTimeout(() => setHeaderNotice(null), 3000);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <header 
      className={`border-b font-mono-code sticky top-0 z-40 transition-colors duration-300 ${
        isCustomTheme ? '' : `${tone.headerBg} ${tone.headerBorder} ${tone.text}`
      }`}
      style={customHeaderStyle}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Title & Header Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setActiveTab('browse')}
            className={`text-left font-mono-code font-bold text-xl tracking-[0.25em] uppercase transition ${
              isCustomTheme ? '' : `${tone.brandText} ${tone.brandHoverText}`
            }`}
            style={isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.text } : {}}
          >
            CHOCO HOUSE
          </button>

          <div 
            className={`flex items-center gap-1.5 ml-2 border-l pl-3 ${
              isCustomTheme ? '' : tone.inputBorder
            }`}
            style={isCustomTheme && resolvedStoryColors ? { borderColor: resolvedStoryColors.border } : {}}
          >
            <button
              onClick={() => setActiveTab('browse')}
              className={`p-1.5 text-xs font-mono-code font-bold transition rounded-xs border flex items-center justify-center ${
                activeTab === 'browse'
                  ? (isCustomTheme 
                      ? 'shadow-sm' 
                      : `${tone.buttonBg} ${tone.buttonBorder} ${tone.text} shadow-sm`)
                  : (isCustomTheme 
                      ? 'border-transparent hover:opacity-80' 
                      : `border-transparent ${tone.textMuted} hover:${tone.text}`)
              }`}
              title="Trang chủ"
              style={
                isCustomTheme && resolvedStoryColors && activeTab === 'browse'
                  ? {
                      backgroundColor: resolvedStoryColors.btnBg,
                      borderColor: resolvedStoryColors.btnBorder,
                      color: resolvedStoryColors.btnText,
                    }
                  : (isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {})
              }
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`p-1.5 text-xs font-mono-code font-bold transition rounded-xs border flex items-center justify-center ${
                activeTab === 'news'
                  ? (isCustomTheme 
                      ? 'shadow-sm' 
                      : `${tone.buttonBg} ${tone.buttonBorder} ${tone.text} shadow-sm`)
                  : (isCustomTheme 
                      ? 'border-transparent hover:opacity-80' 
                      : `border-transparent ${tone.textMuted} hover:${tone.text}`)
              }`}
              title="Diễn đàn"
              style={
                isCustomTheme && resolvedStoryColors && activeTab === 'news'
                  ? {
                      backgroundColor: resolvedStoryColors.btnBg,
                      borderColor: resolvedStoryColors.btnBorder,
                      color: resolvedStoryColors.btnText,
                    }
                  : (isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {})
              }
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`p-1.5 text-xs font-mono-code font-bold transition rounded-xs border flex items-center justify-center ${
                activeTab === 'games'
                  ? (isCustomTheme 
                      ? 'shadow-sm' 
                      : `${tone.buttonBg} ${tone.buttonBorder} ${tone.text} shadow-sm`)
                  : (isCustomTheme 
                      ? 'border-transparent hover:opacity-80' 
                      : `border-transparent ${tone.textMuted} hover:${tone.text}`)
              }`}
              title="Trò chơi"
              style={
                isCustomTheme && resolvedStoryColors && activeTab === 'games'
                  ? {
                      backgroundColor: resolvedStoryColors.btnBg,
                      borderColor: resolvedStoryColors.btnBorder,
                      color: resolvedStoryColors.btnText,
                    }
                  : (isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {})
              }
            >
              <Gamepad2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`p-1.5 text-xs font-mono-code font-bold transition rounded-xs border flex items-center justify-center ${
                activeTab === 'rankings'
                  ? (isCustomTheme 
                      ? 'shadow-sm' 
                      : `${tone.buttonBg} ${tone.buttonBorder} ${tone.text} shadow-sm`)
                  : (isCustomTheme 
                      ? 'border-transparent hover:opacity-80' 
                      : `border-transparent ${tone.textMuted} hover:${tone.text}`)
              }`}
              title="BXH Tấn Giang (JJWXC - Đam Mỹ)"
              style={
                isCustomTheme && resolvedStoryColors && activeTab === 'rankings'
                  ? {
                      backgroundColor: resolvedStoryColors.btnBg,
                      borderColor: resolvedStoryColors.btnBorder,
                      color: resolvedStoryColors.btnText,
                    }
                  : (isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {})
              }
            >
              <Trophy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input, Chucu Balance & Auth Profile */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-56 relative font-mono-code flex items-center">
            <Search 
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isCustomTheme ? '' : tone.textMuted}`} 
              style={isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {}}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm truyện..."
              className={`w-full border pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors ${
                isCustomTheme 
                  ? 'placeholder:text-current placeholder:opacity-50' 
                  : `${tone.inputBg} ${tone.inputBorder} ${tone.text} ${tone.inputPlaceholder} ${tone.inputFocusBorder}`
              }`}
              style={customInputStyle}
            />
          </div>

          {/* Quick Chucu & Direct Daily Check-in Button */}
          <div className="relative shrink-0">
            <button
              onClick={handleHeaderCheckIn}
              disabled={isCheckingIn || hasCheckedInToday}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition shrink-0 ${
                hasCheckedInToday
                  ? (isCustomTheme ? 'border opacity-80 cursor-default select-none' : `${tone.inputBg} border ${tone.inputBorder} ${tone.text} cursor-default select-none`)
                  : (isCustomTheme ? 'border active:scale-95 cursor-pointer' : `${tone.buttonBg} border ${tone.buttonBorder} ${tone.text} active:scale-95 cursor-pointer`)
              }`}
              style={customButtonStyle}
              title={hasCheckedInToday ? 'Đã điểm danh hôm nay' : 'Bấm để điểm danh nhận Chucu ngay'}
            >
              {isCheckingIn && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span className="font-bold">{userProfile?.chucu || 0}</span>
              <span 
                className={`text-[10px] ${isCustomTheme ? '' : tone.textMuted}`}
                style={isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {}}
              >
                Chucu
              </span>
              {(userProfile?.streak || 0) > 0 && (
                <span 
                  className={`flex items-center gap-0.5 text-[10px] text-[#c89666] ml-1 pl-1.5 border-l ${
                    isCustomTheme ? '' : tone.inputBorder
                  }`}
                  style={isCustomTheme && resolvedStoryColors ? { borderColor: resolvedStoryColors.border } : {}}
                >
                  <Flame className="w-3 h-3 text-[#c89666]" />
                  <span>{userProfile?.streak}</span>
                </span>
              )}
            </button>

            {headerNotice && (
              <div 
                className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 border px-2 py-1 text-[11px] font-bold whitespace-nowrap shadow-lg z-50 animate-fade-in ${
                  isCustomTheme ? '' : `${tone.dropdownBg} ${tone.buttonBorder} ${tone.text}`
                }`}
                style={customDropdownStyle}
              >
                {headerNotice}
              </div>
            )}
          </div>

          {/* Theme Mode Toggle (Choco Dark vs Choco Light) */}
          {onToggleSiteTheme && (
            <button
              type="button"
              onClick={onToggleSiteTheme}
              className={`p-2 border relative transition flex items-center justify-center shrink-0 ${
                isCustomTheme ? '' : `${tone.inputBg} ${tone.inputBorder} ${tone.text}`
              }`}
              style={customInputStyle}
              title={siteTheme === 'choco-light' ? 'Chuyển sang Chế độ Tối (Choco Dark)' : 'Chuyển sang Chế độ Sáng (Choco Light)'}
            >
              {siteTheme === 'choco-light' ? (
                <Moon className={`w-4 h-4 ${isCustomTheme ? '' : tone.iconColor}`} />
              ) : (
                <Sun className={`w-4 h-4 ${isCustomTheme ? '' : tone.iconColor}`} />
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          {currentUser && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowUserMenu(false);
                }}
                className={`p-2 border relative transition flex items-center justify-center ${
                  isCustomTheme ? '' : `${tone.inputBg} ${tone.inputBorder} ${tone.text}`
                }`}
                style={customInputStyle}
                title="Thông báo"
              >
                <Bell className={`w-4 h-4 ${isCustomTheme ? '' : tone.iconColor}`} />
                {(notifications || []).some((n) => n && !n.isRead) && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-sans text-[8px] font-bold h-3.5 min-w-3.5 px-1 rounded-full flex items-center justify-center border border-current animate-pulse">
                    {(notifications || []).filter((n) => n && !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifMenu && (
                <div 
                  className={`absolute right-0 mt-2 w-80 border shadow-2xl z-50 p-2 space-y-1 text-xs font-mono-code backdrop-blur-xl ${
                    isCustomTheme ? '' : `${tone.dropdownBg} ${tone.dropdownBorder} ${tone.text}`
                  }`}
                  style={customDropdownStyle}
                >
                  <div className={`p-2 border-b flex items-center justify-between gap-2 ${isCustomTheme ? '' : tone.inputBorder}`} style={isCustomTheme && resolvedStoryColors ? { borderColor: resolvedStoryColors.border } : {}}>
                    <span className="font-bold">THÔNG BÁO ({notifications.length})</span>
                    {notifications.some((n) => !n.isRead) && (
                      <button
                        type="button"
                        onClick={() => {
                          onMarkAllNotificationsRead();
                        }}
                        className="text-[10px] text-[#ff99bb] hover:underline"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-current/10">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-current/60">
                        Bạn chưa có thông báo nào.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const notifIcon = notif.type === 'new_chapter' ? (
                          <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                        );
                        return (
                          <button
                            key={notif.id}
                            type="button"
                            onClick={() => {
                              onMarkNotificationRead(notif.id);
                              onNavigateNotification(notif);
                              setShowNotifMenu(false);
                            }}
                            className={`w-full text-left p-2.5 flex gap-2.5 transition items-start ${
                              notif.isRead 
                                ? 'opacity-75 hover:opacity-100 hover:bg-white/5' 
                                : 'bg-white/5 font-semibold hover:bg-white/10 border-l-2 border-[#ff99bb]'
                            }`}
                          >
                            {notif.senderPhoto ? (
                              <img src={notif.senderPhoto} alt="" className="w-6 h-6 rounded-full shrink-0 object-cover mt-0.5" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 flex items-center justify-center mt-0.5">
                                {notifIcon}
                              </div>
                            )}
                            <div className="flex-1 space-y-0.5">
                              <p className="line-clamp-3 text-[11px] leading-relaxed">
                                {notif.content}
                              </p>
                              <span className="text-[9px] opacity-60 block">
                                {notif.createdAt && typeof notif.createdAt.toDate === 'function'
                                  ? new Date(notif.createdAt.toDate()).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                                  : notif.createdAt instanceof Date 
                                  ? notif.createdAt.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                                  : typeof notif.createdAt === 'string'
                                  ? notif.createdAt
                                  : 'Vừa xong'}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Info / Account Dropdown Menu */}
          <div className="relative shrink-0">
            {currentUser ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 border px-3 py-1.5 text-sm transition ${
                  isCustomTheme ? '' : `${tone.inputBg} ${tone.inputBorder} ${tone.text}`
                }`}
                style={customInputStyle}
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className={`w-4 h-4 ${isCustomTheme ? '' : tone.iconColor}`} />
                )}
                <span className="max-w-[100px] truncate font-mono-code text-xs">
                  {userProfile?.displayName || currentUser.email?.split('@')[0] || 'Thành viên'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-mono-code font-bold uppercase tracking-wider transition ${
                  isCustomTheme ? '' : `${tone.inputBg} ${tone.inputBorder} ${tone.text}`
                }`}
                style={customInputStyle}
              >
                <User className={`w-4 h-4 ${isCustomTheme ? '' : tone.iconColor}`} />
                <span>Tài khoản</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div 
                id="user-menu-dropdown" 
                className={`absolute right-0 mt-2 w-56 border shadow-2xl z-50 p-2 space-y-1 text-xs font-mono-code backdrop-blur-xl ${
                  isCustomTheme ? '' : `${tone.dropdownBg} ${tone.dropdownBorder} ${tone.text}`
                }`}
                style={customDropdownStyle}
              >
                {currentUser ? (
                  <div 
                    className={`p-2 border-b space-y-1.5 ${isCustomTheme ? '' : tone.inputBorder}`}
                    style={isCustomTheme && resolvedStoryColors ? { borderColor: resolvedStoryColors.border } : {}}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold font-mono-code text-xs truncate">
                        {userProfile?.displayName || 'Thành viên'}
                      </p>
                      {canPost && (
                        <span 
                          className={`shrink-0 text-[10px] border px-1.5 py-0.5 font-bold font-mono-code uppercase ${
                            isCustomTheme 
                              ? '' 
                              : `${tone.buttonBg} ${tone.buttonBorder} ${tone.text}`
                          }`}
                          style={isCustomTheme && resolvedStoryColors ? {
                            backgroundColor: resolvedStoryColors.btnBg,
                            borderColor: resolvedStoryColors.btnBorder,
                            color: resolvedStoryColors.btnText,
                          } : {}}
                        >
                          Editor
                        </span>
                      )}
                    </div>
                    <p 
                      className={`text-[11px] truncate font-mono-code ${isCustomTheme ? '' : tone.textMuted}`}
                      style={isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {}}
                    >
                      {currentUser.email}
                    </p>
                    
                    {/* Wallet Balance & Streak Badge */}
                    <div 
                      className={`flex items-center justify-between p-1.5 border text-[11px] ${
                        isCustomTheme ? '' : `${tone.headerBg} ${tone.inputBorder}`
                      }`}
                      style={isCustomTheme && resolvedStoryColors ? { backgroundColor: resolvedStoryColors.bg, borderColor: resolvedStoryColors.border } : {}}
                    >
                      <div>
                        <span className="font-bold">{userProfile?.chucu || 0} Chucu</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#c89666]">
                        <Flame className="w-3 h-3 text-[#c89666]" />
                        <span>{userProfile?.streak || 0} ngày</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`p-2 border-b ${isCustomTheme ? '' : tone.inputBorder}`}
                    style={isCustomTheme && resolvedStoryColors ? { borderColor: resolvedStoryColors.border } : {}}
                  >
                    <p className="font-bold font-mono-code text-xs">Tài khoản Khách</p>
                    <p 
                      className={`text-[11px] font-mono-code ${isCustomTheme ? '' : tone.textMuted}`}
                      style={isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {}}
                    >
                      Chưa đăng nhập
                    </p>
                  </div>
                )}

                {/* Account Menu Actions */}
                <button
                  disabled={hasCheckedInToday}
                  onClick={() => {
                    if (hasCheckedInToday) return;
                    setShowUserMenu(false);
                    handleHeaderCheckIn();
                  }}
                  className={`w-full text-left px-2.5 py-2 flex items-center justify-between transition font-mono-code ${
                    hasCheckedInToday
                      ? 'opacity-60 cursor-not-allowed select-none'
                      : isCustomTheme ? 'hover:opacity-80 cursor-pointer' : tone.dropdownItemHover
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.iconColor}`} />
                    <span>Điểm danh nhận Chucu</span>
                  </div>
                  {hasCheckedInToday ? (
                    <span 
                      className={`text-[10px] font-bold ${isCustomTheme ? '' : tone.textMuted}`}
                      style={isCustomTheme && resolvedStoryColors ? { color: resolvedStoryColors.textMuted } : {}}
                    >
                      Đã điểm danh
                    </span>
                  ) : (
                    <span 
                      className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                        isCustomTheme ? '' : `${tone.buttonBg} ${tone.buttonBorder}`
                      }`}
                      style={customButtonStyle}
                    >
                      Nhận ngay
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('rankings');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 flex items-center justify-between transition font-mono-code ${
                    activeTab === 'rankings'
                      ? (isCustomTheme ? 'font-bold underline' : `${tone.dropdownActiveBg} font-bold`)
                      : (isCustomTheme ? 'hover:opacity-80' : tone.dropdownItemHover)
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.iconColor}`} />
                    <span>BXH Tấn Giang (JJWXC)</span>
                  </div>
                  <span 
                    className={`text-[9px] border px-1 py-0.5 uppercase font-bold text-amber-400 border-amber-500/30 bg-amber-500/10`}
                  >
                    Đam Mỹ
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('library');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 flex items-center justify-between transition font-mono-code ${
                    activeTab === 'library'
                      ? (isCustomTheme ? 'font-bold underline' : `${tone.dropdownActiveBg} font-bold`)
                      : (isCustomTheme ? 'hover:opacity-80' : tone.dropdownItemHover)
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.iconColor}`} />
                    <span>Truyện đã lưu</span>
                  </div>
                  <span 
                    className={`text-[10px] border px-1.5 py-0.5 ${
                      isCustomTheme ? '' : `${tone.headerBg} ${tone.inputBorder} ${tone.text}`
                    }`}
                    style={customInputStyle}
                  >
                    {bookmarkCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('studio');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 flex items-center gap-2 transition font-mono-code ${
                    activeTab === 'studio'
                      ? (isCustomTheme ? 'font-bold underline' : `${tone.dropdownActiveBg} font-bold`)
                      : (isCustomTheme ? 'hover:opacity-80' : tone.dropdownItemHover)
                  }`}
                >
                  <PlusCircle className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.iconColor}`} />
                  <span>Đăng truyện / Quản lý</span>
                </button>

                {currentUser && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettingsModal();
                    }}
                    className={`w-full text-left px-2.5 py-2 flex items-center gap-2 transition font-mono-code ${
                      isCustomTheme ? 'hover:opacity-80' : tone.dropdownItemHover
                    }`}
                  >
                    <Settings className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.iconColor}`} />
                    <span>Cài đặt tài khoản</span>
                  </button>
                )}

                <div 
                  className={`border-t pt-1 ${isCustomTheme ? '' : tone.inputBorder}`}
                  style={isCustomTheme && resolvedStoryColors ? { borderColor: resolvedStoryColors.border } : {}}
                >
                  {currentUser ? (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className={`w-full text-left px-2.5 py-2 flex items-center gap-2 transition font-mono-code ${
                        isCustomTheme ? 'hover:opacity-80 text-rose-400' : `${tone.dropdownItemHover} ${tone.iconColor}`
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal();
                      }}
                      className={`w-full text-left px-2.5 py-2 flex items-center gap-2 transition font-mono-code font-bold ${
                        isCustomTheme ? 'hover:opacity-80' : tone.dropdownItemHover
                      }`}
                    >
                      <LogIn className={`w-3.5 h-3.5 ${isCustomTheme ? '' : tone.iconColor}`} />
                      <span>Đăng nhập</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

