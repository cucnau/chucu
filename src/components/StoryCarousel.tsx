import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Story } from '../types';
import { ChevronLeft, ChevronRight, BookOpen, Flame, Star } from 'lucide-react';

interface StoryCarouselProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
}

export const StoryCarousel: React.FC<StoryCarouselProps> = ({ stories, onSelectStory }) => {
  // Lấy tối đa 5 truyện có lượt xem cao nhất hoặc mới nhất làm tiêu điểm
  const displayStories = [...(stories || [])]
    .filter(Boolean)
    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
    .slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const length = displayStories.length;

  // Đảm bảo currentIndex luôn hợp lệ khi danh sách truyện thay đổi
  useEffect(() => {
    if (length > 0 && currentIndex >= length) {
      setCurrentIndex(0);
    }
  }, [length, currentIndex]);

  // Tự động chuyển slide sau mỗi 3 giây
  useEffect(() => {
    if (length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length);
    }, 3000);

    return () => clearInterval(interval);
  }, [length, isHovered]);

  const currentStory = displayStories[currentIndex] || displayStories[0];

  if (length === 0 || !currentStory) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handleCardClick = (index: number, story: Story) => {
    if (index === currentIndex) {
      onSelectStory(story);
    } else {
      setCurrentIndex(index);
    }
  };

  return (
    <div 
      className="relative bg-[#140e0c] border border-[#2e1d17] p-4 sm:p-6 shadow-md overflow-hidden font-mono-code select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration lines */}
      <div className="absolute inset-0 pointer-events-none border border-[#2e1d17] m-1 opacity-20"></div>
      
      {/* Header of Carousel */}
      <div className="flex items-center justify-between border-b border-[#241511] pb-3 mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#fbbf24] animate-pulse" />
          <h3 className="text-xs font-bold text-[#e8dcd8] uppercase tracking-wider">
            Truyện đề cử nổi bật
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handlePrev}
            className="p-1 border border-[#3d271f] bg-[#1a110e] text-[#a1887f] hover:text-[#f5ebe6] hover:bg-[#2e1d17] hover:border-[#5c3c30] transition active:scale-95 rounded-2xs"
            title="Lùi lại"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-[#a1887f] font-bold px-1 min-w-[32px] text-center">
            {currentIndex + 1} / {length}
          </span>
          <button 
            onClick={handleNext}
            className="p-1 border border-[#3d271f] bg-[#1a110e] text-[#a1887f] hover:text-[#f5ebe6] hover:bg-[#2e1d17] hover:border-[#5c3c30] transition active:scale-95 rounded-2xs"
            title="Tiếp theo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Carousel Display */}
      <div className="flex flex-col md:flex-row items-center gap-6 min-h-[220px]">
        {/* Left Section: 3D Cards */}
        <div className="relative w-full md:w-1/2 h-[220px] flex items-center justify-center overflow-visible">
          {displayStories.map((story, i) => {
            // Tính toán khoảng cách tương đối (diff) cho vòng lặp vòng tròn
            let diff = (i - currentIndex + length) % length;
            if (diff > length / 2) {
              diff -= length;
            }

            // Chỉ hiển thị các phần tử nằm trong phạm vi [-2, 2]
            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            // Xác định vị trí x, tỉ lệ scale, độ mờ opacity và zIndex dựa trên diff
            let xTranslation = 0;
            let scaleValue = 0.6;
            let opacityValue = 0;
            let zIndexValue = 0;

            if (diff === 0) {
              xTranslation = 0;
              scaleValue = 1.0;
              opacityValue = 1;
              zIndexValue = 10;
            } else if (diff === -1) {
              xTranslation = -110;
              scaleValue = 0.8;
              opacityValue = 0.6;
              zIndexValue = 5;
            } else if (diff === 1) {
              xTranslation = 110;
              scaleValue = 0.8;
              opacityValue = 0.6;
              zIndexValue = 5;
            } else if (diff === -2) {
              xTranslation = -190;
              scaleValue = 0.65;
              opacityValue = 0.25;
              zIndexValue = 2;
            } else if (diff === 2) {
              xTranslation = 190;
              scaleValue = 0.65;
              opacityValue = 0.25;
              zIndexValue = 2;
            }

            return (
              <motion.div
                key={story.id || i}
                className={`absolute w-[120px] sm:w-[130px] aspect-[2/3] cursor-pointer origin-center transition-colors duration-300 ${
                  diff === 0 ? 'ring-2 ring-[#c89666] shadow-lg shadow-[#c89666]/10' : 'hover:opacity-85'
                }`}
                style={{
                  zIndex: zIndexValue,
                }}
                animate={{
                  x: xTranslation,
                  scale: scaleValue,
                  opacity: opacityValue,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 26,
                }}
                onClick={() => handleCardClick(i, story)}
              >
                {/* Book Cover Image */}
                <div className="w-full h-full bg-[#1f1512] border border-[#3d271f] relative group overflow-hidden">
                  <img
                    src={story.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Shadow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                  
                  {/* Book Title Overlay (only small when side-by-side or on hover) */}
                  {diff !== 0 && (
                    <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-3xs p-1 rounded-2xs text-center border border-white/5">
                      <p className="text-[8px] font-bold text-[#e8dcd8] truncate">
                        {story.title}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Section: Details of selected/centered story */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-3.5 text-left h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id || currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[9px] bg-[#2e1d17] border border-[#5c3c30] text-[#c89666] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-3xs">
                  Nổi bật
                </span>
                {currentStory.tags?.slice(0, 2).map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-[9px] bg-[#1a110e] border border-[#2e1d17] text-[#a1887f] px-1.5 py-0.5 rounded-3xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title & Author */}
              <div className="space-y-1">
                <h2 
                  onClick={() => onSelectStory(currentStory)}
                  className="text-base sm:text-lg font-bold text-[#e8dcd8] hover:text-[#c89666] cursor-pointer transition line-clamp-1"
                >
                  {currentStory.title}
                </h2>
                <p className="text-[11px] text-[#a1887f]">
                  Tác giả: <span className="text-[#c89666]">{currentStory.author || 'Chưa cập nhật'}</span>
                </p>
              </div>

              {/* Synopsis with paragraph breaks */}
              <div className="text-[11px] text-[#a1887f] line-clamp-4 leading-relaxed whitespace-pre-line">
                {currentStory.synopsis || 'Chưa có tóm tắt chi tiết cho tác phẩm này.'}
              </div>

              {/* Views Stats & Call to Action */}
              <div className="flex items-center justify-between pt-1 border-t border-[#241511]">
                <div className="flex items-center gap-1 text-[11px] text-[#a1887f]">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{(currentStory.viewsCount || 0).toLocaleString()} lượt xem</span>
                </div>
                <button
                  onClick={() => onSelectStory(currentStory)}
                  className="px-3 py-1.5 bg-[#261510] hover:bg-[#3d2118] border border-[#c89666] hover:border-[#dcb185] text-xs font-bold text-[#c89666] hover:text-[#dcb185] transition flex items-center gap-1 active:scale-95 rounded-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đọc ngay</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
