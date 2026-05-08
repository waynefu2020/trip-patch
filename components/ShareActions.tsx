"use client";

import { useState } from "react";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { compressDownloadImage } from "@/lib/image-utils";

interface ShareActionsProps {
  imageUrl: string;
}

export function ShareActions({ imageUrl }: ShareActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }

    const timestamp = Date.now();
    try {
      setIsDownloading(true);
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Image download failed");
      }

      const blob = await response.blob();
      const originalFile = new File([blob], `trip-patch-poster-${timestamp}.png`, {
        type: blob.type || "image/png",
      });

      let downloadBlob = blob;
      let downloadName = `trip-patch-poster-${timestamp}.png`;

      try {
        const compressedFile = await compressDownloadImage(originalFile);
        downloadBlob = compressedFile;
        downloadName = `trip-patch-poster-${timestamp}.jpg`;
      } catch {
        // If compression fails, fall back to the original generated image.
      }

      const url = URL.createObjectURL(downloadBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "我的 Trip Patch 海报",
          text: "用 Trip Patch 生成的旅行海报",
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("链接已复制到剪贴板");
      } catch {
        alert("分享失败，请手动截图保存");
      }
    }
  };

  const handleRegenerate = () => {
    window.location.href = "/";
  };

  return (
    <div className="sticky bottom-0 bg-cream/90 backdrop-blur-sm border-t border-sand/30 px-6 py-4">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex flex-col items-center gap-1.5 py-3 px-2
            bg-ink text-cream rounded-lg
            hover:bg-ink/90 transition-colors active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-wait"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs font-sans tracking-wide">
            {isDownloading ? "压缩中..." : "保存到相册"}
          </span>
        </button>

        <button
          onClick={handleRegenerate}
          className="flex flex-col items-center gap-1.5 py-3 px-2
            bg-transparent border border-sand text-ink rounded-lg
            hover:bg-parchment transition-colors active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs font-sans tracking-wide">重新生成</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1.5 py-3 px-2
            bg-transparent border border-sand text-ink rounded-lg
            hover:bg-parchment transition-colors active:scale-[0.98]"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs font-sans tracking-wide">分享</span>
        </button>
      </div>
    </div>
  );
}
