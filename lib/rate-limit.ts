type RateLimitEnv = Pick<CloudflareEnv, "RATE_LIMIT_KV">;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
  status?: number;
}

export async function checkRateLimit(
  request: Request,
  env?: RateLimitEnv
): Promise<RateLimitResult> {
  // Extract IP from Cloudflare headers or fallback
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const kvKey = `rate_limit:${ip}:${dateKey}`;

  const maxRequests = 10;

  if (!env?.RATE_LIMIT_KV) {
    return { allowed: true, remaining: maxRequests, resetTime: Infinity };
  }

  const kv = env.RATE_LIMIT_KV;

  try {
    const current = await kv.get(kvKey);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: Infinity };
    }

    await kv.put(kvKey, (count + 1).toString(), {
      expirationTtl: 86400, // 24 hours
    });

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetTime: Infinity,
    };
  } catch {
    // If KV fails, allow the request (fail open)
    return { allowed: true, remaining: maxRequests, resetTime: Infinity };
  }
}
