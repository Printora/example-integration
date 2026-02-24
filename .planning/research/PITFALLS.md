# Pitfalls Research

**Domain:** Next.js Partner API Integration with Webhooks
**Project:** Printora Partner Integration Example
**Researched:** 2025-02-24
**Confidence:** HIGH

---

## Executive Summary

Next.js partner API integration demos commonly fail in production due to **webhook security vulnerabilities**, **body parsing issues**, and **deployment configuration gaps**. The most critical pattern is that developers build working demos without signature verification, then forget to add it before shipping. This document catalogs domain-specific pitfalls for webhook-based integrations with actionable prevention strategies.

---

## Critical Pitfalls

### Pitfall 1: Webhook Signature Verification Omission

**What goes wrong:**
Demo code processes webhooks without verifying HMAC signatures. This exposes the integration to forged webhook requests — anyone can send fake "order.paid" events.

**Why it happens:**
- Developers focus on happy path during development
- Signature verification feels like "extra work" that can be added later
- Testing without real webhooks makes verification seem optional
- Copy-pasting from tutorials that skip security for simplicity

**Consequences:**
- Fake order events trigger fulfillment of nonexistent orders
- Revenue loss from fraudulent chargebacks
- Data pollution from fake events
- Security audit failures
- Partner platform compliance issues

**How to avoid:**
```typescript
// Verify signature BEFORE any processing
const rawBody = await request.text();
const signature = request.headers.get('x-webhook-signature');

const expectedSignature = 'sha256=' +
  crypto.createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

if (!crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(signature)
)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

**Warning signs:**
- Webhook handler processes `await request.json()` directly
- No environment variable for webhook secret
- Code comments say "TODO: add verification"
- Testing manually with curl/Postman instead of real webhooks

**Phase to address:** Phase 1 — Core Integration (non-negotiable, must ship with initial implementation)

---

### Pitfall 2: Timing Attack Vulnerability in Signature Comparison

**What goes wrong:**
Using regular equality operators (`===`, `==`) for signature comparison instead of constant-time comparison. Attackers can measure response times to gradually guess valid signatures.

**Why it happens:**
- `crypto.timingSafeEqual()` is less known than `===`
- TypeScript makes Buffer conversion verbose
- Developers think "it's just a string comparison"

**Consequences:**
- Gradual signature enumeration by timing attackers
- Bypass of webhook security entirely
- Not detectable in normal testing — requires security audit

**How to avoid:**
```typescript
// ALWAYS use timing-safe comparison
import crypto from 'crypto';

// Before comparison
const expectedSig = 'sha256=' + hmac.digest('hex');
const receivedSig = request.headers.get('x-signature');

// Convert to Buffers first
if (!crypto.timingSafeEqual(
  Buffer.from(expectedSig),
  Buffer.from(receivedSig)
)) {
  return new Response('Invalid signature', { status: 401 });
}

// NEVER do this:
if (expectedSig === receivedSig) { ... } // VULNERABLE
```

**Warning signs:**
- String comparison with `===` or `==`
- No `crypto.timingSafeEqual()` in codebase
- Linting errors about Buffer usage ignored

**Phase to address:** Phase 1 — Core Integration (security baseline)

---

### Pitfall 3: Parsed JSON Instead of Raw Body for Signature

**What goes wrong:**
Signature verification uses parsed JSON instead of raw request body. JSON parsing changes whitespace, key ordering, and Unicode encoding — causing signature verification to always fail.

**Why it happens:**
- Developers call `await request.json()` first for convenience
- Don't realize raw body is consumed and unavailable after parsing
- Next.js doesn't document this clearly

**Consequences:**
- All legitimate webhooks fail signature verification
- Integration appears broken in production
- Developers mistakenly disable verification as "fix"

**How to avoid:**
```typescript
// CORRECT ORDER — raw body FIRST
export async function POST(request: NextRequest) {
  // 1. Get raw body BEFORE parsing
  const rawBody = await request.text();

  // 2. Verify signature using raw body
  const signature = request.headers.get('x-signature');
  const expectedSig = 'sha256=' +
    crypto.createHmac('sha256', secret)
      .update(rawBody)  // Use raw bytes
      .digest('hex');

  // 3. Only AFTER verification, parse JSON
  const payload = JSON.parse(rawBody);

  // 4. Process webhook...
}
```

**Warning signs:**
- `await request.json()` called before signature verification
- Signature verification happens inside try/catch for JSON parsing
- Comments saying "signature doesn't match, skipping for now"

**Phase to address:** Phase 1 — Core Integration

---

### Pitfall 4: Missing Webhook Idempotency

**What goes wrong:**
Duplicate webhook events cause duplicate side effects. If a webhook is retried (normal behavior), the same order might be processed twice.

**Why it happens:**
- Developers assume webhooks are delivered exactly once
- Don't account for retry behavior from webhook providers
- No unique constraint on event IDs

**Consequences:**
- Duplicate orders created in database
- Double-charging customers
- Inventory oversold
- Confusing user experience

**How to avoid:**
```typescript
// Store processed event IDs
const processedEvents = new Set<string>(); // Use Redis or DB in production

async function processWebhook(event: WebhookEvent) {
  // Check if already processed
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return { status: 'already_processed' };
  }

  // Mark as processed BEFORE doing work (prevent race conditions)
  processedEvents.add(event.id);

  // Now do the actual work
  await updateOrderStatus(event.data.orderId, event.type);
  return { status: 'processed' };
}
```

**Warning signs:**
- No tracking of processed event IDs
- Webhook handler directly executes side effects without deduplication
- Comments say "TODO: handle duplicates"

**Phase to address:** Phase 1 — Core Integration (for demo) / Phase 2 — Production Readiness (with persistent storage)

---

### Pitfall 5: API Key Exposure to Client

**What goes wrong:**
Partner API keys end up in browser bundles, visible to anyone who inspects the page.

**Why it happens:**
- Using `NEXT_PUBLIC_` prefix incorrectly
- Passing secrets through props
- Importing server-only modules in client components
- Environment variables accessed in client components

**Consequences:**
- API keys stolen from bundle
- Unauthorized usage of partner API
- Quota exhaustion
- Security breach requiring key rotation

**How to avoid:**
```typescript
// Server component or API route — SAFE
const apiKey = process.env.PRINTORA_API_KEY; // No NEXT_PUBLIC_ prefix

// ❌ NEVER do this in client components:
// 'use client';
// const apiKey = process.env.NEXT_PUBLIC_PRINTORA_API_KEY; // EXPOSED!

// Instead, create an API route proxy
// app/api/create-session/route.ts
export async function POST(request: NextRequest) {
  const apiKey = process.env.PRINTORA_API_KEY; // Server-only
  const response = await fetch('https://api.printora.ai/sessions', {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  return NextResponse.json({ url: response.data.url });
}
```

**Warning signs:**
- API keys prefixed with `NEXT_PUBLIC_`
- Secrets in `.env` files committed to git
- API calls from client components to external APIs
- Bundle inspection reveals keys

**Phase to address:** Phase 1 — Core Integration

---

### Pitfall 6: Vercel Serverless Timeout on Webhook Processing

**What goes wrong:**
Webhook handlers do too much work synchronously, exceeding Vercel's 10-second (free tier) or 60-second (pro) timeout. The function is killed, webhook provider retries, and work is duplicated.

**Why it happens:**
- Business logic executed directly in webhook handler
- No separation between receipt and processing
- Database operations, external API calls, file processing in webhook

**Consequences:**
- Webhook timeouts trigger retries
- Duplicate processing on retry
- Inconsistent state
- Webhook provider disables failing endpoint

**How to avoid:**
```typescript
// FAST webhook handler — return quickly
export async function POST(request: NextRequest) {
  // 1. Verify signature
  await verifySignature(request);

  // 2. Parse event
  const event = await request.json();

  // 3. Queue for processing (return immediately)
  await queueWebhookEvent(event); // Async queue

  // 4. Return 200 OK within < 5 seconds
  return NextResponse.json({ received: true });
}

// Background worker processes events
async function processQueuedEvents() {
  for (const event of await getQueuedEvents()) {
    await handleOrderCreated(event);
    await sendNotification(event);
  }
}
```

**Warning signs:**
- Webhook handler takes > 5 seconds
- Multiple sequential external API calls in handler
- File uploads or heavy computation in webhook
- Database queries without pagination/limits

**Phase to address:** Phase 2 — Production Readiness (demo can be synchronous for simplicity)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| In-memory event storage | No database setup, instant demo | Data loss on redeploy, no scaling | Demo/MVP only |
| Skip webhook retries | Simpler code | Events lost on failures | Demo with clear disclaimer |
| Synchronous webhook processing | Easier to debug | Timeout issues, no scale | Low-volume demo only |
| Hardcoded test API key | Faster development | Accidental production use | Never — use env vars |
| No rate limiting | Fewer moving parts | DoS vulnerability | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Partner API Session Creation | Calling from client component | Use Next.js API route as proxy |
| Webhook Signature | Using `request.json()` before verification | Use `request.text()` for raw body |
| Environment Variables | `NEXT_PUBLIC_` for secrets | Remove prefix for server-only secrets |
| CORS Errors | Adding CORS to external API | Proxy through Next.js API route |
| Vercel Deployment | Missing environment variables | Configure in Vercel dashboard, not `.env` |
| Webhook Testing | Hardcoding localhost URLs | Use ngrok or deploy preview |
| Type Safety | Untyped webhook payloads | Create Zod schemas for validation |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Cold start spikes | First webhook after idle is slow | Use Edge Runtime (faster cold starts) | Free tier Vercel functions |
| Bundle bloat | Webhook times out on import | Tree-shake dependencies, limit packages | > 50MB bundled size |
| Synchronous processing | Webhook retries triggered | Queue immediately, return 200 | Any processing > 5s |
| Memory leaks | Function OOM after many events | Avoid global state, use external cache | High webhook volume |
| No pagination | Fetch timeouts on large datasets | Always paginate external API calls | > 100 items in response |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No signature verification | Forged webhooks | Always verify HMAC signature |
| `===` for signature comparison | Timing attacks | Use `crypto.timingSafeEqual()` |
| `NEXT_PUBLIC_` on secrets | Client-side exposure | Remove prefix for server secrets |
| Hardcoded secrets in code | Git history exposure | Always use environment variables |
| No CORS validation | Unauthorized requests | Validate Origin header (when applicable) |
| Missing timestamp validation | Replay attacks | Reject events outside 5-minute window |
| Logging sensitive data | Information leakage | Redact API keys, PII in logs |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No webhook status page | Users can't verify integration | Show dashboard of received events |
| Silent failures | Users think integration works | Show error messages, retry UI |
| No local testing guide | Devs can't test before deploy | Document ngrok/local webhook setup |
| Complex setup | Drop-off during onboarding | One-click deploy, preconfigured env vars |
| Missing test data | Unclear what to expect | Sample webhook payloads in docs |

---

## "Looks Done But Isn't" Checklist

- [ ] **Webhook Signature Verification:** Often missing entirely — verify HMAC with timing-safe comparison
- [ ] **Raw Body Handling:** Often uses parsed JSON — must use `request.text()` before verification
- [ ] **Environment Variables:** Often committed to git — check `.gitignore` for `.env.local`
- [ ] **Idempotency:** Often no duplicate handling — track processed event IDs
- [ ] **Error Handling:** Often swallows errors — log webhook failures for debugging
- [ ] **Type Safety:** Often `any` for webhook payloads — define event types or use Zod
- [ ] **Testing Webhooks Locally:** Often not documented — include ngrok setup in README
- [ ] **Vercel Configuration:** Often missing env vars — document required variables
- [ ] **Timeout Protection:** Often synchronous only — consider queuing for production
- [ ] **CORS Issues:** Often not tested — verify API routes work from client

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing signature verification | HIGH | Add verification function, deploy hotfix, rotate webhook secret |
| Timing attack vulnerability | HIGH | Replace `===` with `timingSafeEqual()`, test thoroughly, deploy |
| Exposed API key in bundle | CRITICAL | Rotate key immediately, remove from code, redeploy, audit usage |
| No idempotency (duplicate processing) | MEDIUM | Add event tracking, deduplicate existing duplicates, update database schema |
| Webhook timeouts | MEDIUM | Extract processing to background job, add queue, redeploy |
| Wrong body parsing for signatures | MEDIUM | Refactor to use raw body, test with real webhooks, redeploy |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Signature verification omission | Phase 1 — Core Integration | Manual security review, automated tests |
| Timing attack vulnerability | Phase 1 — Core Integration | Linting rule, code review checklist |
| Parsed JSON for signature | Phase 1 — Core Integration | Integration test with real webhooks |
| Missing idempotency | Phase 1 — Core (demo) / Phase 2 (production) | Duplicate event test suite |
| API key exposure | Phase 1 — Core Integration | Bundle inspection script, CI check |
| Vercel timeouts | Phase 2 — Production Readiness | Load testing, timeout monitoring |
| CORS issues | Phase 1 — Core Integration | End-to-end test from client |
| Type safety issues | Phase 1 — Core Integration | TypeScript strict mode, Zod validation |
| Local testing gaps | Phase 1 — Documentation | Follow setup guide, test locally |

---

## Next.js 15+ Specific Issues

### Breaking Changes Affecting Webhooks

**Promise-based Params:**
```typescript
// Next.js 14 — Direct access
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Direct
}

// Next.js 15+ — Must await
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Required await
}
```

**Impact:** Webhook handlers using dynamic routes must update.

### Security Vulnerabilities (CVE-2025-66478)

Critical RCE vulnerability in App Router with React Server Components:
- Next.js 15.0.0 — 15.5.6 affected
- Next.js 16.0.0 — 16.0.6 affected
- **Fix:** Upgrade to Next.js 15.5.7+ or 16.0.7+

---

## Sources

- [Next.js Webhook Testing with ngrok](https://ngrok.com/docs) — Common issues with local webhook testing (HIGH confidence)
- [Next.js Webhook HMAC Signature Verification](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) — Official Next.js route handler docs (HIGH confidence)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables) — Official Vercel env var docs (HIGH confidence)
- [Next.js App Router Type Safety](https://nextjs.org/docs/app/building-your-application/configuring/typescript) — Official TypeScript docs (HIGH confidence)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices) — Idempotency and retry patterns (HIGH confidence)
- [GitHub Webhook Signature Verification](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries) — Official GitHub security guidance (HIGH confidence)
- [Standard Webhooks Specification](https://standardwebhooks.com/) — Industry standard for webhook security (HIGH confidence)
- [Vercel Serverless Function Limits](https://vercel.com/docs/functions/runtimes) — Official timeout and quota documentation (HIGH confidence)
- [Next.js Edge Runtime Documentation](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes) — Runtime comparison (HIGH confidence)

---

*Pitfalls research for: Next.js Partner API Integration with Webhooks*
*Researched: 2025-02-24*
