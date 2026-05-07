"use client";

import { useEffect, useState } from "react";

const loadingTexts = [
  "调取旅行记忆...",
  "提炼建筑灵魂...",
  "调和明信片色彩...",
  "盖上最后一枚印章...",
];

export function LoadingState() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setIndex((i) => (i + 1) % loadingTexts.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return 95;
        return p + Math.random() * 8;
      });
    }, 2000);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-8">
        {/* Animated dot */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-ink/20 animate-ping opacity-20" />
          <div className="absolute inset-2 rounded-full border border-ink/30 animate-ping opacity-30 animation-delay-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl text-ink">✦</span>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <p className="font-serif italic text-ink text-lg animate-fade-in">
            {loadingTexts[index]}
          </p>
          <p className="text-xs text-ink/60 tracking-wide font-sans">
            通常需要 30-60 秒，喝口水等一下
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[1px] bg-ink/15 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-ink/40 transition-all duration-[2000ms] ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </main>
  );
}
