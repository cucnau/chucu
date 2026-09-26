import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Bookmark, 
  BookOpen, 
  ChevronRight, 
  X, 
  RefreshCw, 
  Layers,
  Languages,
  FileText,
  Tag,
  Hash,
  Crown,
  Star,
  Clock
} from 'lucide-react';
import { 
  JjwxcNovel, 
  JJWXC_RANK_CATEGORIES, 
  initialRealRankingsData, 
  JjwxcRankCategoryConfig 
} from '../data/jjwxcRankingsData';
import { 
  CORE_JJWXC_TAGS,
  TAG_CATEGORY_TABS,
  CoreTagConfig,
  getCoreTagConfig,
  getTagDisplayName 
} from '../data/jjwxcTagsData';
import { Story } from '../types';

interface JjwxcRankingsHubProps {
  currentStory?: Story | null;
  stories?: Story[];
  onSelectStory?: (story: Story) => void;
  onNavigateHome?: () => void;
}

// Dịch thể loại Tấn Giang sang Tiếng Việt
export function formatGenreVi(genreCn: string): string {
  if (!genreCn) return 'Đam mỹ / Thuần ái';
  
  const translations: Record<string, string> = {
    '原创': 'Nguyên sang',
    '纯爱': 'Đam mỹ',
    '架空历史': 'Cổ đại lịch sử',
    '近代现代': 'Hiện đại đô thị',
    '幻想未来': 'Tương lai viễn tưởng',
    '古色古香': 'Cổ trang truyền thống',
    '爱情': 'Tình cảm',
    '奇幻': 'Kỳ ảo dị thế',
    '悬疑': 'Trinh thám phá án',
    '惊悚': 'Kinh dị rùng rợn',
    '科幻': 'Khoa học viễn tưởng',
    '传奇': 'Truyền kỳ',
    '同人': 'Đồng nhân',
    '衍生': 'Phái sinh',
    '武侠': 'Võ hiệp',
    '仙侠': 'Tiên hiệp tu chân',
    '游戏': 'Võng du eSports'
  };

  const parts = genreCn.split(/[-–—\s]+/).filter(Boolean);
  const viParts = parts.map(p => translations[p.trim()] || p.trim());
  return viParts.join(' • ');
}

// Dịch tình trạng sang Tiếng Việt chuẩn theo gốc Tấn Giang
export function formatStatusVi(statusCn: string): { label: string; isCompleted: boolean } {
  if (!statusCn) return { label: 'Đã hoàn thành', isCompleted: true };
  if (statusCn.includes('完结')) {
    return { label: 'Đã hoàn thành', isCompleted: true };
  }
  if (statusCn.includes('连载')) {
    return { label: 'Đang ra', isCompleted: false };
  }
  if (statusCn.includes('暂停')) {
    return { label: 'Tạm dừng', isCompleted: false };
  }
  return { label: statusCn, isCompleted: statusCn.includes('完') };
}

// Format số chữ sang Tiếng Việt
export function formatWordsVi(words: string): string {
  if (!words) return '';
  const num = parseInt(words.replace(/[^\d]/g, ''), 10);
  if (isNaN(num)) return words;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)} triệu chữ`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)} vạn chữ`;
  }
  return `${num.toLocaleString('vi-VN')} chữ`;
}

// Format điểm tích lũy sang Tiếng Việt
export function formatScoreVi(score: string): string {
  if (!score) return '';
  const clean = score.replace(/[^\d]/g, '');
  const num = parseInt(clean, 10);
  if (isNaN(num)) return score;
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)} tỷ`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} triệu`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)} vạn`;
  }
  return num.toLocaleString('vi-VN');
}

// Format lượt bookmark (thâu tàng) sang Tiếng Việt
export function formatBookmarksVi(bm?: string | number): string {
  if (!bm) return '';
  const num = typeof bm === 'number' ? bm : parseInt(String(bm).replace(/[^\d]/g, ''), 10);
  if (isNaN(num)) return '';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)} triệu`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)} vạn`;
  }
  return num.toLocaleString('vi-VN');
}

// Format phiếu bá vương sang Tiếng Việt
export function formatBawangVi(bw?: string | number): string {
  if (!bw) return '';
  const num = typeof bw === 'number' ? bw : parseInt(String(bw).replace(/[^\d]/g, ''), 10);
  if (isNaN(num)) return '';
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)} ức`;
  }
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)} ngàn vạn`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)} vạn`;
  }
  return num.toLocaleString('vi-VN');
}

// Format điểm đánh giá hoàn thành (thang 10)
export function formatRatingVi(rate?: string | number): string {
  if (!rate) return '';
  const num = typeof rate === 'number' ? rate : parseFloat(String(rate));
  if (isNaN(num)) return '';
  return `${num.toFixed(1)}`;
}

// Dịch / chuyển ngữ văn án chữ Hán sang tiếng Việt dễ hiểu
export function translateIntroToVietnamese(introCn: string): string {
  if (!introCn) return 'Tác phẩm chưa có phần giới thiệu công khai trên bảng xếp hạng này. Bạn có thể bấm "Mở trên Tấn Giang" để xem trực tiếp tại trang gốc.';

  let text = introCn;

  // Bản dịch các thuật ngữ, thiết lập đam mỹ phổ biến trong văn án JJWXC
  const termMap: [RegExp, string][] = [
    [/订阅请注意[：:]/g, '【Lưu ý khi theo dõi】: '],
    [/攻[×xX*]受/g, 'Công x Thụ'],
    [/受[×xX*]攻/g, 'Thụ x Công'],
    [/主角受/g, 'Chủ thụ (Góc nhìn Thụ)'],
    [/主角攻/g, 'Chủ công (Góc nhìn Công)'],
    [/互攻/g, 'Hỗ công'],
    [/1[Vv]1/g, '1v1 (Một kèm một chung thủy)'],
    [/[Hh][Ee]/g, 'HE (Kết thúc viên mãn có hậu)'],
    [/[Bb][Ee]/g, 'BE (Kết buồn chia ly)'],
    [/[Oo][Ee]/g, 'OE (Kết mở)'],
    [/排雷[：:]/g, '【Nhắc nhở trước khi đọc】: '],
    [/文案[：:]/g, '【Văn án】: '],
    [/内容标签[：:]/g, '【Nhãn nội dung】: '],
    [/搜索关键字[：:]/g, '【Từ khóa tìm kiếm】: '],
    [/一句话简介[：:]/g, '【Tóm tắt một câu】: '],
    [/立意[：:]/g, '【Thông điệp tác phẩm】: '],
    [/无限流/g, 'Vô hạn lưu (Game sinh tồn)'],
    [/快穿/g, 'Khoái xuyên (Nhanh qua các thế giới)'],
    [/穿越/g, 'Xuyên không'],
    [/重生/g, 'Trọng sinh (Sống lại kiếp trước)'],
    [/穿书/g, 'Xuyên thư (Xuyên vào tiểu thuyết)'],
    [/系统/g, 'Hệ thống'],
    [/娱乐圈/g, 'Giới giải trí'],
    [/修真/g, 'Tu chân tiên hiệp'],
    [/修仙/g, 'Tu tiên'],
    [/甜文/g, 'Điềm văn (Truyện ngọt sủng)'],
    [/爽文/g, 'Sảng văn (Truyện vả mặt sảng khoái)'],
    [/强强/g, 'Cường cường (Cả hai đều siêu mạnh)'],
    [/万人迷/g, 'Vạn nhân mê (Ai cũng say đắm)'],
    [/白月光/g, 'Bạch nguyệt quang (Người thương trong lòng)'],
    [/替身/g, 'Thế thân'],
    [/破镜重圆/g, 'Gương vỡ lại lành'],
    [/青梅竹马/g, 'Thanh mai trúc mã'],
    [/天作之合/g, 'Trời sinh một đôi'],
    [/情有独钟/g, 'Duyên trời tác hợp, tình cảm chung thủy'],
    [/宿敌/g, 'Kẻ thù truyền kiếp'],
    [/死对头/g, 'Oan gia đối đầu'],
    [/金手指/g, 'Bàn tay vàng'],
    [/师尊/g, 'Sư tôn'],
    [/徒弟/g, 'Đồ đệ'],
    [/年下/g, 'Niên hạ (Công nhỏ tuổi hơn Thụ)'],
    [/年上/g, 'Niên thượng (Công lớn tuổi hơn Thụ)'],
    [/ABO/g, 'ABO (Alpha/Beta/Omega)'],
    [/万人嫌/g, 'Vạn nhân hiềm (Bị mọi người ghét bỏ)'],
    [/升级流/g, 'Thăng cấp lưu (Luyện cấp tăng tiến)'],
    [/打脸/g, 'Vả mặt'],
    [/打怪/g, 'Đánh quái'],
    [/大佬/g, 'Đại lão'],
    [/魔尊/g, 'Ma tôn'],
    [/仙尊/g, 'Tiên tôn'],
    [/小少爷/g, 'Tiểu thiếu gia'],
    [/网恋/g, 'Hẹn hò qua mạng'],
    [/电竞/g, 'Thể thao điện tử (eSports)'],
    [/直播/g, 'Livestream'],
    [/双向奔赴/g, 'Song phương cùng hướng về nhau'],
    [/暗恋/g, 'Thầm yêu đơn phương'],
    [/先婚后爱/g, 'Cưới trước yêu sau'],
    [/追妻火葬场/g, 'Truy thê hỏa táng tràng'],
    [/火葬场/g, 'Hỏa táng tràng (Hối hận theo đuổi lại)'],
    [/沙雕/g, 'Hài hước sa điêu'],
    [/治愈/g, 'Chữa lành tâm hồn'],
    [/救赎/g, 'Cứu rỗi lẫn nhau']
  ];

  for (const [regex, rep] of termMap) {
    text = text.replace(regex, rep);
  }

  return text;
}

export const JjwxcRankingsHub: React.FC<JjwxcRankingsHubProps> = ({
  stories = [],
  onSelectStory,
  onNavigateHome
}) => {
  // Bảng xếp hạng đang chọn
  const [selectedRankId, setSelectedRankId] = useState<string>('vip_jinbang');
  // Dữ liệu bảng xếp hạng
  const [dataset, setDataset] = useState(initialRealRankingsData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(initialRealRankingsData.crawledAt || 'Mới cập nhật');

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing'>('all');
  
  // Modal xem chi tiết văn án gốc
  const [activeNovel, setActiveNovel] = useState<JjwxcNovel | null>(null);
  const [isLoadingIntro, setIsLoadingIntro] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chế độ: 'ranks' (9 BXH chính) hoặc 'tags' (BXH Theo Tag Thể Loại)
  const [hubMode, setHubMode] = useState<'ranks' | 'tags'>('ranks');
  const [selectedTagId, setSelectedTagId] = useState<string>('wuxianliu');
  const [tagCategoryFilter, setTagCategoryFilter] = useState<'all' | 'genre' | 'setting' | 'trope' | 'relationship'>('all');
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Bookmark yêu thích lưu localStorage
  const [savedNovelIds, setSavedNovelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('choco_jjwxc_real_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('choco_jjwxc_real_saved', JSON.stringify(savedNovelIds));
    } catch (e) {
      console.warn('Lỗi lưu bookmark:', e);
    }
  }, [savedNovelIds]);

  // Danh sách toàn bộ các tác phẩm trong kho truyện Tấn Giang (hơn 1.400+ truyện đam mỹ)
  const masterNovelList: JjwxcNovel[] = useMemo(() => {
    const list = (dataset as any).allNovels as JjwxcNovel[] | undefined;
    if (list && list.length > 0) return list;
    const map = new Map<string, JjwxcNovel>();
    Object.values(dataset.rankings || {}).forEach(r => {
      r.items?.forEach(n => {
        if (!map.has(n.novelId)) map.set(n.novelId, n);
      });
    });
    return Array.from(map.values());
  }, [dataset]);

  // Hàm kiểm tra tác phẩm có thuộc tag thể loại (BẮT BUỘC 100%: phải có đúng tag gốc tiếng Trung trong tags)
  const isNovelMatchingTagConfig = (novel: JjwxcNovel, tagConfig: CoreTagConfig): boolean => {
    if (!novel.tags || novel.tags.length === 0) return false;
    return novel.tags.some(t => t.trim() === tagConfig.zh || t.trim().includes(tagConfig.zh));
  };

  // Thống kê số lượng truyện cho từng Tag cơ bản phổ biến nhất (Đảm bảo đúng 100 tác phẩm mỗi tag)
  const coreTagsWithStats = useMemo(() => {
    return CORE_JJWXC_TAGS.map(tagConfig => {
      const directList = (dataset as any).tagRankings?.[tagConfig.id] as JjwxcNovel[] | undefined;
      const count = directList ? directList.length : 0;
      return {
        ...tagConfig,
        count: count,
        totalAvailable: count
      };
    });
  }, [dataset]);

  // Danh sách các tag sau khi lọc theo tab danh mục và ô tìm kiếm tag
  const filteredTagsList = useMemo(() => {
    let list = coreTagsWithStats;
    if (tagCategoryFilter !== 'all') {
      list = list.filter(t => t.category === tagCategoryFilter);
    }
    if (tagSearchQuery.trim()) {
      const q = tagSearchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.nameVi.toLowerCase().includes(q) || 
        t.zh.toLowerCase().includes(q)
      );
    }
    return list;
  }, [coreTagsWithStats, tagCategoryFilter, tagSearchQuery]);

  // Tag đang được chọn hiện tại
  const currentTagConfig = useMemo(() => {
    return (
      coreTagsWithStats.find(t => t.id === selectedTagId || t.zh === selectedTagId) || 
      coreTagsWithStats[0]
    );
  }, [coreTagsWithStats, selectedTagId]);

  // BXH truyện theo Tag được chọn: LẤY TRỰC TIẾP TOP 100 GỐC TỪ TẤN GIANG (Rank 1 -> 100)
  const tagNovelList: JjwxcNovel[] = useMemo(() => {
    if (!currentTagConfig) return [];
    
    // 1. Nếu có dữ liệu BXH tag được cào trực tiếp từ Tấn Giang
    const directTagRank = (dataset as any).tagRankings?.[currentTagConfig.id] as JjwxcNovel[] | undefined;
    if (directTagRank && directTagRank.length > 0) {
      return directTagRank.slice(0, 100).map((n, idx) => ({ ...n, rank: idx + 1 }));
    }

    // 2. Fallback: Lọc từ masterNovelList và xếp theo điểm tích phân
    const map = new Map<string, JjwxcNovel>();
    
    const parseScore = (str?: string): number => {
      if (!str) return 0;
      const clean = str.replace(/[^0-9]/g, '');
      return clean ? parseInt(clean, 10) : 0;
    };

    masterNovelList.forEach(n => {
      if (isNovelMatchingTagConfig(n, currentTagConfig)) {
        if (!map.has(n.novelId)) {
          map.set(n.novelId, { ...n });
        } else {
          const exist = map.get(n.novelId)!;
          if (parseScore(n.score) > parseScore(exist.score)) {
            map.set(n.novelId, { ...n });
          }
        }
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      return parseScore(b.score) - parseScore(a.score);
    });

    const top100 = sorted.slice(0, 100);
    return top100.map((n, idx) => ({ ...n, rank: idx + 1 }));
  }, [dataset, masterNovelList, currentTagConfig]);

  // Fetch dữ liệu từ backend API nếu có cập nhật
  const fetchRankings = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsLoading(true);
      const res = await fetch('/api/jjwxc/rankings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rankings) {
          setDataset(data);
          if (data.crawledAt) setLastUpdated(data.crawledAt);
        }
      }
    } catch (err) {
      console.error('Không thể tải API rankings, dùng dữ liệu bundle sẵn có:', err);
    } finally {
      if (isManualRefresh) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(false);
  }, []);

  // Tự động kiểm tra và nạp văn án đầy đủ & bìa riêng từ Tấn Giang nếu văn án hiện tại chưa đủ
  useEffect(() => {
    if (!activeNovel) return;
    let isMounted = true;
    if (!activeNovel.intro || activeNovel.intro.length < 150) {
      setIsLoadingIntro(true);
      fetch(`/api/jjwxc/novel-detail/${activeNovel.novelId}`)
        .then(res => res.ok ? res.json() : null)
        .then(detail => {
          if (detail && isMounted) {
            setActiveNovel(prev => {
              if (!prev || prev.novelId !== activeNovel.novelId) return prev;
              return {
                ...prev,
                intro: detail.fullIntro || prev.intro,
                status: detail.status || prev.status,
                wordCount: detail.wordCount || prev.wordCount,
                coverUrl: detail.coverUrl || prev.coverUrl,
                isAuthorCover: detail.isAuthorCover ?? prev.isAuthorCover
              };
            });
          }
        })
        .catch(err => console.warn('Lỗi nạp văn án chi tiết:', err))
        .finally(() => {
          if (isMounted) setIsLoadingIntro(false);
        });
    } else {
      setIsLoadingIntro(false);
    }
    return () => { isMounted = false; };
  }, [activeNovel?.novelId]);

  const toggleSaveNovel = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedNovelIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Helper lấy URL ảnh bìa gốc tác giả (qua proxy server để chống chặn hotlink)
  const getCoverSrc = (novel: JjwxcNovel) => {
    if (novel.coverUrl && (novel.coverUrl.startsWith('http://') || novel.coverUrl.startsWith('https://'))) {
      return `/api/jjwxc/image-proxy?url=${encodeURIComponent(novel.coverUrl)}`;
    }
    return `/api/jjwxc/cover/${novel.novelId}`;
  };

  const handleCopyChinese = (text: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Lấy danh sách truyện thuộc category đang chọn
  const currentCategoryConfig: JjwxcRankCategoryConfig = useMemo(() => {
    return (
      JJWXC_RANK_CATEGORIES.find(c => c.id === selectedRankId) || JJWXC_RANK_CATEGORIES[0]
    );
  }, [selectedRankId]);

  const rawNovelList: JjwxcNovel[] = useMemo(() => {
    const rankObj = dataset.rankings?.[selectedRankId];
    return rankObj?.items || [];
  }, [dataset, selectedRankId]);

  // Toàn bộ truyện đã bookmark
  const allSavedNovels: JjwxcNovel[] = useMemo(() => {
    const map = new Map<string, JjwxcNovel>();
    Object.values(dataset.rankings || {}).forEach(r => {
      r.items?.forEach(n => {
        if (savedNovelIds.includes(n.novelId) && !map.has(n.novelId)) {
          map.set(n.novelId, n);
        }
      });
    });
    return Array.from(map.values());
  }, [dataset, savedNovelIds]);

  // Danh sách sau lọc (giữ nguyên 100% thứ tự xếp hạng gốc của Tấn Giang từ #1 đến #100)
  const filteredNovels = useMemo(() => {
    const list = showSavedOnly ? allSavedNovels : (hubMode === 'tags' ? tagNovelList : rawNovelList);
    const matched = list.filter(novel => {
      // Đảm bảo 100% CHỈ CÓ ĐAM MỸ / THUẦN ÁI
      if (novel.genre && !novel.genre.includes('纯爱') && !novel.genre.includes('耽美')) {
        return false;
      }

      // Tìm kiếm theo tên gốc tiếng Trung, tác giả, id
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (novel.title || '').toLowerCase().includes(q);
        const matchAuthor = (novel.author || '').toLowerCase().includes(q);
        const matchId = (novel.novelId || '').includes(q);
        const matchGenre = (novel.genre || '').toLowerCase().includes(q);
        const matchViGenre = formatGenreVi(novel.genre || '').toLowerCase().includes(q);
        const matchTags = novel.tags?.some(t => {
          if (!t) return false;
          const { vi } = getTagDisplayName(t);
          return t.toLowerCase().includes(q) || (vi || '').toLowerCase().includes(q);
        });
        if (!matchTitle && !matchAuthor && !matchId && !matchGenre && !matchViGenre && !matchTags) return false;
      }

      // Lọc tình trạng (完结 / 连载)
      if (statusFilter === 'completed' && !(novel.status || '').includes('完结')) return false;
      if (statusFilter === 'ongoing' && !(novel.status || '').includes('连载')) return false;

      return true;
    });

    return matched;
  }, [rawNovelList, tagNovelList, allSavedNovels, hubMode, showSavedOnly, searchQuery, statusFilter]);

  // Tự động reset về Trang 1 khi đổi bộ lọc hoặc đổi BXH / Tag
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRankId, selectedTagId, hubMode, statusFilter, searchQuery, showSavedOnly]);

  // Phân trang 20 truyện / trang chuẩn Tấn Giang
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filteredNovels.length / PAGE_SIZE));
  const pagedNovels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNovels.slice(start, start + PAGE_SIZE);
  }, [filteredNovels, currentPage]);

  // Icon badge theo top 1, 2, 3
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-black text-base shadow-sm">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-lg bg-slate-300/20 text-slate-300 border border-slate-300/40 flex items-center justify-center font-black text-base shadow-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-600/40 flex items-center justify-center font-black text-base shadow-sm">
          3
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-lg jjwxc-rank-badge border flex items-center justify-center font-bold text-sm shadow-sm backdrop-blur-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 font-mono text-white jjwxc-text-main">
      {/* Header Banner thu gọn - Chỉ giữ thông tin cơ bản */}
      <div className="rounded-xl border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card px-4 py-3 mb-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white jjwxc-text-main tracking-tight">
                BXH Tấn Giang (JJWXC)
              </h1>
            </div>
            <div className="text-[11px] jjwxc-text-sub mt-0.5">
              Cập nhật: <span className="text-white jjwxc-text-main">{lastUpdated}</span>
              {savedNovelIds.length > 0 && (
                <> • Đã lưu: <span className="text-emerald-400 font-bold">{savedNovelIds.length}</span></>
              )}
            </div>
          </div>
        </div>

        {/* Nút tác vụ nhanh gọn */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => fetchRankings(true)}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg border border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface hover:bg-[#160a11] jjwxc-bg-card text-white jjwxc-text-main text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            title="Đồng bộ lại từ Tấn Giang"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          <a
            href="https://www.jjwxc.net/fenzhan/noyq/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg border border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface hover:bg-[#160a11] jjwxc-bg-card jjwxc-text-sub hover:text-white jjwxc-text-main text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
            title="Mở trang chủ phân khu Thuần Ái JJWXC"
          >
            <span>Trang gốc</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Thanh chuyển chế độ: 9 BXH Chính vs BXH Theo Tag Thể Loại */}
      <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border w-fit">
        <button
          onClick={() => {
            setHubMode('ranks');
            setShowSavedOnly(false);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            hubMode === 'ranks' && !showSavedOnly
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'jjwxc-text-sub hover:text-white jjwxc-text-main'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>9 Bảng Xếp Hạng Chính</span>
        </button>

        <button
          onClick={() => {
            setHubMode('tags');
            setShowSavedOnly(false);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            hubMode === 'tags' && !showSavedOnly
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'jjwxc-text-sub hover:text-white jjwxc-text-main'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>BXH Theo Tag Thể Loại ({coreTagsWithStats.length} Tag Chính)</span>
        </button>
      </div>

      {/* Hiển thị chọn bảng tùy theo chế độ */}
      {hubMode === 'ranks' ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider jjwxc-text-sub flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Chọn Bảng Xếp Hạng ({JJWXC_RANK_CATEGORIES.length} Bảng):
            </h2>
            {savedNovelIds.length > 0 && (
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  showSavedOnly 
                    ? 'jjwxc-saved-badge shadow-xs' 
                    : 'bg-[#160a11] jjwxc-bg-card border-[#3b1828] jjwxc-border jjwxc-text-sub hover:text-white jjwxc-text-main'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Xem truyện đã lưu ({savedNovelIds.length})</span>
              </button>
            )}
          </div>

          {/* Danh sách tab bảng với tên tiếng Việt rõ ràng */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {JJWXC_RANK_CATEGORIES.map(category => {
              const isSelected = selectedRankId === category.id && !showSavedOnly && hubMode === 'ranks';
              const count = dataset.rankings?.[category.id]?.items?.length || 0;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedRankId(category.id);
                    setShowSavedOnly(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white jjwxc-text-main shadow-md'
                      : 'border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card hover:opacity-90 jjwxc-text-sub hover:text-white jjwxc-text-main'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black tracking-tight text-white jjwxc-text-main group-hover:text-emerald-500 transition-colors leading-snug line-clamp-2 min-h-[32px] flex items-center">
                        {category.nameViGuide}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border jjwxc-count-pill shadow-xs">
                        {count}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-500/80 font-mono">
                      {category.name}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-end min-h-[6px]">
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Giao diện chọn BXH Theo Tag Thể Loại Cơ Bản của Tấn Giang */
        <div className="mb-6 rounded-xl border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider jjwxc-text-sub flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                Chọn Tag Thể Loại Đam Mỹ ({filteredTagsList.length} Tag):
              </h2>
              <p className="text-[11px] jjwxc-text-sub mt-0.5">
                Các thể loại quen thuộc & phổ biến nhất trên Tấn Giang, bấm để xem bảng xếp hạng điểm cao
              </p>
            </div>

            {/* Ô tìm kiếm tag nhanh */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 jjwxc-text-sub" />
              <input
                type="text"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Tìm tag (Vô hạn, học đường, abo...)"
                className="w-full bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border rounded-lg pl-9 pr-7 py-1.5 text-xs text-white jjwxc-text-main placeholder-text-sub/60 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
              {tagSearchQuery && (
                <button
                  onClick={() => setTagSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 jjwxc-text-sub hover:text-white jjwxc-text-main"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Tab danh mục tag (Bối cảnh, Thể loại, Thiết lập, Tình cảm) */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {TAG_CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTagCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  tagCategoryFilter === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#210e19] jjwxc-bg-surface border-[#3b1828] jjwxc-border jjwxc-text-sub hover:text-white jjwxc-text-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lưới các Tag Thể Loại chính */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
            {filteredTagsList.map(tagItem => {
              const isSelected = (selectedTagId === tagItem.id || selectedTagId === tagItem.zh) && !showSavedOnly;
              return (
                <button
                  key={tagItem.id}
                  onClick={() => {
                    setSelectedTagId(tagItem.id);
                    setShowSavedOnly(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface hover:bg-[#160a11] jjwxc-bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'jjwxc-text-sub'}`} />
                      <span className={`text-xs font-black truncate capitalize ${isSelected ? 'text-emerald-400' : 'text-white jjwxc-text-main'}`}>
                        {tagItem.nameVi}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'border jjwxc-count-pill'
                    }`}>
                      {tagItem.count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] jjwxc-text-sub font-mono">
                    <span>{tagItem.zh}</span>
                    {isSelected && <span className="text-emerald-400 font-bold">Đang xem</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Thanh Thông Tin Bảng Đang Chọn + Bộ Lọc Tìm Kiếm */}
      <div className="rounded-xl border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded text-xs font-black uppercase border jjwxc-banner-badge">
                {showSavedOnly 
                  ? 'DANH SÁCH ĐÃ LƯU' 
                  : hubMode === 'tags'
                    ? `TOP ${tagNovelList.length} • ${currentTagConfig.nameVi}`
                    : currentCategoryConfig.nameViGuide}
              </span>
              <span className="text-xs jjwxc-text-sub font-mono font-bold">
                ({hubMode === 'tags' ? currentTagConfig.zh : currentCategoryConfig.name})
              </span>
              {hubMode === 'tags' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs jjwxc-tab-active font-bold">
                    • Xếp theo BXH gốc Tấn Giang ({filteredNovels.length} bộ)
                  </span>
                  <a
                    href={`${currentTagConfig.jjwxcUrl || `https://m.jjwxc.net/assort?bq=${currentTagConfig.bq}&xx2=2`}&page=${currentPage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all ml-1 shadow-xs"
                    title={`Mở link Tấn Giang gốc - Trang ${currentPage} của tag ${currentTagConfig.nameVi} (${currentTagConfig.zh})`}
                  >
                    <span>Link Tấn Giang Trang {currentPage}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            {showSavedOnly && (
              <p className="text-xs jjwxc-text-sub mt-1">
                Tổng hợp tất cả các tác phẩm bạn đã lưu từ mọi bảng xếp hạng Tấn Giang
              </p>
            )}
            {!showSavedOnly && hubMode === 'ranks' && (
              <p className="text-xs jjwxc-text-sub mt-1">
                {currentCategoryConfig.desc}
              </p>
            )}
          </div>

          {/* Công cụ tìm kiếm & lọc bằng tiếng Việt */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Input tìm kiếm */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 jjwxc-text-sub" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên gốc, tác giả, thể loại..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface text-white jjwxc-text-main focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 jjwxc-text-sub hover:text-white jjwxc-text-main"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Lọc tình trạng bằng tiếng Việt */}
            <div className="flex items-center rounded-lg border border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border shadow-sm jjwxc-tab-active'
                    : 'jjwxc-text-sub hover:text-white jjwxc-text-main'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border shadow-sm jjwxc-tab-active'
                    : 'jjwxc-text-sub hover:text-white jjwxc-text-main'
                }`}
              >
                Đã hoàn thành
              </button>
              <button
                onClick={() => setStatusFilter('ongoing')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  statusFilter === 'ongoing'
                    ? 'bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border shadow-sm jjwxc-tab-active'
                    : 'jjwxc-text-sub hover:text-white jjwxc-text-main'
                }`}
              >
                Đang ra
              </button>
            </div>

            <span className="text-xs font-bold jjwxc-text-muted ml-auto sm:ml-2">
              Hiển thị: <strong className="jjwxc-text-main text-emerald-400">{filteredNovels.length}</strong> tác phẩm
            </span>
          </div>
        </div>
      </div>

      {/* Danh Sách Truyện */}
      {filteredNovels.length === 0 ? (
        <div className="rounded-2xl border border-dashed jjwxc-empty-box p-12 text-center shadow-xs">
          <BookOpen className="w-12 h-12 mx-auto jjwxc-text-muted mb-3 opacity-70" />
          <p className="text-sm sm:text-base font-black jjwxc-text-main">Không tìm thấy tác phẩm nào phù hợp</p>
          <p className="text-xs jjwxc-text-sub mt-1.5 max-w-md mx-auto">Hãy thử xóa bộ lọc tìm kiếm hoặc chọn bảng xếp hạng khác</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs jjwxc-btn-close cursor-pointer"
            >
              Xóa từ khóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Thanh Phân Trang 20 truyện/trang (Top 100 gồm 5 trang) */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-3 rounded-xl bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border">
              <div className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Trang <strong className="text-emerald-400">{currentPage}</strong> / {totalPages} (20 bộ/trang)</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      currentPage === p
                        ? 'bg-emerald-500 text-white font-black scale-105 border border-emerald-400'
                        : 'bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border text-white/70 hover:text-white'
                    }`}
                  >
                    Trang {p} (#{ (p - 1) * 20 + 1 } - #{ Math.min(p * 20, filteredNovels.length) })
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagedNovels.map((novel, index) => {
            const isSaved = savedNovelIds.includes(novel.novelId);
            const isCopied = copiedId === novel.novelId;
            const statusInfo = formatStatusVi(novel.status);
            const genreVi = formatGenreVi(novel.genre);
            const wordsVi = formatWordsVi(novel.wordCount);
            const scoreVi = formatScoreVi(novel.score);

            return (
              <div
                key={`${novel.novelId}-${index}`}
                onClick={() => {
                  setActiveNovel(novel);
                }}
                className="group rounded-2xl border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card hover:jjwxc-bg-surface hover:border-emerald-500/50 transition-all duration-200 p-4 flex flex-col justify-between cursor-pointer relative shadow-sm hover:shadow-lg"
              >
                {/* Phần trên: Thứ hạng + Bìa + Thông tin chính */}
                <div className="flex gap-4">
                  {/* Bìa truyện gốc từ Tấn Giang */}
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border shadow-md">
                    <img
                      src={getCoverSrc(novel)}
                      alt={novel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const currentSrc = e.currentTarget.src;
                        if (!currentSrc.includes('/api/jjwxc/cover/')) {
                          e.currentTarget.src = `/api/jjwxc/cover/${novel.novelId}`;
                        }
                      }}
                    />
                    {/* Badge thứ hạng ở góc ảnh */}
                    <div className="absolute top-1.5 left-1.5">
                      {getRankBadge(novel.rank)}
                    </div>
                  </div>

                  {/* Thông tin truyện */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Tiêu đề gốc tiếng Trung (GIỮ NGUYÊN GỐC) */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          className="text-base sm:text-lg font-black text-white jjwxc-text-main group-hover:text-emerald-400 transition-colors line-clamp-1 tracking-tight"
                          title={novel.title}
                        >
                          {novel.title}
                        </h4>
                        
                        {/* Nút bookmark */}
                        <button
                          onClick={(e) => toggleSaveNovel(novel.novelId, e)}
                          className={`p-1.5 rounded-lg border transition-all flex-shrink-0 ${
                            isSaved 
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                              : 'bg-[#210e19] jjwxc-bg-surface border-[#3b1828] jjwxc-border jjwxc-text-sub hover:text-white jjwxc-text-main'
                          }`}
                          title={isSaved ? 'Hủy lưu truyện' : 'Lưu vào danh sách theo dõi'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400' : ''}`} />
                        </button>
                      </div>

                      {/* Tác giả gốc tiếng Trung (GIỮ NGUYÊN GỐC) */}
                      <div className="text-xs jjwxc-text-sub mt-1 flex items-center gap-2">
                        <span>Tác giả:</span>
                        <span className="font-bold text-white jjwxc-text-main px-1.5 py-0.5 rounded bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border-subtle">
                          {novel.author}
                        </span>
                        {novel.authorId && (
                          <span className="text-[10px] jjwxc-text-muted font-bold font-mono">Mã TG: {novel.authorId}</span>
                        )}
                      </div>

                      {/* Thể loại & Tình trạng dịch sang Tiếng Việt */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          statusInfo.isCompleted
                            ? 'jjwxc-status-completed'
                            : 'jjwxc-status-ongoing'
                        }`}>
                          {statusInfo.label}
                        </span>

                        <span className="text-[10px] jjwxc-text-sub px-2 py-0.5 rounded bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border-subtle line-clamp-1 max-w-[200px]" title={genreVi}>
                          {genreVi}
                        </span>
                      </div>

                      {/* Danh sách Tag thể loại chính thức của Tấn Giang */}
                      {novel.tags && novel.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          {(() => {
                            // Sắp xếp đưa tag đang được chọn (nếu có) lên đầu tiên
                            let displayTags = [...novel.tags];
                            if (hubMode === 'tags' && currentTagConfig) {
                              const matchIdx = displayTags.findIndex(t => t === currentTagConfig.zh || t === currentTagConfig.id || Boolean(currentTagConfig.aliases?.includes(t)));
                              if (matchIdx > 0) {
                                const matched = displayTags.splice(matchIdx, 1)[0];
                                displayTags = [matched, ...displayTags];
                              }
                            }
                            return (
                              <>
                                {displayTags.slice(0, 4).map((t, idx) => {
                                  const { vi, zh } = getTagDisplayName(t);
                                  const core = getCoreTagConfig(t);
                                  const isSelectedCurrent = hubMode === 'tags' && currentTagConfig && (t === currentTagConfig.zh || core?.id === currentTagConfig.id || Boolean(currentTagConfig.aliases?.includes(t)));
                                  return (
                                    <button
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setHubMode('tags');
                                        setSelectedTagId(core ? core.id : zh);
                                        window.scrollTo({ top: 120, behavior: 'smooth' });
                                      }}
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors flex items-center gap-0.5 shadow-xs ${
                                        isSelectedCurrent
                                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                                          : 'jjwxc-tag-pill'
                                      }`}
                                      title={`Xem BXH tag: ${vi} (${zh})`}
                                    >
                                      <Hash className="w-2.5 h-2.5 opacity-70" />
                                      <span>{vi}</span>
                                    </button>
                                  );
                                })}
                                {displayTags.length > 4 && (
                                  <span className="text-[10px] jjwxc-text-sub font-mono">+{displayTags.length - 4}</span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Chỉ số chính: Điểm tích lũy, Bookmark, Độ dài, Bá vương, Đánh giá */}
                    <div className="mt-2.5 pt-2 border-t border-[#3b1828] jjwxc-border-subtle flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] jjwxc-text-sub">
                      {scoreVi && (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500 font-bold">Tích lũy:</span>
                          <span className="font-bold text-white jjwxc-text-main">{scoreVi}</span>
                        </div>
                      )}
                      {novel.bookmarks && (
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-500 font-bold">Bookmark:</span>
                          <span className="font-bold text-white jjwxc-text-main">{formatBookmarksVi(novel.bookmarks)}</span>
                        </div>
                      )}
                      {wordsVi && (
                        <div className="flex items-center gap-1">
                          <span>Số chữ:</span>
                          <span className="font-medium text-white jjwxc-text-main">{wordsVi}</span>
                        </div>
                      )}
                      {novel.bawang && (
                        <div className="flex items-center gap-1">
                          <span className="text-pink-400 font-bold">Bá vương:</span>
                          <span className="font-bold text-white jjwxc-text-main">{formatBawangVi(novel.bawang)}</span>
                        </div>
                      )}
                      {novel.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 font-bold">Đánh giá:</span>
                          <span className="font-black text-amber-400">{formatRatingVi(novel.rating)}⭐</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút hành động nhanh ở dưới cùng thẻ */}
                <div className="mt-3 pt-2.5 border-t border-[#3b1828] jjwxc-border-subtle flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {/* Copy tên gốc tiếng Trung */}
                    <button
                      onClick={(e) => handleCopyChinese(novel.title, novel.novelId, e)}
                      className="px-2.5 py-1 rounded-lg border border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface hover:opacity-90 jjwxc-text-sub hover:text-white jjwxc-text-main text-[11px] font-bold flex items-center gap-1.5 transition-all"
                      title="Sao chép tên truyện gốc tiếng Trung để tìm kiếm raw/convert"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Đã chép' : 'Chép tên gốc'}</span>
                    </button>

                    {/* Mở link JJWXC gốc */}
                    <a
                      href={novel.jjwxcUrl || `https://www.jjwxc.net/onebook.php?novelid=${novel.novelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg border border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface hover:opacity-90 jjwxc-text-sub hover:text-white jjwxc-text-main text-[11px] font-bold flex items-center gap-1 transition-all"
                      title="Mở trang truyện trực tiếp trên Tấn Giang"
                    >
                      <span>Trang gốc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <span className="text-xs jjwxc-tab-active font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer">
                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 mt-6 p-3 rounded-xl bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border">
            <div className="text-xs font-bold text-white/80">
              Hiển thị trang <strong className="text-emerald-400">{currentPage}</strong> / {totalPages} (Tối đa 100 tác phẩm - 20 bộ/trang)
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    currentPage === p
                      ? 'bg-emerald-500 text-white font-black scale-105 border border-emerald-400'
                      : 'bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border text-white/70 hover:text-white'
                  }`}
                >
                  Trang {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
      )}

      {/* Modal Xem Chi Tiết Tác Phẩm & Toàn Bộ Văn Án */}
      {activeNovel && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveNovel(null)}
        >
          <div 
            className="w-full max-w-2xl bg-[#160a11] jjwxc-bg-card border border-[#3b1828] jjwxc-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 sm:p-6 border-b border-[#3b1828] jjwxc-border flex items-center justify-between bg-[#210e19] jjwxc-bg-surface">
              <div className="flex items-center gap-3">
                {getRankBadge(activeNovel.rank)}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white jjwxc-text-main tracking-tight drop-shadow-sm">
                    {activeNovel.title}
                  </h3>
                  <div className="text-xs jjwxc-text-sub mt-0.5 flex items-center gap-2">
                    <span>Tác giả: <strong className="text-white jjwxc-text-main">{activeNovel.author}</strong></span>
                    <span>•</span>
                    <span>Mã truyện Tấn Giang: <strong className="text-emerald-400 font-mono font-bold">{activeNovel.novelId}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveNovel(null)}
                className="p-2 rounded-xl border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card jjwxc-text-sub hover:text-white jjwxc-text-main hover:bg-[#210e19] jjwxc-bg-surface transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Box tổng quan bằng tiếng Việt */}
              <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border">
                <div className="w-28 h-36 rounded-lg overflow-hidden flex-shrink-0 border border-[#3b1828] jjwxc-border shadow bg-[#160a11] jjwxc-bg-card mx-auto sm:mx-0">
                  <img
                    src={getCoverSrc(activeNovel)}
                    alt={activeNovel.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src;
                      if (!currentSrc.includes('/api/jjwxc/cover/')) {
                        e.currentTarget.src = `/api/jjwxc/cover/${activeNovel.novelId}`;
                      }
                    }}
                  />
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold jjwxc-text-sub">Trạng thái:</span>
                    <span className={`px-2.5 py-0.5 rounded border font-bold text-xs ${
                      formatStatusVi(activeNovel.status).isCompleted
                        ? 'jjwxc-status-completed'
                        : 'jjwxc-status-ongoing'
                    }`}>
                      {formatStatusVi(activeNovel.status).label}
                    </span>
                    {activeNovel.wordCount && (
                      <span className="jjwxc-text-sub">
                        • {formatWordsVi(activeNovel.wordCount)} ({activeNovel.wordCount.trim()} chữ)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold jjwxc-text-sub">Thể loại tác phẩm: </span>
                    <span className="text-white jjwxc-text-main font-bold">{formatGenreVi(activeNovel.genre)}</span>
                    <span className="text-[10px] jjwxc-text-sub ml-1 font-mono">({activeNovel.genre})</span>
                  </div>

                  {activeNovel.score && (
                    <div>
                      <span className="font-bold text-amber-400">Điểm tích lũy: </span>
                      <span className="text-amber-300 font-black">{formatScoreVi(activeNovel.score)}</span>
                      <span className="text-[10px] jjwxc-text-sub ml-1 font-mono">({activeNovel.score.trim()})</span>
                    </div>
                  )}

                  {activeNovel.bookmarks && (
                    <div>
                      <span className="font-bold text-emerald-400">Lượt bookmark (Thâu tàng): </span>
                      <span className="text-emerald-300 font-black">{formatBookmarksVi(activeNovel.bookmarks)}</span>
                      <span className="text-[10px] jjwxc-text-sub ml-1 font-mono">({typeof activeNovel.bookmarks === 'number' ? activeNovel.bookmarks.toLocaleString('vi-VN') : activeNovel.bookmarks})</span>
                    </div>
                  )}

                  {activeNovel.bawang && (
                    <div>
                      <span className="font-bold text-pink-400">Phiếu bá vương (Donate): </span>
                      <span className="text-pink-300 font-black">{formatBawangVi(activeNovel.bawang)}</span>
                      <span className="text-[10px] jjwxc-text-sub ml-1 font-mono">({typeof activeNovel.bawang === 'number' ? activeNovel.bawang.toLocaleString('vi-VN') : activeNovel.bawang})</span>
                    </div>
                  )}

                  {activeNovel.rating && (
                    <div>
                      <span className="font-bold text-amber-400">Điểm đánh giá hoàn thành: </span>
                      <span className="text-amber-300 font-black">{formatRatingVi(activeNovel.rating)} / 10 ⭐</span>
                    </div>
                  )}

                  {activeNovel.publishDate && (
                    <div>
                      <span className="font-bold jjwxc-text-sub">Ngày xuất bản / Cập nhật: </span>
                      <span className="text-white jjwxc-text-main">{activeNovel.publishDate}</span>
                    </div>
                  )}

                  {/* Danh sách toàn bộ tag Tấn Giang của truyện */}
                  {activeNovel.tags && activeNovel.tags.length > 0 && (
                    <div className="pt-1">
                      <div className="font-bold jjwxc-text-sub mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Tag nội dung Tấn Giang (内容标签):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeNovel.tags.map((t, idx) => {
                          const { vi, zh } = getTagDisplayName(t);
                          const core = getCoreTagConfig(t);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveNovel(null);
                                setHubMode('tags');
                                setSelectedTagId(core ? core.id : zh);
                                window.scrollTo({ top: 120, behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1 rounded-md border text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs jjwxc-tag-pill"
                              title={`Xem BXH tag: ${vi} (${zh})`}
                            >
                              <Hash className="w-3 h-3 opacity-70" />
                              <span>{vi}</span>
                              <span className="text-[10px] opacity-60">({zh})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={(e) => handleCopyChinese(activeNovel.title, activeNovel.novelId, e)}
                      className="px-3 py-1.5 rounded-lg border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card hover:bg-[#210e19] jjwxc-bg-surface text-white jjwxc-text-main font-bold flex items-center gap-1.5 transition-all text-xs"
                    >
                      {copiedId === activeNovel.novelId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy tên gốc</span>
                        </>
                      )}
                    </button>

                    <a
                      href={activeNovel.jjwxcUrl || `https://www.jjwxc.net/onebook.php?novelid=${activeNovel.novelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-[#3b1828] jjwxc-border bg-[#160a11] jjwxc-bg-card hover:bg-[#210e19] jjwxc-bg-surface text-white jjwxc-text-main font-bold flex items-center gap-1.5 transition-all text-xs"
                    >
                      <span>Mở trên Tấn Giang</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={(e) => toggleSaveNovel(activeNovel.novelId, e)}
                      className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                        savedNovelIds.includes(activeNovel.novelId)
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-[#160a11] jjwxc-bg-card border-[#3b1828] jjwxc-border jjwxc-text-sub hover:text-white jjwxc-text-main'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedNovelIds.includes(activeNovel.novelId) ? 'Đã lưu theo dõi' : 'Lưu theo dõi'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Phần Giới thiệu tác phẩm (100% Nguyên tác Tiếng Trung) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider jjwxc-text-sub flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Văn án tác phẩm:
                  </h4>
                </div>

                {/* Khung nội dung văn án nguyên tác 100% tiếng Trung */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#210e19] jjwxc-bg-surface border border-[#3b1828] jjwxc-border text-sm leading-relaxed text-white jjwxc-text-main whitespace-pre-line font-sans shadow-inner max-h-96 overflow-y-auto pr-2">
                  {isLoadingIntro ? (
                    <div className="flex items-center gap-2 py-8 justify-center jjwxc-text-sub text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>Đang tải văn án đầy đủ từ Tấn Giang...</span>
                    </div>
                  ) : (
                    activeNovel.intro || 'Tác phẩm chưa có phần giới thiệu công khai trên Tấn Giang.'
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-[#3b1828] jjwxc-border bg-[#210e19] jjwxc-bg-surface flex items-center justify-between">
              <span className="text-xs jjwxc-text-sub">
                Đường dẫn gốc: <code className="text-white jjwxc-text-main font-mono">onebook.php?novelid={activeNovel.novelId}</code>
              </span>
              <button
                onClick={() => setActiveNovel(null)}
                className="px-5 py-2 rounded-xl border text-xs font-bold transition-all shadow-md jjwxc-btn-close cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
