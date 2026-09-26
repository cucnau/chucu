#!/bin/bash
sed -i 's/const outputType = (file.type === '"'"'image\/png'"'"' || file.type === '"'"'image\/webp'"'"') ? file.type : '"'"'image\/jpeg'"'"';/const outputType = (file.type === '"'"'image\/png'"'"' || file.type === '"'"'image\/webp'"'"') ? '"'"'image\/webp'"'"' : '"'"'image\/jpeg'"'"';/g' src/components/LiveStoryEditor.tsx

sed -i 's/const handleCompressGallerySingle = (file: File) => {/const handleCompressGallerySingle = (file: File) => {\n    if (file.type === '"'"'image\/gif'"'"' \&\& file.size > 500 * 1024) {\n      alert(`Kích thước ảnh GIF quá lớn (${(file.size \/ 1024).toFixed(1)} KB). Vui lòng chọn ảnh GIF dưới 500 KB để tránh lỗi lưu trữ.`);\n      return;\n    }/' src/components/LiveStoryEditor.tsx

sed -i 's/const handleCompressGalleryAlbum = (files: FileList | File\[\]) => {/const handleCompressGalleryAlbum = (files: FileList | File\[\]) => {\n    const validFiles = Array.from(files).filter(file => {\n      if (file.type === '"'"'image\/gif'"'"' \&\& file.size > 500 * 1024) {\n        alert(`Ảnh "${file.name}" là GIF quá lớn (${(file.size \/ 1024).toFixed(1)} KB). Vui lòng chọn GIF dưới 500 KB.`);\n        return false;\n      }\n      return true;\n    });\n\n    if (validFiles.length === 0) return;\n/' src/components/LiveStoryEditor.tsx

sed -i 's/Array.from(files).forEach((file) => {/validFiles.forEach((file) => {/g' src/components/LiveStoryEditor.tsx
