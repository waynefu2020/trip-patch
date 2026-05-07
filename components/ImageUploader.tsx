"use client";

import { useCallback, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("请上传图片文件");
        return;
      }
      const url = URL.createObjectURL(file);
      onImageSelect(file, url);
    },
    [onImageSelect]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative flex flex-col items-center justify-center
        w-full aspect-[4/5] max-h-[420px]
        border-[1.5px] border-dashed rounded-lg
        transition-all duration-300 cursor-pointer
        ${
          isDragging
            ? "border-ink bg-parchment scale-[1.02]"
            : "border-sand bg-cream"
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3 text-muted">
        <div className="w-14 h-14 rounded-full border border-sand flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </div>
        <p className="text-sm tracking-wide">点击上传旅行照片</p>
        <p className="text-xs opacity-60">或拖拽图片到此处</p>
      </div>
    </div>
  );
}
