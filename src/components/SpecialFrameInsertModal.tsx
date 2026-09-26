import React, { useState } from 'react';
import {
  BellRing,
  MessageSquare,
  Smartphone,
  Mail,
  Frame,
  Cloud,
  Shield,
  StickyNote,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Check,
  Send,
  Eye,
  Terminal,
} from 'lucide-react';
import { SpecialBlockType, SpecialBlockRenderer } from './ChapterSpecialBlocks';

interface SpecialFrameInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode: (snippet: string) => void;
  initialContent?: string;
  initialType?: SpecialBlockType;
  themeColors?: {
    bg?: string;
    cardBg?: string;
    border?: string;
    btnBg?: string;
    btnText?: string;
    btnSecondaryBg?: string;
    btnBorder?: string;
    text?: string;
    textMuted?: string;
    accentColor?: string;
  };
}

export const SpecialFrameInsertModal: React.FC<SpecialFrameInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertCode,
  initialContent,
  initialType = 'system',
  themeColors,
}) => {
  if (!isOpen) return null;

  const tBg = themeColors?.bg || '#18181b';
  const tCardBg = themeColors?.cardBg || '#27272a';
  const tBorder = themeColors?.border || '#3f3f46';
  const tBtnBg = themeColors?.btnBg || '#3f3f46';
  const tBtnText = themeColors?.btnText || '#f4f4f5';
  const tBtnSecBg = themeColors?.btnSecondaryBg || '#27272a';
  const tText = themeColors?.text || '#f4f4f5';
  const tTextMuted = themeColors?.textMuted || '#a1a1aa';
  const tAccent = themeColors?.accentColor || themeColors?.text || themeColors?.btnText || '#f4f4f5';

  const [selectedType, setSelectedType] = useState<SpecialBlockType>(initialType);
  const [titleInput, setTitleInput] = useState(() => {
    if (initialType === 'system') return 'THÔNG BÁO HỆ THỐNG';
    if (initialType === 'forum' || initialType === 'netizen') return 'Diễn đàn Mạng Xã Hội';
    if (initialType === 'chat') return 'Hội thoại Trò Chuyện';
    if (initialType === 'letter') return 'Thư Từ / Mật Hàm';
    if (initialType === 'thought') return 'Độc thoại nội tâm';
    if (initialType === 'status') return 'BẢNG TRẠNG THÁI NHÂN VẬT';
    if (initialType === 'note') return 'Lời tác giả / Chú thích';
    if (initialType === 'warning') return 'CẢNH BÁO NGUY HIỂM';
    return 'THÔNG BÁO HỆ THỐNG';
  });
  const [metaInput, setMetaInput] = useState('');
  const [singleContent, setSingleContent] = useState(() => {
    if (initialContent && initialContent.trim()) {
      return initialContent.trim();
    }
    return 'Chúc mừng ký chủ đã hoàn thành nhiệm vụ ẩn!\nPhần thưởng: 1000 Điểm kinh nghiệm và 1 Thần khí cấp S.';
  });

  // Dành riêng cho Chat
  const [chatRows, setChatRows] = useState<
    Array<{ sender: string; side: 'left' | 'right'; text: string }>
  >(() => {
    if (initialContent && initialContent.trim()) {
      const lines = initialContent.trim().split('\n').filter(Boolean);
      return lines.map((line, idx) => ({
        sender: idx % 2 === 0 ? 'Đối phương' : 'Tôi',
        side: idx % 2 === 0 ? ('left' as const) : ('right' as const),
        text: line.trim(),
      }));
    }
    return [
      { sender: 'Lâm Tiêu', side: 'left', text: 'Cậu đang ở đâu thế? Mọi người đang đợi nè!' },
      { sender: 'Tôi', side: 'right', text: 'Mình vừa ra khỏi phòng thi, tới ngay đây!' },
    ];
  });

  // Dành riêng cho Diễn đàn / Cư dân mạng
  const [forumRows, setForumRows] = useState<
    Array<{ sender: string; time: string; likes: string; text: string }>
  >(() => {
    if (initialContent && initialContent.trim()) {
      const lines = initialContent.trim().split('\n').filter(Boolean);
      return lines.map((line, idx) => ({
        sender: `Cư dân mạng #${idx + 1}`,
        time: 'Vừa xong',
        likes: '10',
        text: line.trim(),
      }));
    }
    return [
      { sender: 'Lầu 1 - Ăn dưa hóng biến', time: '1 phút trước', likes: '99+', text: 'Trời ơi hóng tin này cả tuần nay rồi, cuối cùng cũng công bố!' },
      { sender: 'ID_9832 Qua Đường', time: 'Vừa xong', likes: '45', text: 'Căng đét luôn, lót dép ngồi hóng tiếp chap sau!' },
    ];
  });

  // Dành riêng cho Bảng trạng thái RPG
  const [statusRows, setStatusRows] = useState<Array<{ key: string; val: string }>>(() => {
    if (initialContent && initialContent.trim()) {
      const lines = initialContent.trim().split('\n').filter(Boolean);
      const parsed = lines.map((line) => {
        if (line.includes(':')) {
          const [k, ...v] = line.split(':');
          return { key: k.trim(), val: v.join(':').trim() };
        }
        return { key: 'Mô tả', val: line.trim() };
      });
      if (parsed.length > 0) return parsed;
    }
    return [
      { key: 'Họ tên', val: 'Cố Dạ Bạch' },
      { key: 'Chủng tộc', val: 'Nhân tộc (Đột biến)' },
      { key: 'Cảnh giới', val: 'Kim Đan Sơ Kỳ' },
      { key: 'Chiến lực', val: '98,500' },
      { key: 'Kỹ năng đặc biệt', val: 'Lôi Đình Kiếm Quyết (Cấp 5)' },
    ];
  });

  const handleSelectType = (type: SpecialBlockType) => {
    setSelectedType(type);

    // Cập nhật tiêu đề & meta mặc định tương ứng với loại khung
    if (type === 'system') {
      setTitleInput('THÔNG BÁO HỆ THỐNG');
      setMetaInput('Nhiệm vụ mới');
    } else if (type === 'forum' || type === 'netizen') {
      setTitleInput('Diễn đàn Mạng Xã Hội');
      setMetaInput('Chủ đề nóng hổi');
    } else if (type === 'chat') {
      setTitleInput('Hội thoại Trò Chuyện');
      setMetaInput('');
    } else if (type === 'letter') {
      setTitleInput('Thư Từ / Mật Hàm');
      setMetaInput('Gửi người thừa kế');
    } else if (type === 'thought') {
      setTitleInput('Độc thoại nội tâm');
      setMetaInput('');
    } else if (type === 'status') {
      setTitleInput('BẢNG TRẠNG THÁI NHÂN VẬT');
      setMetaInput('');
    } else if (type === 'note') {
      setTitleInput('Lời tác giả / Chú thích');
      setMetaInput('');
    } else if (type === 'warning') {
      setTitleInput('CẢNH BÁO NGUY HIỂM');
      setMetaInput('');
    }

    // Nếu người dùng đã có nội dung (ví dụ từ việc bôi đen văn bản ban đầu hoặc đã gõ):
    // TUYỆT ĐỐI KHÔNG RESET nội dung về dữ liệu mẫu (sample), mà đồng bộ nội dung của người dùng sang cấu trúc loại mới
    const currentBaseText = singleContent && singleContent.trim()
      ? singleContent.trim()
      : (initialContent && initialContent.trim() ? initialContent.trim() : '');

    if (currentBaseText) {
      // Nếu chuyển sang Chat và chưa có chatRows được tạo từ nội dung này
      const lines = currentBaseText.split('\n').filter(Boolean);
      setChatRows(lines.map((line, idx) => ({
        sender: idx % 2 === 0 ? 'Đối phương' : 'Tôi',
        side: idx % 2 === 0 ? ('left' as const) : ('right' as const),
        text: line.trim(),
      })));

      // Nếu chuyển sang Forum / Cư dân mạng
      setForumRows(lines.map((line, idx) => ({
        sender: `Cư dân mạng #${idx + 1}`,
        time: 'Vừa xong',
        likes: `${10 * (idx + 1)}`,
        text: line.trim(),
      })));

      // Nếu chuyển sang Status RPG
      const parsedStatus = lines.map((line) => {
        if (line.includes(':')) {
          const [k, ...v] = line.split(':');
          return { key: k.trim(), val: v.join(':').trim() };
        }
        return { key: `Mục ${lines.length > 1 ? lines.indexOf(line) + 1 : ''}`.trim(), val: line.trim() };
      });
      setStatusRows(parsedStatus);
    } else {
      // Chỉ khi hoàn toàn không có nội dung nào thì mới đặt văn bản mẫu cho các khung đơn
      if (type === 'system') {
        setSingleContent('Chúc mừng ký chủ đã hoàn thành nhiệm vụ ẩn!\nPhần thưởng: 1000 Điểm kinh nghiệm và 1 Thần khí cấp S.');
      } else if (type === 'letter') {
        setSingleContent('Gửi người nhận,\nNếu bạn đọc được bức thư này, hãy đến gặp tôi tại điểm hẹn cũ...');
      } else if (type === 'thought') {
        setSingleContent('Không ngờ chuyện này lại diễn ra nhanh đến như vậy...');
      } else if (type === 'note') {
        setSingleContent('(*) Lời tác giả: Cảm ơn các bạn độc giả đã đồng hành cùng chương truyện này.');
      } else if (type === 'warning') {
        setSingleContent('Cảnh báo: Khu vực phía trước cực kỳ nguy hiểm, hãy cẩn thận!');
      }
    }
  };

  const generateSnippet = (): string => {
    const supportsMeta = ['system', 'forum', 'netizen', 'letter'].includes(selectedType);
    let titleHeader = '';
    if (supportsMeta && metaInput.trim()) {
      titleHeader = titleInput.trim() ? `${titleInput.trim()} | ${metaInput.trim()}` : `| ${metaInput.trim()}`;
    } else {
      titleHeader = titleInput.trim();
    }

    const tagOpening = (type: string, header: string) => (header ? `[${type}: ${header}]` : `[${type}]`);

    if (selectedType === 'chat') {
      const innerLines = chatRows.map((r) => `[${r.side}: ${r.sender}]: ${r.text}`).join('\n');
      return `\n${tagOpening('chat', titleHeader)}\n${innerLines}\n[/chat]\n`;
    }

    if (selectedType === 'forum' || selectedType === 'netizen') {
      const innerLines = forumRows
        .map((r) => {
          const header = r.time ? `${r.sender} | ${r.time}` : r.sender;
          return `[netizen: ${header}]: ${r.text}`;
        })
        .join('\n');
      return `\n${tagOpening('forum', titleHeader)}\n${innerLines}\n[/forum]\n`;
    }

    if (selectedType === 'status') {
      const innerLines = statusRows.map((r) => `${r.key}: ${r.val}`).join('\n');
      return `\n${tagOpening('status', titleHeader)}\n${innerLines}\n[/status]\n`;
    }

    return `\n${tagOpening(selectedType, titleHeader)}\n${singleContent.trim()}\n[/${selectedType}]\n`;
  };

  const handleConfirmInsert = () => {
    const snippet = generateSnippet();
    onInsertCode(snippet);
    onClose();
  };

  // Preview Block Mock
  const supportsMeta = ['system', 'forum', 'netizen', 'letter'].includes(selectedType);
  const previewBlock = {
    type: selectedType,
    title: titleInput,
    meta: supportsMeta ? metaInput : '',
    rawText: singleContent,
    lines:
      selectedType === 'status'
        ? statusRows.map((r) => `${r.key}: ${r.val}`)
        : singleContent.split('\n'),
    subItems:
      selectedType === 'chat'
        ? chatRows
        : selectedType === 'forum' || selectedType === 'netizen'
        ? forumRows
        : undefined,
  };

  return (
    <div className="special-frame-modal-root fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs font-mono">
      <style>{`
        .special-frame-modal-root ::selection,
        .special-frame-modal-root *::selection,
        .special-frame-modal-root input::selection,
        .special-frame-modal-root textarea::selection,
        .special-frame-modal-root select::selection {
          background-color: ${tBtnBg} !important;
          color: ${tBtnText || '#ffffff'} !important;
        }
      `}</style>
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ background: tCardBg, borderColor: tBorder, color: tText }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b shrink-0"
          style={{ borderColor: tBorder }}
        >
          <div className="flex items-center gap-2">
            <Frame className="w-5 h-5" style={{ color: tAccent }} />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: tText }}>
                Chèn Khung Đặc Biệt Vào Chương
              </h3>
              <p className="text-[11px] opacity-70" style={{ color: tTextMuted }}>
                Tạo khung thông báo hệ thống, bình luận cư dân mạng, chat điện thoại, thư tay,...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-75 transition cursor-pointer"
            style={{ color: tText }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body 2 columns: Config & Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: tBorder }}>
          
          {/* Cột trái: Tùy chỉnh (7 cols) */}
          <div className="lg:col-span-6 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[65vh]">
            {/* Chọn Loại Khung */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: tAccent }}>
                1. Chọn kiểu khung:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'system', name: 'Hệ thống', icon: BellRing, color: '#38bdf8' },
                  { id: 'forum', name: 'Cư dân mạng', icon: MessageSquare, color: '#f472b6' },
                  { id: 'chat', name: 'Chat / SMS', icon: Smartphone, color: '#4ade80' },
                  { id: 'letter', name: 'Thư / Nhật ký', icon: Mail, color: '#fbbf24' },
                  { id: 'thought', name: 'Độc thoại', icon: Cloud, color: '#c084fc' },
                  { id: 'status', name: 'Bảng RPG', icon: Shield, color: '#e879f9' },
                  { id: 'note', name: 'Lời tác giả', icon: StickyNote, color: '#94a3b8' },
                  { id: 'warning', name: 'Cảnh báo', icon: AlertTriangle, color: '#f87171' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isCur = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectType(item.id as SpecialBlockType)}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                        isCur ? 'font-bold shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        background: isCur ? tBtnBg : tBg,
                        borderColor: isCur ? tAccent : tBorder,
                        color: isCur ? tBtnText : tText,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] leading-tight line-clamp-1">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tiêu đề & Thông tin phụ */}
            {supportsMeta ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block" style={{ color: tText }}>
                    Tiêu đề khung:
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Ví dụ: THÔNG BÁO HỆ THỐNG..."
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: tBg, borderColor: tBorder, color: tText }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block" style={{ color: tText }}>
                    Ghi chú góc (Meta / Thời gian):
                  </label>
                  <input
                    type="text"
                    value={metaInput}
                    onChange={(e) => setMetaInput(e.target.value)}
                    placeholder="Ví dụ: 1 phút trước, Cấp SSS..."
                    className="w-full p-2 rounded border text-xs focus:outline-none"
                    style={{ background: tBg, borderColor: tBorder, color: tText }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: tText }}>
                  Tiêu đề khung:
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Nhập tiêu đề khung..."
                  className="w-full p-2 rounded border text-xs focus:outline-none"
                  style={{ background: tBg, borderColor: tBorder, color: tText }}
                />
              </div>
            )}

            {/* Form nhập nội dung chi tiết theo từng loại */}
            {selectedType === 'chat' ? (
              /* Quản lý các dòng chat */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                    Danh sách câu thoại / tin nhắn ({chatRows.length}):
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setChatRows([...chatRows, { sender: 'Lâm Tiêu', side: 'left', text: 'Nội dung tin nhắn mới...' }])
                    }
                    className="px-2 py-1 text-[10px] rounded border flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
                    style={{ background: tBtnSecBg, borderColor: tBorder, color: tText }}
                  >
                    <Plus className="w-3 h-3" /> Thêm câu thoại
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {chatRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border space-y-1.5 text-xs"
                      style={{ background: tBg, borderColor: tBorder }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.sender}
                          onChange={(e) => {
                            const clone = [...chatRows];
                            clone[idx].sender = e.target.value;
                            setChatRows(clone);
                          }}
                          placeholder="Người nói"
                          className="w-32 p-1 rounded border text-[11px]"
                          style={{ background: tCardBg, borderColor: tBorder, color: tText }}
                        />
                        <select
                          value={row.side}
                          onChange={(e) => {
                            const clone = [...chatRows];
                            clone[idx].side = e.target.value as 'left' | 'right';
                            setChatRows(clone);
                          }}
                          className="p-1 rounded border text-[11px] cursor-pointer"
                          style={{ background: tCardBg, borderColor: tBorder, color: tText }}
                        >
                          <option value="left">Bên Trái (Người khác)</option>
                          <option value="right">Bên Phải (Tôi / Gửi đi)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setChatRows(chatRows.filter((_, i) => i !== idx))}
                          className="p-1 text-red-400 hover:text-red-300 ml-auto cursor-pointer"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={row.text}
                        onChange={(e) => {
                          const clone = [...chatRows];
                          clone[idx].text = e.target.value;
                          setChatRows(clone);
                        }}
                        placeholder="Nội dung tin nhắn..."
                        className="w-full p-1.5 rounded border text-xs"
                        style={{ background: tCardBg, borderColor: tBorder, color: tText }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedType === 'forum' || selectedType === 'netizen' ? (
              /* Quản lý các dòng bình luận diễn đàn */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                    Danh sách bình luận cư dân mạng ({forumRows.length}):
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForumRows([
                        ...forumRows,
                        { sender: 'Cư dân mạng mới', time: 'Vừa xong', likes: '12', text: 'Bình luận mới...' },
                      ])
                    }
                    className="px-2 py-1 text-[10px] rounded border flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
                    style={{ background: tBtnSecBg, borderColor: tBorder, color: tText }}
                  >
                    <Plus className="w-3 h-3" /> Thêm bình luận
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {forumRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border space-y-1.5 text-xs"
                      style={{ background: tBg, borderColor: tBorder }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.sender}
                          onChange={(e) => {
                            const clone = [...forumRows];
                            clone[idx].sender = e.target.value;
                            setForumRows(clone);
                          }}
                          placeholder="Tên cư dân mạng"
                          className="flex-1 p-1 rounded border text-[11px]"
                          style={{ background: tCardBg, borderColor: tBorder, color: tText }}
                        />
                        <input
                          type="text"
                          value={row.time}
                          onChange={(e) => {
                            const clone = [...forumRows];
                            clone[idx].time = e.target.value;
                            setForumRows(clone);
                          }}
                          placeholder="Thời gian"
                          className="w-24 p-1 rounded border text-[11px]"
                          style={{ background: tCardBg, borderColor: tBorder, color: tText }}
                        />
                        <button
                          type="button"
                          onClick={() => setForumRows(forumRows.filter((_, i) => i !== idx))}
                          className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={row.text}
                        onChange={(e) => {
                          const clone = [...forumRows];
                          clone[idx].text = e.target.value;
                          setForumRows(clone);
                        }}
                        placeholder="Nội dung bình luận..."
                        className="w-full p-1.5 rounded border text-xs"
                        style={{ background: tCardBg, borderColor: tBorder, color: tText }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedType === 'status' ? (
              /* Quản lý các dòng chỉ số RPG */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                    Các dòng chỉ số nhân vật ({statusRows.length}):
                  </label>
                  <button
                    type="button"
                    onClick={() => setStatusRows([...statusRows, { key: 'Chỉ số mới', val: 'Giá trị' }])}
                    className="px-2 py-1 text-[10px] rounded border flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
                    style={{ background: tBtnSecBg, borderColor: tBorder, color: tText }}
                  >
                    <Plus className="w-3 h-3" /> Thêm chỉ số
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {statusRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => {
                          const clone = [...statusRows];
                          clone[idx].key = e.target.value;
                          setStatusRows(clone);
                        }}
                        placeholder="Tên chỉ số (VD: Cấp độ)"
                        className="w-1/2 p-1.5 rounded border text-xs"
                        style={{ background: tBg, borderColor: tBorder, color: tText }}
                      />
                      <input
                        type="text"
                        value={row.val}
                        onChange={(e) => {
                          const clone = [...statusRows];
                          clone[idx].val = e.target.value;
                          setStatusRows(clone);
                        }}
                        placeholder="Giá trị (VD: Lv.99)"
                        className="w-1/2 p-1.5 rounded border text-xs"
                        style={{ background: tBg, borderColor: tBorder, color: tText }}
                      />
                      <button
                        type="button"
                        onClick={() => setStatusRows(statusRows.filter((_, i) => i !== idx))}
                        className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Textarea đơn cho các loại còn lại */
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: tText }}>
                  Nội dung bên trong khung:
                </label>
                <textarea
                  rows={6}
                  value={singleContent}
                  onChange={(e) => setSingleContent(e.target.value)}
                  placeholder="Gõ hoặc dán nội dung vào đây..."
                  className="w-full p-2.5 rounded border text-xs leading-relaxed focus:outline-none resize-y"
                  style={{ background: tBg, borderColor: tBorder, color: tText }}
                />
              </div>
            )}
          </div>

          {/* Cột phải: Xem trước (Live Preview) (5 cols) */}
          <div className="lg:col-span-6 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[65vh] space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                <Eye className="w-4 h-4" />
                <span>Xem trước trực tiếp (Live Preview):</span>
              </div>
              <div
                className="p-4 rounded-xl border min-h-48 overflow-hidden transition-all"
                style={{ background: tBg, borderColor: tBorder }}
              >
                <SpecialBlockRenderer
                  block={previewBlock as any}
                  themeColors={themeColors}
                />
              </div>
            </div>

            {/* Mã chèn dạng Shortcode */}
            <div className="p-3 rounded-lg border space-y-1.5 text-[10px] font-mono" style={{ background: tCardBg, borderColor: tBorder }}>
              <span className="font-bold block" style={{ color: tAccent }}>
                Đoạn mã sẽ được chèn vào chương:
              </span>
              <pre className="p-2 rounded bg-black/40 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-24 opacity-80" style={{ color: tText }}>
                {generateSnippet().trim()}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="p-3.5 sm:p-4 border-t flex items-center justify-between gap-3 shrink-0"
          style={{ borderColor: tBorder, background: tCardBg }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border text-xs font-bold transition hover:opacity-80 cursor-pointer"
            style={{ background: tBtnSecBg, borderColor: tBorder, color: tText }}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmInsert}
            className="px-6 py-2 rounded border text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            style={{ background: tBtnBg, borderColor: tAccent, color: tBtnText }}
          >
            <Check className="w-4 h-4" />
            <span>Chèn vào nội dung chương</span>
          </button>
        </div>
      </div>
    </div>
  );
};
