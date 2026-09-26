import React from 'react';
import { Story } from '../types';
import { Eye, Flame, BookOpen } from 'lucide-react';

interface RankingSectionProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
}

export const RankingSection: React.FC<RankingSectionProps> = ({
  stories,
  onSelectStory,
}) => {
  // Sort stories by viewsCount descending
  const rankedStories = [...(stories || [])]
    .filter(Boolean)
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 3);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="bg-[#3d1e2c] text-[#f2e6e8] border border-[#733d52] px-2 py-0.5 text-xs font-bold font-mono-code flex items-center gap-1 shrink-0">
            <span>#1</span>
          </span>
        );
      case 1:
        return (
          <span className="bg-[#2b1620] text-[#e0d0d5] border border-[#5e2f46] px-2 py-0.5 text-xs font-bold font-mono-code flex items-center gap-1 shrink-0">
            <span>#2</span>
          </span>
        );
      case 2:
        return (
          <span className="bg-[#1f0f17] text-[#c0a0aa] border border-[#3d1e2c] px-2 py-0.5 text-xs font-bold font-mono-code flex items-center gap-1 shrink-0">
            <span>#3</span>
          </span>
        );
      default:
        return (
          <span className="bg-[#1c0f15] text-[#8a717a] border border-[#2d1822] px-2 py-0.5 text-xs font-bold font-mono-code shrink-0">
            #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#11090c] border border-[#2d1822] p-4 font-mono-code space-y-3.5 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#2d1822] pb-2.5">
        <h2 className="font-mono-code font-bold text-[#e0c0cc] text-xs uppercase tracking-[0.15em] flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#d0a0b0]" />
          <span>Bảng xếp hạng lượt đọc</span>
        </h2>
      </div>

      <div className="space-y-2.5">
        {rankedStories.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8a717a]">
            Chưa có truyện nào để xếp hạng.
          </div>
        ) : (
          rankedStories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="group p-2.5 bg-[#170d12] hover:bg-[#23121b] border border-[#2d1822] hover:border-[#5e2f46] transition cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getRankBadge(idx)}

                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="w-10 h-14 object-cover border border-[#2d1822] shrink-0 group-hover:border-[#5e2f46] transition"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300';
                  }}
                />

                <div className="min-w-0">
                  <h3 className="font-mono-code font-bold text-[#e0c0cc] text-sm group-hover:text-[#d0a0b0] transition truncate">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#8a717a] truncate mt-0.5 font-mono-code">
                    Tác giả: <span className="text-[#c0a0aa]">{story.author}</span>
                  </p>
                </div>
              </div>

              {/* View Count Badge */}
              <div className="flex items-center gap-1.5 text-xs text-[#d0a0b0] bg-[#23121b] px-2.5 py-1 border border-[#3d1e2c] shrink-0 font-tech">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-bold">{story.viewsCount || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
