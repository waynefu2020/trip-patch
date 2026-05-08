"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ImageUploader";
import { MetaForm } from "@/components/MetaForm";
import { LoadingState } from "@/components/LoadingState";
import { compressImage } from "@/lib/image-utils";
import { extractDateTime, getCurrentTime } from "@/lib/exif";
import { smartCrop, type SubjectPosition } from "@/lib/crop-utils";
import { Sparkle, RotateCcw } from "lucide-react";

const RESULT_STORAGE_KEY = "trip_patch_result";

interface RecognizeResponse {
  location?: string;
  subject?: string;
  subjectPosition?: SubjectPosition;
  error?: string;
}

interface GenerateResponse {
  image?: string;
  error?: string;
}

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState(getCurrentTime());
  const [subject, setSubject] = useState("");
  const [isCropped, setIsCropped] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageSelect = useCallback(
    async (selectedFile: File, url: string) => {
      try {
        const compressed = await compressImage(selectedFile);
        setFile(compressed);
        setPreviewUrl(url);
        setOriginalFile(compressed);
        setOriginalPreviewUrl(url);
        setIsCropped(false);
        setSubject("");

        // Extract EXIF time
        const exifTime = await extractDateTime(compressed);
        if (exifTime) {
          setTime(exifTime);
        }
      } catch {
        setFile(selectedFile);
        setPreviewUrl(url);
        setOriginalFile(selectedFile);
        setOriginalPreviewUrl(url);
        setIsCropped(false);
        setSubject("");
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

      const data = (await res.json()) as RecognizeResponse;
      if (!res.ok) {
        alert(data.error || "AI 识别暂时不可用，请手动输入地点");
        return;
      }

      if (data.location) {
        setLocation(data.location);
      }
      if (data.subject) {
        setSubject(data.subject);
      }

      // Smart crop based on subject position
      const subjectPosition = data.subjectPosition as SubjectPosition | undefined;
      if (subjectPosition && file) {
        try {
          const cropped = await smartCrop(file, subjectPosition);
          const croppedUrl = URL.createObjectURL(cropped);
          setFile(cropped);
          setPreviewUrl(croppedUrl);
          setIsCropped(true);
        } catch {
          // If crop fails, keep original image
        }
      }

      if (!data.location) {
        alert("识别失败，请手动输入地点");
      }
    } catch {
      alert("AI 识别暂时不可用，请手动输入地点");
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
      if (subject) {
        formData.append("subject", subject);
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as GenerateResponse;
      if (data.image) {
        sessionStorage.setItem(
          RESULT_STORAGE_KEY,
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
  }, [file, location, time, subject, router]);

  if (isGenerating) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-6 py-10 flex flex-col items-center gap-8">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <img
            src="/logo.png"
            alt=""
            className="w-11 h-11 rounded-[22%]"
          />
          <div className="text-left">
            <h1 className="font-serif italic text-3xl text-ink tracking-tight">
              旅贴
            </h1>
            <p className="text-xs text-ink/60 tracking-[0.12em] font-sans uppercase">
              一张照片，一张旅行海报
            </p>
          </div>
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setOriginalFile(null);
                  setOriginalPreviewUrl(null);
                  setLocation("");
                  setTime(getCurrentTime());
                  setSubject("");
                  setIsCropped(false);
                }}
                className="text-xs text-ink/60 underline underline-offset-4 font-sans"
              >
                重新选择图片
              </button>
              {isCropped && originalFile && originalPreviewUrl && (
                <button
                  onClick={() => {
                    setFile(originalFile);
                    setPreviewUrl(originalPreviewUrl);
                    setIsCropped(false);
                  }}
                  className="flex items-center gap-1 text-xs text-brick underline underline-offset-4 font-sans"
                >
                  <RotateCcw className="w-3 h-3" />
                  重置裁剪
                </button>
              )}
            </div>
          </div>
        ) : (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}

        {/* Meta Form */}
        {previewUrl && (
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <MetaForm
              location={location}
              time={time}
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
