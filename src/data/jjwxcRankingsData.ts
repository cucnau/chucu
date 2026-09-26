import rawData from './jjwxcRealData.json';

export interface JjwxcNovel {
  rank: number;
  novelId: string;
  title: string;          // Tên gốc tiếng Trung (Không dịch)
  author: string;         // Tác giả gốc tiếng Trung (Không dịch)
  authorId?: string;
  genre: string;          // Thể loại gốc JJWXC (Đam Mỹ thuần ái)
  status: string;         // Tình trạng gốc (完结 / 连载)
  wordCount: string;      // Số chữ gốc
  score: string;          // Điểm tích phân / điểm bá vương gốc
  publishDate?: string;   // Ngày phát hành gốc
  intro: string;          // Văn án gốc tiếng Trung của tác giả
  coverUrl: string;       // Bìa gốc từ server JJWXC
  jjwxcUrl: string;       // Link truyện gốc trên JJWXC
  tags?: string[];        // Các tag thể loại chính thức của Tấn Giang
  isAuthorCover?: boolean;// Đánh dấu bìa do chính tác giả/NXB thiết kế riêng
  bookmarks?: string | number; // Lượt bookmark (Thâu tàng)
  bawang?: string | number;    // Phiếu bá vương (Donate độc giả)
  rating?: string | number;    // Điểm đánh giá hoàn thành (Thang 10)
}

export interface JjwxcRankCategoryConfig {
  id: string;
  name: string;           // Tên chữ Hán gốc
  nameViGuide: string;    // Chú thích loại bảng để độc giả Việt hiểu
  fullName: string;
  desc: string;
  badgeColor: string;
}

export const JJWXC_RANK_CATEGORIES: JjwxcRankCategoryConfig[] = [
  {
    id: 'vip_jinbang',
    name: 'VIP金榜',
    nameViGuide: 'VIP Kim Bảng (7 Ngày Bán Chạy)',
    fullName: 'VIP Kim Bảng (VIP文7日销量排行榜)',
    desc: 'Bảng xếp hạng doanh số bán chạy 7 ngày qua của toàn phân khu Đam Mỹ VIP trên Tấn Giang',
    badgeColor: 'amber'
  },
  {
    id: 'wanjie_jinbang',
    name: '完结金榜',
    nameViGuide: 'Hoàn Kết Kim Bảng (30 Ngày Bán Chạy)',
    fullName: 'Hoàn Kết Kim Bảng (完结文30日销量排行榜)',
    desc: 'Bảng xếp hạng truyện đam mỹ đã hoàn thành bán chạy nhất trong 30 ngày qua trên Tấn Giang',
    badgeColor: 'emerald'
  },
  {
    id: 'qianzi_jinbang',
    name: '千字金榜',
    nameViGuide: 'Thiên Tự Kim Bảng (Doanh Thu Ngàn Chữ)',
    fullName: 'Thiên Tự Kim Bảng (入v30天千字收益榜)',
    desc: 'Bảng xếp hạng doanh thu trên mỗi 1.000 chữ sau 30 ngày vào VIP của truyện đam mỹ',
    badgeColor: 'purple'
  },
  {
    id: 'bawang',
    name: '霸王票总榜',
    nameViGuide: 'Bá Vương Phiếu (Đại Pháo / Ném Mìn)',
    fullName: 'Bá Vương Phiếu Tổng Bảng (霸王票总榜)',
    desc: 'Bảng xếp hạng tổng điểm Bá Vương Phiếu (ném mìn, nạp thẻ ủng hộ) đam mỹ Tấn Giang',
    badgeColor: 'rose'
  },
  {
    id: 'zongfen',
    name: '总分排行榜',
    nameViGuide: 'Tổng Phân Bảng (Tích Phân Lịch Sử)',
    fullName: 'Tổng Phân Bảng (纯爱总积分榜)',
    desc: 'Bảng xếp hạng tổng điểm tích phân toàn năng cao nhất mọi thời đại trong phân khu Đam Mỹ Tấn Giang',
    badgeColor: 'indigo'
  },
  {
    id: 'yuedu',
    name: '月度排行榜',
    nameViGuide: 'Nguyệt Độ Bảng (Tích Phân Trong Tháng)',
    fullName: 'Nguyệt Độ Bảng (月度排行榜)',
    desc: 'Bảng xếp hạng các tác phẩm đam mỹ mới nổi bật nhất đăng tải từ 11 đến 40 ngày',
    badgeColor: 'blue'
  },
  {
    id: 'jidu',
    name: '季度排行榜',
    nameViGuide: 'Quý Độ Bảng (Tích Phân Trong Quý)',
    fullName: 'Quý Độ Bảng (季度排行榜)',
    desc: 'Bảng xếp hạng tác phẩm đam mỹ nổi bật đăng tải từ 41 đến 130 ngày trên Tấn Giang',
    badgeColor: 'teal'
  },
  {
    id: 'bannian',
    name: '半年排行榜',
    nameViGuide: 'Bán Niên Bảng (Tích Phân Nửa Năm)',
    fullName: 'Bán Niên Bảng (半年排行榜)',
    desc: 'Bảng xếp hạng tác phẩm đam mỹ duy trì độ hot hàng đầu trong nửa năm qua',
    badgeColor: 'cyan'
  },
  {
    id: 'xinjin',
    name: '新晋作者榜',
    nameViGuide: 'Tân Tấn Tác Giả (Cây Bút Mới)',
    fullName: 'Tân Tấn Tác Giả Bảng (新晋作者榜)',
    desc: 'Bảng xếp hạng tác phẩm của tác giả mới tạo tài khoản Tấn Giang trong vòng 30 ngày',
    badgeColor: 'green'
  }
];

export interface JjwxcRealDataset {
  crawledAt: string;
  source: string;
  rankings: Record<string, {
    id: string;
    name: string;
    fullName: string;
    desc: string;
    items: JjwxcNovel[];
  }>;
}

export const initialRealRankingsData = rawData as JjwxcRealDataset;
