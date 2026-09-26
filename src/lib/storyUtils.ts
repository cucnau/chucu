import { Story, StoryTheme } from '../types';

/**
 * Lấy ra đối tượng Story đã được áp dụng các thuộc tính tùy chỉnh từ Theme chính (activeThemeId)
 * nếu câu chuyện có danh sách `storyThemes`.
 */
export function getEffectiveStory(story: Story, overrideThemeId?: string): Story {
  if (!story) return story;
  if (!story.storyThemes || story.storyThemes.length === 0) return story;

  const targetThemeId = overrideThemeId || story.activeThemeId;
  const activeTheme = story.storyThemes.find(t => t.id === targetThemeId) || story.storyThemes[0];
  
  if (!activeTheme) return story;

  return {
    ...story,
    ...activeTheme,
    // Preserve core story identifiers
    id: story.id,
    title: story.title,
    author: story.author,
    authorUid: story.authorUid,
    authorEmail: story.authorEmail,
    editorName: story.editorName,
    editorPhoto: story.editorPhoto,
    viewsCount: story.viewsCount,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    storyThemes: story.storyThemes,
    activeThemeId: story.activeThemeId,
    storyElements: activeTheme.storyElements && activeTheme.storyElements.length > 0 ? activeTheme.storyElements : story.storyElements,
  };
}

/**
 * Trích xuất một StoryTheme từ cấu hình hiện tại của một Story
 */
export function extractThemeFromStory(story: Story, themeId: string, themeName: string, description?: string): StoryTheme {
  return {
    id: themeId,
    name: themeName,
    description: description || 'Theme tùy biến cho truyện',
    coverUrl: story.coverUrl,
    synopsis: story.synopsis,
    themeTone: story.themeTone,
    defaultFont: story.defaultFont,
    customTitleFont: story.customTitleFont,
    customChapterTitleFont: story.customChapterTitleFont,
    customSubtitleFont: story.customSubtitleFont,
    customBodyFont: story.customBodyFont,
    customMutedFont: story.customMutedFont,
    customBtnFont: story.customBtnFont,
    titleFontSize: story.titleFontSize,
    bodyFontSize: story.bodyFontSize,
    customBgColor: story.customBgColor,
    customCardBgColor: story.customCardBgColor,
    customTextColor: story.customTextColor,
    customTextMutedColor: story.customTextMutedColor,
    customBorderColor: story.customBorderColor,
    customBtnBgColor: story.customBtnBgColor,
    customBtnTextColor: story.customBtnTextColor,
    customBtnSecondaryBgColor: story.customBtnSecondaryBgColor,
    borderStyle: story.borderStyle,
    borderWidth: story.borderWidth,
    borderRadius: story.borderRadius,
    borderCornerAccent: story.borderCornerAccent,
    borderGlow: story.borderGlow,
    customBorderGradientColor2: story.customBorderGradientColor2,
    customBorderGlowColor1: story.customBorderGlowColor1,
    customBorderGlowColor2: story.customBorderGlowColor2,
    readingEffect: story.readingEffect,
    readingEffectColor: story.readingEffectColor,
    chapterListStyle: story.chapterListStyle,
    storyElements: story.storyElements,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
