# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Creator Dashboard** (`/ai-image-app/creator-dashboard`) — full merch management page where users can switch to a creator profile and manage their merchandise
  - **Creator Selector** dropdown to switch between 14 registered creators
  - **Merch list** with cards showing image, title, product, price range, color count, stock info, and active/inactive status
  - **Create Merch** modal — select product from Printora catalog (fetched via `GET /api/v1/catalog/products`), pick colors (with search bar), auto-include all sizes per color, set image URL and description
  - **Edit Merch** modal — update title, description, image URL, add/remove color variants with search, view stock info (remaining/sold/limited edition)
  - **Activate/Deactivate** merch with confirmation dialog (calls `PUT /api/v1/creators/:creatorId/merch/:merchId` with `status` + `isActive`)
  - **Design Editor redirect** — after creating merch, modal offers "Open Design Editor" button linking to Printora's Konva editor via `editSession.editorUrl`
- **Profile Dropdown** in DreamCanvas header with "Switch to Creator" navigation link
- **API Routes** for merch management:
  - `GET /api/catalog` — proxy to Printora catalog (`GET /api/v1/catalog/products`) with real product IDs and variant UUIDs
  - `GET /api/merch?creatorId=xxx` — fetch creator's merch from Printora BE (`GET /api/v1/creators/:creatorId/merch`)
  - `GET /api/merch/:id?creatorId=xxx` — fetch single merch detail from BE
  - `POST /api/merch` — create merch via Printora BE (`POST /api/v1/creators/:creatorId/merch`), returns `editSession` with editor URL
  - `PUT /api/merch/:id` — update merch via Printora BE (`PUT /api/v1/creators/:creatorId/merch/:merchId`)
  - `PATCH /api/merch/:id` — toggle active status via Printora BE
- **Printora API client** (`lib/printora-client.ts`) — added `createCreatorMerch()` and `updateCreatorMerch()` functions with proper types matching CREATOR_SYSTEM.md
- **In-memory merch store** (`lib/merch-store.ts`) — local cache with stock fields (`stockLimit`, `stockSold`, `stockRemaining`, `isLimitedEdition`)
- **Stock info display** across all views:
  - Print Modal: "Limited Edition — 95/100 remaining" badge, "Sold Out" badge with disabled order button
  - MerchCard: "Limited 95/100 left" or "Sold out" or "Unlimited stock"
  - Edit Modal: remaining/sold counters
- **2-step variant picker** in Print Modal — compact color tags → size tags (replaces flat variant list), with dedup for duplicate color+size combos from catalog
- **Color search bar** in Create/Edit merch modals — auto-shown when product has more than 6 colors
- **Shared data module** (`app/ai-image-app/data.ts`) — extracted types, creators, merch catalog, and gallery images from page.tsx
- `CREATOR_SYSTEM.md` documentation

### Changed
- **14 unique creators** registered on Printora staging API, each with real UUIDs, names, descriptions, and unique avatar gradients
- **Merch items** for each creator with product variants (color, size, price) from Printora catalog
- **Variant selector modal** — users can browse merch details, pick a variant (color swatch, size, price), then order
- **Flow C (Direct Merch)** integration — session created with `merchId` and `variantId`
- Support for `variantId` field in session creation (pre-selects variant on Printora)
- Support for `quantity` field in session creation (default: 1, range: 1-100)
- `FRONTEND_INTEGRATION_GUIDE.md` — full partner API documentation
- **Home page** redesigned to showcase Flow A (Image Upload) and Flow C (Direct Merch) with code snippets and descriptions
- **Session API route** now validates and supports all 3 integration flows (`imageUrl`, `creatorId`, `merchId`) with Zod schema refinement
- **PrintoraSessionRequest** type updated — `imageUrl` is now optional alongside `creatorId`, `merchId`, `variantId`, and `quantity`
- **DreamCanvas gallery** images now reference creators via `creatorId` and merch via `merchId` (real Printora UUIDs)
- **Print Modal** now fetches merch data from Printora BE (`GET /api/v1/creators/:creatorId/merch/:merchId`) for latest data
- Print modal no longer auto-triggers — user selects variant first, then clicks "Order"
- **MerchInfo type** — added `imageUrl` field, all catalog items now have image URLs
- **MerchCard** shows color count instead of total variant count
- **colorCode normalization** — BE returns hex without `#`, frontend auto-prepends `#` for CSS

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
