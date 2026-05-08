/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    RATE_LIMIT_KV?: KVNamespace;
  }
}

export {};
