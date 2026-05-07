"use client";

import { Download, RefreshCw, Share2 } from "lucide-react";

interface ShareActionsProps {
  imageUrl: string;
}

export function ShareActions({ imageUrl }: ShareActionsProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lvtie-poster-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "我的旅贴海报",
          text: "用旅贴生成的旅行海报",
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
          className="flex flex-col items-center gap-1.5 py-3 px-2
            bg-ink text-cream rounded-lg
            hover:bg-ink/90 transition-colors active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs font-sans tracking-wide">保存到相册</span>
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
