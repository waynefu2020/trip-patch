import { NextRequest, NextResponse } from "next/server";
import { generatePoster } from "@/lib/openai-client";
import { buildPrompt } from "@/lib/prompt";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "今日生成次数已达上限，请明天再来" },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const location = formData.get("location") as string | null;
    const time = formData.get("time") as string | null;
    const subject = formData.get("subject") as string | null;

    if (!file || !location) {
      return NextResponse.json(
        { error: "请上传图片并填写地点名称" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片过大，请上传小于 5MB 的图片" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const prompt = buildPrompt(location, time || getCurrentTime(), subject || undefined);
    const result = await generatePoster(arrayBuffer, prompt);

    return NextResponse.json({ image: result });
  } catch (error: any) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error.message || "生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}

function getCurrentTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}
