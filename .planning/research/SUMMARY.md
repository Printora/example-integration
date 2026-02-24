# Project Research Summary

**Project:** example-integration (Printora Partner Integration Demo)
**Domain:** Next.js Partner API Integration with Webhook Handling
**Researched:** 2025-02-24
**Confidence:** HIGH

## Executive Summary

This is a partner integration demo application that showcases how to integrate with Printora's API for session creation and webhook event handling. Experts build these integrations using Next.js App Router with server-side API routes for secure partner communication, HMAC signature verification for webhook security, and in-memory event storage for demo purposes.

The recommended approach is to use Next.js 16.1.6 with App Router for modern route handlers, native Node.js crypto for HMAC verification (avoiding external dependencies), and T3 Env for type-safe environment variable validation. The architecture should separate API routes (`/api/sessions`, `/api/webhooks`, `/api/events`) from UI components, with webhook verification happening before any processing. For the demo, in-memory event storage is acceptable, but production would need persistent storage.

Key risks center on webhook security: omitting signature verification exposes the integration to forged requests, using regular string equality for signatures enables timing attacks, and parsing JSON before verification breaks signature validation. All three are **critical security vulnerabilities** that must be addressed in Phase 1. Additional risks include API key exposure through client components and Vercel serverless timeouts from synchronous webhook processing.

## Key Findings

### Recommended Stack

**Core technologies:**
- **Next.js 16.1.6** — React framework with App Router for modern route handlers and server components
- **React 19.2.3** — Latest UI library with built-in form state hooks compatible with Next.js 16
- **TypeScript 5.x** — Type safety required for App Router best practices and webhook payload validation
- **Node.js 20/22 LTS** — Runtime with built-in crypto module for HMAC verification (no external dependencies needed)

**Styling & UI:**
- **Tailwind CSS 4.x** — Utility-first CSS with CSS-native configuration and 5x faster Oxide engine
- **shadcn/ui** — Component primitives (not an npm package) built on Radix UI for accessibility
- **Lucide React** — Modern icon library, tree-shakeable, standard companion to shadcn/ui

**Supporting libraries:**
- **Zod** — Schema validation for webhook payloads and environment variables
- **@t3-oss/env-nextjs** — Runtime environment validation with Zod schemas
- **React Hook Form** — Form performance with Zod integration for session creation
- **date-fns** — Lightweight date formatting for webhook timestamps

**What NOT to use:** Pages Router (deprecated), crypto npm package (use native), NextAuth.js (no auth needed), Prisma/Drizzle (database out of scope), SWR/React Query (unnecessary for demo).

### Expected Features

**Note:** FEATURES.md was not generated during research. Based on the domain and architecture, inferred must-have features include:

**Must have (table stakes):**
- Session creation form — captures image URL and customer data
- Webhook endpoint with HMAC verification — receives Printora events securely
- Webhook event dashboard — displays received events for verification
- Success/failed callback pages — handles Printora redirect responses
- Type-safe environment validation — fails fast on missing configuration

**Should have (competitive):**
- Real-time event updates — polling or Server-Sent Events for dashboard
- Webhook event replay capability — for debugging and testing
- Sample webhook payloads — for local testing and documentation

**Defer (v2+):**
- User authentication — demo has public access requirement
- Persistent database storage — in-memory acceptable for demo
- Production webhook queue — synchronous processing acceptable for demo

### Architecture Approach

The recommended architecture follows Next.js App Router patterns with clear separation between API routes and UI components. Server-side API routes handle partner communication and webhook processing, while client components manage interactive forms and event display. The webhook handler must verify signatures before any processing, using raw request body (not parsed JSON) with timing-safe comparison.

**Major components:**
1. **Landing Page (`app/page.tsx`)** — Home page with session creation form
2. **Sessions API (`app/api/sessions/route.ts`)** — Creates partner session via Printora API
3. **Webhook Handler (`app/api/webhooks/route.ts`)** — Receives POST webhooks with HMAC verification
4. **Webhook Store (`lib/webhook-store.ts`)** — In-memory event storage (max 100 events)
5. **Dashboard (`app/dashboard/page.tsx`)** — Displays webhook event history
6. **Environment Validation (`lib/env.ts`)** — Type-safe runtime env validation with T3 Env

**Key architectural patterns:**
- Route Handlers for webhooks (App Router) — raw body access via `request.text()`
- In-memory event store for demos — module-scoped array with size limit
- HMAC signature verification — using `crypto.timingSafeEqual()` to prevent timing attacks
- Server Actions for form submission — `'use server'` directive for session creation
- Type-safe environment variables — T3 Env with Zod schemas separates server/client variables

### Critical Pitfalls

**Top 5 pitfalls with prevention strategies:**

1. **Webhook Signature Verification Omission** — Process webhooks without HMAC verification, exposing integration to forged requests. **Prevention:** Always verify signature before processing; use raw body with `request.text()`; return 401 on mismatch.

2. **Timing Attack Vulnerability** — Using regular equality (`===`) for signature comparison enables timing attacks. **Prevention:** Always use `crypto.timingSafeEqual()` with Buffer conversion; never use string comparison for signatures.

3. **Parsed JSON Instead of Raw Body** — Calling `request.json()` before verification loses raw bytes needed for signature. **Prevention:** Get raw body first with `await request.text()`, verify signature, then parse JSON.

4. **Missing Webhook Idempotency** — Duplicate webhook events cause duplicate processing. **Prevention:** Track processed event IDs in Set (demo) or Redis (production); check before processing; mark as processed before work.

5. **API Key Exposure to Client** — Secrets in client components end up in browser bundles. **Prevention:** Never use `NEXT_PUBLIC_` prefix for secrets; proxy through Next.js API routes; keep partner API calls server-side only.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Security

**Rationale:** Security-critical components must be implemented first to avoid building insecure patterns. Foundation utilities (env validation, types, webhook verification) have no dependencies and establish patterns for the rest of the application.

**Delivers:**
- Type-safe environment validation with T3 Env
- HMAC webhook signature verification with timing-safe comparison
- In-memory webhook event store
- TypeScript types for Printora API
- Basic project structure with ESLint and Tailwind

**Addresses:**
- All critical security pitfalls (signature verification, timing attacks, raw body handling)
- API key exposure prevention through server-only patterns

**Avoids:**
- Omitted signature verification (Pitfall 1)
- Timing attack vulnerability (Pitfall 2)
- Parsed JSON for signatures (Pitfall 3)
- API key exposure (Pitfall 5)

### Phase 2: API Integration & Webhook Handler

**Rationale:** After security foundation is in place, implement the core API integration and webhook endpoint. This phase depends on Phase 1 utilities (env validation, webhook verification, types).

**Delivers:**
- Sessions API route (`/api/sessions`) — creates partner session
- Webhook handler route (`/api/webhooks`) — receives and verifies events
- Events API route (`/api/events`) — retrieves stored events
- Printora API client library (`lib/printora.ts`)
- Idempotency handling for duplicate webhooks

**Uses:**
- T3 Env for API key and webhook secret
- Webhook verification library from Phase 1
- In-memory event store from Phase 1
- Zod schemas for payload validation

**Implements:**
- Route Handler pattern for webhooks (ARCHITECTURE.md)
- Server Actions pattern for session creation (ARCHITECTURE.md)

**Avoids:**
- Missing webhook idempotency (Pitfall 4)

### Phase 3: UI Components & Pages

**Rationale:** With API routes working, build the UI that consumes them. Client components depend on API routes and need shadcn/ui primitives in place first.

**Delivers:**
- shadcn/ui component setup (button, input, card, etc.)
- Session creation form component (`components/session-form.tsx`)
- Webhook event list component (`components/webhook-list.tsx`)
- Landing page with form (`app/page.tsx`)
- Success page (`app/success/page.tsx`)
- Failed page (`app/failed/page.tsx`)

**Uses:**
- React Hook Form with Zod validation
- Server Actions for form submission
- Tailwind CSS 4 for styling
- Lucide React for icons

### Phase 4: Dashboard & Real-time Updates

**Rationale:** The dashboard requires all backend APIs to be functional and UI components to be in place. Optional real-time updates are a nice-to-have enhancement.

**Delivers:**
- Dashboard page (`app/dashboard/page.tsx`) — displays webhook events
- Optional polling for live updates
- Event detail view
- Webhook status indicators

**Uses:**
- Events API from Phase 2
- Webhook list component from Phase 3
- Server-side data fetching in page components

### Phase 5: Production Readiness (Optional)

**Rationale:** Demo can function with synchronous processing and in-memory storage, but production readiness requires addressing scaling concerns.

**Delivers:**
- Webhook replay mechanism
- Async webhook processing with queue
- Persistent storage (Vercel KV or Redis)
- Webhook event TTL and cleanup
- Rate limiting
- Comprehensive error logging

**Addresses:**
- Vercel serverless timeouts (Pitfall 6)
- In-memory storage limitations
- Production scaling considerations

### Phase Ordering Rationale

- **Foundation first** — Security patterns established early prevent insecure code from spreading
- **API before UI** — UI components depend on working API routes; test APIs directly first
- **Simple pages before dashboard** — Landing, success, and failed pages are static/form-based; dashboard requires all APIs
- **Demo before production** — Get demo working with simple patterns, then add production complexity
- **Grouping by dependency** — Each phase builds on previous outputs, minimizing cross-phase dependencies

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 5 (Production Readiness):** Webhook queuing strategies and persistent storage options need research based on deployment target (Vercel vs self-hosted)

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Well-documented patterns for T3 Env, crypto verification, TypeScript types
- **Phase 2 (API Integration):** Standard Next.js Route Handler patterns, partner API integration is straightforward REST
- **Phase 3 (UI Components):** shadcn/ui and React Hook Form have extensive documentation and examples
- **Phase 4 (Dashboard):** Standard server-side data fetching and optional polling patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with official Next.js 16 docs, Tailwind CSS 4 docs, and current community best practices (2025-2026) |
| Features | MEDIUM | FEATURES.md was not generated; features inferred from domain and architecture. Requires validation during requirements phase. |
| Architecture | HIGH | Based on official Next.js App Router documentation and established webhook handling patterns from Stripe, GitHub, and Standard Webhooks |
| Pitfalls | HIGH | Verified with official security documentation (Stripe webhooks, GitHub webhooks, Standard Webhooks spec) and Next.js 15/16 breaking changes |

**Overall confidence:** HIGH

### Gaps to Address

- **Missing FEATURES.md:** Feature research was not completed during the research phase. Features were inferred from the domain (partner integration demo) and architecture. During requirements definition, validate that all necessary features are captured and prioritize appropriately.

- **Printora API specifics:** Research references Printora API but the actual API documentation was not consulted. During Phase 2 planning, verify Printora API endpoints, request/response formats, and webhook event types.

- **Webhook payload formats:** Specific webhook event types and payloads from Printora are not documented. During Phase 2 implementation, define Zod schemas based on actual Printora webhook documentation.

## Sources

### Primary (HIGH confidence)
- [Next.js 15/16 Official Documentation](https://nextjs.org/docs) — App Router, Route Handlers, Server Actions, TypeScript configuration
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs) — v4 features, @theme directive, PostCSS plugin
- [shadcn/ui Documentation](https://ui.shadcn.com) — component patterns, installation, Next.js integration
- [T3 Env Documentation](https://env.t3.gg) — environment validation patterns, Zod integration
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices) — idempotency, signature verification, retry handling
- [GitHub Webhook Signature Verification](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries) — HMAC verification patterns
- [Standard Webhooks Specification](https://standardwebhooks.com) — industry standard for webhook security
- [Vercel Serverless Function Limits](https://vercel.com/docs/functions/runtimes) — timeout and quota documentation

### Secondary (MEDIUM confidence)
- [Next.js Route Handlers — CSDN Blog](https://m.blog.csdn.net/gitblog_00663/article/details/152141455) — Sept 2025, webhook implementation examples
- [Webhook HMAC Verification — CSDN Blog](https://m.blog.csdn.net/gitblog_00663/article/details/152141455) — Jan 2026, timing-safe patterns
- [React Hook Form + Zod Integration](https://juejin.cn/post/7564253109163163675) — Dec 2025, form validation patterns
- [Next.js App Router Project Structure](https://juejin.cn/post/7575090551356588084) — Nov 2025, directory organization

### Tertiary (LOW confidence)
- [In-Memory Event Store Pattern](https://blog.csdn.net/sfdzhmr/article/details/153871207) — tech blog, demo-specific pattern
- [Real-time Dashboard with Webhooks](https://m.blog.csdn.net/gitblog_00970/article/details/151252937) — CSDN blog, needs validation

---
*Research completed: 2025-02-24*
*Ready for roadmap: yes*
