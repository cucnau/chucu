#!/bin/bash
sed -i 's/galleryAutoScrollSpeed,\n      galleryImageSize, setGalleryAutoScrollSpeed\] = useState/galleryAutoScrollSpeed, setGalleryAutoScrollSpeed\] = useState/g' src/components/LiveStoryEditor.tsx
