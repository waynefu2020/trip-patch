"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ImageUploader";
import { MetaForm } from "@/components/MetaForm";
import { LoadingState } from "@/components/LoadingState";
import { compressImage } from "@/lib/image-utils";
import { extractDateTime, getCurrentTime } from "@/lib/exif";
import { Sparkle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState(getCurrentTime());
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageSelect = useCallback(
    async (selectedFile: File, url: string) => {
      try {
        const compressed = await compressImage(selectedFile);
        setFile(compressed);
        setPreviewUrl(url);

        // Extract EXIF time
        const exifTime = await extractDateTime(compressed);
        if (exifTime) {
          setTime(exifTime);
        }
      } catch {
        setFile(selectedFile);
        setPreviewUrl(url);
      }
    },
    []
  );

  const handleRecognize = useCallback(async () => {
    if (!file) return;
    setIsRecognizing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/recognize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.location) {
        setLocation(data.location);
      } else {
        alert(data.error || "识别失败，请手动输入");
      }
    } catch {
      alert("识别失败，请手动输入地点");
    } finally {
      setIsRecognizing(false);
    }
  }, [file]);

  const handleGenerate = useCallback(async () => {
    if (!file || !location.trim()) {
      alert("请上传图片并填写地点");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("location", location.trim());
      formData.append("time", time.trim() || getCurrentTime());

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.image) {
        sessionStorage.setItem(
          "lvtie_result",
          JSON.stringify({ image: data.image })
        );
        router.push("/result/" + Date.now());
      } else {
        alert(data.error || "生成失败，请重试");
        setIsGenerating(false);
      }
    } catch {
      alert("生成失败，请检查网络后重试");
      setIsGenerating(false);
    }
  }, [file, location, time, router]);

  if (isGenerating) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-6 py-10 flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="font-serif italic text-3xl text-ink tracking-tight">
            旅贴
          </h1>
          <p className="text-xs text-ink/60 tracking-[0.12em] font-sans uppercase">
            一张照片，一张旅行海报
          </p>
        </div>

        {/* Upload or Preview */}
        {previewUrl ? (
          <div className="w-full space-y-4 animate-slide-up">
            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-sand">
              <img
                src={previewUrl}
                alt="预览"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setLocation("");
                setTime(getCurrentTime());
              }}
              className="text-xs text-ink/60 underline underline-offset-4 font-sans"
            >
              重新选择图片
            </button>
          </div>
        ) : (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}

        {/* Meta Form */}
        {previewUrl && (
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <MetaForm
              defaultLocation={location}
              defaultTime={time}
              onLocationChange={setLocation}
              onTimeChange={setTime}
              onRecognize={handleRecognize}
              isRecognizing={isRecognizing}
            />
          </div>
        )}

        {/* Generate CTA */}
        {previewUrl && (
          <button
            onClick={handleGenerate}
            disabled={!location.trim()}
            className="w-full py-4 bg-ink text-cream rounded-lg
              font-serif italic text-[15px]
              flex items-center justify-center gap-2
              hover:bg-ink/90 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Sparkle className="w-4 h-4" />
            生成旅行海报
          </button>
        )}

        {/* Footer */}
        <p className="text-[10px] text-ink/40 tracking-wider font-sans">
          Made with wanderlust ✦
        </p>
      </div>
    </main>
  );
}
