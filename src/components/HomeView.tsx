import React, { useState } from 'react';
import { Story, Chapter, Comment, LoungeMessage, UserProfile } from '../types';
import { StoryCard } from './StoryCard';
import { StoryCarousel } from './StoryCarousel';
import { LoungeChat } from './LoungeChat';
import { RankingSection } from './RankingSection';
import { LatestCommentsSection } from './LatestCommentsSection';
import { BookOpen, PlusCircle, Calendar, Flame, ChevronRight, Loader2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { calculateStreakReward, checkInDaily, getLocalDateString, getYesterdayDateString } from '../lib/storage';

interface HomeViewProps {
  stories: Story[];
  chapters: Chapter[];
  comments: Comment[];
  loungeMessages: LoungeMessage[];
  searchQuery: string;
  bookmarkedSet: Set<string>;
  currentUser: FirebaseUser | null;
  canPost: boolean;
  onSelectStory: (story: Story) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onToggleBookmark: (e: React.MouseEvent | string, storyId?: string) => void;
  onNavigateStudio: () => void;
  onOpenAuthModal: () => void;
  onCheckInSuccess?: (reward: number, newStreak: number, newBalance: number) => void;
  userProfile: UserProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  chapters,
  comments,
  loungeMessages,
  searchQuery,
  bookmarkedSet,
  currentUser,
  canPost,
  onSelectStory,
  onSelectChapter,
  onToggleBookmark,
  onNavigateStudio,
  onOpenAuthModal,
  onCheckInSuccess,
  userProfile,
}) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInNotice, setCheckInNotice] = useState<{ message: string; isError?: boolean } | null>(null);

  // Filter stories based on search query
  const filteredStories = (stories || []).filter((s) => {
    if (!s) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title ? s.title.toLowerCase().includes(q) : false;
      const matchAuthor = s.author ? s.author.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchAuthor) return false;
    }
    return true;
  });

  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();
  const hasCheckedInToday = userProfile?.lastCheckInDate === today;
  const currentStreak = userProfile?.streak || 0;
  const nextStreak = hasCheckedInToday ? currentStreak : userProfile?.lastCheckInDate === yesterday ? currentStreak + 1 : 1;
  const expectedReward = calculateStreakReward(nextStreak);

  const handleDirectCheckIn = async () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (hasCheckedInToday) return;

    setIsCheckingIn(true);
    setCheckInNotice(null);
    try {
      const res = await checkInDaily(currentUser.uid, userProfile || undefined);
      if (res.success) {
        setCheckInNotice({ message: `+${res.reward} Chucu! (Streak: ${res.streak} ngày)` });
        onCheckInSuccess?.(res.reward, res.streak, res.newBalance);
        setTimeout(() => setCheckInNotice(null), 4000);
      } else {
        setCheckInNotice({ message: res.message, isError: true });
        setTimeout(() => setCheckInNotice(null), 4000);
      }
    } catch (err: any) {
      setCheckInNotice({ message: err?.message || 'Lỗi khi điểm danh', isError: true });
      setTimeout(() => setCheckInNotice(null), 4000);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10 font-mono-code">
      {/* Dải truyện chuyển động liên tục nổi bật */}
      {stories.length > 0 && (
        <StoryCarousel 
          stories={stories} 
          onSelectStory={onSelectStory} 
        />
      )}

      {/* SECTION TOP: Lounge + Ranking & Comments Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column: Check-in + Lounge Chat Box */}
        <div className="lg:col-span-7 space-y-4">
          {/* Daily Check-In Widget Card */}
          <div className="bg-[#11090c] border border-[#2d1822] p-3.5 space-y-2.5 font-mono-code shadow-md">
            <div className="flex items-center justify-between border-b border-[#24111a] pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d0a0b0]" />
                <h3 className="text-xs font-bold text-[#e0c0cc] uppercase tracking-wider">
                  Điểm danh nhận Chucu
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#e0c0cc] font-bold">
                  <span>{userProfile?.chucu || 0} Chucu</span>
                </span>
                {(userProfile?.streak || 0) > 0 && (
                  <span className="flex items-center gap-0.5 text-[11px] text-[#c89666]">
                    <Flame className="w-3 h-3 text-[#c89666]" />
                    <span>{userProfile?.streak} ngày</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="text-[11px] text-[#8a717a]">
                  {hasCheckedInToday
                    ? 'Bạn đã điểm danh hôm nay!'
                    : `Điểm danh nhận ngay +${expectedReward} Chucu`}
                </p>
                <p className="text-[10px] text-[#8a717a] flex items-center gap-1">
                  <span>Streak hiện tại:</span>
                  <span className="font-bold text-[#c89666]">{currentStreak} ngày liên tiếp</span>
                </p>
                {checkInNotice && (
                  <p className={`text-[10px] font-bold ${checkInNotice.isError ? 'text-[#c07080]' : 'text-[#d0a0b0]'}`}>
                    {checkInNotice.message}
                  </p>
                )}
              </div>

              <button
                onClick={handleDirectCheckIn}
                disabled={hasCheckedInToday || isCheckingIn}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider shrink-0 transition flex items-center gap-1.5 ${
                  hasCheckedInToday
                    ? 'bg-[#180c12] border border-[#2d1822] text-[#8a717a] cursor-not-allowed opacity-70 select-none'
                    : 'bg-[#160c10] hover:bg-[#2a1621] border border-[#3a1e2d] hover:border-[#63334a] text-[#e0c0cc] active:scale-95 cursor-pointer'
                }`}
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-[#e0c0cc] animate-spin" />
                    <span>Đang nhận...</span>
                  </>
                ) : hasCheckedInToday ? (
                  <span>Đã điểm danh</span>
                ) : (
                  <span>Điểm danh</span>
                )}
              </button>
            </div>
          </div>

          <LoungeChat
            messages={loungeMessages}
            currentUser={currentUser}
            onOpenAuthModal={onOpenAuthModal}
            userProfile={userProfile}
          />
        </div>

        {/* Right Column: Ranking + Latest Comments */}
        <div className="lg:col-span-5 space-y-6">
          <RankingSection
            stories={stories}
            onSelectStory={onSelectStory}
          />

          <LatestCommentsSection
            comments={comments}
            stories={stories}
            chapters={chapters}
            onSelectStory={onSelectStory}
            onSelectChapter={onSelectChapter}
          />
        </div>
      </div>

      {/* SECTION BOTTOM: Tất cả truyện (All Stories) */}
      <section className="space-y-5 pt-4 border-t border-[#2d1822]">
        <div className="flex items-center justify-between gap-4 border-b border-[#2d1822] pb-3">
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#e0c0cc] font-mono-code uppercase tracking-[0.15em] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#d0a0b0]" />
              <span>
                {searchQuery
                  ? `Kết quả tìm kiếm: "${searchQuery}"`
                  : 'Tất cả truyện'}
              </span>
            </h1>
            <p className="text-xs text-[#8a717a] mt-0.5 font-mono-code">
              Danh sách gồm {filteredStories.length} truyện
            </p>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="py-16 text-center bg-[#11090c] border border-[#2d1822] p-8 space-y-3">
            <p className="text-sm text-[#8a717a]">
              Chưa có truyện nào được đăng.
            </p>
            {canPost && (
              <button
                onClick={onNavigateStudio}
                className="px-4 py-2 bg-[#2b1620] border border-[#5e2f46] text-[#e0c0cc] text-sm"
              >
                Đăng truyện đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onSelectStory={onSelectStory}
                isBookmarked={bookmarkedSet.has(story.id)}
                onToggleBookmark={(e, id) => onToggleBookmark(e, id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
