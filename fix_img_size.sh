#!/bin/bash
sed -i 's/className="max-w-full h-auto object-contain transition duration-300 group-hover:opacity-90"/className="h-auto object-contain transition duration-300 group-hover:opacity-90"\n              style={{ width: `${story.galleryImageSize || 100}%`, maxWidth: '"'"'100%'"'"' }}/g' src/components/StoryBlocks.tsx
