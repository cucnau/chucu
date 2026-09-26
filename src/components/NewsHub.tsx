import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsPost, UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { FileText, Send, Trash2, Users, Pencil, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsHubProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isEditor: boolean;
}

const renderContentWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="forum-link text-[#c026d3] dark:text-[#e879f9] hover:underline hover:text-[#9333ea] dark:hover:text-[#fbcfe8] transition duration-150 break-all inline font-bold"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export const NewsHub: React.FC<NewsHubProps> = ({ currentUser, userProfile, isEditor }) => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as NewsPost[];
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, []);

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'news'), {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.email || 'Admin',
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error posting news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = (post: NewsPost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdateNews = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'news', id), {
        title: editTitle.trim(),
        content: editContent.trim(),
        updatedAt: new Date().toISOString()
      });
      setEditingId(null);
      setEditTitle('');
      setEditContent('');
    } catch (error) {
      console.error('Error updating news:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 font-mono-code space-y-8">
      <div className="flex items-center gap-3 border-b border-[#30222a] pb-4">
        <div className="p-3 bg-[#e879f9]/10 rounded-lg">
          <Users className="w-6 h-6 text-[#e879f9]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#fbcfe8] uppercase tracking-wider">Diễn đàn</h2>
        </div>
      </div>

      {isEditor && (
        <form onSubmit={handlePostNews} className="bg-[#1f1017] p-4 rounded-xl border border-[#30222a] space-y-4 shadow-xl">
          <h3 className="font-bold text-[#fbcfe8] flex items-center gap-2">
            <FileText className="w-4 h-4" /> Đăng bài viết mới
          </h3>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-[#30222a] text-[#fbcfe8] px-3 py-2 text-sm rounded border border-transparent focus:border-[#e879f9] outline-none transition"
            />
          </div>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung bài viết (hỗ trợ nhập văn bản có xuống dòng)..."
              rows={4}
              className="w-full bg-[#30222a] text-[#fbcfe8] px-3 py-2 text-sm rounded border border-transparent focus:border-[#e879f9] outline-none transition resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#e879f9] text-[#1a0b12] text-sm font-bold rounded hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng bài'} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-[#fbcfe8]/50 italic text-sm bg-[#1f1017]/50 rounded-xl border border-[#30222a]">
            Chưa có bài viết nào được đăng.
          </div>
        ) : (
          posts.map((post) => {
            const canManage = isEditor || (currentUser && post.authorId === currentUser.uid);
            const isEditingThis = editingId === post.id;

            return (
              <div key={post.id} className="bg-[#1f1017] p-5 rounded-xl border border-[#30222a] shadow-lg relative group">
                {isEditingThis ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#e879f9] flex items-center gap-1.5 uppercase tracking-wider">
                      <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa bài viết
                    </h4>
                    <div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Tiêu đề bài viết..."
                        className="w-full bg-[#30222a] text-[#fbcfe8] px-3 py-2 text-sm rounded border border-transparent focus:border-[#e879f9] outline-none transition"
                      />
                    </div>
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Nội dung bài viết..."
                        rows={5}
                        className="w-full bg-[#30222a] text-[#fbcfe8] px-3 py-2 text-sm rounded border border-transparent focus:border-[#e879f9] outline-none transition resize-y"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#30222a] text-[#fbcfe8]/80 text-xs font-bold rounded hover:bg-[#3d2c36] transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateNews(post.id)}
                        disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#e879f9] text-[#1a0b12] text-xs font-bold rounded hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                      >
                        {isUpdating ? 'Đang lưu...' : 'Lưu'} <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {canManage && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10">
                        <button
                          onClick={() => handleStartEdit(post)}
                          className="p-1.5 bg-[#30222a] hover:bg-[#3d2c36] text-[#fbcfe8]/60 hover:text-[#e879f9] rounded-full transition cursor-pointer"
                          title="Sửa bài viết"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(post.id)}
                          className="p-1.5 bg-[#30222a] hover:bg-rose-900/50 text-[#fbcfe8]/60 hover:text-rose-400 rounded-full transition cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-[#fbcfe8] mb-2 pr-20">{post.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#fbcfe8]/60 mb-4 font-mono">
                      <span className="font-bold text-[#e879f9]">{post.authorName}</span>
                      <span>•</span>
                      <span>
                        {post.createdAt 
                          ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })
                          : 'Vừa xong'
                        }
                      </span>
                    </div>
                    <div className="text-sm text-[#fbcfe8]/90 leading-relaxed whitespace-pre-wrap font-sans">
                      {renderContentWithLinks(post.content)}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
