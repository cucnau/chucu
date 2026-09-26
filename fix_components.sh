#!/bin/bash
sed -i 's/galleryAutoScrollSpeed,/galleryAutoScrollSpeed,\n  galleryImageSize,/g' src/components/StoryBlocks.tsx
