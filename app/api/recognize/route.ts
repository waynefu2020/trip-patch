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

    return NextResponse.json({ location: analysis.location || "" });
  } catch (error: any) {
    console.error("Recognize error:", error);
    return NextResponse.json(
      { error: error.message || "识别失败，请手动输入地点" },
      { status: 500 }
    );
  }
}
