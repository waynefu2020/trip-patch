"use client";

import { MapPin, Clock, Sparkles } from "lucide-react";

interface MetaFormProps {
  location: string;
  time: string;
  onLocationChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onRecognize: () => void;
  isRecognizing: boolean;
}

export function MetaForm({
  location,
  time,
  onLocationChange,
  onTimeChange,
  onRecognize,
  isRecognizing,
}: MetaFormProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs text-ink/60 tracking-widest uppercase font-sans">
          地点
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
          <input
            type="text"
            value={location}
            placeholder="White Dagoba"
            onChange={(e) => {
              onLocationChange(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-3 bg-ivory border border-sand rounded-md
              font-serif italic text-ink placeholder:text-sand/70
              focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/20
              transition-colors"
          />
        </div>
      </div>

      {/* AI Recognize Button */}
      <button
        onClick={onRecognize}
        disabled={isRecognizing}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment rounded
          text-brick text-xs font-sans tracking-wide
          hover:bg-parchment/80 transition-colors disabled:opacity-50"
      >
        <Sparkles className="w-3 h-3" />
        {isRecognizing ? "AI 识别中..." : "AI 帮我识别地点"}
      </button>

      {/* Time */}
      <div className="space-y-1.5">
        <label className="text-xs text-ink/60 tracking-widest uppercase font-sans">
          时间
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
          <input
            type="text"
            value={time}
            placeholder="16:20 PM"
            onChange={(e) => {
              onTimeChange(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-3 bg-ivory border border-sand rounded-md
              font-serif italic text-ink placeholder:text-sand/70
              focus:outline-none focus:border-ink/50 focus:ring-1 focus:ring-ink/20
              transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
