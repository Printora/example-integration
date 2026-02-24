# Phase 1: Foundation & Security - Research

**Researched:** 2026-02-24
**Domain:** Environment validation, webhook security, and TypeScript type safety
**Confidence:** HIGH

## Summary

Phase 1 establishes the secure foundation for the Printora partner integration demo. This phase focuses on three critical areas: type-safe environment variable validation with T3 Env and Zod, HMAC webhook signature verification using Node.js built-in crypto module, and TypeScript type definitions for all Printora API data structures. These foundational elements must be implemented correctly from the start, as they cannot be easily retrofitted without significant refactoring.

The most critical insight from research is that webhook security is frequently omitted or implemented incorrectly in demo applications. Developers commonly skip signature verification during development, never add it before deployment, and use vulnerable string comparison operators instead of timing-safe methods. This phase addresses these security issues upfront by establishing patterns that prevent timing attacks, forged webhook requests, and API key exposure.

**Primary recommendation:** Use T3 Env with Zod for runtime environment validation, implement HMAC signature verification with `crypto.timingSafeEqual()` before any webhook processing, and define comprehensive TypeScript types for all Printora API contracts.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @t3-oss/env-nextjs | latest | Type-safe environment validation | Standard for Next.js 15+; provides runtime validation, fails fast on missing env vars, separates server/client variables with TypeScript inference |
| zod | latest | Schema validation | Industry standard for TypeScript-first validation; integrates with T3 Env; provides type inference from schemas |
| typescript | ^5 | Type safety | Required for App Router; enables compile-time safety for API contracts |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node:crypto | Built-in | HMAC signature verification | Always use built-in module, never external crypto packages |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @t3-oss/env-nextjs | Manual Zod validation | Manual validation requires more boilerplate and doesn't provide client/server boundary enforcement |
| Native crypto module | Svix webhooks library | Svix is overkill for simple demo; native crypto is sufficient and has no dependencies |

**Installation:**
```bash
npm install @t3-oss/env-nextjs zod
```

## Architecture Patterns

### Recommended Project Structure

```
lib/
├── env.ts                    # T3 Env configuration
├── webhook-verify.ts         # HMAC signature verification
└── webhook-store.ts          # In-memory event storage (Phase 1)

types/
└── printora.ts               # Printora API types
```

### Pattern 1: T3 Env with Zod Runtime Validation

**What:** Type-safe environment variable validation that fails fast on startup if variables are missing or invalid.

**When to use:** All Next.js applications; essential for catching configuration errors before runtime.

**Example:**
```typescript
// lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Server-only secrets (never exposed to client)
    PRINTORA_API_KEY: z.string().min(1),
    PRINTORA_API_URL: z.string().url().default("https://api-staging.printora.ai"),
    WEBHOOK_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    // Client-accessible variables (must use NEXT_PUBLIC_ prefix)
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  // Manual mapping required for Next.js bundling
  runtimeEnv: {
    PRINTORA_API_KEY: process.env.PRINTORA_API_KEY,
    PRINTORA_API_URL: process.env.PRINTORA_API_URL,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Allow skipping validation for Docker builds
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
```

**Key points:**
- Server variables without `NEXT_PUBLIC_` prefix are never exposed to client bundle
- Zod schemas provide runtime validation with clear error messages
- `skipValidation` enables Docker builds where env vars are injected at runtime
- Type inference provides autocomplete throughout codebase

### Pattern 2: HMAC Signature Verification with Timing-Safe Comparison

**What:** Verifying webhook authenticity using HMAC-SHA256 with constant-time comparison to prevent timing attacks.

**When to use:** All webhook handlers; critical security baseline for partner integrations.

**Example:**
```typescript
// lib/webhook-verify.ts
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  // Compute expected signature
  const expectedSignature = `sha256=${createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;

  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Critical security practices:**
- Always use `crypto.timingSafeEqual()` — never `===` or `==`
- Get raw body with `await request.text()` BEFORE JSON parsing
- Store webhook secret without `NEXT_PUBLIC_` prefix
- Return 401 immediately on signature mismatch
- Verify signature BEFORE any processing

### Pattern 3: Raw Body Parsing for Signature Verification

**What:** Reading raw request body before JSON parsing to preserve exact bytes for HMAC verification.

**When to use:** Webhook handlers that verify signatures; critical for correct signature validation.

**Example:**
```typescript
// app/api/webhooks/route.ts
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook-verify";

export async function POST(request: Request) {
  // 1. Get raw body FIRST (critical for HMAC)
  const rawBody = await request.text();
  const signature = request.headers.get("x-printora-signature");

  // 2. Verify signature using raw body
  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  // 3. Only AFTER verification, parse JSON
  const payload = JSON.parse(rawBody);

  // 4. Process webhook...
  return NextResponse.json({ received: true });
}
```

**Why order matters:** JSON parsing alters whitespace and encoding. The signature is computed on raw bytes, so using parsed JSON will cause verification to fail even for valid requests.

### Pattern 4: TypeScript Types for API Contracts

**What:** Defining TypeScript interfaces/types for all external API data structures.

**When to use:** All API integrations; enables compile-time safety and autocomplete.

**Example:**
```typescript
// types/printora.ts
export interface PrintoraSessionRequest {
  imageUrl: string;
  userData: {
    email: string;
    name: string;
  };
  successUrl: string;
  failedUrl: string;
}

export interface PrintoraSessionResponse {
  sessionId: string;
  editorUrl: string;
  expiresAt: string;
}

export interface PrintoraWebhookEvent {
  id: string;
  type: "order.created" | "order.paid" | "order.shipped" | "order.delivered";
  timestamp: string;
  data: {
    orderId: string;
    sessionId?: string;
    status: string;
  };
}

export interface WebhookStoredEvent {
  id: string;
  receivedAt: Date;
  type: string;
  payload: unknown;
  verified: boolean;
}
```

### Anti-Patterns to Avoid

- **Anti-pattern:** Using `NEXT_PUBLIC_` prefix for API keys or webhook secrets
  - **Why:** Exposes secrets to client bundle, visible to anyone inspecting the page
  - **Instead:** Use unprefixed variables, access only in server components/routes

- **Anti-pattern:** Using `===` for signature comparison
  - **Why:** Vulnerable to timing attacks; short-circuits on first mismatch
  - **Instead:** Always use `crypto.timingSafeEqual()`

- **Anti-pattern:** Calling `request.json()` before signature verification
  - **Why:** Raw body is consumed after parsing; signature verification fails
  - **Instead:** Call `request.text()` first, verify, then `JSON.parse()`

- **Anti-pattern:** Optional environment variables for required secrets
  - **Why:** Application starts with missing config, fails at runtime
  - **Instead:** Use `.min(1)` in Zod schema to enforce required values

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment validation | Custom env parser with type assertion | @t3-oss/env-nextjs | Built-in Zod integration, client/server boundary enforcement, fails fast with clear errors |
| HMAC verification | Manual HMAC implementation | Node.js `crypto` module | Built-in, battle-tested, timing-safe comparison included |
| Schema validation | Custom validation logic | Zod | Type inference, composable schemas, excellent error messages |

**Key insight:** Custom environment validation is a common source of security vulnerabilities. T3 Env handles edge cases like client/server separation, Docker builds, and validation skipping that hand-rolled solutions often miss.

## Common Pitfalls

### Pitfall 1: Webhook Signature Verification Omission

**What goes wrong:** Demo code processes webhooks without verifying HMAC signatures. This exposes the integration to forged webhook requests — anyone can send fake "order.paid" events.

**Why it happens:** Developers focus on happy path during development; signature verification feels like "extra work" that can be added later.

**How to avoid:** Implement signature verification as the first line in the webhook handler, before any processing. Never bypass verification "for testing."

**Warning signs:** Webhook handler processes `await request.json()` directly without prior verification; no environment variable for webhook secret.

### Pitfall 2: Timing Attack Vulnerability

**What goes wrong:** Using regular equality operators (`===`, `==`) for signature comparison instead of constant-time comparison. Attackers can measure response times to gradually guess valid signatures.

**Why it happens:** `crypto.timingSafeEqual()` is less known than `===`; TypeScript makes Buffer conversion verbose.

**How to avoid:** Always use `crypto.timingSafeEqual()` with Buffer conversion. Consider adding a linting rule to catch string comparison of signatures.

### Pitfall 3: API Key Exposure via NEXT_PUBLIC_ Prefix

**What goes wrong:** Partner API keys end up in browser bundles, visible to anyone who inspects the page.

**Why it happens:** Using `NEXT_PUBLIC_` prefix incorrectly; passing secrets through props; importing server-only modules in client components.

**How to avoid:** Never prefix sensitive variables with `NEXT_PUBLIC_`. Always access secrets in server components or API routes only. Use T3 Env's `server` object for server-only variables.

### Pitfall 4: Wrong Body Parsing for Signatures

**What goes wrong:** Signature verification uses parsed JSON instead of raw request body. JSON parsing changes whitespace, causing signature verification to fail.

**Why it happens:** Developers call `await request.json()` first for convenience; don't realize raw body is consumed and unavailable.

**How to avoid:** Always call `await request.text()` first for raw body, verify signature, then `JSON.parse()` the result.

### Pitfall 5: Missing Environment Variable Validation

**What goes wrong:** Application starts with missing or invalid environment variables, fails at runtime with cryptic errors.

**Why it happens:** Relying on TypeScript type assertions instead of runtime validation; not checking if required variables exist.

**How to avoid:** Use T3 Env with Zod schemas that enforce `.min(1)` for required values. Application will fail fast on startup with clear error messages.

## Code Examples

Verified patterns from official sources:

### Environment Validation with T3 Env

```typescript
// lib/env.ts
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

### Webhook Signature Verification

```typescript
// lib/webhook-verify.ts
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Handler with Raw Body

```typescript
// app/api/webhooks/route.ts
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook-verify";

export async function POST(request: Request) {
  // Get raw body BEFORE JSON parsing
  const rawBody = await request.text();
  const signature = request.headers.get("x-printora-signature");

  // Verify signature using raw body
  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse after verification
  const event = JSON.parse(rawBody);

  // Store event (Phase 1: in-memory)
  // Process event...

  return NextResponse.json({ received: true });
}
```

### In-Memory Event Storage

```typescript
// lib/webhook-store.ts
import type { WebhookStoredEvent } from "@/types/printora";

const events: WebhookStoredEvent[] = [];
const MAX_EVENTS = 100;

export function addEvent(event: WebhookStoredEvent): void {
  events.unshift(event);
  if (events.length > MAX_EVENTS) {
    events.pop();
  }
}

export function getEvents(): WebhookStoredEvent[] {
  return [...events];
}

export function clearEvents(): void {
  events.length = 0;
}
```

### TypeScript Types for Printora API

```typescript
// types/printora.ts
export interface PrintoraSessionRequest {
  imageUrl: string;
  userData: {
    email: string;
    name: string;
  };
  successUrl: string;
  failedUrl: string;
}

export interface PrintoraSessionResponse {
  sessionId: string;
  editorUrl: string;
  expiresAt: string;
}

export type PrintoraWebhookEventType =
  | "order.created"
  | "order.paid"
  | "order.shipped"
  | "order.delivered";

export interface PrintoraWebhookEvent {
  id: string;
  type: PrintoraWebhookEventType;
  timestamp: string;
  data: {
    orderId: string;
    sessionId?: string;
    status: string;
  };
}

export interface WebhookStoredEvent {
  id: string;
  receivedAt: Date;
  type: PrintoraWebhookEventType;
  payload: PrintoraWebhookEvent;
  verified: boolean;
}
```

### .env.example Template

```bash
# Server-only variables (never exposed to client)
PRINTORA_API_KEY=sk_test_your_api_key_here
PRINTORA_API_URL=https://api-staging.printora.ai
WEBHOOK_SECRET=whsec_your_webhook_secret_here
NODE_ENV=development

# Client-accessible variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual env validation with type assertions | T3 Env with Zod runtime validation | 2023-2024 | Fails fast on startup, type-safe env access |
| String comparison (`===`) for signatures | `crypto.timingSafeEqual()` | Always been best practice | Prevents timing attacks |
| Optional environment variables | Required validation with `.min(1)` | Modern practice | Catches config errors early |

**Deprecated/outdated:**
- **crypto npm package:** Deprecated; use native `import { createHmac } from 'node:crypto'`
- **Manual process.env type assertions:** Prone to runtime errors; use T3 Env instead
- **Pages Router API routes:** App Router with `route.ts` is the standard for Next.js 15+

## Open Questions

1. **Printora Webhook Signature Header Name**
   - What we know: Webhooks use HMAC-SHA256 signatures
   - What's unclear: Exact header name (e.g., `x-printora-signature`, `x-webhook-signature`)
   - Recommendation: Verify header name in Printora API documentation during Phase 2 implementation

2. **Printora Webhook Event Types**
   - What we know: Events include order lifecycle (created, paid, shipped, delivered)
   - What's unclear: Exact event type names and payload structure
   - Recommendation: Define types based on Printora API documentation during Phase 2; use Zod schemas for runtime validation

3. **Printora API Session Endpoint**
   - What we know: API uses Bearer token authentication
   - What's unclear: Exact endpoint path and request/response format
   - Recommendation: Confirm API endpoints and authentication format during Phase 2

## Sources

### Primary (HIGH confidence)
- T3 Env Documentation — https://env.t3.gg (Core concepts, createEnv API, runtimeEnv pattern)
- Next.js Route Handlers — https://nextjs.org/docs/app/building-your-application/routing/route-handlers (App Router patterns, request.text() for raw body)
- Node.js Crypto Documentation — https://nodejs.org/api/crypto.html (timingSafeEqual, createHmac, HMAC patterns)
- Zod Documentation — https://zod.dev (Schema validation, type inference, .min() .url() .enum() methods)

### Secondary (MEDIUM confidence)
- Next.js Webhook Best Practices (CSDN, 2025-2026) — HMAC verification patterns, raw body handling
- Webhook Security Patterns (GitHub Webhooks Docs) — Timing attack prevention, signature verification
- Environment Variable Security (Vercel Docs) — NEXT_PUBLIC_ prefix behavior, server/client separation

### Tertiary (LOW confidence)
- Printora API Documentation — https://staging.printora.ai/en/integrations (Not verified; may be staging-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - T3 Env and Zod are well-documented, industry standard for Next.js
- Architecture: HIGH - Patterns verified against official Next.js and Node.js documentation
- Pitfalls: HIGH - Security pitfalls based on well-documented webhook vulnerabilities

**Research date:** 2026-02-24
**Valid until:** 2026-04-24 (60 days - stable domain with mature libraries)
