'use client';

import { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (imageData: string) => void;
  selectedImage: string | null;
}

export default function ImageUploader({
  onImageSelect,
  selectedImage,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        onImageSelect(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedImage ? (
        <div>
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full rounded-2xl border border-opacity-20 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ borderColor: '#D4C5C1' }}
          />
          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="w-full mt-4 py-3 px-4 rounded-xl font-light transition-all duration-300 hover:shadow-sm"
            style={{
              backgroundColor: '#F8F6F4',
              color: '#4a3f3d',
              border: '1px solid #D4C5C1',
            }}
          >
            ✏️ Change Image
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-12 px-4 rounded-2xl border-2 border-dashed font-light transition-all duration-300 hover:shadow-sm hover:bg-opacity-75"
          style={{
            borderColor: '#D4C5C1',
            backgroundColor: '#F8F6F4',
            color: '#888',
          }}
        >
          <div className="text-3xl mb-2">📁</div>
          <div>Click to upload</div>
          <div className="text-xs opacity-70 mt-1">or drag image here</div>
        </button>
      )}
    </div>
  );
}
