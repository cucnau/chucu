import React from 'react';
import { Story } from '../types';
import { PRESET_THEME_COLORS } from './themeConstants';

export interface BorderStyleOption {
  value: NonNullable<Story['borderStyle']>;
  label: string;
  desc: string;
  category?: 'classic' | 'creative' | 'retro';
}

export interface BorderWidthOption {
  value: NonNullable<Story['borderWidth']>;
  label: string;
  widthPx: number;
}

export interface BorderRadiusOption {
  value: NonNullable<Story['borderRadius']>;
  label: string;
  desc: string;
}

export interface BorderCornerAccentOption {
  value: NonNullable<Story['borderCornerAccent']>;
  label: string;
  desc: string;
  category?: 'tech' | 'vintage' | 'cute' | 'craft';
}

export interface BorderGlowOption {
  value: NonNullable<Story['borderGlow']>;
  label: string;
  desc: string;
}

export const BORDER_STYLE_OPTIONS: BorderStyleOption[] = [
  { value: 'solid', label: 'Nét liền', desc: 'Đường nét thẳng chuẩn mực, tinh tế', category: 'classic' },
  { value: 'double', label: 'Viền đôi', desc: 'Hai đường song song sang trọng', category: 'classic' },
  { value: 'dashed', label: 'Nét đứt', desc: 'Nét đứt khúc thủ công ấn tượng', category: 'classic' },
  { value: 'dotted', label: 'Chấm bi tròn', desc: 'Hàng chấm tròn nhỏ tinh tế', category: 'classic' },
  { value: 'dash-dot', label: 'Gạch chấm xen kẽ', desc: 'Gạch dài xen kẽ chấm tròn thanh lịch', category: 'creative' },
  { value: 'wavy', label: 'Viền sóng dạt', desc: 'Đường sóng mềm mại uốn lượn tự nhiên', category: 'creative' },
  { value: 'scallop', label: 'Viền sò nhún mây', desc: 'Viền uốn các vỏ sò mây nhún bèo tròn', category: 'creative' },
  { value: 'curly', label: 'Viền xoắn ốc lò xo', desc: 'Đường nét cuộn tròn xoắn nối tiếp điệu đà', category: 'creative' },
  { value: 'hand-dashed', label: 'Viền sọc gạch vẽ tay', desc: 'Hàng gạch sọc đứt ngắn thủ công mộc mạc', category: 'creative' },
  { value: 'sketch', label: 'Nét vẽ tay', desc: 'Nét phác thảo uốn lượn tự nhiên', category: 'creative' },
  { value: 'stitched', label: 'Đường may chỉ', desc: 'Đường chỉ thêu viền cách mép cổ điển', category: 'creative' },
  { value: 'gradient', label: 'Viền dải màu chuyển sắc', desc: 'Dải màu chuyển động theo đúng góc bo', category: 'creative' },
  { value: 'stamp', label: 'Viền tem thư bưu chính', desc: 'Răng cưa viền tem bưu chính cổ điển', category: 'retro' },
  { value: 'film', label: 'Khung cuộn phim', desc: 'Hàng lỗ răng cưa cuộn phim điện ảnh', category: 'retro' },
  { value: 'groove', label: 'Rãnh chìm', desc: 'Đường rãnh khắc chìm có chiều sâu', category: 'classic' },
  { value: 'ridge', label: 'Sống nổi', desc: 'Gờ sống viền nổi tinh xảo', category: 'classic' },
  { value: 'offset', label: 'Viền đôi lệch tầng', desc: 'Hiệu ứng xếp lớp đa tầng nổi bật', category: 'creative' },
  { value: 'none', label: 'Không viền', desc: 'Tối giản hoàn toàn không đường viền', category: 'classic' },
];

export const BORDER_WIDTH_OPTIONS: BorderWidthOption[] = [
  { value: 'thin', label: 'Siêu mảnh - 1px', widthPx: 1 },
  { value: 'medium', label: 'Vừa vặn - 2px', widthPx: 2 },
  { value: 'thick', label: 'Dày rõ nét - 3px', widthPx: 3 },
  { value: 'heavy', label: 'Đậm đà - 4px', widthPx: 4 },
  { value: 'bold', label: 'Siêu đậm - 6px', widthPx: 6 },
  { value: 'frame', label: 'Khung tranh - 8px', widthPx: 8 },
];

export const BORDER_RADIUS_OPTIONS: BorderRadiusOption[] = [
  { value: 'none', label: 'Vuông vức', desc: 'Góc vuông sắc cạnh' },
  { value: 'xs', label: 'Bo vi mô', desc: 'Bo góc cực nhỏ 2px tinh tế' },
  { value: 'sm', label: 'Bo nhẹ', desc: 'Mềm mại thanh lịch 4px' },
  { value: 'md', label: 'Bo vừa', desc: 'Chuẩn giao diện hiện đại 8px' },
  { value: 'lg', label: 'Bo tròn lớn', desc: 'Mềm mại thân thiện 16px' },
  { value: 'xl', label: 'Bo siêu mềm', desc: 'Bo tròn mềm mại 24px' },
  { value: 'leaf', label: 'Góc lá chéo', desc: 'Bo 2 góc chéo bất đối xứng' },
  { value: 'chamfer', label: 'Vát góc', desc: 'Vát góc đa giác hình học' },
  { value: 'ticket', label: 'Khuyết góc vé', desc: 'Khuyết góc vé xem phim cổ điển' },
  { value: 'petal', label: 'Cánh hoa', desc: 'Dáng cánh hoa 1 góc nhọn mềm mại' },
  { value: 'tab', label: 'Thẻ kẹp trên', desc: 'Bo tròn phía trên dạng kẹp hồ sơ' },
];

export const BORDER_CORNER_ACCENT_OPTIONS: BorderCornerAccentOption[] = [
  { value: 'none', label: 'Không góc trang trí', desc: 'Viền thuần túy', category: 'tech' },
  { value: 'bow', label: 'Nơ ruy-băng 4 góc', desc: '4 nơ ruy-băng nhỏ xinh ở các góc', category: 'cute' },
  { value: 'ribbon-corner', label: 'Nơ ruy-băng uốn lượn góc', desc: 'Nơ góc kèm dải ruy-băng sóng rủ', category: 'cute' },
  { value: 'ribbon-top-bow', label: 'Nơ thắt chính giữa mép trên', desc: 'Nơ ruy-băng xinh xắn đính ở đỉnh khung', category: 'cute' },
  { value: 'brackets', label: 'Khung góc thước L', desc: 'Khung ngắm chữ L sắc nét ở 4 góc', category: 'tech' },
  { value: 'artdeco', label: 'Họa tiết Art Deco', desc: 'Họa tiết góc xếp tầng sang trọng', category: 'vintage' },
  { value: 'rivets', label: 'Đinh tán kim loại', desc: '4 chốt đinh ốc kim loại ở 4 góc', category: 'tech' },
  { value: 'dots', label: 'Chấm định vị', desc: '4 chấm tròn nhỏ tinh tế ở 4 góc', category: 'tech' },
  { value: 'crosshairs', label: 'Dấu chữ thập tâm điểm', desc: '4 dấu chữ thập giao điểm ở 4 góc', category: 'tech' },
  { value: 'washi', label: 'Băng dính dán góc', desc: 'Băng dính dán đè mép giấy tràn ra nền', category: 'craft' },
  { value: 'paperclip', label: 'Kẹp giấy kim loại', desc: 'Kẹp giấy văn phòng kẹp mép tràn ra nền sau', category: 'craft' },
];

export const BORDER_GLOW_OPTIONS: BorderGlowOption[] = [
  { value: 'none', label: 'Không hiệu ứng', desc: 'Màu viền nguyên bản' },
  { value: 'soft', label: 'Hào quang dịu', desc: 'Tỏa ánh sáng nhẹ nhàng êm mắt' },
  { value: 'neon', label: 'Phát sáng Neon', desc: 'Ánh sáng neon nổi bật' },
  { value: 'shadow', label: 'Đổ bóng khối', desc: 'Bóng khối cứng phong cách retro' },
  { value: 'soft-depth', label: 'Đổ bóng đa tầng', desc: 'Bóng mềm nhiều lớp có chiều sâu chân thực' },
  { value: 'gradient-aura', label: 'Hào quang chuyển sắc', desc: 'Vầng hào quang chuyển sắc rực rỡ' },
  { value: 'isometric', label: 'Khối nổi đa hướng', desc: 'Hiệu ứng gờ nổi khối đa chiều' },
];

function normalizeColor(color?: string, fallback = '#5e2f46'): string {
  if (!color || !color.trim()) return fallback;
  return color.trim();
}

const WIDTH_MAP: Record<string, string> = {
  thin: '1px',
  medium: '2px',
  thick: '3px',
  heavy: '4px',
  bold: '6px',
  frame: '8px',
};

/**
 * Trả về style object áp dụng cho thẻ / khung truyện
 */
export function getStoryBorderStyle(
  story?: Partial<Story>,
  fallbackBorderColor = '#2d1822'
): React.CSSProperties {
  if (!story) return {};

  const style: React.CSSProperties = {};
  const bStyle = story.borderStyle || 'solid';
  const bWidth = story.borderWidth || 'thin';
  const bRadius = story.borderRadius || 'none';
  const bGlow = story.borderGlow || 'none';
  const borderColor = normalizeColor(story.customBorderColor, fallbackBorderColor);
  const strokeWidth = WIDTH_MAP[bWidth] || '1px';

  // 1. Border Radius & Shape (Xác định trước để kết hợp mượt với mọi kiểu viền)
  if (bStyle === 'sketch') {
    // Khi chọn nét vẽ tay, mặc định luôn luôn là vuông vức (0px)
    style.borderRadius = '0px';
  } else if (bRadius === 'leaf') {
    style.borderRadius = '24px 4px 24px 4px';
  } else if (bRadius === 'chamfer') {
    style.borderRadius = '12px';
    style.clipPath = 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)';
  } else if (bRadius === 'ticket') {
    style.borderRadius = '10px';
    style.maskImage = 'radial-gradient(circle at top left, transparent 10px, black 10.5px), radial-gradient(circle at top right, transparent 10px, black 10.5px), radial-gradient(circle at bottom left, transparent 10px, black 10.5px), radial-gradient(circle at bottom right, transparent 10px, black 10.5px)';
    style.maskComposite = 'intersect';
  } else if (bRadius === 'petal') {
    style.borderRadius = '28px 28px 4px 28px';
  } else if (bRadius === 'tab') {
    style.borderRadius = '16px 16px 4px 4px';
  } else if (bRadius === 'xl') {
    style.borderRadius = '24px';
  } else if (bRadius === 'lg') {
    style.borderRadius = '16px';
  } else if (bRadius === 'md') {
    style.borderRadius = '8px';
  } else if (bRadius === 'sm') {
    style.borderRadius = '4px';
  } else if (bRadius === 'xs') {
    style.borderRadius = '2px';
  } else {
    style.borderRadius = '0px';
  }

  // 2. Border Style & Width
  if (bStyle === 'none') {
    style.border = 'none';
  } else if (bStyle === 'groove') {
    const grooveMap: Record<string, string> = { thin: '3px', medium: '4px', thick: '5px', heavy: '6px', bold: '8px', frame: '10px' };
    style.borderWidth = grooveMap[bWidth] || '3px';
    style.borderStyle = 'groove';
    style.borderColor = borderColor;
    style.boxShadow = `inset 2px 2px 4px rgba(0,0,0,0.45), inset -1px -1px 2px rgba(255,255,255,0.15)`;
  } else if (bStyle === 'ridge') {
    const ridgeMap: Record<string, string> = { thin: '3px', medium: '4px', thick: '5px', heavy: '6px', bold: '8px', frame: '10px' };
    style.borderWidth = ridgeMap[bWidth] || '3px';
    style.borderStyle = 'ridge';
    style.borderColor = borderColor;
    style.boxShadow = `2px 2px 5px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.2)`;
  } else if (bStyle === 'double') {
    const doubleMap: Record<string, string> = { thin: '3px', medium: '4px', thick: '5px', heavy: '6px', bold: '8px', frame: '10px' };
    style.borderWidth = doubleMap[bWidth] || '3px';
    style.borderStyle = 'double';
    style.borderColor = borderColor;
  } else if (bStyle === 'dotted') {
    // Chấm bi tròn to, rõ ràng và sắc nét
    const dottedWidth = bWidth === 'thin' ? '3px' : bWidth === 'medium' ? '4px' : bWidth === 'thick' ? '5px' : bWidth === 'heavy' ? '6px' : '8px';
    style.borderWidth = dottedWidth;
    style.borderStyle = 'dotted';
    style.borderColor = borderColor;
  } else if (bStyle === 'dashed') {
    // Nét đứt gạch nối rõ ràng
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
  } else if (bStyle === 'dash-dot') {
    // Gạch chấm xen kẽ thanh lịch
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `2px dotted ${borderColor}bb`;
    style.outlineOffset = `2px`;
  } else if (bStyle === 'sketch') {
    // Nét vẽ tay phác thảo tự nhiên - Vẫn giữ nguyên hiệu lực và đường nét vẽ phác thảo trên mọi kiểu bo góc
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `2.5px 1.5px 0px ${borderColor}99, -1.5px 2px 0px ${borderColor}77, 1px -1.5px 0px ${borderColor}55, inset 1px 1px 0px ${borderColor}33`;
  } else if (bStyle === 'stitched') {
    // Đường may chỉ khâu viền cách mép
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `1px solid ${borderColor}66`;
    style.outlineOffset = '3px';
  } else if (bStyle === 'gradient') {
    // Viền gradient 2 màu chuyển sắc rực rỡ từ Color1 đến Color2 theo đúng góc bo
    const color1 = borderColor;
    const color2 = normalizeColor(story.customBorderGradientColor2, '#ff6b9d');
    const toneConfig = story.themeTone ? PRESET_THEME_COLORS[story.themeTone] : undefined;
    const cardBg = story.customCardBgColor || story.customBgColor || toneConfig?.cardBg || toneConfig?.bg;
    const bgFill = cardBg
      ? (cardBg.startsWith('linear-gradient') ? cardBg : `linear-gradient(${cardBg}, ${cardBg})`)
      : 'linear-gradient(rgba(20, 10, 16, 0.95), rgba(20, 10, 16, 0.95))';

    const gWidth = strokeWidth === '1px' ? '2px' : strokeWidth;
    style.border = `${gWidth} solid transparent`;
    style.backgroundImage = `${bgFill}, linear-gradient(135deg, ${color1}, ${color2})`;
    style.backgroundOrigin = 'border-box';
    style.backgroundClip = 'padding-box, border-box';
  } else if (bStyle === 'stamp') {
    // Viền tem thư bưu chính: Răng cưa lỗ dập tem thư cổ điển quanh mép kèm khung chỉ viền trong
    style.borderWidth = strokeWidth;
    style.borderStyle = 'dashed';
    style.borderColor = borderColor;
    style.outline = `2px solid ${borderColor}77`;
    style.outlineOffset = '4px';
    style.boxShadow = `inset 0 0 0 2px ${borderColor}44, 0 0 0 7px ${borderColor}22, 0 4px 12px rgba(0,0,0,0.4)`;
  } else if (bStyle === 'film') {
    // Khung cuộn phim 35mm điện ảnh: Dải cuộn phim màu đen cổ điển sát mép trên/dưới bao ngoài thẻ
    style.borderLeft = `${strokeWidth} solid ${borderColor}`;
    style.borderRight = `${strokeWidth} solid ${borderColor}`;
    style.borderTop = 'none';
    style.borderBottom = 'none';
    style.paddingTop = '48px';
    style.paddingBottom = '48px';
    style.position = 'relative';
    style.overflow = 'hidden';
    style.boxShadow = `0 4px 14px rgba(0,0,0,0.35)`;
  } else if (bStyle === 'offset') {
    // Viền đôi lệch tầng
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = borderColor;
    style.boxShadow = `4px 4px 0px 0px ${borderColor}88, 7px 7px 0px 0px ${borderColor}44`;
  } else if (bStyle === 'wavy' || bStyle === 'scallop' || bStyle === 'curly' || bStyle === 'hand-dashed') {
    // Với các kiểu viền đồ họa đặc biệt, viền nét chính được vẽ sắc nét bằng SVG Overlay trong StoryCornerAccents
    style.borderWidth = strokeWidth;
    style.borderStyle = 'solid';
    style.borderColor = 'transparent';
  } else {
    style.borderStyle = bStyle;
    style.borderWidth = strokeWidth;
    style.borderColor = borderColor;
  }

  // 3. Border Glow / Shadow (Bỏ qua nếu là groove/ridge/offset vì đã có shadow chuyên biệt)
  if (bStyle !== 'groove' && bStyle !== 'ridge' && bStyle !== 'offset') {
    const existingShadow = style.boxShadow ? `${style.boxShadow}, ` : '';
    if (bGlow === 'soft') {
      style.boxShadow = `${existingShadow}0 0 16px ${borderColor}66, inset 0 0 8px ${borderColor}22`;
    } else if (bGlow === 'neon') {
      style.boxShadow = `${existingShadow}0 0 8px ${borderColor}, 0 0 24px ${borderColor}aa, inset 0 0 10px ${borderColor}55`;
    } else if (bGlow === 'shadow') {
      style.boxShadow = `${existingShadow}5px 5px 0px ${borderColor}`;
    } else if (bGlow === 'soft-depth') {
      style.boxShadow = `${existingShadow}0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 10px 20px -3px ${borderColor}44, 0 1px 3px 0 rgba(0, 0, 0, 0.2)`;
    } else if (bGlow === 'gradient-aura') {
      const glow1 = normalizeColor(story.customBorderGlowColor1, '#ff6b9d');
      const glow2 = normalizeColor(story.customBorderGlowColor2, '#38bdf8');
      style.boxShadow = `${existingShadow}0 0 20px ${glow1}66, 0 0 35px ${glow2}55, 0 0 50px ${borderColor}44`;
    } else if (bGlow === 'isometric') {
      style.boxShadow = `${existingShadow}3px 3px 0px ${borderColor}, 6px 6px 0px ${borderColor}66, 9px 9px 0px ${borderColor}22`;
    }
  }

  return style;
}

/**
 * Trả về style object áp dụng cho nút bấm (Button)
 */
export function getStoryButtonBorderStyle(
  story?: Partial<Story>,
  fallbackBorderColor = '#5e2f46'
): React.CSSProperties {
  if (!story) return {};

  const style: React.CSSProperties = {};
  const bStyle = story.borderStyle || 'solid';
  const bWidth = story.borderWidth || 'thin';
  const bRadius = story.borderRadius || 'none';
  const bGlow = story.borderGlow || 'none';
  const borderColor = normalizeColor(story.customBorderColor, fallbackBorderColor);

  if (bRadius === 'leaf') {
    style.borderRadius = '14px 3px 14px 3px';
  } else if (bRadius === 'petal') {
    style.borderRadius = '16px 16px 2px 16px';
  } else if (bRadius === 'tab') {
    style.borderRadius = '10px 10px 2px 2px';
  } else if (bRadius === 'xl') {
    style.borderRadius = '16px';
  } else if (bRadius === 'lg') {
    style.borderRadius = '12px';
  } else if (bRadius === 'md') {
    style.borderRadius = '6px';
  } else if (bRadius === 'sm') {
    style.borderRadius = '4px';
  } else if (bRadius === 'xs') {
    style.borderRadius = '2px';
  } else if (bStyle === 'sketch' && bRadius === 'none') {
    style.borderRadius = '255px 15px 225px 15px/15px 225px 15px 255px';
  } else {
    style.borderRadius = '0px';
  }

  if (bStyle === 'none') {
    style.border = 'none';
  } else if (bStyle === 'double') {
    style.borderWidth = '3px';
    style.borderStyle = 'double';
    style.borderColor = borderColor;
  } else if (bStyle === 'gradient') {
    // Với button: Áp dụng dải chuyển màu gradient 2 màu từ Color1 đến Color2
    const color1 = borderColor;
    const color2 = normalizeColor(story.customBorderGradientColor2, '#ff6b9d');
    const toneConfig = story.themeTone ? PRESET_THEME_COLORS[story.themeTone] : undefined;
    const btnBg = story.customBtnBgColor || story.customCardBgColor || story.customBgColor || toneConfig?.btnBg || toneConfig?.cardBg;
    const bgFill = btnBg
      ? (btnBg.startsWith('linear-gradient') ? btnBg : `linear-gradient(${btnBg}, ${btnBg})`)
      : 'linear-gradient(rgba(42, 17, 29, 0.95), rgba(42, 17, 29, 0.95))';

    style.border = '2px solid transparent';
    style.backgroundImage = `${bgFill}, linear-gradient(135deg, ${color1}, ${color2})`;
    style.backgroundOrigin = 'border-box';
    style.backgroundClip = 'padding-box, border-box';
  } else {
    style.borderStyle = (bStyle === 'sketch' || bStyle === 'film' || bStyle === 'offset') ? 'solid' : (bStyle === 'stitched' || bStyle === 'dash-dot') ? 'dashed' : bStyle;
    style.borderWidth = bWidth === 'frame' || bWidth === 'bold' ? '3px' : bWidth === 'heavy' ? '2px' : '1px';
    style.borderColor = borderColor;
  }

  if (bGlow === 'soft') {
    style.boxShadow = `0 0 8px ${borderColor}44`;
  } else if (bGlow === 'neon') {
    style.boxShadow = `0 0 5px ${borderColor}, 0 0 12px ${borderColor}77`;
  } else if (bGlow === 'shadow') {
    style.boxShadow = `2px 2px 0px ${borderColor}`;
  } else if (bGlow === 'soft-depth') {
    style.boxShadow = `0 3px 6px ${borderColor}44`;
  } else if (bGlow === 'gradient-aura') {
    const glow1 = normalizeColor(story.customBorderGlowColor1, '#ff6b9d');
    const glow2 = normalizeColor(story.customBorderGlowColor2, '#38bdf8');
    style.boxShadow = `0 0 10px ${glow1}55, 0 0 15px ${glow2}44`;
  } else if (bGlow === 'isometric') {
    style.boxShadow = `2px 2px 0px ${borderColor}, 4px 4px 0px ${borderColor}55`;
  }

  return style;
}

/**
 * Component hiển thị họa tiết trang trí 4 góc viền
 */
export const StoryCornerAccents: React.FC<{
  accent?: Story['borderCornerAccent'];
  borderStyle?: string;
  borderColor?: string;
  color?: string;
  className?: string;
}> = ({ accent = 'none', borderStyle, borderColor, color, className = '' }) => {
  if (borderStyle === 'sketch') return null;
  const isFilm = borderStyle === 'film';
  const isGraphicBorder = borderStyle === 'wavy' || borderStyle === 'scallop' || borderStyle === 'curly' || borderStyle === 'hand-dashed';
  const hasAccent = accent && accent !== 'none';

  if (!hasAccent && !isFilm && !isGraphicBorder) return null;

  const accentColor = color || borderColor || '#1a1a1a';

  // 1. Film Sprockets Overlay
  const filmSprocketsOverlay = isFilm ? (
    <div 
      className="pointer-events-none z-10 overflow-hidden rounded-[inherit]"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none',
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30px',
          backgroundColor: '#0d0d0d',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='30'%3E%3Crect width='16' height='30' fill='%230d0d0d'/%3E%3Crect x='3' y='5.5' width='10' height='19' rx='3' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          borderBottom: '2px solid rgba(0,0,0,0.9)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30px',
          backgroundColor: '#0d0d0d',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='30'%3E%3Crect width='16' height='30' fill='%230d0d0d'/%3E%3Crect x='3' y='5.5' width='10' height='19' rx='3' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          borderTop: '2px solid rgba(0,0,0,0.9)',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  ) : null;

  // 2. Graphic Border Overlay (Viền đồ họa SVG)
  let graphicBorderOverlay: React.ReactNode = null;
  if (borderStyle === 'wavy') {
    graphicBorderOverlay = (
      <svg className="pointer-events-none absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path
          d="M 4,4 Q 16,-2 28,4 T 52,4 T 76,4 T 96,4 Q 102,16 96,28 T 96,52 T 96,76 T 96,96 Q 84,102 72,96 T 48,96 T 24,96 T 4,96 Q -2,84 4,72 T 4,48 T 4,24 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  } else if (borderStyle === 'scallop') {
    graphicBorderOverlay = (
      <svg className="pointer-events-none absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path
          d="M 4,4 C 7,1 11,1 14,4 C 17,1 21,1 24,4 C 27,1 31,1 34,4 C 37,1 41,1 44,4 C 47,1 51,1 54,4 C 57,1 61,1 64,4 C 67,1 71,1 74,4 C 77,1 81,1 84,4 C 87,1 91,1 94,4 C 98,7 98,11 94,14 C 98,17 98,21 94,24 C 98,27 98,31 94,34 C 98,37 98,41 94,44 C 98,47 98,51 94,54 C 98,57 98,61 94,64 C 98,67 98,71 94,74 C 98,77 98,81 94,84 C 98,87 98,91 94,94 C 91,98 87,98 84,94 C 81,98 77,98 74,94 C 71,98 67,98 64,94 C 61,98 57,98 54,94 C 51,98 47,98 44,94 C 41,98 37,98 34,94 C 31,98 27,98 24,94 C 21,98 17,98 14,94 C 11,98 7,98 4,94 C 1,91 1,87 4,84 C 1,81 1,77 4,74 C 1,71 1,67 4,64 C 1,61 1,57 4,54 C 1,51 1,47 4,44 C 1,41 1,37 4,34 C 1,31 1,27 4,24 C 1,21 1,17 4,14 C 1,11 1,7 4,4 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  } else if (borderStyle === 'curly') {
    graphicBorderOverlay = (
      <svg className="pointer-events-none absolute -inset-[2px] w-[calc(100%+4px)] h-[calc(100%+4px)] overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path
          d="M 5,5 C 10,-3 15,13 20,5 C 25,-3 30,13 35,5 C 40,-3 45,13 50,5 C 55,-3 60,13 65,5 C 70,-3 75,13 80,5 C 85,-3 90,13 95,5 C 103,10 87,15 95,20 C 103,25 87,30 95,35 C 103,40 87,45 95,50 C 103,55 87,60 95,65 C 103,70 87,75 95,80 C 103,85 87,90 95,95 C 90,103 85,87 80,95 C 75,103 70,87 65,95 C 60,103 55,87 50,95 C 45,103 40,87 35,95 C 30,103 25,87 20,95 C 15,103 10,87 5,95 C -3,90 13,85 5,80 C -3,75 13,70 5,65 C -3,60 13,55 5,50 C -3,45 13,40 5,35 C -3,30 13,25 5,20 C -3,15 13,10 5,5 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  } else if (borderStyle === 'hand-dashed') {
    graphicBorderOverlay = (
      <svg className="pointer-events-none absolute -inset-[3px] w-[calc(100%+6px)] h-[calc(100%+6px)] overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        <rect
          x="3" y="3" width="94" height="94" rx="2"
          fill="none"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeDasharray="1.5 3.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="4.5" y="4.5" width="91" height="91" rx="2"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // 3. Accent Content (Họa tiết trang trí góc / nơ)
  let accentContent: React.ReactNode = null;

  if (accent === 'bow') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        <div className="absolute -top-3 -left-3 rotate-[-15deg] filter drop-shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 16 16 C 9 7 3 10 5 15 C 7 19 14 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <path d="M 16 16 C 23 7 29 10 27 15 C 25 19 18 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <circle cx="16" cy="16" r="2.5" fill={accentColor} />
            <path d="M 15 17.5 C 11 23 13 27 8 30" strokeWidth="2" />
            <path d="M 17 17.5 C 21 23 19 27 24 30" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute -top-3 -right-3 rotate-[15deg] filter drop-shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 16 16 C 9 7 3 10 5 15 C 7 19 14 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <path d="M 16 16 C 23 7 29 10 27 15 C 25 19 18 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <circle cx="16" cy="16" r="2.5" fill={accentColor} />
            <path d="M 15 17.5 C 11 23 13 27 8 30" strokeWidth="2" />
            <path d="M 17 17.5 C 21 23 19 27 24 30" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute -bottom-3 -left-3 rotate-[15deg] filter drop-shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 16 16 C 9 7 3 10 5 15 C 7 19 14 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <path d="M 16 16 C 23 7 29 10 27 15 C 25 19 18 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <circle cx="16" cy="16" r="2.5" fill={accentColor} />
            <path d="M 15 17.5 C 11 23 13 27 8 30" strokeWidth="2" />
            <path d="M 17 17.5 C 21 23 19 27 24 30" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute -bottom-3 -right-3 rotate-[-15deg] filter drop-shadow-sm">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 16 16 C 9 7 3 10 5 15 C 7 19 14 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <path d="M 16 16 C 23 7 29 10 27 15 C 25 19 18 17 16 16 Z" fill={accentColor} fillOpacity="0.25" />
            <circle cx="16" cy="16" r="2.5" fill={accentColor} />
            <path d="M 15 17.5 C 11 23 13 27 8 30" strokeWidth="2" />
            <path d="M 17 17.5 C 21 23 19 27 24 30" strokeWidth="2" />
          </svg>
        </div>
      </div>
    );
  } else if (accent === 'ribbon-corner') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        <div className="absolute -top-2 -left-2 w-28 h-28 pointer-events-none filter drop-shadow-sm">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 32 18 Q 50 8, 68 18 T 105 18" strokeWidth="2.2" />
            <path d="M 18 32 Q 8 50, 18 68 T 18 105" strokeWidth="2.2" />
            <path d="M 22 22 C 12 11 5 17 9 26 C 13 32 20 26 22 22 Z" fill={accentColor} fillOpacity="0.25" />
            <path d="M 22 22 C 32 11 39 17 35 26 C 31 32 24 26 22 22 Z" fill={accentColor} fillOpacity="0.25" />
            <circle cx="22" cy="22" r="3.2" fill={accentColor} />
            <path d="M 21 25 C 16 35 20 46 13 56" strokeWidth="2.2" />
            <path d="M 25 21 C 35 16 46 20 56 13" strokeWidth="2.2" />
          </svg>
        </div>
      </div>
    );
  } else if (accent === 'ribbon-top-bow') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none filter drop-shadow-sm">
          <svg width="56" height="36" viewBox="0 0 56 36" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 28 16 C 18 5 8 9 11 18 C 14 25 23 20 28 16 Z" fill={accentColor} fillOpacity="0.25" />
            <path d="M 28 16 C 38 5 48 9 45 18 C 42 25 33 20 28 16 Z" fill={accentColor} fillOpacity="0.25" />
            <circle cx="28" cy="16" r="3" fill={accentColor} />
            <path d="M 26 18 C 21 25 23 30 16 34" strokeWidth="2" />
            <path d="M 30 18 C 35 25 33 30 40 34" strokeWidth="2" />
          </svg>
        </div>
      </div>
    );
  } else if (accent === 'brackets') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5" style={{ borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5" style={{ borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5" style={{ borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5" style={{ borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
      </div>
    );
  } else if (accent === 'artdeco') {
    const dim = 30;
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute top-1 left-1">
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute top-1 right-1" style={{ transform: 'scaleX(-1)' }}>
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute bottom-1 left-1" style={{ transform: 'scaleY(-1)' }}>
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
        <svg width={dim} height={dim} viewBox="0 0 32 32" fill="none" stroke={accentColor} strokeWidth="1.5" className="absolute bottom-1 right-1" style={{ transform: 'scale(-1, -1)' }}>
          <path d="M2 2 H30 M2 2 V30 M6 6 H24 M6 6 V24 M10 10 H18 M10 10 V18" />
          <polygon points="2,2 10,2 2,10" fill={accentColor} opacity="0.3" />
        </svg>
      </div>
    );
  } else if (accent === 'washi') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        <div
          className="absolute -top-3.5 -left-5.5 w-16 h-6 opacity-90 shadow-md transform -rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 15%, 4% 0%, 8% 18%, 12% 2%, 96% 0%, 100% 18%, 97% 85%, 100% 100%, 94% 88%, 90% 98%, 0% 100%)',
          }}
        />
        <div
          className="absolute -top-3.5 -right-5.5 w-16 h-6 opacity-90 shadow-md transform rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 0%, 96% 2%, 100% 15%, 97% 85%, 100% 100%, 8% 100%, 4% 85%, 0% 100%, 3% 85%, 0% 15%)',
          }}
        />
        <div
          className="absolute -bottom-3.5 -left-5.5 w-16 h-6 opacity-90 shadow-md transform rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 15%, 4% 0%, 8% 18%, 12% 2%, 96% 0%, 100% 18%, 97% 85%, 100% 100%, 94% 88%, 90% 98%, 0% 100%)',
          }}
        />
        <div
          className="absolute -bottom-3.5 -right-5.5 w-16 h-6 opacity-90 shadow-md transform -rotate-28 border border-white/25"
          style={{
            backgroundColor: accentColor,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
            clipPath: 'polygon(0% 0%, 96% 2%, 100% 15%, 97% 85%, 100% 100%, 8% 100%, 4% 85%, 0% 100%, 3% 85%, 0% 15%)',
          }}
        />
      </div>
    );
  } else if (accent === 'paperclip') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 z-20 ${className}`}>
        <div className="absolute -top-5.5 left-8 rotate-12 filter drop-shadow-lg">
          <svg width="28" height="46" viewBox="0 0 28 46" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14 V32 C10 38 20 38 20 32 V8 C20 2 4 2 4 10 V34 C4 44 24 44 24 34 V16" />
          </svg>
        </div>
        <div className="absolute -top-5.5 right-8 -rotate-12 filter drop-shadow-lg">
          <svg width="28" height="46" viewBox="0 0 28 46" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14 V32 C10 38 20 38 20 32 V8 C20 2 4 2 4 10 V34 C4 44 24 44 24 34 V16" />
          </svg>
        </div>
      </div>
    );
  } else if (accent === 'rivets') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 rotate-45" />
        </div>
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 -rotate-45" />
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 -rotate-45" />
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-black/60 shadow-xs flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <div className="w-[65%] h-[1px] bg-black/70 rotate-45" />
        </div>
      </div>
    );
  } else if (accent === 'dots') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: accentColor }} />
      </div>
    );
  } else if (accent === 'crosshairs') {
    accentContent = (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-1.5 left-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="absolute top-1.5 right-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 flex items-center justify-center">
          <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: accentColor }} />
          <div className="absolute h-full w-[1.5px]" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {filmSprocketsOverlay}
      {graphicBorderOverlay}
      {accentContent}
    </>
  );
};
