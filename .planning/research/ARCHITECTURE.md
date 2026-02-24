# Architecture Research

**Domain:** Next.js Partner Integration Demo with Webhook Handling
**Researched:** 2025-02-24
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+-----------------------------------------------------------------------+
|                           Browser (Client)                            |
+-----------------------------------------------------------------------+
|  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  |
|  │ Landing Page │  │Session Form  │  │Success Page  │  │Dashboard  │  |
|  │  (page.tsx)  │  │ (Client)     │  │(page.tsx)    │  │(page.tsx) │  |
|  └──────┬───────┘  └──────┬───────┘  └──────────────┘  └─────┬─────┘  |
|         │                 │                                   │        |
+---------┼-----------------┼-----------------------------------┼--------+
          │                 │                                   │
          │ POST            │ POST                               │ GET (poll)
          │                 │                                   │
+---------┼-----------------┼-----------------------------------┼--------+
|         ▼                 ▼                                   ▼        |
|  ┌─────────────────────────────────────────────────────────────────┐  |
|  │                      Next.js App Router                         │  |
|  ├─────────────────────────────────────────────────────────────────┤  |
|  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │  |
|  │  │ /api/sessions   │  │ /api/webhooks   │  │ /api/events   │  │  |
|  │  │   route.ts      │  │   route.ts      │  │   route.ts    │  │  |
|  │  │  (Server Action)│  │  (POST handler) │  │  (GET handler)│  │  |
|  │  └────────┬────────┘  └────────┬────────┘  └───────┬───────┘  │  |
|  │           │                     │                    │          │  |
|  │  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼───────┐  │  |
|  │  │ lib/printora.ts │  │ lib/webhook-    │  │ lib/webhook-   │  │  |
|  │  │  (API client)   │  │    verify.ts    │  │    store.ts    │  │  |
|  │  └─────────────────┘  └─────────────────┘  └────────────────┘  │  |
|  └─────────────────────────────────────────────────────────────────┘  |
+-----------------------------------------------------------------------+
          │                     │
          │ HTTPS               │ HTTPS (webhook)
          ▼                     ▼
+-------------------+  +-------------------+
|  Printora API     |  |  Printora API     |
|  (create session) |  |  (sends webhook)  |
+-------------------+  +-------------------+
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Landing Page** (`app/page.tsx`) | Home page with session creation form | Session Form component, `/api/sessions` |
| **Session Form** (`components/session-form.tsx`) | Client component capturing user input (image URL, customer data) | `/api/sessions` API route, Printora API redirect |
| **Sessions API** (`app/api/sessions/route.ts`) | Creates partner session via Printora API, returns redirect URL | Printora API, lib/printora.ts |
| **Webhook Handler** (`app/api/webhooks/route.ts`) | Receives POST webhooks, verifies HMAC signature, stores events | lib/webhook-verify.ts, lib/webhook-store.ts |
| **Webhook Verifier** (`lib/webhook-verify.ts`) | HMAC-SHA256 signature verification using timingSafeEqual | Webhook Handler |
| **Webhook Store** (`lib/webhook-store.ts`) | In-memory event storage with max 100 events | Webhook Handler, Events API |
| **Events API** (`app/api/events/route.ts`) | GET endpoint returning stored webhook events | Dashboard page, lib/webhook-store.ts |
| **Dashboard** (`app/dashboard/page.tsx`) | Displays webhook event history | Events API (polling or Server Action) |
| **Success Page** (`app/success/page.tsx`) | Post-checkout confirmation | Query params from Printora redirect |
| **Failed Page** (`app/failed/page.tsx`) | Cancellation/failure message | Query params from Printora redirect |

## Recommended Project Structure

```
example-integration/
├── app/                          # App Router core directory
│   ├── api/                      # API Route Handlers
│   │   ├── sessions/
│   │   │   └── route.ts          # POST: Create partner session
│   │   ├── webhooks/
│   │   │   └── route.ts          # POST: Receive webhook events
│   │   └── events/
│   │       └── route.ts          # GET: Retrieve stored events
│   ├── dashboard/
│   │   ├── page.tsx              # Webhook event viewer dashboard
│   │   └── loading.tsx           # Loading skeleton for dashboard
│   ├── success/
│   │   └── page.tsx              # Callback success page
│   ├── failed/
│   │   └── page.tsx              # Callback failure page
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Landing page with session form
│   └── globals.css               # Global styles + Tailwind
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives (button, input, etc.)
│   ├── session-form.tsx          # Session creation form (client component)
│   ├── webhook-list.tsx          # Dashboard event list (client component)
│   └── event-card.tsx            # Single webhook event display
├── lib/                          # Utilities & helpers
│   ├── env.ts                    # T3 Env configuration (server + client vars)
│   ├── printora.ts               # Printora API client (session creation)
│   ├── webhook-verify.ts         # HMAC signature verification
│   ├── webhook-store.ts          # In-memory event storage
│   └── utils.ts                  # General utilities (cn() for Tailwind)
├── types/                        # TypeScript type definitions
│   ├── printora.ts               # Printora API types (session, webhook)
│   └── index.ts                  # Shared type exports
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS v4 configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

### Structure Rationale

- **`app/api/`**: All Route Handlers organized by domain; separates server endpoints from UI
- **`lib/`**: Business logic and utilities separate from components; enables reuse across routes
- **`types/`**: Centralized type definitions prevent duplication; clear API contracts
- **`components/ui/`**: shadcn/ui pattern allows component customization; components owned by project
- **Client components in `components/`**: Interactive elements (forms, event display) need 'use client'
- **Server components in `app/`**: Pages are server components by default; better performance

## Architectural Patterns

### Pattern 1: Route Handler for Webhooks (App Router)

**What:** Using `route.ts` files in App Router for webhook endpoints instead of Pages Router API routes.

**When to use:** All Next.js 15+ projects; especially those needing webhook handling with raw body access.

**Trade-offs:**
- Pro: No bodyParser configuration needed (raw body accessible via `request.text()`)
- Pro: Native Web Request/Response APIs
- Pro: Consistent with App Router patterns
- Con: Different from Pages Router (migration consideration for legacy codebases)

**Example:**
```typescript
// app/api/webhooks/route.ts
import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhook-verify';
import { storeWebhookEvent } from '@/lib/webhook-store';

export async function POST(request: Request) {
  // Get raw body BEFORE JSON parsing (critical for HMAC)
  const rawBody = await request.text();
  const signature = request.headers.get('x-printora-signature');

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  // Parse and store event
  const event = JSON.parse(rawBody);
  await storeWebhookEvent(event);

  return new NextResponse('OK', { status: 200 });
}
```

### Pattern 2: In-Memory Event Store for Demos

**What:** Using module-scoped arrays for webhook event storage instead of a database.

**When to use:** Demo/reference applications; testing environments; short-lived deployments.

**Trade-offs:**
- Pro: Zero infrastructure dependencies
- Pro: Simple to understand and debug
- Con: Data resets on server restart
- Con: Single-server only (doesn't scale horizontally)
- Con: No persistence across deployments

**Example:**
```typescript
// lib/webhook-store.ts
interface WebhookEvent {
  id: string;
  receivedAt: Date;
  type: string;
  payload: unknown;
  verified: boolean;
}

// Module-scoped storage (persists across requests, not deployments)
const events: WebhookEvent[] = [];
const MAX_EVENTS = 100;

export function addEvent(event: WebhookEvent): void {
  events.unshift(event); // Add to front (newest first)
  if (events.length > MAX_EVENTS) {
    events.pop(); // Remove oldest
  }
}

export function getEvents(): WebhookEvent[] {
  return [...events]; // Return copy to prevent external mutation
}

export function clearEvents(): void {
  events.length = 0;
}
```

### Pattern 3: HMAC Signature Verification

**What:** Verifying webhook authenticity using HMAC-SHA256 with timing-safe comparison.

**When to use:** All webhook handlers; critical for security in partner integrations.

**Trade-offs:**
- Pro: Prevents forged webhook requests
- Pro: Timing-safe comparison prevents timing attacks
- Con: Requires raw body access (must call `request.text()` before parsing)
- Con: Partner must provide shared secret

**Example:**
```typescript
// lib/webhook-verify.ts
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  // Compute expected signature
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

### Pattern 4: Server Actions for Form Submission

**What:** Using Server Actions (`'use server'` directive) for form handling instead of manual API calls.

**When to use:** Form submissions in Next.js 14+ App Router; standard CRUD operations.

**Trade-offs:**
- Pro: Less boilerplate than manual fetch calls
- Pro: Automatic form revalidation after submission
- Pro: Progressive enhancement (works without JS)
- Con: Less control over request/response
- Con: Not suitable for public APIs

**Example:**
```typescript
// app/actions.ts (or inline in form component)
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

const SessionSchema = z.object({
  imageUrl: z.string().url(),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
});

export async function createSession(formData: FormData) {
  const data = SessionSchema.parse({
    imageUrl: formData.get('imageUrl'),
    customerEmail: formData.get('customerEmail'),
    customerName: formData.get('customerName'),
  });

  // Call Printora API
  const response = await fetch(`${process.env.PRINTORA_API_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PRINTORA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const { editorUrl } = await response.json();
  redirect(editorUrl); // Redirect to Printora editor
}
```

### Pattern 5: Type-Safe Environment Variables

**What:** Using T3 Env with Zod schemas for runtime environment validation.

**When to use:** All Next.js applications; critical for catching configuration errors early.

**Trade-offs:**
- Pro: Fails fast on missing/invalid environment variables
- Pro: TypeScript autocomplete for env vars
- Pro: Separates server-only from client-exposed variables
- Con: Additional dependency
- Con: Requires skipValidation for Docker builds

**Example:**
```typescript
// lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PRINTORA_API_KEY: z.string().min(1),
    PRINTORA_API_URL: z.string().url().default('https://api-staging.printora.ai'),
    WEBHOOK_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
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

## Data Flow

### Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Session Creation Flow                           │
└─────────────────────────────────────────────────────────────────────────┘

User submits form
    │
    ▼
[Session Form] (Client Component)
    │ Server Action
    ▼
[createSession Action]
    │ 1. Validate with Zod
    │ 2. POST to Printora API
    ▼
[Printora API] → Returns session with editorUrl
    │
    ▼
[redirect(editorUrl)] → User navigates to Printora editor
    │
    ▼
[User designs + checks out at Printora]
    │
    ▼
[Printora redirects back]
    │ → /success?session_id=xxx (on success)
    └→ /failed?reason=xxx (on cancellation/error)

┌─────────────────────────────────────────────────────────────────────────┐
│                          Webhook Flow                                   │
└─────────────────────────────────────────────────────────────────────────┘

[Printora API Event]
    │ POST /api/webhooks
    │ Headers: x-printora-signature
    │ Body: { type, payload, timestamp }
    ▼
[Webhook Route Handler]
    │ 1. Get raw body (await request.text())
    │ 2. Extract signature header
    │ 3. Verify HMAC signature
    │    └── If invalid: return 401
    │ 4. Parse JSON payload
    │ 5. Store in memory (webhook-store)
    ▼
[Return 200 OK]

┌─────────────────────────────────────────────────────────────────────────┐
│                          Dashboard Flow                                 │
└─────────────────────────────────────────────────────────────────────────┘

User navigates to /dashboard
    │
    ▼
[Dashboard Page] (Server Component)
    │ Fetch events on server (initial load)
    ▼
[GET /api/events] (Server Action or direct import)
    │
    ▼
[webhook-store.getEvents()] → Returns array
    │
    ▼
[Render WebhookList] (Client Component)
    │ Optional: Poll for updates every 5s
    ▼
Display events to user
```

### State Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Client-Side State (Minimal)                       │
└─────────────────────────────────────────────────────────────────────────┘

This demo uses minimal client state:

[Session Form]
    ├── Form state (React Hook Form)
    └── Validation errors (Zod schema)

[Dashboard]
    ├── Event list (fetched from API / imported module)
    └── Optional: Polling interval for updates

┌─────────────────────────────────────────────────────────────────────────┐
│                      Server-Side State (In-Memory)                     │
└─────────────────────────────────────────────────────────────────────────┘

[webhook-store.ts]
    ├── events: WebhookEvent[] (module-scoped array)
    └── MAX_EVENTS: 100 (size limit)

Note: Module-scoped state persists across requests but resets on deployment.
For production, replace with Vercel KV, Redis, or database.
```

### Key Data Flows

1. **Session Creation:** Form data -> Zod validation -> Printora API -> redirect to editor
2. **Webhook Ingestion:** Raw request -> HMAC verify -> Parse -> Store in memory -> Return 200
3. **Event Display:** Dashboard -> Get events from store -> Render list (with optional polling)
4. **Callback Handling:** Printora redirect -> success/failed page -> Display result with query params

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users (Demo/Testing) | Current architecture is sufficient. In-memory storage works fine for demo purposes. Single Vercel deployment handles this load. |
| 1k-100k users (Production MVP) | Replace in-memory storage with Vercel KV or Redis for webhook event persistence. Add webhook event deduplication using event IDs. Consider adding database for session tracking. |
| 100k+ users (Scale) | Add persistent database (PostgreSQL) for sessions and events. Implement webhook replay mechanism. Use message queue (SQS, Redis Streams) for async webhook processing. Consider microservices for webhook handling. |

### Scaling Priorities

1. **First bottleneck:** In-memory event storage resets on deployment. Replace with Vercel KV or Redis for persistence. Implement TTL for old events.
2. **Second bottleneck:** Synchronous webhook processing may timeout. Move to async processing with background jobs or message queues.
3. **Third bottleneck:** Dashboard polling doesn't scale. Implement Server-Sent Events (SSE) or WebSocket for real-time updates.

## Anti-Patterns

### Anti-Pattern 1: JSON Parsing Before Signature Verification

**What people do:**
```typescript
// BAD: Parsing JSON before verifying signature
export async function POST(request: Request) {
  const body = await request.json(); // Raw body is lost!
  const signature = request.headers.get('x-signature');

  // Can't verify HMAC correctly - JSON.stringify may differ
  verifySignature(JSON.stringify(body), signature);
}
```

**Why it's wrong:** The signature is computed on the raw JSON bytes. Parsing and re-stringifying can produce different whitespace, causing signature verification to fail even for valid requests.

**Do this instead:**
```typescript
// GOOD: Get raw body first
export async function POST(request: Request) {
  const rawBody = await request.text(); // Preserve exact bytes
  const signature = request.headers.get('x-signature');

  if (!verifySignature(rawBody, signature, secret)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const body = JSON.parse(rawBody); // Parse AFTER verification
}
```

### Anti-Pattern 2: Using Regular String Equality for Signature Comparison

**What people do:**
```typescript
// BAD: Vulnerable to timing attacks
if (signature === expectedSignature) {
  // Process webhook
}
```

**Why it's wrong:** Standard string comparison short-circuits on first mismatch, leaking timing information that attackers can use to guess valid signatures character by character.

**Do this instead:**
```typescript
// GOOD: Use timing-safe comparison
import { timingSafeEqual } from 'node:crypto';

if (timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
  // Process webhook
}
```

### Anti-Pattern 3: Mixing Page and Route Files in Same Segment

**What people do:**
```typescript
// BAD: Can't have both at same route level
app/
├── page.tsx      // Defines route at /
└── route.ts      // Also wants route at / → CONFLICT!
```

**Why it's wrong:** Both `page.tsx` and `route.ts` claim ownership of the route segment. Next.js throws an error during build.

**Do this instead:**
```typescript
// GOOD: Use separate segments for API routes
app/
├── page.tsx              // UI route at /
└── api/
    └── webhooks/
        └── route.ts      // API route at /api/webhooks
```

### Anti-Pattern 4: Environment Variables in Client Code Without Prefix

**What people do:**
```typescript
// BAD: Server-only env exposed to client
const apiKey = process.env.PRINTORA_API_KEY; // Exposed in browser bundle!
```

**Why it's wrong:** Next.js only exposes environment variables prefixed with `NEXT_PUBLIC_` to the client. Server-only variables will be `undefined` in client components, but attempting to use them this way risks accidental exposure.

**Do this instead:**
```typescript
// GOOD: Server-side only
import { env } from '@/lib/env';

// In Route Handler or Server Component (runs on server)
const apiKey = env.PRINTORA_API_KEY;

// Or use Server Action for client form submissions
'use server';
export async function createSession() {
  const apiKey = env.PRINTORA_API_KEY; // Safe - runs on server
}
```

### Anti-Pattern 5: Hardcoded URLs in Components

**What people do:**
```typescript
// BAD: Hardcoded URLs break across environments
fetch('https://api-staging.printora.ai/sessions', { ... });
```

**Why it's wrong:** Hardcoded URLs don't work across environments (dev, staging, production). Requires code changes for deployment.

**Do this instead:**
```typescript
// GOOD: Environment-aware URLs
import { env } from '@/lib/env';

fetch(`${env.PRINTORA_API_URL}/sessions`, { ... });
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Printora Partner API | Server-side fetch with Bearer auth | Use Route Handler or Server Action; never expose API key to client |
| Printora Webhooks | POST endpoint with HMAC verification | Verify signature before processing; return 200 quickly; store async |
| Vercel Deployment | Native Next.js hosting | Webhooks require public URL; configure env vars in Vercel dashboard |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client Components -> Server Actions | Direct function call | Form submissions use 'use server' actions; no fetch needed |
| Client Components -> API Routes | HTTP fetch | For public APIs or external integrations |
| Server Components -> lib/ | Direct import | Server components can import and call lib functions directly |
| API Routes -> lib/ | Direct import | Route handlers import utilities from lib/ |

## Build Order Implications

Based on component dependencies, here is the recommended build sequence:

1. **Phase 1: Foundation** (No external dependencies)
   - `lib/env.ts` - Environment validation
   - `lib/utils.ts` - General utilities (cn helper)
   - `types/` - TypeScript type definitions

2. **Phase 2: Core Utilities** (Depends on Phase 1)
   - `lib/webhook-verify.ts` - HMAC verification
   - `lib/webhook-store.ts` - Event storage
   - `lib/printora.ts` - API client (requires env)

3. **Phase 3: API Routes** (Depends on Phase 2)
   - `app/api/webhooks/route.ts` - Webhook endpoint
   - `app/api/events/route.ts` - Events retrieval
   - `app/api/sessions/route.ts` - Session creation

4. **Phase 4: UI Components** (Depends on types)
   - `components/ui/` - shadcn/ui primitives
   - `components/session-form.tsx` - Form component

5. **Phase 5: Pages** (Depends on Phase 3 & 4)
   - `app/page.tsx` - Landing with form
   - `app/success/page.tsx` - Success callback
   - `app/failed/page.tsx` - Failure callback
   - `app/dashboard/page.tsx` - Event viewer

## Sources

- [Next.js Route Handlers Official Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) (HIGH - Official docs)
- [Next.js App Router Project Structure Best Practices](https://juejin.cn/post/7575090551356588084) (MEDIUM - Nov 2025)
- [Webhook HMAC Verification Best Practices](https://m.blog.csdn.net/gitblog_00663/article/details/152141455) (MEDIUM - Feb 2026)
- [Stripe Webhook Next.js App Router Implementation](https://m.blog.csdn.net/gitblog_00970/article/details/151252937) (MEDIUM - 2025)
- [Next.js Server Actions vs API Routes](https://juejin.cn/post/7564253109163163675) (MEDIUM - 2025)
- [GitHub Webhook Handler Examples](https://blog.csdn.net/sfdzhmr/article/details/153871207) (MEDIUM - 2025)
- [In-Memory Event Store Pattern](https://blog.csdn.net/sfdzhmr/article/details/153871207) (LOW - Tech blog)
- [Real-time Dashboard with Webhooks](https://m.blog.csdn.net/gitblog_00970/article/details/151252937) (LOW - CSDN blog)
- [Next.js Environment Variables with Zod](https://www.cnblogs.com/guangzan/articles/19212998.html) (MEDIUM - 2025)
- [TypeScript Types Organization](https://juejin.cn/post/7564253109163163675) (MEDIUM - 2025)
- [OAuth Partner Integration Patterns](https://m.ibm.com/docs/zh/security-verify) (LOW - IBM docs, Chinese)
- [Webhook Authentication Patterns](https://learn.microsoft.com/en-us/partner-center/developer/partner-center-webhooks) (MEDIUM - Microsoft Learn)

---
*Architecture research for: Next.js Partner Integration Demo*
*Researched: 2025-02-24*
