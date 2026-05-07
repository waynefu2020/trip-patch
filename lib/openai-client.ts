const baseUrl = process.env.OPENAI_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const apiKey = process.env.OPENAI_API_KEY;

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

export async function generatePoster(
  imageBuffer: ArrayBuffer,
  prompt: string
): Promise<string> {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

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

export async function analyzePhoto(
  imageBuffer: ArrayBuffer
): Promise<{ description: string; location: string }> {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

  const data = await arkFetch("/chat/completions", {
    model: "doubao-vision-pro-32k-241028",
    messages: [
      {
        role: "system",
        content:
          'You are a travel photography analyst. Analyze the image and provide two things in JSON format: 1) "description": a vivid English description of the photo\'s main subject, colors, mood, and style (2-3 sentences); 2) "location": the English name of the landmark or city shown. Respond ONLY with valid JSON like {"description":"...","location":"..."}',
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
        ],
      },
    ],
    max_tokens: 300,
  });

  const content = data.choices?.[0]?.message?.content?.trim();
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
      };
    }
  } catch {
    // Fallback
  }

  return { description: content, location: "" };
}
