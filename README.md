This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Environment

The project uses Volcengine Ark for image generation and location recognition.

Required variables:

```bash
OPENAI_API_KEY=ark-...
OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
OPENAI_VISION_BASE_URL=https://api.moonshot.cn/v1
OPENAI_VISION_API_KEY=sk-...
OPENAI_VISION_MODEL=kimi-k2.5
```

Image generation and vision recognition can use different providers.

- `OPENAI_API_KEY` and `OPENAI_BASE_URL` are used for poster generation.
- `OPENAI_VISION_BASE_URL`, `OPENAI_VISION_API_KEY`, and `OPENAI_VISION_MODEL`
  are used only for image understanding.

For Kimi vision recognition, use the OpenAI-compatible Moonshot endpoint and a
multimodal model such as `kimi-k2.5`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
