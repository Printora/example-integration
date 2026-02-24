# Printora Partner Integration Example

## What This Is

A Next.js demo/reference implementation showing how partners can integrate with the Printora Partner API. This example web app demonstrates session creation and webhook handling for print-on-demand orders, deployed on Vercel so developers can test webhook endpoints in a real environment.

## Core Value

Partners can understand and test the Printora integration flow end-to-end with working code examples.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can create a partner session with design image URL and customer data
- [ ] User is redirected to Printora's design editor after session creation
- [ ] Webhook endpoint receives order lifecycle events (created, paid, shipped, delivered)
- [ ] Webhook signature is verified for security (HMAC)
- [ ] Success page displays after user completes checkout
- [ ] Failed page displays when user cancels or checkout fails
- [ ] Dashboard displays all webhook events received
- [ ] Demo can be deployed to Vercel for live webhook testing

### Out of Scope

- User authentication/authorization — this is a public demo
- Database persistence — webhook events stored in memory or local state
- Order management UI (fetch orders, cancel sessions) — partner backend concern
- Production-ready error handling — demo/reference quality only
- Multiple design images per session
- Advanced webhook retry logic — demo shows basic handling

## Context

**Printora Partner API:**
- REST API with Bearer token authentication
- Test mode API key: `sk_test_yulieko-favourse-com_6b7d1b23590d9796a48eec0a0694b19c`
- API base URL: `https://api-staging.printora.ai`
- Documentation: `https://staging.printora.ai/en/integrations`

**Integration Flow:**
1. Partner creates session via API with imageUrl, userData, successUrl, failedUrl
2. User redirected to Printora editor (guest checkout, no login needed)
3. User designs product and checks out on Printora
4. User redirected back to partner's success/failed URL
5. Partner receives webhook events for order lifecycle (created → paid → shipped → delivered)

**Current Environment:**
- Existing Next.js project detected (package.json present)
- Target deployment: Vercel (free tier sufficient)

## Constraints

- **Tech Stack**: Next.js (App Router) — required by user
- **Deployment**: Vercel — for webhook endpoint accessibility
- **API Key**: Use test mode key `sk_test_yulieko-favourse-com_6b7d1b23590d9796a48eec0a0694b19c`
- **Environment**: Use staging API `https://api-staging.printora.ai`
- **Webhook Security**: Must implement HMAC signature verification
- **Scope**: Partner-side only — no backend order management, just session creation + webhook display

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js with App Router | User explicitly requested this stack | — Pending |
| In-memory webhook storage | Demo simplicity, no database needed | — Pending |
| Vercel deployment | Webhook endpoints need public URL | — Pending |
| Single-page dashboard | Easy to view all webhook events at once | — Pending |

---
*Last updated: 2025-02-24 after initialization*
