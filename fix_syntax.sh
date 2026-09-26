#!/bin/bash
sed -i 's/initialStory?.galleryImageSize || 100/initialStory?.galleryImageSize || 100\n  );/g' src/components/LiveStoryEditor.tsx
