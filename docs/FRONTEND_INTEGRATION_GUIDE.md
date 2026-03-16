# Frontend Integration Guide — Printora Partner API

**Version:** 1.1 | **Last Updated:** 2026-03-15 | **Auth:** API Key only (`/api/v1/`)

> This guide is for **partner developers** integrating Printora's print-on-demand service into their platform. All endpoints use API key authentication.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Integration Flows](#integration-flows)
   - [Flow A — Custom Image Upload](#flow-a--custom-image-upload)
   - [Flow B — Creator Storefront](#flow-b--creator-storefront)
   - [Flow C — Direct Merch Link](#flow-c--direct-merch-link)
5. [API Reference](#api-reference)
   - [Sessions](#sessions)
   - [Catalog](#catalog)
   - [Creators](#creators)
   - [Merch](#merch)
   - [Orders & Analytics](#orders--analytics)
   - [Webhooks Management](#webhooks-management)
6. [Webhook Handling](#webhook-handling)
7. [Full Working Examples](#full-working-examples)
   - [Next.js (React)](#nextjs-react)
   - [Node.js + Express](#nodejs--express)
   - [Python + Flask](#python--flask)
8. [Error Handling](#error-handling)
9. [Security Best Practices](#security-best-practices)
10. [FAQ](#faq)

---

## Architecture Overview

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Your Frontend  │         │  Your Backend    │         │   Printora API   │
│   (React, Vue,   │         │  (Node, Python,  │         │   /api/v1/...    │
│    Next.js...)   │         │   PHP, Go...)    │         │                  │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         │  1. User clicks            │                            │
         │     "Order Print"          │                            │
         ├───────────────────────────>│                            │
         │                            │  2. POST /partner-session  │
         │                            │     (with API key)         │
         │                            ├───────────────────────────>│
         │                            │                            │
         │                            │  3. { redirectUrl }        │
         │                            │<───────────────────────────┤
         │  4. Redirect user          │                            │
         │<───────────────────────────┤                            │
         │                            │                            │
         │  5. User lands on Printora │                            │
         │     (selects product,      │                            │
         │      customizes, pays)     │                            │
         │                            │                            │
         │                            │  6. Webhook: order.paid    │
         │                            │<───────────────────────────┤
         │                            │                            │
         │  7. Update UI              │                            │
         │<───────────────────────────┤                            │
```

**Key principle:** Your API key must NEVER be exposed in frontend/client-side code. All Printora API calls go through YOUR backend server.

---

## Quick Start

### 1. Get Your Credentials

Contact Printora to receive:

| Credential | Example | Usage |
|------------|---------|-------|
| **API Key** | `pk_live_abc123...` | `Authorization: Bearer <key>` header |
| **Webhook Secret** | `whsec_xyz789...` | Verify incoming webhook signatures |

### 2. Set Up Environment Variables

```bash
# .env
PRINTORA_API_KEY=pk_live_abc123def456ghi789
PRINTORA_WEBHOOK_SECRET=whsec_xyz789abc123def456
PRINTORA_API_URL=https://printora-be-staging.vercel.app/api/v1
FRONTEND_URL=https://your-site.com
```

### 3. Make Your First API Call

```bash
# Create a session (redirect user to Printora)
curl -X POST https://printora-be-staging.vercel.app/api/v1/partner-session \
  -H "Authorization: Bearer pk_live_abc123..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "imageUrl": "https://your-cdn.com/design.png",
    "userData": { "email": "user@example.com", "name": "John" },
    "successUrl": "https://your-site.com/success",
    "failedUrl": "https://your-site.com/failed"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "redirectUrl": "https://printora.ai/en/print/abc123token",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

### 4. Redirect User

```javascript
// Your frontend
window.location.href = response.data.redirectUrl;
```

That's it! The user completes their order on Printora, and you receive webhooks for order updates.

---

## Authentication

**All requests** to `/api/v1/` require an API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

### API Key Types

| Prefix | Environment | Usage |
|--------|-------------|-------|
| `pk_test_` | Staging | Development & testing |
| `pk_live_` | Production | Real transactions |

### Base URLs

| Environment | URL |
|-------------|-----|
| **Staging** | `https://printora-be-staging.vercel.app/api/v1` |
| **Production** | `https://printora-be-prod.vercel.app/api/v1` |

### Rate Limits

| Limit | Value |
|-------|-------|
| Per minute | 100 requests |
| Per hour | 1,000 requests |

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
```

---

## Integration Flows

Printora supports **3 integration flows**. Choose the one that fits your use case.

### Flow A — Custom Image Upload

**Use case:** Your users upload/create designs on your platform, and you send them to Printora for printing.

```
User uploads design → Your backend sends imageUrl → User redirected to Printora → Selects product & pays
```

```javascript
// Your backend
const response = await fetch(`${PRINTORA_API_URL}/partner-session`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID()
  },
  body: JSON.stringify({
    imageUrl: 'https://your-cdn.com/user-design.png',  // Must be publicly accessible
    userData: { email: 'user@example.com', name: 'John Doe' },
    successUrl: 'https://your-site.com/order/success',
    failedUrl: 'https://your-site.com/order/failed'
  })
});

const { data } = await response.json();
// Redirect user to: data.redirectUrl
```

---

### Flow B — Creator Storefront

**Use case:** You have creators (influencers, artists) on your platform. Each creator has pre-configured merch. End users browse a creator's merch catalog.

```
User clicks "Shop Creator" → Your backend sends creatorId → User sees all creator merch on Printora
```

#### Step 1: Set Up Creator & Merch (one-time)

```javascript
// 1. Browse Printora catalog to find products
const catalog = await fetch(`${PRINTORA_API_URL}/catalog/products`, {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
}).then(r => r.json());

// 2. Create a creator
const creator = await fetch(`${PRINTORA_API_URL}/creators`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Anya Artwork',
    slug: 'anya-artwork',
    description: 'Galaxy-themed digital artist',
    logoUrl: 'https://cdn.your-site.com/anya-logo.png'
  })
}).then(r => r.json());

// 3. Add merch items to the creator
const product = catalog.data.products[0];
const merch = await fetch(`${PRINTORA_API_URL}/creators/${creator.creator.id}/merch`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Galaxy Art T-Shirt',
    description: 'Signature galaxy design on premium cotton',
    productId: product.id,
    variantIds: product.variants.map(v => v.id),
    designImageUrl: 'https://cdn.your-site.com/anya-galaxy-design.png'
  })
}).then(r => r.json());
```

#### Step 2: Create Session for End User

```javascript
// When user clicks "Shop Anya's Merch"
const session = await fetch(`${PRINTORA_API_URL}/partner-session`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID()
  },
  body: JSON.stringify({
    creatorId: 'creator-uuid-here',  // User browses ALL merch by this creator
    userData: { email: 'fan@example.com', name: 'Jane' },
    successUrl: 'https://your-site.com/order/success',
    failedUrl: 'https://your-site.com/order/failed'
  })
}).then(r => r.json());

// Redirect user
window.location.href = session.data.redirectUrl;
```

---

### Flow C — Direct Merch Link

**Use case:** Link directly to a specific merch item. The design and product are pre-configured — user just selects size/color and pays.

```
User clicks "Buy This Merch" → Your backend sends merchId → User lands on specific product page
```

```javascript
const session = await fetch(`${PRINTORA_API_URL}/partner-session`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID()
  },
  body: JSON.stringify({
    merchId: 'merch-uuid-here',      // Specific merch item
    variantId: 'variant-uuid-here',  // Optional: pre-selected variant (single cartItem)
    userData: { email: 'fan@example.com', name: 'Jane' },
    successUrl: 'https://your-site.com/order/success',
    failedUrl: 'https://your-site.com/order/failed'
  })
}).then(r => r.json());

// Response includes cartItems with only the selected variant
// Store in localStorage and go to checkout
if (session.data.sessionMode === 'merch') {
  const cart = session.data.cartItems; // single item when variantId provided
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Redirect user
window.location.href = session.data.redirectUrl;
```

---

## API Reference

### Sessions

#### Create Partner Session

```
POST /api/v1/partner-session
```

Creates a checkout session. Provide exactly **one** of `imageUrl`, `creatorId`, or `merchId`.

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer YOUR_API_KEY` |
| `Content-Type` | Yes | `application/json` |
| `Idempotency-Key` | Yes | UUID to prevent duplicate sessions |

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageUrl` | String (URL) | Mode A | Public URL of the design image (PNG/JPG, 2000x2000px recommended) |
| `creatorId` | UUID | Mode B | Creator ID — user browses all creator merch |
| `merchId` | UUID | Mode C | Merch ID — user lands on specific merch item |
| `variantId` | UUID | No | Selected variant ID — use with `merchId` to return single `cartItems` entry. Must belong to the merch. |
| `quantity` | Integer | No | Quantity (1-100, default: 1). Validated against `stockLimit` for limited edition merch. |
| `userData` | Object | No | Customer information |
| `userData.email` | String | No | Customer email (pre-fills checkout) |
| `userData.name` | String | No | Customer full name |
| `successUrl` | String (URL) | **Yes** | Redirect after successful payment |
| `failedUrl` | String (URL) | **Yes** | Redirect after failed/cancelled payment |

**Response (201) — Mode A (imageUrl) / Mode B (creatorId):**

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "redirectUrl": "https://printora.ai/en/print/abc123token",
    "sessionMode": "image",
    "imageUrl": "https://your-cdn.com/design.png",
    "creatorId": null,
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

**Response (201) — Mode C (merchId):**

When `merchId` is used, the response includes `merch` details and `cartItems` — an array of cart-ready items that the frontend can store directly in localStorage:

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "redirectUrl": "https://printora.ai/en/print/abc123token",
    "sessionMode": "merch",
    "imageUrl": "https://cdn.partner.com/design.png",
    "creatorId": "creator-uuid",
    "merchId": "merch-uuid",
    "merch": {
      "id": "merch-uuid",
      "title": "Galaxy Art T-Shirt",
      "description": "Signature galaxy design",
      "designImageUrl": "https://cdn.partner.com/design.png",
      "productId": "product-uuid",
      "variantIds": ["var-uuid-1", "var-uuid-2"]
    },
    "cartItems": [
      {
        "id": "product-uuid",
        "cartItemId": 1710460800000,
        "productId": "product-uuid",
        "name": "Premium Unisex T-Shirt",
        "price": 11.99,
        "image": "https://storage.example.com/tshirt.jpg",
        "preview": null,
        "productType": "apparel",
        "designUrl": "https://cdn.partner.com/design.png",
        "size": "S",
        "color": "White",
        "colorCode": "#FFFFFF",
        "variantId": "var-uuid-1",
        "partnerSessionId": "550e8400-e29b-41d4-a716-446655440000",
        "mockupPreviewUrl": null,
        "quantity": 1,
        "sku": "TSHU000WHT000S"
      }
    ],
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

**Frontend cart usage:**
```javascript
if (data.sessionMode === 'merch') {
  // User selects a variant
  const selected = data.cartItems.find(item => item.color === 'White' && item.size === 'S');
  selected.cartItemId = Date.now(); // unique per add-to-cart

  // Store to localStorage → redirect to checkout
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(selected);
  localStorage.setItem('cart', JSON.stringify(cart));
}
```

---

#### Get Session by ID

```
GET /api/v1/partner-session/:sessionId
```

Retrieve session details (including linked order if available).

---

#### Get Session by Token (Public)

```
GET /api/v1/partner-session/by-token/:token
```

> No auth required — the token itself acts as authentication. Used by the Printora frontend.

---

### Catalog

#### Browse Products

```
GET /api/v1/catalog/products
```

Browse Printora's product catalog with pricing and images.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 20 | Products per page (max: 100) |
| `category` | String | — | Filter by category (e.g., `apparel`, `mugs`) |
| `search` | String | — | Search by product name |

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "a6bce136-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "name": "Premium Unisex T-Shirt",
        "category": "apparel",
        "description": "High-quality cotton t-shirt",
        "thumbnail": "https://storage.example.com/tshirt-front.png",
        "images": [
          "https://storage.example.com/tshirt-front.png",
          "https://storage.example.com/tshirt-back.png"
        ],
        "variants": [
          {
            "id": "var-uuid-001",
            "color": "White",
            "colorCode": "#FFFFFF",
            "size": "S",
            "endPrice": 11.99
          },
          {
            "id": "var-uuid-002",
            "color": "Black",
            "colorCode": "#000000",
            "size": "M",
            "endPrice": 13.99
          }
        ]
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Product fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Product ID (use when creating merch) |
| `name` | String | Product display name |
| `category` | String | Product category |
| `description` | String | Product description |
| `thumbnail` | String/null | First product image URL (quick preview) |
| `images` | String[] | All product images |
| `variants` | Object[] | Available variants with pricing |

**Variant fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Variant ID (use when creating merch) |
| `color` | String | Color name (e.g., "White", "Black") |
| `colorCode` | String/null | Hex color code (e.g., "#FFFFFF") |
| `size` | String | Size (e.g., "S", "M", "L", "XL") |
| `endPrice` | Number | Base price in USD |

> Only variants with a set price are returned. Products with no priced variants are excluded.

---

### Creators

#### Create Creator

```
POST /api/v1/creators
```

```json
{
  "name": "Anya Artwork",
  "slug": "anya-artwork",
  "description": "Galaxy-themed digital artist",
  "logoUrl": "https://cdn.your-site.com/anya-logo.png"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | **Yes** | Display name (max 255 chars) |
| `slug` | String | No | URL-friendly identifier (auto-generated from name if not provided) |
| `email` | String | No | Creator's email address |
| `description` | String | No | Creator bio |
| `logoUrl` | String (URL) | No | Creator avatar/logo |

**Response (201):**

```json
{
  "success": true,
  "creator": {
    "id": "729f2632-7bc0-4b57-94f8-880508ec1146",
    "name": "Anya Artwork",
    "slug": "anya-artwork",
    "description": "Galaxy-themed digital artist",
    "logoUrl": "https://cdn.your-site.com/anya-logo.png",
    "status": "active",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

---

#### List Creators

```
GET /api/v1/creators
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 20 | Results per page |
| `status` | String | — | Filter: `active`, `inactive`, `suspended` |

---

#### Get Creator

```
GET /api/v1/creators/:creatorId
```

---

#### Update Creator

```
PUT /api/v1/creators/:creatorId
```

All fields are optional. Only provided fields are updated.

```json
{
  "name": "Anya Art Studio",
  "description": "Updated bio text"
}
```

---

#### Update Creator Status

```
PUT /api/v1/creators/:creatorId/status
```

```json
{ "status": "inactive" }
```

| Status | Description |
|--------|-------------|
| `active` | Creator is live, can accept new orders |
| `inactive` | Creator is hidden; existing sessions still complete |
| `suspended` | Creator is temporarily blocked |

---

#### Delete Creator

```
DELETE /api/v1/creators/:creatorId
```

> **Warning:** Permanently deletes the creator AND all their merch items. Cannot be undone.

---

### Merch

#### Create Merch

```
POST /api/v1/creators/:creatorId/merch
```

```json
{
  "title": "Galaxy Art T-Shirt",
  "description": "Anya's signature galaxy design",
  "productId": "a6bce136-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "variantIds": ["var-uuid-001", "var-uuid-002", "var-uuid-003"],
  "designImageUrl": "https://cdn.your-site.com/galaxy-design.png",
  "stockLimit": 100
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | **Yes** | Merch item name |
| `description` | String | No | Short description |
| `productId` | UUID | **Yes** | Product ID from catalog |
| `variantIds` | UUID[] | **Yes** | Variant IDs (must belong to `productId`) |
| `designImageUrl` | String (URL) | **Yes** | Public URL of the design image |
| `stockLimit` | Integer/null | No | Max units available. `null` or omit = unlimited. Set a number for limited edition. |

**Response (201):**

```json
{
  "success": true,
  "merch": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Galaxy Art T-Shirt",
    "description": "Anya's signature galaxy design",
    "designImageUrl": "https://cdn.your-site.com/galaxy-design.png",
    "status": "active",
    "stockLimit": 100,
    "stockSold": 0,
    "stockRemaining": 100,
    "isLimitedEdition": true,
    "konvaMetadata": null,
    "hasDesign": false,
    "product": {
      "id": "a6bce136-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "Premium Unisex T-Shirt"
    },
    "variants": [
      {
        "id": "var-uuid-001",
        "color": "White",
        "colorCode": "#FFFFFF",
        "size": "S",
        "endPrice": 11.99
      }
    ],
    "createdAt": "2026-03-15T10:00:00.000Z",
    "editSession": {
      "sessionId": "session-uuid",
      "token": "a1b2c3d4e5f6...hex64",
      "editorUrl": "https://printora.ai/en/merch/a6bce136-xxxx/a1b2c3d4e5f6...hex64",
      "expiresAt": "2026-03-16T10:00:00.000Z"
    }
  }
}
```

---

#### List Merch

```
GET /api/v1/creators/:creatorId/merch
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 20 | Results per page |
| `status` | String | — | Filter: `active`, `inactive`, `archived` |

---

#### Get Merch Detail

```
GET /api/v1/creators/:creatorId/merch/:merchId
```

Returns full merch details including resolved variant list with pricing.

---

#### Update Merch

```
PUT /api/v1/creators/:creatorId/merch/:merchId
```

All fields are optional — only send the fields you want to change.

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Merch item name |
| `description` | String | Short description |
| `designImageUrl` | String (URL) | Design image URL |
| `productId` | UUID | Change base product |
| `variantIds` | UUID[] | Change available variants (must belong to `productId`) |
| `status` | String | `active` / `inactive` / `archived` |
| `isActive` | Boolean | Quick toggle to show/hide merch |
| `sortOrder` | Integer | Display order within creator catalog |
| `stockLimit` | Integer/null | Max units (`null` = unlimited) |

**Example:**

```json
{
  "title": "Galaxy Art V2",
  "status": "inactive"
}
```

---

#### Delete Merch

```
DELETE /api/v1/creators/:creatorId/merch/:merchId
```

---

### Merch Edit Session (Konva Editor)

Time-limited tokens for creator design editing via Konva editor. Sessions are auto-created on merch creation, valid for 24 hours, and expire after the design is saved.

#### Request New Edit Session

```
POST /api/v1/creators/:creatorId/merch/:merchId/edit-session
```

**Auth:** API key required. Use this when a creator wants to (re-)edit their merch design.

**Response (201):**

```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "token": "a1b2c3d4e5f6...hex64",
    "editorUrl": "https://printora.ai/en/merch/product-uuid/a1b2c3d4e5f6...hex64",
    "expiresAt": "2026-03-17T10:00:00.000Z"
  }
}
```

#### Get Editor Data by Token (Public)

```
GET /api/v1/merch-editor/by-token/:token
```

> No auth required — the token itself is the authentication. Used by the Printora frontend Konva editor page.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": { "id": "session-uuid", "status": "active", "expiresAt": "..." },
    "merch": {
      "id": "merch-uuid",
      "title": "Galaxy Art T-Shirt",
      "designImageUrl": "https://cdn.partner.com/design.png",
      "konvaMetadata": null,
      "productId": "product-uuid",
      "variantIds": ["var-uuid-1"],
      "product": { "id": "product-uuid", "name": "Premium Unisex T-Shirt", "category": "apparel" },
      "variants": [{ "id": "var-uuid-1", "color": "White", "size": "S", "endPrice": 11.99 }]
    }
  }
}
```

#### Save Design (Public)

```
POST /api/v1/merch-editor/by-token/:token/save
```

> No auth required — the token itself is the authentication.

```json
{
  "konvaMetadata": { "designElements": [...], "mockupConfig": {...} },
  "designImageUrl": "https://cdn.example.com/rendered-mockup.png"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `konvaMetadata` | Object | **Yes** | Full Konva canvas state |
| `designImageUrl` | String (URL) | No | Rendered mockup image URL |

**Error codes:** `SESSION_NOT_FOUND` (404), `SESSION_USED` (410), `SESSION_EXPIRED` (410)

---

### Orders & Analytics

#### Get Partner Orders

```
GET /api/v1/partners/orders
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | Integer | 20 | Results per page (max: 100) |
| `offset` | Integer | 0 | Pagination offset |
| `status` | String | — | Filter by order status |

---

#### Get Creator Stats

```
GET /api/v1/creators/:creatorId/stats
```

```json
{
  "success": true,
  "stats": {
    "creatorId": "729f2632-...",
    "totalOrders": 42,
    "totalRevenue": 499.58,
    "ordersByStatus": {
      "pending": 3,
      "paid": 30,
      "shipped": 7,
      "delivered": 2
    },
    "topMerch": [
      { "merchId": "a1b2c3d4-...", "title": "Galaxy Art T-Shirt", "orderCount": 25 }
    ]
  }
}
```

---

#### Get Creator Orders

```
GET /api/v1/creators/:creatorId/orders
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 20 | Results per page |
| `status` | String | — | Filter by order status |

---

### Webhooks Management

#### View Webhook Logs

```
GET /api/v1/partners/webhook-logs
```

| Param | Type | Description |
|-------|------|-------------|
| `limit` | Integer | Results per page (max: 100) |
| `offset` | Integer | Pagination offset |
| `status` | String | Filter: `pending`, `sent`, `failed`, `retrying` |
| `event_type` | String | Filter by event type |

---

#### Retry Failed Webhook

```
POST /api/v1/partners/webhook-logs/:webhookLogId/retry
```

---

#### Resend Webhook for Order

```
POST /api/v1/partners/webhooks/resend
```

```json
{
  "orderId": "order-uuid",
  "eventType": "order.paid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | UUID | One of | Session ID (lookup order by session) |
| `orderId` | UUID | One of | Order ID directly |
| `eventType` | String | **Yes** | `order.created`, `order.paid`, `order.shipped`, `order.delivered` |

> Provide either `sessionId` OR `orderId`, not both.

---

## Webhook Handling

Printora sends webhooks to your registered URL when order events occur.

### Webhook Events

| Event | When | Key Data |
|-------|------|----------|
| `order.created` | Customer creates order (before payment) | `orderId`, `paymentUrl`, `totalAmount` |
| `order.paid` | Payment confirmed | `orderId`, `customer`, `items[]`, `shippingAddress` |
| `order.shipped` | Order shipped | `orderId`, `trackingNumber`, `carrier`, `trackingUrl` |
| `order.delivered` | Delivery confirmed | `orderId`, `deliveredAt` |

### Webhook Payload Structure

All webhooks arrive as `POST` requests with these headers:

```
Content-Type: application/json
User-Agent: Printora-Webhook/1.0
x-printora-signature: sha256=<hex-signature>
```

#### order.created

```json
{
  "event": "order.created",
  "timestamp": "2026-03-15T10:00:00.000Z",
  "sessionId": "session-uuid",
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "ORD-2026-001234",
    "status": "pending",
    "paymentStatus": "pending",
    "paymentUrl": "https://printora.ai/checkout/pay/abc123",
    "totalAmount": 29.99,
    "currency": "USD",
    "creator": {
      "id": "creator-uuid",
      "name": "Anya Artwork",
      "slug": "anya-artwork"
    },
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

#### order.paid

```json
{
  "event": "order.paid",
  "timestamp": "2026-03-15T10:15:00.000Z",
  "sessionId": "session-uuid",
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "ORD-2026-001234",
    "status": "paid",
    "paymentStatus": "paid",
    "paymentMethod": "stripe",
    "totalAmount": 29.99,
    "currency": "USD",
    "customer": {
      "email": "fan@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "+1234567890"
    },
    "items": [
      { "productName": "Premium T-Shirt", "quantity": 1, "price": 11.99 }
    ],
    "shippingAddress": {
      "firstName": "Jane",
      "lastName": "Doe",
      "street": "123 Main St",
      "apartment": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "creator": {
      "id": "creator-uuid",
      "name": "Anya Artwork",
      "slug": "anya-artwork"
    },
    "partnerImageUrl": "https://cdn.your-site.com/design.png",
    "createdAt": "2026-03-15T10:00:00.000Z",
    "paidAt": "2026-03-15T10:15:00.000Z"
  }
}
```

#### order.shipped

```json
{
  "event": "order.shipped",
  "timestamp": "2026-03-17T14:30:00.000Z",
  "sessionId": "session-uuid",
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "ORD-2026-001234",
    "status": "shipped",
    "trackingNumber": "1Z999AA10123456784",
    "carrier": "UPS",
    "trackingUrl": "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    "creator": { "id": "creator-uuid", "name": "Anya Artwork", "slug": "anya-artwork" },
    "shippedAt": "2026-03-17T14:30:00.000Z"
  }
}
```

#### order.delivered

```json
{
  "event": "order.delivered",
  "timestamp": "2026-03-20T16:45:00.000Z",
  "sessionId": "session-uuid",
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "ORD-2026-001234",
    "status": "delivered",
    "creator": { "id": "creator-uuid", "name": "Anya Artwork", "slug": "anya-artwork" },
    "deliveredAt": "2026-03-20T16:45:00.000Z"
  }
}
```

> **Note:** `creator` is `null` for orders placed with `imageUrl` mode (Flow A).

### Signature Verification

Always verify webhook signatures to ensure they came from Printora.

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(body, signatureHeader, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}

// Usage
app.post('/webhooks/printora', express.json(), (req, res) => {
  const signature = req.headers['x-printora-signature'];

  if (!verifyWebhookSignature(req.body, signature, process.env.PRINTORA_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Respond immediately (Printora expects 200 within 30 seconds)
  res.status(200).json({ received: true });

  // Process asynchronously
  handleWebhookEvent(req.body.event, req.body.data).catch(console.error);
});
```

### Retry Policy

If your endpoint fails, Printora retries:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |

After 5 failures, the webhook is marked as `failed`. You can retry manually via `POST /partners/webhook-logs/:id/retry`.

---

## Full Working Examples

### Next.js (React)

#### API Routes (Server-Side)

```typescript
// app/api/printora/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.PRINTORA_API_KEY!;
const API_URL = process.env.PRINTORA_API_URL!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageUrl, creatorId, merchId, email, name } = body;

  const response = await fetch(`${API_URL}/partner-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      ...(imageUrl && { imageUrl }),
      ...(creatorId && { creatorId }),
      ...(merchId && { merchId }),
      userData: { email, name },
      successUrl: `${process.env.NEXT_PUBLIC_URL}/order/success`,
      failedUrl: `${process.env.NEXT_PUBLIC_URL}/order/failed`
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
```

```typescript
// app/api/printora/catalog/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const params = new URLSearchParams({ page, ...(category && { category }), ...(search && { search }) });

  const response = await fetch(`${process.env.PRINTORA_API_URL}/catalog/products?${params}`, {
    headers: { 'Authorization': `Bearer ${process.env.PRINTORA_API_KEY}` }
  });

  return NextResponse.json(await response.json());
}
```

```typescript
// app/api/printora/creators/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.PRINTORA_API_KEY!;
const API_URL = process.env.PRINTORA_API_URL!;

// List creators
export async function GET() {
  const response = await fetch(`${API_URL}/creators`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  return NextResponse.json(await response.json());
}

// Create creator
export async function POST(req: NextRequest) {
  const body = await req.json();
  const response = await fetch(`${API_URL}/creators`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
```

```typescript
// app/api/printora/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-printora-signature') || '';

  // Verify signature
  const expected = crypto
    .createHmac('sha256', process.env.PRINTORA_WEBHOOK_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Process event
  const { event, data } = body;

  switch (event) {
    case 'order.created':
      // Save order to your database
      console.log('Order created:', data.orderId);
      break;
    case 'order.paid':
      // Update order status, send confirmation email
      console.log('Order paid:', data.orderId, 'by', data.customer.email);
      break;
    case 'order.shipped':
      // Update tracking info, notify customer
      console.log('Shipped:', data.trackingNumber, 'via', data.carrier);
      break;
    case 'order.delivered':
      // Mark as complete
      console.log('Delivered:', data.orderId);
      break;
  }

  return NextResponse.json({ received: true });
}
```

#### Frontend Components

```tsx
// components/OrderPrintButton.tsx
'use client';
import { useState } from 'react';

interface Props {
  imageUrl?: string;
  creatorId?: string;
  merchId?: string;
  userEmail?: string;
  userName?: string;
  label?: string;
}

export function OrderPrintButton({ imageUrl, creatorId, merchId, userEmail, userName, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/printora/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          creatorId,
          merchId,
          email: userEmail,
          name: userName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create session');
      }

      // Redirect to Printora checkout
      window.location.href = data.data.redirectUrl;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : (label || 'Order Print')}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
```

```tsx
// Usage examples:

// Flow A: Custom image
<OrderPrintButton
  imageUrl="https://cdn.your-site.com/user-design.png"
  userEmail="user@example.com"
  userName="John Doe"
  label="Print This Design"
/>

// Flow B: Creator storefront
<OrderPrintButton
  creatorId="729f2632-7bc0-4b57-94f8-880508ec1146"
  userEmail="fan@example.com"
  label="Shop Anya's Merch"
/>

// Flow C: Specific merch item
<OrderPrintButton
  merchId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  userEmail="fan@example.com"
  label="Buy Galaxy T-Shirt"
/>
```

```tsx
// components/ProductCatalog.tsx
'use client';
import { useState, useEffect } from 'react';

interface Variant {
  id: string;
  color: string;
  colorCode: string | null;
  size: string;
  endPrice: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string | null;
  images: string[];
  variants: Variant[];
}

export function ProductCatalog({ onSelectProduct }: { onSelectProduct: (product: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);

    const res = await fetch(`/api/printora/catalog?${params}`);
    const data = await res.json();

    setProducts(data.data.products);
    setTotalPages(data.data.totalPages);
    setLoading(false);
  };

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />

      {/* Product Grid */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
              onClick={() => onSelectProduct(product)}
            >
              {product.thumbnail && (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-48 object-contain mb-2"
                />
              )}
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
              <p className="text-sm mt-1">
                {product.variants.length} variants |
                From ${Math.min(...product.variants.map(v => v.endPrice)).toFixed(2)}
              </p>
              {/* Color swatches */}
              <div className="flex gap-1 mt-2">
                {[...new Set(product.variants.map(v => v.colorCode))].filter(Boolean).map(code => (
                  <div
                    key={code}
                    className="w-5 h-5 rounded-full border"
                    style={{ backgroundColor: code! }}
                    title={product.variants.find(v => v.colorCode === code)?.color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
```

---

### Node.js + Express

Complete server with all endpoints:

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const API_KEY = process.env.PRINTORA_API_KEY;
const API_URL = process.env.PRINTORA_API_URL;
const WEBHOOK_SECRET = process.env.PRINTORA_WEBHOOK_SECRET;

// ── Helper: Printora API request ──────────────────────────────────
async function printoraFetch(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);
  if (method === 'POST') options.headers['Idempotency-Key'] = crypto.randomUUID();

  const res = await fetch(`${API_URL}${endpoint}`, options);
  return { status: res.status, data: await res.json() };
}

// ── 1. Create Session (any mode) ──────────────────────────────────
app.post('/api/create-session', async (req, res) => {
  try {
    const { imageUrl, creatorId, merchId, email, name } = req.body;

    const { status, data } = await printoraFetch('POST', '/partner-session', {
      ...(imageUrl && { imageUrl }),
      ...(creatorId && { creatorId }),
      ...(merchId && { merchId }),
      userData: { email, name },
      successUrl: `${process.env.FRONTEND_URL}/success`,
      failedUrl: `${process.env.FRONTEND_URL}/failed`
    });

    res.status(status).json(data);
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ── 2. Browse Catalog ─────────────────────────────────────────────
app.get('/api/catalog', async (req, res) => {
  const params = new URLSearchParams(req.query).toString();
  const { data } = await printoraFetch('GET', `/catalog/products?${params}`);
  res.json(data);
});

// ── 3. Creator CRUD ───────────────────────────────────────────────
app.post('/api/creators', async (req, res) => {
  const { status, data } = await printoraFetch('POST', '/creators', req.body);
  res.status(status).json(data);
});

app.get('/api/creators', async (req, res) => {
  const { data } = await printoraFetch('GET', '/creators');
  res.json(data);
});

app.get('/api/creators/:id', async (req, res) => {
  const { data } = await printoraFetch('GET', `/creators/${req.params.id}`);
  res.json(data);
});

app.put('/api/creators/:id', async (req, res) => {
  const { data } = await printoraFetch('PUT', `/creators/${req.params.id}`, req.body);
  res.json(data);
});

app.delete('/api/creators/:id', async (req, res) => {
  const { data } = await printoraFetch('DELETE', `/creators/${req.params.id}`);
  res.json(data);
});

// ── 4. Merch CRUD ─────────────────────────────────────────────────
app.post('/api/creators/:id/merch', async (req, res) => {
  const { status, data } = await printoraFetch('POST', `/creators/${req.params.id}/merch`, req.body);
  res.status(status).json(data);
});

app.get('/api/creators/:id/merch', async (req, res) => {
  const { data } = await printoraFetch('GET', `/creators/${req.params.id}/merch`);
  res.json(data);
});

// ── 5. Analytics ──────────────────────────────────────────────────
app.get('/api/creators/:id/stats', async (req, res) => {
  const { data } = await printoraFetch('GET', `/creators/${req.params.id}/stats`);
  res.json(data);
});

app.get('/api/creators/:id/orders', async (req, res) => {
  const { data } = await printoraFetch('GET', `/creators/${req.params.id}/orders`);
  res.json(data);
});

app.get('/api/orders', async (req, res) => {
  const params = new URLSearchParams(req.query).toString();
  const { data } = await printoraFetch('GET', `/partners/orders?${params}`);
  res.json(data);
});

// ── 6. Webhook Handler ───────────────────────────────────────────
app.post('/webhooks/printora', (req, res) => {
  const signature = req.headers['x-printora-signature'];

  // Verify signature
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (!crypto.timingSafeEqual(
    Buffer.from((signature || '').replace('sha256=', '')),
    Buffer.from(expected)
  )) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Respond immediately
  res.status(200).json({ received: true });

  // Process async
  const { event, data } = req.body;
  console.log(`[Webhook] ${event}: ${data.orderId}`);

  switch (event) {
    case 'order.created':
      // Save pending order
      break;
    case 'order.paid':
      // Update status, send confirmation
      break;
    case 'order.shipped':
      // Save tracking, notify customer
      break;
    case 'order.delivered':
      // Mark complete
      break;
  }
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
```

---

### Python + Flask

```python
# app.py
import os
import hmac
import hashlib
import json
import uuid
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv('PRINTORA_API_KEY')
API_URL = os.getenv('PRINTORA_API_URL')
WEBHOOK_SECRET = os.getenv('PRINTORA_WEBHOOK_SECRET')
FRONTEND_URL = os.getenv('FRONTEND_URL')

def printora_request(method, endpoint, data=None, params=None):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    if method == 'POST':
        headers['Idempotency-Key'] = str(uuid.uuid4())

    response = requests.request(
        method, f'{API_URL}{endpoint}',
        json=data, params=params, headers=headers
    )
    return response.status_code, response.json()


# Create session (any mode)
@app.route('/api/create-session', methods=['POST'])
def create_session():
    body = request.json
    payload = {
        'userData': {'email': body.get('email'), 'name': body.get('name')},
        'successUrl': f'{FRONTEND_URL}/success',
        'failedUrl': f'{FRONTEND_URL}/failed'
    }
    for key in ('imageUrl', 'creatorId', 'merchId'):
        if body.get(key):
            payload[key] = body[key]

    status, data = printora_request('POST', '/partner-session', payload)
    return jsonify(data), status


# Browse catalog
@app.route('/api/catalog')
def catalog():
    _, data = printora_request('GET', '/catalog/products', params=request.args)
    return jsonify(data)


# Webhook handler
@app.route('/webhooks/printora', methods=['POST'])
def webhook():
    payload = request.json
    signature = request.headers.get('x-printora-signature', '')

    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        json.dumps(payload, separators=(',', ':')).encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature.replace('sha256=', ''), expected):
        return jsonify({'error': 'Invalid signature'}), 401

    event = payload.get('event')
    data = payload.get('data')
    print(f'[Webhook] {event}: {data.get("orderId")}')

    # Process event...
    return jsonify({'received': True})


if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

---

## Error Handling

### Common Error Responses

| Status | Code | Message | Solution |
|--------|------|---------|----------|
| 400 | `VALIDATION_ERROR` | Validation failed | Check request body fields |
| 400 | `MISSING_IDEMPOTENCY_KEY` | Idempotency-Key header is required | Add `Idempotency-Key` header |
| 400 | `INVALID_VARIANTS` | All variantIds must belong to the specified productId | Check variant-product relationship |
| 400 | — | Merch item is sold out | Limited edition merch has no remaining stock |
| 400 | — | Only N units remaining for this merch item | Reduce quantity or check stock |
| 400 | — | variantId does not belong to this merch item | Check variant belongs to merch |
| 401 | `MISSING_API_KEY` | API key is required | Add `Authorization` header |
| 401 | `INVALID_API_KEY` | Invalid or expired API key | Check API key |
| 403 | `FORBIDDEN` | Creator/Merch does not belong to this partner | Check resource ownership |
| 404 | `NOT_FOUND` | Resource not found | Check ID |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry with backoff |
| 500 | `INTERNAL_ERROR` | Server error | Retry or contact support |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "imageUrl", "message": "imageUrl must be a valid URL" }
    ]
  }
}
```

### Recommended Retry Strategy

```javascript
async function fetchWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result.status === 429) {
        const retryAfter = result.headers.get('retry-after') || delay / 1000;
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
}
```

---

## Security Best Practices

### 1. Never Expose API Key in Frontend

```javascript
// WRONG - API key visible to anyone
fetch('https://printora-be-prod.vercel.app/api/v1/partner-session', {
  headers: { 'Authorization': 'Bearer pk_live_abc123...' }  // EXPOSED!
});

// CORRECT - Call your own backend
fetch('/api/create-session', {
  method: 'POST',
  body: JSON.stringify({ imageUrl: '...' })
});
```

### 2. Always Verify Webhook Signatures

Never trust webhook payloads without verifying the `x-printora-signature` header.

### 3. Use HTTPS Everywhere

- Your webhook URL **must** use HTTPS
- Your `successUrl` and `failedUrl` should use HTTPS

### 4. Store Credentials in Environment Variables

```bash
# .env (gitignored)
PRINTORA_API_KEY=pk_live_abc123...
PRINTORA_WEBHOOK_SECRET=whsec_xyz789...
```

### 5. Implement Idempotency

Always send `Idempotency-Key` with `POST /partner-session` to prevent duplicate sessions on network retries.

---

## FAQ

### Q: Can I call the Printora API directly from the browser?

**No.** Your API key would be exposed. Always proxy through your backend server.

### Q: What image formats are supported for designs?

PNG and JPG/JPEG. Recommended resolution: 2000x2000px or higher for best print quality.

### Q: How long does a session URL stay valid?

Session URLs are valid for 24 hours after creation.

### Q: Can I create merch without a creator?

No. Merch items must belong to a creator. Create a creator first, then add merch to it.

### Q: What happens if my webhook endpoint is down?

Printora retries up to 5 times over ~2.5 hours. After that, the webhook is marked as `failed` and can be manually retried via the API.

### Q: Can I use the same API key for staging and production?

No. Staging uses `pk_test_` keys, production uses `pk_live_` keys. They are separate.

### Q: What is the `creator` field in webhook payloads?

It's `null` for orders placed via Flow A (imageUrl). For orders via Flow B (creatorId) or Flow C (merchId), it contains the creator's `id`, `name`, and `slug`.

### Q: How do I test webhooks locally?

Use [ngrok](https://ngrok.com) to create a tunnel:
```bash
ngrok http 3000
# Use the ngrok URL as your webhook endpoint
```

### Q: What currencies are supported?

All prices are in **USD** only.

---

## Support

- **Email:** support@printora.ai
- **Include:** Partner ID, error messages, request/response payloads, timestamps

---

## Related Documentation

- [Authentication Details](./AUTHENTICATION.md)
- [Webhook Reference](./WEBHOOKS.md)
- [Creator System Reference](./CREATOR_SYSTEM.md)
- [API Reference](./API_REFERENCE.md)
- [Multi-Language Code Examples](./EXAMPLES.md)
- [Testing Guide](./TESTING.md)
