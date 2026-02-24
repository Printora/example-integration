# Roadmap: Printora Partner Integration Example

## Overview

This roadmap guides the construction of a Next.js demo application showing partners how to integrate with Printora's API. The journey starts with secure foundations (environment validation, HMAC webhook verification), builds the API integration layer (session creation, webhook handling), constructs the UI (forms, dashboard, callback pages), and finishes with deployment readiness (Vercel configuration, documentation). Each phase delivers a verifiable capability that partners can reference for their own implementations.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Security** - Type-safe environment validation, HMAC webhook verification, TypeScript types, and in-memory event store
- [ ] **Phase 2: API Integration** - Session creation, webhook handler, and events API with Printora client
- [ ] **Phase 3: UI Components & Callback Pages** - Form components, shadcn/ui setup, and callback landing pages
- [ ] **Phase 4: Event Dashboard** - Webhook event display with filtering, search, and real-time polling
- [ ] **Phase 5: Deployment & Developer Experience** - Vercel deployment, README documentation, and integration test examples

## Phase Details

### Phase 1: Foundation & Security

**Goal**: Secure foundation with type-safe environment validation, webhook signature verification, TypeScript types, and in-memory event storage.

**Depends on**: Nothing (first phase)

**Requirements**: SECU-01, SECU-02, SECU-03, SESS-05, DEVX-01, DEVX-02, DEVX-05

**Success Criteria** (what must be TRUE):
1. Application validates all required environment variables at startup and fails fast with clear error messages if any are missing
2. Webhook signature verification uses timing-safe comparison with raw body parsing to prevent timing attacks
3. API key and webhook secret are accessible only server-side (no NEXT_PUBLIC_ prefix)
4. TypeScript types provide autocomplete and compile-time safety for all Printora API data structures

**Plans**: 3 plans

Plans:
- [ ] 01-01: Type-safe environment validation with T3 Env and Zod schemas
- [ ] 01-02: HMAC webhook signature verification with timing-safe comparison
- [ ] 01-03: TypeScript types and in-memory webhook event store

---

### Phase 2: API Integration

**Goal**: Partner API integration with session creation, secure webhook handling, and events retrieval endpoints.

**Depends on**: Phase 1 (environment validation, webhook verification, types, event store)

**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SECU-04, WEBH-01, WEBH-02, WEBH-03, WEBH-04, WEBH-05, WEBH-06, WEBH-07

**Success Criteria** (what must be TRUE):
1. User can submit form with design image URL and customer data, and system creates a Printora session
2. User is redirected to Printora design editor after successful session creation
3. Webhook endpoint receives and verifies POST requests with HMAC signature, rejecting invalid signatures with 401
4. Webhook events are stored in-memory with deduplication by event ID
5. Events API returns all stored webhook events for dashboard consumption

**Plans**: 2 plans

Plans:
- [ ] 02-01: Printora API client with session creation and error handling
- [ ] 02-02: Webhook handler route with signature verification, idempotency, and events API

---

### Phase 3: UI Components & Callback Pages

**Goal**: User interface components for session creation form, callback pages, and shadcn/ui component library setup.

**Depends on**: Phase 2 (API routes for form submission and callback handling)

**Requirements**: CALL-01, CALL-02, CALL-03, DEVX-03

**Success Criteria** (what must be TRUE):
1. Landing page displays session creation form with design image URL and customer data fields
2. Form validates inputs client-side and server-side with clear error messages
3. Success page displays order confirmation when user completes checkout on Printora
4. Failed page displays when user cancels or checkout fails
5. shadcn/ui components are installed and configured with Tailwind CSS

**Plans**: 2 plans

Plans:
- [ ] 03-01: shadcn/ui setup and session creation form component
- [ ] 03-02: Landing page, success page, and failed page

---

### Phase 4: Event Dashboard

**Goal**: Real-time webhook event dashboard with filtering, search, and detailed event inspection.

**Depends on**: Phase 2 (events API), Phase 3 (UI components)

**Requirements**: EVNT-01, EVNT-02, EVNT-03, EVNT-04, EVNT-05, EVNT-06, EVNT-07

**Success Criteria** (what must be TRUE):
1. Dashboard page displays all received webhook events in chronological order
2. Each event shows timestamp, event type badge (created/paid/shipped/delivered), and summary
3. User can filter events by type and search by order ID or customer email
4. Dashboard polls for new events every 5 seconds to provide real-time updates
5. User can expand event cards to view full JSON payload with color-coded success/error indicators

**Plans**: 2 plans

Plans:
- [ ] 04-01: Event list component with filtering and search
- [ ] 04-02: Dashboard page with real-time polling and event detail expansion

---

### Phase 5: Deployment & Developer Experience

**Goal**: Vercel deployment configuration, comprehensive documentation, and integration test examples for partner reference.

**Depends on**: Phase 4 (complete application ready for deployment)

**Requirements**: DEPL-01, DEPL-02, DEPL-03, DEVX-04

**Success Criteria** (what must be TRUE):
1. Application deploys to Vercel with zero configuration using Next.js defaults
2. Environment variables can be configured via Vercel dashboard for the deployed instance
3. Webhook endpoint is accessible at public Vercel URL for external testing
4. README provides clear setup instructions with environment variable template
5. Integration test examples demonstrate webhook testing flow with sample payloads

**Plans**: 2 plans

Plans:
- [ ] 05-01: Vercel deployment configuration and environment variable setup
- [ ] 05-02: README documentation and integration test examples

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Security | 0/3 | Not started | - |
| 2. API Integration | 0/2 | Not started | - |
| 3. UI Components & Callback Pages | 0/2 | Not started | - |
| 4. Event Dashboard | 0/2 | Not started | - |
| 5. Deployment & Developer Experience | 0/2 | Not started | - |

**Total Progress:** 0/11 plans complete (0%)
