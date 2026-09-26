export interface CustomEmoji {
  id: string;
  name: string;
  src: string;
  fallbackIcon: string;
}

// Danh sách các emoji mặc định tương ứng với các file ảnh trong thư mục /public/emojis/
// Khi bạn thêm file ảnh vào /public/emojis/ (ví dụ: like.png, heart.png, emo1.png, emo2.png...)
// bạn chỉ cần đặt tên file tương ứng là ứng dụng tự động hiển thị!
export const CUSTOM_EMOJIS: CustomEmoji[] = [
  { id: 'bamtim', name: 'Bầm tím', src: '/emojis/bamtim.png', fallbackIcon: '🤕' },
  { id: 'colen', name: 'Cố lên', src: '/emojis/colen.png', fallbackIcon: '💪' },
  { id: 'chongmat', name: 'Chóng mặt', src: '/emojis/chongmat.png', fallbackIcon: '😵' },
  { id: 'haiz', name: 'Haiz', src: '/emojis/haiz.png', fallbackIcon: '😮‍💨' },
  { id: 'hehe', name: 'Hehe', src: '/emojis/hehe.png', fallbackIcon: '😁' },
  { id: 'hetlon', name: 'Hét lớn', src: '/emojis/hetlon.png', fallbackIcon: '😱' },
  { id: 'hi', name: 'Hi', src: '/emojis/hi.png', fallbackIcon: '👋' },
  { id: 'hoicham', name: 'Hỏi chấm', src: '/emojis/hoicham.png', fallbackIcon: '❓' },
  { id: 'hum', name: 'Hừm', src: '/emojis/hum.png', fallbackIcon: '😤' },
  { id: 'ngai', name: 'Ngại', src: '/emojis/ngai.png', fallbackIcon: '😳' },
  { id: 'nguongmo', name: 'Ngưỡng mộ', src: '/emojis/nguongmo.png', fallbackIcon: '🤩' },
  { id: 'nhaymat', name: 'Nháy mắt', src: '/emojis/nhaymat.png', fallbackIcon: '😉' },
  { id: 'soc', name: 'Sốc', src: '/emojis/soc.png', fallbackIcon: '😲' },
  { id: 'suong', name: 'Sướng', src: '/emojis/suong.png', fallbackIcon: '🥳' },
  { id: 'suynghi', name: 'Suy nghĩ', src: '/emojis/suynghi.png', fallbackIcon: '🤔' },
  { id: 'tucgian', name: 'Tức giận', src: '/emojis/tucgian.png', fallbackIcon: '😡' },
  { id: 'thich', name: 'Thích', src: '/emojis/thich.png', fallbackIcon: '👍' },
];

export const getEmojiById = (id: string): CustomEmoji => {
  const found = CUSTOM_EMOJIS.find((e) => e.id === id);
  if (found) return found;
  // Tự động tìm đường dẫn tới /emojis/<id>.png nếu người dùng đặt tên file khác
  return {
    id,
    name: id,
    src: `/emojis/${id}.png`,
    fallbackIcon: '😊',
  };
};


