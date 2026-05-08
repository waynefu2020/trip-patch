const baseUrl = process.env.OPENAI_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const apiKey = process.env.OPENAI_API_KEY;
const visionBaseUrl = process.env.OPENAI_VISION_BASE_URL || baseUrl;
const visionApiKey = process.env.OPENAI_VISION_API_KEY || apiKey;
const visionModel = process.env.OPENAI_VISION_MODEL;
const usesKimiVision =
  visionBaseUrl.includes("moonshot.cn") || (visionModel?.startsWith("kimi-") ?? false);

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function arkFetch(path: string, body: unknown): Promise<any> {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} — ${errorText.slice(0, 300)}`
    );
  }

  return response.json();
}

async function visionFetch(path: string, body: unknown): Promise<any> {
  if (!visionApiKey) {
    throw new Error("OPENAI_VISION_API_KEY is not configured");
  }

  const response = await fetch(`${visionBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${visionApiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Vision API error: ${response.status} ${response.statusText} - ${errorText.slice(0, 300)}`
    );
  }

  return response.json();
}

export async function generatePoster(
  imageBuffer: ArrayBuffer,
  prompt: string
): Promise<string> {
  const base64 = arrayBufferToBase64(imageBuffer);

  const data = await arkFetch("/images/generations", {
    model: "doubao-seedream-5-0-260128",
    prompt,
    image: `data:image/jpeg;base64,${base64}`,
    size: "2K",
    output_format: "png",
    response_format: "url",
    sequential_image_generation: "disabled",
    watermark: false,
    stream: false,
  });

  const result = data.data?.[0];
  if (!result) {
    throw new Error("No image returned from API");
  }

  if (result.url) {
    return result.url;
  }

  throw new Error("Unexpected API response format: missing url");
}

export interface SubjectPosition {
  horizontal: string;
  vertical: string;
}

export interface PhotoAnalysis {
  description: string;
  location: string;
  subject: string;
  subjectPosition: SubjectPosition;
}

function extractAssistantText(message: any): string {
  if (typeof message?.content === "string" && message.content.trim()) {
    return message.content.trim();
  }

  if (Array.isArray(message?.content)) {
    const text = message.content
      .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (text) {
      return text;
    }
  }

  if (typeof message?.reasoning_content === "string" && message.reasoning_content.trim()) {
    return message.reasoning_content.trim();
  }

  return "";
}

export async function analyzePhoto(
  imageBuffer: ArrayBuffer
): Promise<PhotoAnalysis> {
  if (!visionModel) {
    throw new Error("OPENAI_VISION_MODEL is not configured");
  }

  const base64 = arrayBufferToBase64(imageBuffer);

  const data = await visionFetch("/chat/completions", {
    model: visionModel,
    ...(usesKimiVision ? { thinking: { type: "disabled" as const } } : {}),
    messages: [
      {
        role: "system",
        content:
          'You are a travel photography analyst. Analyze the image and provide four things in JSON format: 1) "description": a vivid English description of the photo\'s main subject, colors, mood, and style (2-3 sentences); 2) "location": the English name of the landmark or city shown; 3) "subject": a concise English description of the single most prominent architectural element or landmark in the photo (1 sentence). This should specifically describe the main building, structure, or monument that should be used as the fridge-magnet icon; 4) "subjectPosition": an object with "horizontal" and "vertical" keys indicating where the main subject sits in the frame. Use exactly one of these values for each: horizontal: "far-left", "left", "center-left", "center", "center-right", "right", "far-right"; vertical: "top", "upper", "center", "lower", "bottom". Respond ONLY with valid JSON like {"description":"...","location":"...","subject":"...","subjectPosition":{"horizontal":"...","vertical":"..."}}',
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
          {
            type: "text",
            text: "Analyze this image and return the requested JSON only.",
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  const content = extractAssistantText(data.choices?.[0]?.message);
  if (!content) {
    throw new Error("Could not analyze photo");
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        description: parsed.description || "",
        location: parsed.location || "",
        subject: parsed.subject || "",
        subjectPosition: parsed.subjectPosition || { horizontal: "center", vertical: "center" },
      };
    }
  } catch {
    // Fallback
  }

  return { description: content, location: "", subject: "", subjectPosition: { horizontal: "center", vertical: "center" } };
}
