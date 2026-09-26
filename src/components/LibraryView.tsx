import React from 'react';
import { Story, Chapter, BookmarkItem, ReadingProgress } from '../types';
import { StoryCard } from './StoryCard';
import { Bookmark, Clock } from 'lucide-react';

interface LibraryViewProps {
  stories: Story[];
  chapters: Chapter[];
  bookmarks: BookmarkItem[];
  readingHistory: ReadingProgress[];
  onSelectStory: (story: Story) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onToggleBookmark: (e: React.MouseEvent, storyId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  stories,
  chapters,
  bookmarks,
  readingHistory,
  onSelectStory,
  onSelectChapter,
  onToggleBookmark,
}) => {
  const bookmarkedSet = new Set((bookmarks || []).map(b => b && b.storyId));
  const bookmarkedStories = (stories || []).filter(s => s && bookmarkedSet.has(s.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-mono-code text-[#e0d0d5]">
      
      {/* Saved Stories Section */}
      <section className="space-y-4">
        <div className="border-b border-[#2d1822] pb-3 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#e0c0cc] fill-current" />
            <span>Danh sách truyện đã lưu ({bookmarkedStories.length})</span>
          </h2>
        </div>

        {bookmarkedStories.length === 0 ? (
          <div className="bg-[#11090c] border border-[#2d1822] p-8 text-center text-xs text-[#8a717a] font-mono-code">
            Bạn chưa lưu truyện nào. Hãy bấm biểu tượng lưu khi đọc truyện!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {bookmarkedStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onSelectStory={onSelectStory}
                isBookmarked={true}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reading History Section */}
      <section className="space-y-4">
        <div className="border-b border-[#2d1822] pb-3 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-[0.15em] text-[#e0c0cc] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8a717a]" />
            <span>Lịch sử đọc gần đây</span>
          </h2>
        </div>

        {readingHistory.length === 0 ? (
          <div className="bg-[#11090c] border border-[#2d1822] p-8 text-center text-xs text-[#8a717a] font-mono-code">
            Chưa có lịch sử đọc.
          </div>
        ) : (
          <div className="space-y-2">
            {(readingHistory || []).map((item) => {
              if (!item) return null;
              const story = (stories || []).find(s => s && s.id === item.storyId);
              const chapter = (chapters || []).find(c => c && c.id === item.chapterId);
              if (!story || !chapter) return null;

              return (
                <div
                  key={`${item.storyId}-${item.chapterId}`}
                  onClick={() => onSelectChapter(chapter)}
                  className="bg-[#11090c] border border-[#2d1822] hover:border-[#5e2f46] p-3 flex items-center justify-between cursor-pointer transition text-xs font-mono-code"
                >
                  <div>
                    <span className="font-bold text-[#e0c0cc] block text-sm font-mono-code">{story.title}</span>
                    <span className="text-xs text-[#8a717a]">Đã đọc: {chapter.title}</span>
                  </div>
                  <span className="text-xs text-[#d0a0b0] font-mono-code font-bold uppercase tracking-wider">Đọc tiếp →</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
