import React from 'react';
import { Comment, Story, Chapter } from '../types';
import { MessageCircle, BookOpen, Clock } from 'lucide-react';

interface LatestCommentsSectionProps {
  comments: Comment[];
  stories: Story[];
  chapters: Chapter[];
  onSelectStory: (story: Story) => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export const LatestCommentsSection: React.FC<LatestCommentsSectionProps> = ({
  comments,
  stories,
  chapters,
  onSelectStory,
  onSelectChapter,
}) => {
  // Sort comments by timestamp/id (newest first), filtering out special reaction comments
  const recentComments = [...(comments || [])]
    .filter((cm) => cm && cm.content !== '__paragraph_reactions__' && cm.content !== '__chapter_reactions__' && cm.content !== '__story_reactions__')
    .slice(0, 3);

  const handleCommentClick = (comment: Comment) => {
    if (!comment) return;
    const story = (stories || []).find((s) => s && s.id === comment.storyId);
    if (!story) return;

    if (comment.chapterId) {
      const chapter = (chapters || []).find((c) => c && c.id === comment.chapterId);
      if (chapter) {
        onSelectChapter(chapter);
        return;
      }
    }
    onSelectStory(story);
  };

  return (
    <div className="bg-[#11090c] border border-[#2d1822] p-4 font-mono-code space-y-3.5 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#2d1822] pb-2.5">
        <h2 className="font-mono-code font-bold text-[#e0c0cc] text-xs uppercase tracking-[0.15em] flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#d0a0b0]" />
          <span>Bình luận mới nhất</span>
        </h2>
      </div>

      <div className="space-y-2.5">
        {recentComments.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8a717a]">
            Chưa có bình luận nào.
          </div>
        ) : (
          recentComments.map((comm) => {
            if (!comm) return null;
            const story = (stories || []).find((s) => s && s.id === comm.storyId);
            const chapter = comm.chapterId
              ? (chapters || []).find((c) => c && c.id === comm.chapterId)
              : null;

            return (
              <div
                key={comm.id}
                onClick={() => handleCommentClick(comm)}
                className="group p-3 bg-[#170d12] hover:bg-[#23121b] border border-[#2d1822] hover:border-[#5e2f46] transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold font-mono-code text-[#d0a0b0] group-hover:text-[#ffd6e2] transition">
                    {comm.userName}
                  </span>
                  <span className="text-[10px] text-[#8a717a] font-tech flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {comm.createdAt}
                  </span>
                </div>

                <p className="text-xs text-[#e0d0d5] line-clamp-2 leading-relaxed italic bg-[#10080c] p-2 border-l-2 border-[#5e2f46]">
                  "{comm.content}"
                </p>

                {story && (
                  <div className="text-[11px] text-[#8a717a] truncate pt-0.5 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-[#5e2f46] shrink-0" />
                    <span className="truncate">
                      tại <span className="text-[#c0a0aa] font-semibold">{story.title}</span>
                      {chapter && ` • Chương ${chapter.chapterNumber}`}
                    </span>
                    {comm.paragraphIndex !== undefined && (
                      <span className="text-[10px] bg-[#221019] border border-[#5e2f46] text-[#ffd6e2] px-1 py-0.2 shrink-0 font-mono-code">
                        Đoạn #{comm.paragraphIndex + 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
