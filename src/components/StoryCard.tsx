import React from 'react';
import { Story } from '../types';
import { getStoryBorderStyle, StoryCornerAccents } from '../lib/borderStyles';
import { getEffectiveStory } from '../lib/storyUtils';

interface StoryCardProps {
  story: Story;
  onSelectStory: (story: Story) => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelectStory,
}) => {
  if (!story) return null;
  const effectiveStory = getEffectiveStory(story);

  return (
    <article
      onClick={() => onSelectStory(effectiveStory)}
      className="bg-[#11090c] border border-[#2d1822] hover:border-[#5e2f46] p-2.5 transition-all duration-200 cursor-pointer flex flex-col group font-mono-code relative hover:scale-[1.01] rounded-xs shadow-xs"
    >
      <div className="space-y-2.5 relative z-10">
        {/* Cover image if available */}
        {effectiveStory.coverUrl ? (
          <div className="w-full aspect-[3/4] bg-[#170d12] border border-[#2d1822] overflow-hidden flex justify-center items-center rounded-xs">
            <img
              src={effectiveStory.coverUrl}
              alt={effectiveStory.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        ) : (
          <div className="w-full aspect-[3/4] bg-[#170d12] border border-[#2d1822] flex items-center justify-center text-xs text-[#8a717a] rounded-xs">
            Chưa có ảnh bìa
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-mono-code font-bold text-xs text-[#e0c0cc] group-hover:text-[#ffd6e2] transition leading-snug line-clamp-2">
            {effectiveStory.title}
          </h3>

          <div className="text-[11px] text-[#8a717a] space-y-0.5 font-mono-code">
            <p className="truncate">Tác giả: <span className="text-[#c0a0aa]">{effectiveStory.author}</span></p>
            <p>Lượt đọc: <span className="text-[#e0c0cc]">{effectiveStory.viewsCount}</span></p>
          </div>
        </div>
      </div>
    </article>
  );
};

