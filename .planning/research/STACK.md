# Stack Research

**Domain:** Next.js Partner Integration Demo with Webhook Handling
**Researched:** 2025-02-24
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | React framework with App Router | Latest stable release; App Router provides modern route handlers for webhooks, built-in API routes, first-class Vercel deployment; server components default for better performance |
| React | 19.2.3 | UI library | Latest version; built-in support for useFormStatus and useActionState which work seamlessly with Next.js server actions |
| TypeScript | 5.x | Type safety | Standard for 2025; required for App Router best practices; enables type-safe API routes and webhook payload validation |
| Node.js | 20 LTS / 22 LTS | Runtime | Required for Next.js 16; crypto module built-in for HMAC verification (no external dependencies needed) |

### Styling & UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tailwind CSS | 4.x | Utility-first CSS | Latest major release; CSS-native configuration with @theme directive; 5x faster builds with Oxide engine; no config file needed for simple projects |
| shadcn/ui | latest | Component primitives | NOT an npm package — components copied to project; built on Radix UI for accessibility; Tailwind-native; TypeScript-first; 100k+ GitHub stars; 2026 added RTL support |
| Lucide React | latest | Icons | Modern icon library; tree-shakeable; standard companion to shadcn/ui |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | latest | Schema validation | Type-safe validation for webhook payloads, environment variables, and form inputs; works with T3 Env for runtime env validation |
| @t3-oss/env-nextjs | latest | Environment validation | Runtime env validation with Zod; separates client/server variables; fails fast on missing env vars; skipValidation for Docker builds |
| React Hook Form | latest | Form performance | Session creation form; minimizes re-renders; integrates with Zod for validation |
| date-fns | latest | Date formatting | Webhook event timestamps; lightweight tree-shakeable alternative to Moment.js |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code quality | Use eslint-config-next for Next.js-specific rules; enables proper server/component boundary checking |
| PostCSS | CSS processing | Required for Tailwind CSS 4; use @tailwindcss/postcss plugin |

## Installation

```bash
# Core (already installed in project)
npm install next@16.1.6 react@19.2.3 react-dom@19.2.3

# Styling
npm install tailwindcss@next @tailwindcss/postcss@next

# UI components
npm install lucide-react clsx tailwind-merge

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Environment validation
npm install @t3-oss/env-nextjs

# Date utilities
npm install date-fns

# Dev dependencies (already installed)
npm install -D typescript@5 @types/node@20 @types/react@19 @types/react-dom@19
```

## Webhook Security Implementation

**HMAC Verification (No External Library Required)**

Node.js built-in `crypto` module is sufficient and standard for 2025:

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = `sha256=${createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;

  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Key security practices:**
- Use `timingSafeEqual()` to prevent timing attacks
- Get raw body with `await request.text()` before JSON parsing
- Store webhook secret in environment variable (never commit)
- Return 401 immediately on signature mismatch
- Process webhooks asynchronously to prevent timeouts

## In-Memory Webhook Storage Pattern

For demo purposes without a database:

```typescript
// lib/webhook-store.ts
type WebhookEvent = {
  id: string;
  receivedAt: Date;
  type: string;
  payload: unknown;
  verified: boolean;
};

const events: WebhookEvent[] = [];
const MAX_EVENTS = 100;

export function addEvent(event: WebhookEvent) {
  events.unshift(event);
  if (events.length > MAX_EVENTS) events.pop();
}

export function getEvents(): WebhookEvent[] {
  return [...events]; // Return copy
}

export function clearEvents() {
  events.length = 0;
}
```

**Caveat:** Data resets on server redeploy. This is acceptable for demo/testing but not production.

## Environment Variables Pattern

Use T3 Env for type-safe runtime validation:

```typescript
// env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PRINTORA_API_KEY: z.string().min(1),
    PRINTORA_API_URL: z.string().url().default("https://api-staging.printora.ai"),
    WEBHOOK_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    PRINTORA_API_KEY: process.env.PRINTORA_API_KEY,
    PRINTORA_API_URL: process.env.PRINTORA_API_URL,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
```

## App Router Structure for Webhooks

```
app/
├── api/
│   ├── webhooks/
│   │   └── route.ts          # Webhook endpoint (POST only)
│   └── sessions/
│       └── route.ts          # Session creation (POST)
├── dashboard/
│   ├── page.tsx              # Webhook event viewer
│   └── loading.tsx           # Loading state
├── success/
│   └── page.tsx              # Post-design success page
├── failed/
│   └── page.tsx              # Post-design failed page
├── layout.tsx                # Root layout
└── page.tsx                  # Landing / session creation form
components/
├── ui/                       # shadcn components
├── session-form.tsx          # Session creation form
└── webhook-list.tsx          # Dashboard event list
lib/
├── env.ts                    # T3 Env configuration
├── webhook-verify.ts         # HMAC verification
├── webhook-store.ts          # In-memory event storage
└── utils.ts                  # cn() helper for Tailwind
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Native crypto | Svix webhooks | Use Svix for production webhook infrastructure; overkill for simple demo |
| T3 Env | Manual Zod validation | Use manual if you need custom validation logic beyond Zod schemas |
| shadcn/ui | Chakra UI | Use Chakra if you prefer opinionated components with built-in theming; shadcn gives more control |
| React Hook Form | Formik | Use Formik if legacy codebase; React Hook Form has better performance and smaller bundle |
| In-memory store | Redis / Vercel KV | Use persistent storage for production webhooks; in-memory is demo-only |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Pages Router | Deprecated in favor of App Router; no server components; less performant | App Router (`app/` directory) |
| `crypto` npm package | Deprecated; use native Node.js `crypto` module | Native `import { createHmac } from 'node:crypto'` |
| NextAuth.js | Demo has no user authentication requirement (public access) | Skip auth entirely |
| Prisma / Drizzle | Out of scope for demo; no database persistence needed | In-memory storage |
| SWR / React Query | Unnecessary for simple demo; server components handle data fetching | Server-side data fetching in page components |
| Custom CSS files | Tailwind 4 has CSS-native theming with @theme | Tailwind utilities + @theme directive |
| Moment.js | Large bundle size; deprecated; legacy API | date-fns or native Intl.DateTimeFormat |

## Stack Patterns by Variant

**If webhook needs replay capability:**
- Use Vercel KV (Redis) instead of in-memory
- Store events with TTL to auto-expire old data
- Implement replay endpoint for debugging

**If deploying outside Vercel:**
- Use platform-specific env variable management
- Consider Docker secrets for sensitive data
- May need edge-compatible crypto (verify runtime support)

**If adding user authentication later:**
- Add NextAuth.js (Auth.js) v5 beta for App Router
- Protect `/dashboard` route with middleware
- Store webhook events per-user

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1.6 | React 19.2.3 | React 19 required for Next.js 16 |
| Tailwind CSS 4 | Next.js 16 | Use @tailwindcss/postcss plugin; no tailwind.config.js needed |
| shadcn/ui | Next.js 16 + App Router | Copy components to project; works with Tailwind 4 |
| @t3-oss/env-nextjs | Next.js 15+ | Requires App Router; not compatible with Pages Router |
| React Hook Form | React 19 | Works with Server Actions via useActionState |

## Sources

- Next.js 15/16 API Route Handlers — CSDN Blog (Sept 2025)
- Webhook HMAC verification Node.js — CSDN Blog (Jan 2026)
- Webhook handling security patterns — CSDN Blog (Jan 2026)
- Tailwind CSS 4 with Next.js 16 — Web Search Results (2025)
- shadcn/ui with Next.js 16 App Router — Web Search Results (2025-2026)
- Zod environment variable validation — Web Search Results (Dec 2025)
- T3 Env Next.js runtime validation — Web Search Results (2025)
- React Hook Form + Zod + Next.js App Router — Web Search Results (Dec 2025)

---
*Stack research for: Next.js Partner Integration Demo*
*Researched: 2025-02-24*
