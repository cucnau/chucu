export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string; // Nội dung chữ
  views: number;
  createdAt: string;
  updatedAt: string;
  isLocked?: boolean; // Chương có bị khóa Chucu không
  unlockPrice?: number; // Số Chucu cần để mở khóa (mặc định min 1 nếu khóa, ví dụ 1, 2, 5...)
  isPasswordProtected?: boolean; // Chương có đặt mật khẩu (Pass) không
  password?: string; // Mật khẩu đọc chương
  passwordHint?: string; // Gợi ý câu hỏi / pass
  unlockMode?: 'and' | 'or'; // 'and': Bắt buộc mở cả 2 (Chucu + Pass), 'or': Chỉ cần mở 1 trong 2 (Chucu HOẶC Pass)
  volumeTitle?: string; // Tên phần / quyển / ngắt phần (ví dụ: "Quyển 1: Đêm đông sống lại")
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId?: string;
  paragraphIndex?: number;
  paragraphSnippet?: string;
  userName: string;
  userUid?: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
  parentCommentId?: string; // ID của bình luận cha nếu đây là phản hồi (reply)
  parentCommentAuthorUid?: string; // UID của người được phản hồi để gửi thông báo
  reactions?: Record<string, string[]>; // Map emojiId -> list of user uids who reacted
}

export interface Notification {
  id: string;
  userId: string; // Người nhận thông báo (UID)
  title: string;
  content: string;
  type: 'new_chapter' | 'new_comment' | 'reply_comment';
  storyId: string;
  chapterId?: string;
  chapterNumber?: number;
  paragraphIndex?: number;
  commentId?: string;
  senderName: string;
  senderPhoto?: string;
  isRead: boolean;
  createdAt: string; // ISOString
}

export interface CharacterInfo {
  id: string;
  name: string;
  role?: string; // Tùy chọn: Nam chính, Nữ chính, Phản diện, Sư phụ, v.v.
  avatarUrl?: string; // Tùy chọn: URL ảnh đại diện nhân vật
  avatarShape?: 'circle' | 'square' | 'portrait_34' | 'portrait_23' | 'landscape_43' | 'landscape_169'; // Tỉ lệ/hình dáng ảnh nhân vật riêng
  description?: string; // Tùy chọn: Mô tả ngắn nhân vật
}

export interface StoryGalleryImage {
  id: string;
  url: string;
  caption?: string; // Chú thích cho từng ảnh
}

export interface StoryGalleryWidget {
  id: string; // ID duy nhất của widget (ví dụ: 'gw_1', 'gallery_widget', ...)
  title?: string; // Tiêu đề ô Widget ảnh/album (ví dụ: "Bìa đặc biệt", "Album Fanart", "Ảnh minh họa")
  mode: 'single' | 'album'; // 'single' (Ảnh lẻ) | 'album' (Album dải ảnh di chuyển)
  singleImageUrl?: string; // Đường dẫn ảnh lẻ / GIF
  singleImageCaption?: string; // Chú thích cho ảnh lẻ
  images?: StoryGalleryImage[]; // Danh sách các ảnh trong album
  autoScrollSpeed?: 'slow' | 'normal' | 'fast'; // Tốc độ di chuyển dải album
  imageSize?: number; // Kích thước hiển thị widget ảnh (%) từ 20 đến 100
  enabled?: boolean; // Bật/tắt riêng từng widget (mặc định true)
}

export interface StoryElement {
  id: string;
  imageUrl: string;
  name?: string;
  x: number; // Tọa độ ngang (% từ 0 đến 100 theo chiều rộng khung truyện)
  y: number; // Tọa độ dọc (% từ 0 đến 100 theo chiều cao khung truyện)
  width: number; // Chiều rộng (pixel, từ 20 đến 500)
  height?: number; // Chiều cao (pixel hoặc tự động)
  rotation?: number; // Góc xoay (độ, từ -180 đến 180)
  opacity?: number; // Độ mờ đục (từ 0.1 đến 1)
  zIndex?: number; // Thứ tự lớp hiển thị (từ 1 đến 50)
  flipHorizontal?: boolean; // Lật ảnh theo chiều ngang
  animation?: 'none' | 'float' | 'spin' | 'pulse' | 'bounce' | 'wiggle'; // Hiệu ứng chuyển động của element
}

export interface StoryTheme {
  id: string;
  name: string; // Tên theme (ví dụ: "Theme Mặc Định", "Theme Mùa Hè", "Theme Giáng Sinh", "Theme U Tối")
  description?: string; // Mô tả ngắn về theme
  coverUrl?: string; // Bìa truyện riêng cho theme này
  synopsis?: string; // Tóm tắt / Lời tựa riêng cho theme này
  
  // Màu sắc & Font
  themeTone?: string;
  defaultFont?: string;
  customTitleFont?: string;
  customChapterTitleFont?: string;
  customSubtitleFont?: string;
  customBodyFont?: string;
  customMutedFont?: string;
  customBtnFont?: string;
  titleFontSize?: string;
  bodyFontSize?: string;
  customBgColor?: string;
  customCardBgColor?: string;
  customTextColor?: string;
  customTextMutedColor?: string;
  customBorderColor?: string;
  customBtnBgColor?: string;
  customBtnTextColor?: string;
  customBtnSecondaryBgColor?: string;
  chapterCustomBtnTextColor?: string;

  // Viền & Hiệu ứng
  borderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'dash-dot' | 'sketch' | 'stitched' | 'gradient' | 'stamp' | 'film' | 'groove' | 'ridge' | 'offset' | 'wavy' | 'scallop' | 'curly' | 'hand-dashed' | 'none';
  borderWidth?: 'thin' | 'medium' | 'thick' | 'heavy' | 'bold' | 'frame';
  borderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'leaf' | 'chamfer' | 'ticket' | 'petal' | 'tab';
  borderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs' | 'washi' | 'sparkle' | 'heart' | 'botanical' | 'artdeco' | 'bow' | 'ribbon-corner' | 'ribbon-top-bow' | 'paperclip';
  borderGlow?: 'none' | 'soft' | 'neon' | 'shadow' | 'soft-depth' | 'gradient-aura' | 'isometric';
  customBorderGradientColor2?: string;
  customBorderGlowColor1?: string;
  customBorderGlowColor2?: string;

  readingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo' | 'fireworks' | 'fire_sparks' | 'sci_fi_hud' | 'fruits' | 'ocean' | 'butterflies' | 'feathers' | 'lightning' | 'fog';
  readingEffectColor?: string;

  chapterListStyle?: 'standard' | 'grid' | 'accordion' | 'timeline' | 'minimal_table' | 'book_catalog' | 'scroll_strip' | 'cards_bento' | 'modern_compact' | 'numbers_only';
  storyElements?: StoryElement[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Story {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  authorUid?: string; // UID của Editor/Tác giả sở hữu truyện
  authorEmail?: string; // Email của Editor/Tác giả sở hữu truyện
  editorName?: string; // Tên hiển thị của Editor
  editorPhoto?: string; // Ảnh đại diện của Editor
  synopsis: string; // Tóm tắt bài / truyện
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Đa dạng Theme tùy chỉnh cho bộ truyện
  storyThemes?: StoryTheme[]; // Danh sách các Theme do Editor thiết kế riêng cho truyện
  activeThemeId?: string; // ID của Theme chính được chọn hiển thị cho độc giả

  themeTone?: string; // Tông màu truyện ('dark-rose' | 'choco-light' | 'gradient-choco-light' | 'sepia' | 'emerald' | 'slate' | 'classic-dark' | 'gradient-rose' | 'gradient-midnight' | 'gradient-ocean' | 'gradient-emerald' | 'gradient-sunset' | 'gradient-cyber' | 'custom')
  defaultFont?: string; // Font chữ mặc định của truyện
  customTitleFont?: string; // Font chữ cho tiêu đề truyện
  customChapterTitleFont?: string; // Font chữ cho tiêu đề chương
  customSubtitleFont?: string; // Font chữ cho tiêu đề phụ/Tiêu đề widget (tên quyển, tiêu đề widget, v.v.)
  customBodyFont?: string; // Font chữ cho nội dung / chữ thường
  customMutedFont?: string; // Font chữ phụ / chú thích / tác giả / ngày tháng
  customBtnFont?: string; // Font chữ cho các nút bấm / huy hiệu / nhãn trạng thái
  titleFontSize?: string; // Cỡ chữ tiêu đề truyện (ví dụ: '18px', '20px', '24px', '28px', '32px')
  bodyFontSize?: string; // Cỡ chữ nội dung / tóm tắt / danh sách chương (ví dụ: '12px', '14px', '16px', '18px')
  customBgColor?: string; // Màu nền trang đọc truyện (Màu đơn hoặc Gradient CSS)
  customCardBgColor?: string; // Màu nền khung truyện/thẻ truyện (Màu đơn hoặc Gradient CSS)
  customTextColor?: string; // Màu chữ chính
  customTextMutedColor?: string; // Màu chữ phụ/nhỏ
  customBorderColor?: string; // Màu đường viền khung
  customBtnBgColor?: string; // Màu nền nút bấm chính (Màu đơn hoặc Gradient CSS)
  customBtnTextColor?: string; // Màu chữ trên nút bấm chính
  customBtnSecondaryBgColor?: string; // Màu nền nút phụ / ô editor / danh sách chương (Màu đơn hoặc Gradient CSS)
  tags?: string[]; // Danh sách các tag thể loại của truyện

  // Widget thông tin nhân vật (Character Info Widget)
  showCharacterWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget nhân vật
  characterWidgetTitle?: string; // Tiêu đề ô Widget (Mặc định: "Thông tin nhân vật")
  characterAvatarShape?: 'circle' | 'square' | 'portrait_34' | 'portrait_23' | 'landscape_43' | 'landscape_169'; // Hình dáng / tỉ lệ khung ảnh nhân vật chung
  characters?: CharacterInfo[]; // Danh sách các nhân vật trong widget

  // Widget tiến độ truyện (Story Progress Widget)
  showProgressWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget tiến độ
  progressWidgetTitle?: string; // Tiêu đề ô Widget (Mặc định: "Tiến độ hoàn thành" hoặc "Tiến độ bộ truyện")
  totalPlannedChapters?: number; // Tổng số chương dự kiến của bộ truyện

  // Widget nội dung tùy chỉnh (Custom Content Widget)
  showCustomWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget tùy chỉnh
  customWidgetTitle?: string; // Tiêu đề ô Widget tự đặt
  customWidgetContent?: string; // Nội dung ô Widget tự viết

  // Widget ảnh lẻ / Album ảnh di chuyển (Gallery / Single Image / Moving Album Widget)
  showGalleryWidget?: boolean; // Editor chọn bật/tắt hiển thị Widget ảnh lẻ / album
  galleryWidgetTitle?: string; // Tiêu đề ô Widget ảnh/album
  galleryMode?: 'single' | 'album'; // Kiểu: 'single' (Ảnh lẻ) | 'album' (Album dải ảnh di chuyển)
  gallerySingleImageUrl?: string; // Đường dẫn ảnh lẻ
  gallerySingleImageCaption?: string; // Chú thích cho ảnh lẻ
  images?: StoryGalleryImage[]; // Dữ liệu phụ
  galleryImages?: StoryGalleryImage[]; // Danh sách các ảnh trong album
  galleryAutoScrollSpeed?: 'slow' | 'normal' | 'fast';
  galleryImageSize?: number; // Kích thước hiển thị widget ảnh (%) 
  galleryWidgets?: StoryGalleryWidget[]; // Danh sách nhiều Widget ảnh / Album độc lập do Editor tạo thêm tùy ý

  // Các Element / Sticker / Họa tiết trang trí tự do trên trang truyện
  storyElements?: StoryElement[];

  // Kiểu trình bày danh sách chương (Chapter List Display Style)
  chapterListStyle?: 'standard' | 'grid' | 'accordion' | 'timeline' | 'minimal_table' | 'book_catalog' | 'scroll_strip' | 'cards_bento' | 'modern_compact' | 'numbers_only';

  // Tùy chỉnh Bố cục & Thứ tự các phân đoạn trong trang truyện (Story Sections & Block Reordering)
  storyLayoutSections?: StoryLayoutSection[]; // Danh sách các phân đoạn (hàng 1 cột hoặc 2 cột linh hoạt)
  storyLayoutMode?: StoryLayoutMode; // Dữ liệu cũ để tương thích ngược
  storyLayoutLeft?: StoryLayoutBlockId[]; // Dữ liệu cũ để tương thích ngược
  storyLayoutRight?: StoryLayoutBlockId[]; // Dữ liệu cũ để tương thích ngược
  storyLayoutBottom?: StoryLayoutBlockId[]; // Dữ liệu cũ để tương thích ngược
  storyLayoutOrder?: StoryLayoutBlockId[]; // Dữ liệu cũ để tương thích ngược

  readingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo' | 'fireworks' | 'fire_sparks' | 'sci_fi_hud' | 'fruits' | 'ocean' | 'butterflies' | 'feathers' | 'lightning' | 'fog'; // Hiệu ứng đọc truyện
  readingEffectColor?: string; // Tùy chỉnh màu sắc cho hiệu ứng (đặc biệt là Sci-Fi HUD)
  borderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'dash-dot' | 'sketch' | 'stitched' | 'gradient' | 'stamp' | 'film' | 'groove' | 'ridge' | 'offset' | 'wavy' | 'scallop' | 'curly' | 'hand-dashed' | 'none'; // Kiểu nét đường viền
  borderWidth?: 'thin' | 'medium' | 'thick' | 'heavy' | 'bold' | 'frame'; // Độ dày đường viền
  borderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'leaf' | 'chamfer' | 'ticket' | 'petal' | 'tab'; // Kiểu bo góc viền đa dạng
  borderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs' | 'washi' | 'sparkle' | 'heart' | 'botanical' | 'artdeco' | 'bow' | 'ribbon-corner' | 'ribbon-top-bow' | 'paperclip'; // Trang trí góc viền nghệ thuật
  borderGlow?: 'none' | 'soft' | 'neon' | 'shadow' | 'soft-depth' | 'gradient-aura' | 'isometric'; // Hiệu ứng phát sáng / đổ bóng viền
  customBorderGradientColor2?: string; // Màu thứ 2 cho Viền Gradient đa sắc
  customBorderGlowColor1?: string; // Màu thứ 1 cho Hào quang Gradient
  customBorderGlowColor2?: string; // Màu thứ 2 cho Hào quang Gradient
  
  // Tách biệt theme chương và truyện riêng biệt
  chapterCount?: number;
  useSeparateChapterTheme?: boolean;
  useSeparateChapterEffect?: boolean; // Tách biệt hiệu ứng hạt rơi giữa trang truyện và đọc chương
  chapterThemeTone?: string;
  chapterCustomBgColor?: string;
  chapterCustomCardBgColor?: string;
  chapterCustomTextColor?: string;
  chapterCustomTextMutedColor?: string;
  chapterCustomBorderColor?: string;
  chapterCustomBtnBgColor?: string;
  chapterCustomBtnTextColor?: string;
  chapterCustomBtnSecondaryBgColor?: string;
  chapterBorderStyle?: 'solid' | 'double' | 'dashed' | 'dotted' | 'dash-dot' | 'sketch' | 'stitched' | 'gradient' | 'stamp' | 'film' | 'groove' | 'ridge' | 'offset' | 'wavy' | 'scallop' | 'curly' | 'hand-dashed' | 'none';
  chapterBorderWidth?: 'thin' | 'medium' | 'thick' | 'heavy' | 'bold' | 'frame';
  chapterBorderRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'leaf' | 'chamfer' | 'ticket' | 'petal' | 'tab';
  chapterBorderCornerAccent?: 'none' | 'brackets' | 'vintage' | 'rivets' | 'dots' | 'crosshairs' | 'washi' | 'sparkle' | 'heart' | 'botanical' | 'artdeco' | 'bow' | 'ribbon-corner' | 'ribbon-top-bow' | 'paperclip';
  chapterBorderGlow?: 'none' | 'soft' | 'neon' | 'shadow' | 'soft-depth' | 'gradient-aura' | 'isometric';
  chapterCustomBorderGradientColor2?: string;
  chapterCustomBorderGlowColor1?: string;
  chapterCustomBorderGlowColor2?: string;
  chapterReadingEffect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'ginkgo' | 'fireworks' | 'fire_sparks' | 'sci_fi_hud' | 'fruits' | 'ocean' | 'butterflies' | 'feathers' | 'lightning' | 'fog';
  chapterReadingEffectColor?: string;
}

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  chapterNumber?: number;
  chapterTitle?: string;
  scrollY?: number;
  progressPercent?: number;
  updatedAt: string;
}

export interface BookmarkItem {
  storyId: string;
  createdAt: string;
}

export interface LoungeMessage {
  id: string;
  userName: string;
  userUid?: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
}

export interface EditorRequest {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  reason?: string;
  experience?: string;
  contact?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  chucu: number; // Đơn vị tiền tệ ảo Chucu
  streak: number; // Chuỗi ngày điểm danh liên tiếp
  lastCheckInDate?: string; // YYYY-MM-DD của lần điểm danh gần nhất
  totalCheckIns?: number; // Tổng số ngày đã điểm danh
  unlockedChapters?: string[]; // Danh sách các chapterId đã mở khóa bằng Chucu
  unlockedPasswordChapters?: string[]; // Danh sách các chapterId đã mở khóa bằng Pass
  createdAt?: string;
  updatedAt?: string;
}

export interface BlockLeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  updatedAt: string;
}

export interface Game2048LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  maxTile: number;
  updatedAt: string;
}

export type StoryLayoutBlockId = 
  | 'cover'
  | 'title'
  | 'meta'
  | 'synopsis'
  | 'editor_info'
  | 'action_buttons'
  | 'tags'
  | 'character_widget'
  | 'progress_widget'
  | 'custom_widget'
  | 'gallery_widget'
  | 'chapter_list'
  | 'comments'
  | (string & {});

export type StoryLayoutSectionType = '1_column' | '2_columns';
export type StoryLayoutColumnRatio = 'left_fixed' | 'equal' | 'right_fixed';

export interface StoryLayoutSection {
  id: string;
  type: StoryLayoutSectionType; // '1_column' (1 Cột toàn chiều rộng) | '2_columns' (2 Cột phân chia)
  title?: string; // Tên gợi nhớ phân đoạn (ví dụ: 'Phần 1', 'Phần 2')
  columnRatio?: StoryLayoutColumnRatio; // Tỉ lệ 2 cột: 'left_fixed' (Trái 224px & Phải tự co giãn) | 'equal' (50/50) | 'right_fixed' (Trái tự co giãn & Phải 224px)
  blocks?: StoryLayoutBlockId[]; // Danh sách khối khi là 1 Cột
  leftBlocks?: StoryLayoutBlockId[]; // Danh sách khối ở Cột Trái khi là 2 Cột
  rightBlocks?: StoryLayoutBlockId[]; // Danh sách khối ở Cột Phải khi là 2 Cột
}

export type StoryLayoutMode = 'two_columns' | 'single_column' | 'inverted_two_columns';



export interface NewsPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}
