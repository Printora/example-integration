# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **14 unique creators** registered on Printora staging API, each with real UUIDs, names, descriptions, and unique avatar gradients
- **Merch items** for each creator with product variants (color, size, price) from Printora catalog
- **Variant selector modal** — users can browse merch details, pick a variant (color swatch, size, price), then order
- **Flow C (Direct Merch)** integration — session created with `merchId` and `variantId`
- Support for `variantId` field in session creation (pre-selects variant on Printora)
- Support for `quantity` field in session creation (default: 1, range: 1-100)
- `FRONTEND_INTEGRATION_GUIDE.md` — full partner API documentation

### Changed
- **Home page** redesigned to showcase Flow A (Image Upload) and Flow C (Direct Merch) with code snippets and descriptions
- **Session API route** now validates and supports all 3 integration flows (`imageUrl`, `creatorId`, `merchId`) with Zod schema refinement
- **PrintoraSessionRequest** type updated — `imageUrl` is now optional alongside `creatorId`, `merchId`, `variantId`, and `quantity`
- **DreamCanvas gallery** images now reference creators via `creatorId` and merch via `merchId` (real Printora UUIDs)
- Print modal no longer auto-triggers — user selects variant first, then clicks "Order"

### Removed
- Flow B (Creator Storefront) card from home page — not used in demo

## [0.1.0] - 2026-03-14

### Added
- Initial project setup with Next.js 16, TypeScript, Tailwind CSS
- Session creation form (`/create-session`) with image URL input
- Printora API client with error handling and idempotency keys
- Webhook receiver with HMAC-SHA256 signature verification
- Real-time webhook event dashboard (`/dashboard`)
- DreamCanvas AI image gallery demo (`/ai-image-app`)
- Callback pages for success and failure flows
- Environment validation with `@t3-oss/env-nextjs`
