import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto } from "@/lib/openai-client";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片过大，请上传小于 5MB 的图片" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const analysis = await analyzePhoto(arrayBuffer);

    return NextResponse.json({
      location: analysis.location || "",
      subject: analysis.subject || "",
      subjectPosition: analysis.subjectPosition || { horizontal: "center", vertical: "center" },
    });
  } catch (error: any) {
    console.error("Recognize error:", error);
    const rawMessage = error?.message || "Unknown recognize error";

    if (
      rawMessage.includes("OPENAI_VISION_MODEL is not configured") ||
      rawMessage.includes("OPENAI_VISION_API_KEY is not configured")
    ) {
      return NextResponse.json(
        { error: "AI 识别暂时不可用，请手动输入地点" },
        { status: 503 }
      );
    }

    if (
      rawMessage.includes("404 Not Found") ||
      rawMessage.includes("InvalidEndpointOrModel.NotFound") ||
      rawMessage.includes("does not exist") ||
      rawMessage.includes("do not have access") ||
      rawMessage.includes("Vision API error:")
    ) {
      return NextResponse.json(
        { error: "AI 识别暂时不可用，请手动输入地点" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "识别失败，请手动输入地点" },
      { status: 500 }
    );
  }
}
