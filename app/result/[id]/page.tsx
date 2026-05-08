"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShareActions } from "@/components/ShareActions";
import { LoadingState } from "@/components/LoadingState";

const RESULT_STORAGE_KEY = "trip_patch_result";
const LEGACY_RESULT_STORAGE_KEY = "lvtie_result";

export default function ResultPage() {
  const params = useParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In MVP, we store the result in sessionStorage
    const stored =
      sessionStorage.getItem(RESULT_STORAGE_KEY) ||
      sessionStorage.getItem(LEGACY_RESULT_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.image) {
          setImageUrl(data.image);
        }
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!imageUrl) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-ink/60 text-sm tracking-wide">
            未找到海报，请返回首页重新生成
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-ink text-sm underline underline-offset-4"
          >
            返回首页
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <img
            src={imageUrl}
            alt="生成的旅行海报"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </div>
      <ShareActions imageUrl={imageUrl} />
    </main>
  );
}
