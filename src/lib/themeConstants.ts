export interface ThemeToken {
  name: string;
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  btnBg: string;
  btnSecondaryBg?: string;
  btnBorder: string;
  btnText: string;
  accentColor?: string;
}

export const PRESET_THEME_COLORS: Record<string, ThemeToken> = {
  'dark-rose': {
    name: 'Dark Rose (Hồng Đen)',
    bg: '#080406',
    cardBg: '#11090c',
    text: '#f2e6ea',
    textMuted: '#d0a0b0',
    border: '#2d1822',
    btnBg: '#2b1620',
    btnSecondaryBg: '#1c0f16',
    btnBorder: '#5e2f46',
    btnText: '#ffd6e2',
    accentColor: '#f472b6',
  },
  'choco-light': {
    name: 'Choco Light (Sô-cô-la Sữa)',
    bg: '#fcf8f5',
    cardBg: '#fffcf9',
    text: '#3d2314',
    textMuted: '#8c5e42',
    border: '#e8d5c8',
    btnBg: '#f0e2d8',
    btnSecondaryBg: '#f8f2ec',
    btnBorder: '#cbb3a3',
    btnText: '#3d2314',
    accentColor: '#7c3f1d',
  },
  'gradient-choco-light': {
    name: 'Gradient Choco Light (Kem Ca Cao Sáng)',
    bg: 'linear-gradient(135deg, #fffcfa 0%, #f7ebe1 50%, #ebd7c8 100%)',
    cardBg: 'linear-gradient(135deg, #ffffff 0%, #fcf5ee 100%)',
    text: '#3d2314',
    textMuted: '#8c5e42',
    border: '#d9beab',
    btnBg: '#e8d3c3',
    btnSecondaryBg: '#f7ebe1',
    btnBorder: '#cbb3a3',
    btnText: '#3d2314',
    accentColor: '#7c3f1d',
  },
  'classic-black': {
    name: 'Classic Black (Đen Tuyến)',
    bg: '#0a0a0a',
    cardBg: '#141414',
    text: '#f5f5f5',
    textMuted: '#a3a3a3',
    border: '#262626',
    btnBg: '#1f1f1f',
    btnSecondaryBg: '#171717',
    btnBorder: '#404040',
    btnText: '#ffffff',
    accentColor: '#f5f5f5',
  },
  'classic-white': {
    name: 'Classic White (Trắng Tinh Khôi)',
    bg: '#ffffff',
    cardBg: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    btnBg: '#f1f5f9',
    btnSecondaryBg: '#ffffff',
    btnBorder: '#cbd5e1',
    btnText: '#0f172a',
    accentColor: '#0284c7',
  },
  'dark-violet': {
    name: 'Dark Violet (Tím Đêm)',
    bg: '#06030a',
    cardBg: '#0f0817',
    text: '#f2e8f8',
    textMuted: '#b690d4',
    border: '#28153b',
    btnBg: '#28133b',
    btnSecondaryBg: '#1a0c27',
    btnBorder: '#562c7e',
    btnText: '#ebd6fb',
    accentColor: '#c084fc',
  },
  'navy-blue': {
    name: 'Navy Blue (Xanh Đêm)',
    bg: '#03080d',
    cardBg: '#08121d',
    text: '#e6eff8',
    textMuted: '#8dafcb',
    border: '#152a40',
    btnBg: '#13283e',
    btnSecondaryBg: '#0c1b2c',
    btnBorder: '#295480',
    btnText: '#cce2f8',
    accentColor: '#38bdf8',
  },
  'sepia': {
    name: 'Sepia (Giấy Cổ Điển)',
    bg: '#f4ecd8',
    cardBg: '#fcf8ed',
    text: '#4a3525',
    textMuted: '#8c7460',
    border: '#d3c29f',
    btnBg: '#e2d5b6',
    btnSecondaryBg: '#faf6eb',
    btnBorder: '#bca883',
    btnText: '#4a3525',
    accentColor: '#6d4c41',
  },
  'emerald': {
    name: 'Emerald (Xanh Ngọc Lục)',
    bg: '#06100c',
    cardBg: '#0b1a14',
    text: '#d1e7dd',
    textMuted: '#628f7a',
    border: '#153327',
    btnBg: '#163f2d',
    btnSecondaryBg: '#0e251c',
    btnBorder: '#2a6b4e',
    btnText: '#d1e7dd',
    accentColor: '#34d399',
  },
  'slate': {
    name: 'Slate (Xanh Đá Xám)',
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    btnBg: '#334155',
    btnSecondaryBg: '#1e293b',
    btnBorder: '#475569',
    btnText: '#f1f5f9',
    accentColor: '#60a5fa',
  },
  'classic-dark': {
    name: 'Classic Dark (Đen Nhám)',
    bg: '#0a0a0a',
    cardBg: '#121212',
    text: '#e5e5e5',
    textMuted: '#737373',
    border: '#242424',
    btnBg: '#262626',
    btnSecondaryBg: '#171717',
    btnBorder: '#404040',
    btnText: '#e5e5e5',
    accentColor: '#f5f5f5',
  },
  'cyberpunk': {
    name: 'Cyberpunk (Neon Tím)',
    bg: '#05000a',
    cardBg: '#0d001a',
    text: '#00ffff',
    textMuted: '#ff007f',
    border: '#ff007f',
    btnBg: '#1f0038',
    btnSecondaryBg: '#120021',
    btnBorder: '#00ffff',
    btnText: '#00ffff',
    accentColor: '#00ffff',
  },
  'forest-dark': {
    name: 'Forest Dark (Rừng Đêm)',
    bg: '#030805',
    cardBg: '#08140c',
    text: '#e8f5ec',
    textMuted: '#88b894',
    border: '#163320',
    btnBg: '#14301d',
    btnSecondaryBg: '#0d2113',
    btnBorder: '#2d633c',
    btnText: '#c9e8d1',
    accentColor: '#4ade80',
  },
  'warm-coffee': {
    name: 'Warm Coffee (Cà Phê Ấm)',
    bg: '#0a0705',
    cardBg: '#140f0a',
    text: '#f5eee6',
    textMuted: '#c4ad97',
    border: '#332417',
    btnBg: '#2e1f13',
    btnSecondaryBg: '#21160d',
    btnBorder: '#5c4129',
    btnText: '#fceee1',
    accentColor: '#d97706',
  },
  'gradient-rose': {
    name: 'Gradient Rose (Hồng Đen)',
    bg: 'linear-gradient(135deg, #4a1528 0%, #230b15 50%, #0c0408 100%)',
    cardBg: 'linear-gradient(135deg, #280c1b 0%, #1c0a13 100%)',
    text: '#fce7f0',
    textMuted: '#f4a6c1',
    border: '#682542',
    btnBg: '#521930',
    btnSecondaryBg: '#280c1b',
    btnBorder: '#832e55',
    btnText: '#ffc2d4',
    accentColor: '#f472b6',
  },
  'gradient-midnight': {
    name: 'Gradient Midnight (Đêm Tím)',
    bg: 'linear-gradient(135deg, #2e1065 0%, #160833 50%, #080314 100%)',
    cardBg: 'linear-gradient(135deg, #210f47 0%, #170b33 100%)',
    text: '#f3e8ff',
    textMuted: '#c084fc',
    border: '#581c87',
    btnBg: '#3b1278',
    btnSecondaryBg: '#210f47',
    btnBorder: '#7e22ce',
    btnText: '#e9d5ff',
    accentColor: '#c084fc',
  },
  'gradient-ocean': {
    name: 'Gradient Ocean (Đại Dương)',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #07273c 50%, #030d17 100%)',
    cardBg: 'linear-gradient(135deg, #0c273a 0%, #081d2c 100%)',
    text: '#e0f2fe',
    textMuted: '#38bdf8',
    border: '#0284c7',
    btnBg: '#0369a1',
    btnSecondaryBg: '#0c273a',
    btnBorder: '#38bdf8',
    btnText: '#bae6fd',
    accentColor: '#38bdf8',
  },
  'gradient-emerald': {
    name: 'Gradient Emerald (Ngọc Lục Bảo)',
    bg: 'linear-gradient(135deg, #064e3b 0%, #04291f 50%, #02120d 100%)',
    cardBg: 'linear-gradient(135deg, #0d3327 0%, #082119 100%)',
    text: '#ecfdf5',
    textMuted: '#34d399',
    border: '#059669',
    btnBg: '#047857',
    btnSecondaryBg: '#0d3327',
    btnBorder: '#10b981',
    btnText: '#a7f3d0',
    accentColor: '#34d399',
  },
  'gradient-sunset': {
    name: 'Gradient Sunset (Hoàng Hôn)',
    bg: 'linear-gradient(135deg, #681212 0%, #3b0914 50%, #120307 100%)',
    cardBg: 'linear-gradient(135deg, #380b15 0%, #24080e 100%)',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#9f1239',
    btnBg: '#881337',
    btnSecondaryBg: '#380b15',
    btnBorder: '#e11d48',
    btnText: '#fecdd3',
    accentColor: '#fb7185',
  },
  'gradient-cyber': {
    name: 'Gradient Cyber (Viễn Tưởng)',
    bg: 'linear-gradient(135deg, #581c87 0%, #2e0854 50%, #100220 100%)',
    cardBg: 'linear-gradient(135deg, #320a52 0%, #210638 100%)',
    text: '#fae8ff',
    textMuted: '#e879f9',
    border: '#a21caf',
    btnBg: '#7e22ce',
    btnSecondaryBg: '#320a52',
    btnBorder: '#c084fc',
    btnText: '#f5d0fe',
    accentColor: '#e879f9',
  },
  'gradient-gold': {
    name: 'Gradient Gold (Hoàng Gia Vàng)',
    bg: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #180801 100%)',
    cardBg: 'linear-gradient(135deg, #3d1703 0%, #290e02 100%)',
    text: '#fef3c7',
    textMuted: '#fbbf24',
    border: '#b45309',
    btnBg: '#92400e',
    btnSecondaryBg: '#3d1703',
    btnBorder: '#d97706',
    btnText: '#fef3c7',
    accentColor: '#fbbf24',
  },
  'gradient-cherry': {
    name: 'Gradient Cherry (Hoa Đào)',
    bg: 'linear-gradient(135deg, #831843 0%, #500724 50%, #1f020d 100%)',
    cardBg: 'linear-gradient(135deg, #42081f 0%, #2e0516 100%)',
    text: '#fce7f0',
    textMuted: '#f4a6c1',
    border: '#be185d',
    btnBg: '#9d174d',
    btnSecondaryBg: '#42081f',
    btnBorder: '#e11d48',
    btnText: '#ffe4e6',
    accentColor: '#f472b6',
  },
};

export interface ResolvedThemeColors {
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
  btnBg: string;
  btnSecondaryBg: string;
  btnBorder: string;
  btnText: string;
  accentColor?: string;
  isDark: boolean;
}

export function resolveStoryColors(story?: {
  themeTone?: string;
  customBgColor?: string;
  customCardBgColor?: string;
  customTextColor?: string;
  customTextMutedColor?: string;
  customBorderColor?: string;
  customBtnBgColor?: string;
  customBtnSecondaryBgColor?: string;
  customBtnTextColor?: string;
}): ResolvedThemeColors {
  if (!story) {
    const preset = PRESET_THEME_COLORS['dark-rose'];
    return {
      bg: preset.bg,
      cardBg: preset.cardBg,
      text: preset.text,
      textMuted: preset.textMuted,
      border: preset.border,
      btnBg: preset.btnBg,
      btnSecondaryBg: preset.btnSecondaryBg || preset.btnBg,
      btnBorder: preset.btnBorder,
      btnText: preset.btnText,
      accentColor: preset.accentColor,
      isDark: true,
    };
  }

  const toneKey = story.themeTone || 'dark-rose';
  const isCustom = toneKey === 'custom';
  const preset = PRESET_THEME_COLORS[toneKey] || PRESET_THEME_COLORS['dark-rose'];

  if (!isCustom) {
    return {
      bg: preset.bg,
      cardBg: preset.cardBg,
      text: preset.text,
      textMuted: preset.textMuted,
      border: preset.border,
      btnBg: preset.btnBg,
      btnSecondaryBg: preset.btnSecondaryBg || preset.btnBg,
      btnBorder: preset.btnBorder,
      btnText: preset.btnText,
      accentColor: preset.accentColor,
      isDark: !preset.bg.toLowerCase().includes('#fff') && !preset.bg.toLowerCase().includes('255, 255, 255') && !['classic-white', 'choco-light', 'sepia'].includes(toneKey),
    };
  }

  const bg = story.customBgColor || preset.bg;
  const cardBg = story.customCardBgColor || story.customBgColor || preset.cardBg;
  const text = story.customTextColor || preset.text;
  const textMuted = story.customTextMutedColor || story.customTextColor || preset.textMuted;
  const border = story.customBorderColor || preset.border;
  const btnBg = story.customBtnBgColor || story.customCardBgColor || story.customBgColor || preset.btnBg;
  const btnSecondaryBg = story.customBtnSecondaryBgColor || story.customCardBgColor || story.customBgColor || preset.btnSecondaryBg || preset.btnBg;
  const btnBorder = story.customBorderColor || border;
  const btnText = story.customBtnTextColor || story.customTextColor || text;

  return {
    bg,
    cardBg,
    text,
    textMuted,
    border,
    btnBg,
    btnSecondaryBg,
    btnBorder,
    btnText,
    accentColor: story.customTextColor || story.customBtnTextColor || text,
    isDark: !bg.toLowerCase().includes('#fff') && !bg.toLowerCase().includes('255, 255, 255') && !bg.toLowerCase().includes('#fcf') && !bg.toLowerCase().includes('#f8f') && !bg.toLowerCase().includes('#f4e'),
  };
}

export function resolveChapterColors(story?: {
  useSeparateChapterTheme?: boolean;
  themeTone?: string;
  customBgColor?: string;
  customCardBgColor?: string;
  customTextColor?: string;
  customTextMutedColor?: string;
  customBorderColor?: string;
  customBtnBgColor?: string;
  customBtnSecondaryBgColor?: string;
  customBtnTextColor?: string;
  chapterThemeTone?: string;
  chapterCustomBgColor?: string;
  chapterCustomCardBgColor?: string;
  chapterCustomTextColor?: string;
  chapterCustomTextMutedColor?: string;
  chapterCustomBorderColor?: string;
  chapterCustomBtnBgColor?: string;
  chapterCustomBtnSecondaryBgColor?: string;
  chapterCustomBtnTextColor?: string;
}): ResolvedThemeColors {
  if (!story) return resolveStoryColors();
  const hasSeparate = !!story.useSeparateChapterTheme;
  if (hasSeparate) {
    return resolveStoryColors({
      themeTone: story.chapterThemeTone || story.themeTone,
      customBgColor: story.chapterCustomBgColor || story.customBgColor,
      customCardBgColor: story.chapterCustomCardBgColor || story.customCardBgColor || story.chapterCustomBgColor || story.customBgColor,
      customTextColor: story.chapterCustomTextColor || story.customTextColor,
      customTextMutedColor: story.chapterCustomTextMutedColor || story.customTextMutedColor || story.chapterCustomTextColor || story.customTextColor,
      customBorderColor: story.chapterCustomBorderColor || story.customBorderColor,
      customBtnBgColor: story.chapterCustomBtnBgColor || story.customBtnBgColor,
      customBtnSecondaryBgColor: story.chapterCustomBtnSecondaryBgColor || story.customBtnSecondaryBgColor,
      customBtnTextColor: story.chapterCustomBtnTextColor || story.customBtnTextColor,
    });
  }
  return resolveStoryColors(story);
}
