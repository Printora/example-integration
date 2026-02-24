# Phase 2: API Integration - Research

**Researched:** 2026-02-24
**Domain:** Next.js App Router, API Client Design, Webhook Handling
**Confidence:** HIGH

## Summary

Phase 2 involves implementing the Printora API integration with two main components: (1) a session creation flow where users submit a form with design image URL and customer data, create a Printora session, and redirect to the design editor, and (2) a webhook handler that receives, verifies, stores, and serves webhook events.

The research confirms that the existing Phase 1 infrastructure (T3 Env, webhook verification, event store, TypeScript types) provides a solid foundation. The primary implementation will use Next.js 16 App Router Route Handlers for both the session API and webhook endpoint. For form handling, the modern approach uses React 19's `useActionState` hook with Server Actions, providing built-in pending states and error handling.

**Primary recommendation:** Use Next.js App Router Route Handlers (`app/api/*/route.ts`) for API endpoints, implement a typed fetch wrapper client using native fetch with proper error handling, and use Server Actions with `useActionState` for the form submission flow.

## User Constraints

### Locked Decisions (from Phase 1)
- **Environment validation:** T3 Env with `@t3-oss/env-nextjs`
- **Webhook secret naming:** `PRINTORA_WEBHOOK_SECRET`
- **Signature comparison:** `timingSafeEqual` from `node:crypto`
- **Type definitions:** TypeScript interfaces in `types/printora.ts`
- **Event store:** In-memory with getters returning copies
- **Memory management:** `MAX_EVENTS` cap at 100 events
- **Import style:** Import from `node:crypto` for Node.js built-ins

### Claude's Discretion
- API client implementation pattern (native fetch vs ofetch vs custom wrapper)
- Form handling approach (Server Actions vs API route + manual fetch)
- Error handling and response format for API endpoints
- Zod schema organization and validation pattern
- Session creation URL construction pattern

### Deferred Ideas (OUT OF SCOPE)
- Database persistence (use in-memory store from Phase 1)
- Advanced retry mechanisms for API client
- Webhook retry delivery logic
- Dashboard UI for viewing events (events API only)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router with Route Handlers | Current stable release, provides Web-standard Request/Response APIs |
| React | 19.2.3 | `useActionState` hook for form state management | React 19 introduces native form state hooks |
| Zod | 4.3.6 | Schema validation for form inputs | Type-safe validation, already in project |
| T3 Env | 0.13.10 | Environment variable validation | Already configured in Phase 1 |
| TypeScript | 5.x | Type safety for API contracts | Already configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| native fetch | (built-in) | HTTP client for Printora API | Prefer native fetch over ofetch for this simple use case |
| NextResponse | (next/server) | HTTP responses with status codes | Use for all Route Handler responses |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| native fetch | ofetch | ofetch provides auto-retry and better error handling, but adds a dependency for minimal gain |
| Server Actions | API route + fetch | Server Actions provide simpler form handling with automatic pending states |
| Route Handlers | Server Actions | Route Handlers are better for webhooks (need raw body access) and external API calls |

**Installation:**
No additional packages needed. All required dependencies are already installed:
```bash
# Already present in package.json:
# - next (16.1.6)
# - react (19.2.3)
# - zod (4.3.6)
# - @t3-oss/env-nextjs (0.13.10)
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   ├── printora/
│   │   └── session/
│   │       └── route.ts          # POST: Create Printora session
│   ├── webhooks/
│   │   └── route.ts              # POST: Handle Printora webhooks
│   └── events/
│       └── route.ts              # GET: Retrieve stored webhook events
├── create-session/
│   └── page.tsx                  # Form page for session creation
lib/
├── printora-client.ts            # NEW: Printora API client
├── env.ts                        # EXISTING: T3 Env validation
├── webhook-verify.ts             # EXISTING: Signature verification
└── webhook-store.ts              # EXISTING: In-memory event store
types/
└── printora.ts                   # EXISTING: TypeScript types
```

### Pattern 1: API Route Handler with NextResponse
**What:** Route Handlers in App Router use Web-standard Request/Response APIs
**When to use:** All API endpoints (webhooks, session creation, events retrieval)
**Example:**
```typescript
// Source: Next.js official docs
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Always return NextResponse explicitly
  return NextResponse.json(
    { message: 'Success' },
    { status: 200 }
  )
}
```

### Pattern 2: Raw Body Reading for Webhook Verification
**What:** Read raw request body before JSON parsing for signature verification
**When to use:** Webhook endpoints that verify HMAC signatures
**Example:**
```typescript
// Source: Web search for Next.js webhook patterns 2026
export async function POST(req: Request) {
  // CRITICAL: Get raw body BEFORE JSON parsing
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')

  // Verify signature with raw body
  const isValid = verifySignature(rawBody, signature)

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }

  // Now parse JSON for processing
  const payload = JSON.parse(rawBody)
  // ... process event
}
```

### Pattern 3: Server Actions with useActionState
**What:** React 19's `useActionState` hook for form state management
**When to use:** Form submissions that need server-side validation and error feedback
**Example:**
```typescript
// Source: Next.js 15/16 documentation patterns
'use server'
import { z } from 'zod'

const schema = z.object({
  imageUrl: z.string().url('Invalid URL'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

export async function createSession(prevState: any, formData: FormData) {
  const validated = schema.safeParse({
    imageUrl: formData.get('imageUrl'),
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
    }
  }

  // Call Printora API...
  return { success: true, editorUrl: response.editorUrl }
}
```

### Pattern 4: Typed Fetch Wrapper for API Client
**What:** Simple typed fetch wrapper with error handling
**When to use:** External API integration (Printora API calls)
**Example:**
```typescript
// Recommended pattern for Phase 2
interface ApiError {
  code: string
  message: string
}

class PrintoraApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

async function printoraFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.PRINTORA_API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PRINTORA_API_KEY}`,
      ...options.headers,
    },
  })

  // Fetch doesn't throw on 4xx/5xx - must check manually
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      code: 'UNKNOWN',
      message: `HTTP ${response.status}`,
    }))
    throw new PrintoraApiError(response.status, error.code, error.message)
  }

  return response.json()
}
```

### Anti-Patterns to Avoid
- **Silent error handling:** Fetch doesn't throw on non-2xx status codes - always check `response.ok`
- **Parsing JSON before verification:** For webhooks, always read raw body first for signature verification
- **Missing NextResponse return:** Route Handlers must explicitly return NextResponse, not undefined
- **Redirect inside try/catch:** The `redirect()` function throws an error - placing it in try/catch will catch the redirect
- **Mutation of returned state:** Always return copies from getters, not references to internal arrays

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema validation | Custom validation logic | Zod | Zod provides type-safe validation with clear error messages, already installed |
| Environment validation | Manual `process.env` checks | T3 Env | Already configured, provides type safety and validation |
| Webhook signature verification | Custom HMAC implementation | Phase 1's `verifyWebhookSignature` | Already implemented with timingSafeEqual |
| Event deduplication | Custom deduplication logic | Phase 1's `addEvent` | Already handles event ID deduplication |
| Form state management | Manual useState and useEffect | `useActionState` from React 19 | Built-in form state with pending states |

**Key insight:** Phase 1 has already built the foundational utilities (env, webhook verification, event store). Phase 2 should compose these rather than rebuilding them.

## Common Pitfalls

### Pitfall 1: Fetch Doesn't Throw on HTTP Errors
**What goes wrong:** Code assumes `fetch` throws on 4xx/5xx status codes, but it doesn't
**Why it happens:** The Fetch API was designed this way - only network errors throw
**How to avoid:** Always check `response.ok` after fetch and handle non-2xx responses explicitly
**Warning signs:** Errors being treated as successful responses, API errors not being caught

### Pitfall 2: JSON Parsing Before Signature Verification
**What goes wrong:** Webhook signature verification fails because body was parsed before computing signature
**Why it happens:** JSON parsing can modify whitespace/encoding, breaking the signature
**How to avoid:** Always call `req.text()` before `req.json()` for webhook endpoints
**Warning signs:** Signature verification consistently returns false despite correct secret

### Pitfall 3: Forgetting to Return NextResponse
**What goes wrong:** Route Handler returns undefined, causing TypeError when Next.js tries to read headers
**Why it happens:** Next.js App Router uses Web Response API, requires explicit return
**How to avoid:** Always have explicit return statements with NextResponse
**Warning signs:** "Cannot read properties of undefined (reading 'headers')" errors

### Pitfall 4: Timing Attacks on Signature Comparison
**What goes wrong:** Using `===` for signature comparison leaks timing information
**Why it happens:** String comparison is O(n) and returns early at first mismatch
**How to avoid:** Already solved in Phase 1 - use `timingSafeEqual` from `node:crypto`
**Warning signs:** None visible - this is a security vulnerability that doesn't affect functionality

### Pitfall 5: Redirect Inside Try/Catch
**What goes wrong:** Redirect doesn't happen because it gets caught by error handler
**Why it happens:** `redirect()` throws a special error to trigger navigation
**How to avoid:** Place redirect calls outside try/catch blocks
**Warning signs:** Form submits successfully but page doesn't redirect

## Code Examples

Verified patterns from official sources:

### Webhook Route Handler with Raw Body
```typescript
// Source: Web search results for Next.js webhook patterns 2026
// File: app/api/webhooks/route.ts
import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/webhook-verify'
import { addEvent } from '@/lib/webhook-store'

export async function POST(request: Request) {
  // CRITICAL: Read raw body first for signature verification
  const rawBody = await request.text()
  const signature = request.headers.get('x-printora-signature')

  // Verify signature using Phase 1 implementation
  const isValid = verifyWebhookSignature(rawBody, signature)

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    )
  }

  // Parse JSON after verification
  const event = JSON.parse(rawBody)

  // Store event using Phase 1 implementation (handles deduplication)
  const added = addEvent(event, true)

  // Return 200 OK even for duplicate events (idempotency)
  return NextResponse.json(
    { received: true, duplicate: !added },
    { status: 200 }
  )
}
```

### Session Creation API Client
```typescript
// File: lib/printora-client.ts
import { env } from '@/lib/env'
import type {
  PrintoraSessionRequest,
  PrintoraSessionResponse,
} from '@/types/printora'

class PrintoraApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'PrintoraApiError'
  }
}

export async function createSession(
  request: PrintoraSessionRequest
): Promise<PrintoraSessionResponse> {
  const response = await fetch(`${env.PRINTORA_API_URL}/partner/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PRINTORA_API_KEY}`,
    },
    body: JSON.stringify(request),
  })

  // Fetch doesn't throw on HTTP errors - must check manually
  if (!response.ok) {
    if (response.status === 401) {
      throw new PrintoraApiError(401, 'AUTH_FAILED', 'Authentication failed')
    }
    // Handle other error codes...
  }

  return response.json()
}
```

### Events Retrieval Endpoint
```typescript
// File: app/api/events/route.ts
import { NextResponse } from 'next/server'
import { getEvents } from '@/lib/webhook-store'

export async function GET() {
  const events = getEvents() // Returns a copy, not reference
  return NextResponse.json(events)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API Routes (`pages/api/*.ts`) | App Router Route Handlers (`app/api/*/route.ts`) | Next.js 13+ | Route Handlers use Web Request/Response, support Edge Runtime |
| `getServerSideProps` for form handling | Server Actions with `useActionState` | Next.js 14+ / React 19 | Simplified form handling, automatic pending states |
| Manual form state with `useState` | `useActionState` hook | React 19 | Built-in form state management, less boilerplate |
| `res.status(401).json(...)` pattern | `NextResponse.json(..., { status: 401 })` | Next.js 13+ | Web-standard Response API |

**Deprecated/outdated:**
- `pages/api` directory: Use `app/api` with Route Handlers instead
- `next/router`: Use `next/navigation` for App Router
- `useFormState` from `react-dom`: Use `useActionState` from React 19

## Open Questions

1. **Printora API endpoint path**
   - What we know: Need to create sessions via POST to an endpoint
   - What's unclear: Exact API path (e.g., `/partner/sessions`, `/api/v1/sessions`, `/sessions`)
   - Recommendation: Use a configurable path constant in `printora-client.ts` that can be updated when API docs are confirmed

2. **Printora signature header name**
   - What we know: Signature uses HMAC-SHA256 with `sha256=` prefix
   - What's unclear: Exact header name (e.g., `x-printora-signature`, `x-webhook-signature`, `webhook-signature`)
   - Recommendation: Use `x-printora-signature` as placeholder, make it configurable

3. **Session expiration handling**
   - What we know: Response includes `expiresAt` timestamp
   - What's unclear: Whether expired sessions should be handled on redirect
   - Recommendation: For Phase 2, trust the API response - expiration handling can be added later if needed

## Sources

### Primary (HIGH confidence)
- **Next.js Official Documentation** - Route Handlers, Request/Response patterns, Server Actions
- **Phase 1 Implementation** - `lib/env.ts`, `lib/webhook-verify.ts`, `lib/webhook-store.ts`, `types/printora.ts`
- **React 19 Documentation** - `useActionState` hook for form state management

### Secondary (MEDIUM confidence)
- [Next.js App Router POST Request Handling](https://www.nextjs.cn/docs/app/building-your-application/routing/route-handlers) - Verified pattern for returning NextResponse
- [Type-Safe Form Validation in Next.js 15](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Zod + Server Actions pattern (January 2026)
- [Next.js Redirecting Guide](https://nextjs.org/docs/app/guides/redirecting) - Official redirect patterns with Server Actions
- [ofetch GitHub Repository](https://github.com/unjs/ofetch) - Evaluated as alternative to native fetch

### Tertiary (LOW confidence)
- Various Chinese technical blogs (CSDN, Juejin) - Used for pattern verification, cross-referenced with official docs
- Webhook idempotency patterns from general web search - Standard patterns, not specific to Next.js

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed, documented in package.json
- Architecture: HIGH - Next.js 16 App Router patterns well-documented, Phase 1 provides solid foundation
- Pitfalls: HIGH - Common pitfalls well-documented across multiple sources

**Research date:** 2026-02-24
**Valid until:** 2026-03-26 (30 days - stable ecosystem, Next.js 16 is current LTS)
