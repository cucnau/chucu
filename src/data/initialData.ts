export interface InitialAccount {
  email: string;
  password?: string;
  uid: string;
  userCode: string;
  displayName: string;
  userAvatar?: string;
  physicalGrade?: string;
  mentalGrade?: string;
  friends?: string[];
}

export interface InitialPost {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  comments?: Array<{
    id: string;
    author: string;
    avatar?: string;
    content: string;
    time: string;
  }>;
}

export interface InitialChatMessage {
  id: string;
  senderCode: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  time: string;
}

export interface InitialConversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  members: string[]; // userCodes
  messages: InitialChatMessage[];
  createdAt: string;
}

// Danh sách ảnh đại diện có sẵn lưu cứng trong mã nguồn
export const PRESET_AVATARS: string[] = [];

// Dữ liệu tài khoản & người dùng mặc định được mã hoá cứng trong codebase
export const INITIAL_ACCOUNTS: InitialAccount[] = [
  {
    email: 'askerhater21@gmail.com',
    uid: 'user_askerhater21',
    userCode: '888999',
    displayName: 'Thủ Lĩnh Chocoatl',
    userAvatar: '',
    friends: []
  }
];

// Dữ liệu bài viết diễn đàn mặc định mã hoá cứng trong codebase
export const INITIAL_POSTS: InitialPost[] = [];

// Dữ liệu cuộc trò chuyện / nhóm chat mặc định mã hoá cứng trong codebase
export const INITIAL_CONVERSATIONS: InitialConversation[] = [];
