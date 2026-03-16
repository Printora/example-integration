# Creator System — Partner Integration v1.1

**Last Updated:** 2026-03-13

---

## Endpoint Groups

There are **two separate endpoint groups**. Use the correct one for your use case:

| Group | Base URL | Auth | Used By |
|-------|----------|------|---------|
| **Partner API** | `/api/v1/` | API Key (`Authorization: Bearer sk_live_xxx`) | External partners integrating via backend/server |
| **Partner Dashboard** | `/api/partner/` | JWT (session cookie / Bearer token from dashboard login) | Printora partner dashboard frontend only |

> **For new partner integrations, use the Partner API (`/api/v1/`) with your API key.**
> The Dashboard endpoints (`/api/partner/`) are for the Printora web dashboard UI and do not require an API key.

### Base URLs

**Partner API (external integration):**
- Staging: `https://printora-be-staging.vercel.app/api/v1`
- Production: `https://printora-be-prod.vercel.app/api/v1`

**Partner Dashboard (internal UI):**
- Staging: `https://printora-be-staging.vercel.app/api/partner`
- Production: `https://printora-be-prod.vercel.app/api/partner`

---

## Table of Contents

1. [Overview](#overview)
2. [Concepts & Hierarchy](#concepts--hierarchy)
3. [Session Modes](#session-modes)
4. [Catalog Browse](#catalog-browse)
5. [Creator Management](#creator-management)
6. [Merch Management](#merch-management)
7. [Merch Edit Session (Konva Editor)](#merch-edit-session-konva-editor)
8. [Creator Analytics](#creator-analytics)
8. [Webhook Changes](#webhook-changes)
9. [Full Code Example](#full-code-example)
10. [Error Reference](#error-reference)

---

## Overview

The **Creator System** is a major update to the Partner Integration that enables **creator-based merch storefronts**. Partners can register creators (influencers, artists, brands) under their account, assign product configurations (merch) to each creator, and send end users directly to a creator's personalized storefront.

### What's New in v1.1

| Feature | Description |
|---------|-------------|
| **Catalog Browse** | Browse Printora's product catalog to find product and variant IDs |
| **Creator Management** | Full CRUD for creators registered under your partner account |
| **Merch Management** | Assign products, variants, and design images to each creator |
| **3 Session Modes** | `POST /partner-session` now accepts `imageUrl`, `creatorId`, or `merchId` |
| **Creator in Webhooks** | All order webhooks now include a `creator` field |

> **Backward Compatible:** All existing `imageUrl`-based sessions continue to work without changes.

### Endpoint Quick Reference

All endpoints are available on **both groups** — same logic, different auth:

| Action | Partner API (`/api/v1/`) | Dashboard (`/api/partner/`) |
|--------|--------------------------|------------------------------|
| Browse catalog | `GET /catalog/products` | `GET /catalog/products` |
| Create session | `POST /partner-session` | *(use Partner API only)* |
| Create creator | `POST /creators` | `POST /creators` |
| List creators | `GET /creators` | `GET /creators` |
| Get creator | `GET /creators/:id` | `GET /creators/:id` |
| Update creator | `PUT /creators/:id` | `PUT /creators/:id` |
| Toggle status | `PUT /creators/:id/status` | `PUT /creators/:id/status` |
| Delete creator | `DELETE /creators/:id` | `DELETE /creators/:id` |
| Add merch | `POST /creators/:id/merch` | `POST /creators/:id/merch` |
| List merch | `GET /creators/:id/merch` | `GET /creators/:id/merch` |
| Get merch | `GET /creators/:id/merch/:merchId` | `GET /creators/:id/merch/:merchId` |
| Update merch | `PUT /creators/:id/merch/:merchId` | `PUT /creators/:id/merch/:merchId` |
| Delete merch | `DELETE /creators/:id/merch/:merchId` | `DELETE /creators/:id/merch/:merchId` |
| Creator stats | `GET /creators/:id/stats` | `GET /creators/:id/stats` |
| Creator orders | `GET /creators/:id/orders` | `GET /creators/:id/orders` |

---

## Concepts & Hierarchy

```
Partner (your platform)
  └── Creator (influencer / artist / brand)
        └── Merch (product + variants + design image)
              └── Order (placed by end user)
```

| Entity | Description |
|--------|-------------|
| **Partner** | Your platform — authenticated via API key |
| **Creator** | An individual (influencer/artist) registered under your partner account. Has a name, slug, logo, and description. |
| **Merch** | A product configuration for a creator: one design image + one product + a set of allowed variants (colors/sizes). |
| **Session** | A short-lived checkout session. Can be linked to a creator and/or a specific merch item. |

---

## Session Modes

`POST /api/v1/partner-session` now supports **3 modes**. Provide exactly one of `imageUrl`, `creatorId`, or `merchId`.

### Mode A — Custom Image *(existing)*

Partner provides a design image. User can select any product in Printora.

```json
{
  "imageUrl": "https://your-cdn.com/customer-design.png",
  "userData": { "email": "user@example.com", "name": "John" },
  "successUrl": "https://partner.com/success",
  "failedUrl": "https://partner.com/failed"
}
```

### Mode B — Creator Catalog *(new)*

Redirects user to browse **all merch** belonging to a specific creator.

```json
{
  "creatorId": "729f2632-7bc0-4b57-94f8-880508ec1146",
  "userData": { "email": "user@example.com", "name": "John" },
  "successUrl": "https://partner.com/success",
  "failedUrl": "https://partner.com/failed"
}
```

### Mode C — Specific Merch Item *(new)*

Redirects user directly to a **specific merch item**. The design image and creator are resolved automatically from the merch record.

```json
{
  "merchId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "variantId": "var-uuid-white-s",
  "userData": { "email": "user@example.com", "name": "John" },
  "successUrl": "https://partner.com/success",
  "failedUrl": "https://partner.com/failed"
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageUrl` | String | Mode A | Publicly accessible URL of the design image |
| `creatorId` | UUID | Mode B | ID of a creator registered under your account |
| `merchId` | UUID | Mode C | ID of a merch item belonging to your creator |
| `variantId` | UUID | Optional | Selected variant ID — when provided with `merchId`, `cartItems` returns only this variant. Must belong to the merch item. |
| `quantity` | Integer | Optional | Quantity (1-100, default: 1). For limited edition merch, validated against remaining stock. |
| `userData.email` | String | Optional | Customer email — pre-fills checkout form |
| `userData.name` | String | Optional | Customer full name |
| `successUrl` | String | **Yes** | Redirect URL after successful payment |
| `failedUrl` | String | **Yes** | Redirect URL after failed/cancelled payment |

### Response (All Modes)

All responses include `sessionMode` to indicate which mode was used:

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "redirectUrl": "https://printora.ai/en/print/abc123token",
    "sessionMode": "image",
    "imageUrl": "https://your-cdn.com/design.png",
    "creatorId": null,
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

### Response (Mode C — merchId)

When `merchId` is provided, the response includes `merch` details and `cartItems` — cart-ready items that the frontend can store directly in localStorage without additional API calls:

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "redirectUrl": "https://printora.ai/en/print/abc123token",
    "sessionMode": "merch",
    "imageUrl": "https://cdn.partner.com/anya-galaxy.png",
    "creatorId": "729f2632-7bc0-4b57-94f8-880508ec1146",
    "merchId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "merch": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Galaxy Art T-Shirt",
      "description": "Signature galaxy design",
      "designImageUrl": "https://cdn.partner.com/anya-galaxy.png",
      "productId": "prod-uuid-001",
      "variantIds": ["var-uuid-white-s", "var-uuid-white-m"]
    },
    "cartItems": [
      {
        "id": "prod-uuid-001",
        "cartItemId": 1710460800000,
        "productId": "prod-uuid-001",
        "name": "Premium Unisex T-Shirt",
        "price": 11.99,
        "image": "https://storage.example.com/tshirt-front.png",
        "preview": null,
        "productType": "apparel",
        "designUrl": "https://cdn.partner.com/anya-galaxy.png",
        "size": "S",
        "color": "White",
        "colorCode": "#FFFFFF",
        "variantId": "var-uuid-white-s",
        "partnerSessionId": "550e8400-e29b-41d4-a716-446655440000",
        "mockupPreviewUrl": null,
        "quantity": 1,
        "sku": "TSHU000WHT000S"
      }
    ],
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

**Frontend usage:**
```javascript
if (data.sessionMode === 'merch') {
  // User selects a variant from cartItems
  const selected = data.cartItems.find(item => item.color === 'White' && item.size === 'S');
  selected.cartItemId = Date.now(); // unique ID per add-to-cart

  // Store in localStorage → go to checkout
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(selected);
  localStorage.setItem('cart', JSON.stringify(cart));
}
```

---

## Catalog Browse

Browse Printora's available products to find `productId` and `variantIds` for creating merch.

```
GET /api/v1/catalog/products
```

**Authentication:** Required (API key)

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | Integer | 20 | Products per page (max: 100) |
| `offset` | Integer | 0 | Pagination offset |
| `category` | String | — | Filter by category slug |
| `search` | String | — | Search by product name |

### Response

```json
{
  "success": true,
  "products": [
    {
      "id": "prod-uuid-001",
      "name": "Premium Unisex T-Shirt",
      "category": "apparel",
      "description": "High-quality cotton t-shirt",
      "variants": [
        { "id": "var-uuid-white-s", "color": "White", "size": "S", "end_price": 11.99 },
        { "id": "var-uuid-white-m", "color": "White", "size": "M", "end_price": 11.99 },
        { "id": "var-uuid-black-m", "color": "Black", "size": "M", "end_price": 13.99 }
      ]
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

## Creator Management

All creator endpoints require API key authentication.

### Create Creator

```
POST /api/v1/creators
```

```json
{
  "name": "Anya Artwork",
  "slug": "anya-artwork",
  "description": "Digital artist specializing in galaxy themes",
  "logoUrl": "https://cdn.partner.com/anya-logo.png"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | **Yes** | Creator display name (max 255 chars) |
| `slug` | String | **Yes** | URL-friendly unique ID — lowercase, hyphens only (e.g. `anya-artwork`) |
| `description` | String | No | Creator bio shown to end users |
| `logoUrl` | String | No | Creator avatar/logo image URL |

**Response (201):**

```json
{
  "success": true,
  "creator": {
    "id": "729f2632-7bc0-4b57-94f8-880508ec1146",
    "name": "Anya Artwork",
    "slug": "anya-artwork",
    "description": "Digital artist specializing in galaxy themes",
    "logoUrl": "https://cdn.partner.com/anya-logo.png",
    "status": "active",
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

---

### List Creators

```
GET /api/v1/creators
```

Returns all creators under your partner account.

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | String | Filter: `active` or `inactive` |
| `limit` | Integer | Results per page (default: 20) |
| `offset` | Integer | Pagination offset |

---

### Get Creator by ID

```
GET /api/v1/creators/:creatorId
```

---

### Update Creator

```
PUT /api/v1/creators/:creatorId
```

All fields are optional. Only provided fields are updated.

```json
{ "name": "Anya Art Studio", "description": "Updated bio" }
```

---

### Update Creator Status

```
PUT /api/v1/creators/:creatorId/status
```

```json
{ "status": "inactive" }
```

| Value | Description |
|-------|-------------|
| `active` | Creator is live and can accept new orders |
| `inactive` | Creator is hidden; existing sessions still complete normally |

---

### Delete Creator

```
DELETE /api/v1/creators/:creatorId
```

Permanently deletes the creator and all their merch items.

> ⚠️ **Warning:** This cannot be undone. In-progress orders are not affected.

---

## Merch Management

Each merch item links a creator to a specific product, variant set, and design image.

### Create Merch

```
POST /api/v1/creators/:creatorId/merch
```

```json
{
  "title": "Galaxy Art T-Shirt",
  "description": "Anya's signature galaxy design on a premium tee",
  "productId": "prod-uuid-001",
  "variantIds": [
    "var-uuid-white-s",
    "var-uuid-white-m",
    "var-uuid-black-m"
  ],
  "designImageUrl": "https://cdn.partner.com/anya-galaxy-design.png",
  "stockLimit": 100
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | **Yes** | Merch item name shown to end users |
| `description` | String | No | Short description shown at checkout |
| `productId` | UUID | **Yes** | Product ID from `GET /catalog/products` |
| `variantIds` | UUID[] | **Yes** | Variant IDs available for this merch — all must belong to `productId` |
| `designImageUrl` | String | **Yes** | Public URL of the design image to print |
| `stockLimit` | Integer/null | No | Max units available. `null` or omit = unlimited. Set a number for limited edition. |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Galaxy Art T-Shirt",
    "description": "Anya's signature galaxy design on a premium tee",
    "designImageUrl": "https://cdn.partner.com/anya-galaxy-design.png",
    "status": "active",
    "stockLimit": 100,
    "stockSold": 0,
    "stockRemaining": 100,
    "isLimitedEdition": true,
    "konvaMetadata": null,
    "hasDesign": false,
    "createdAt": "2026-03-13T10:00:00.000Z",
    "editSession": {
      "sessionId": "session-uuid",
      "token": "a1b2c3d4e5f6...hex64",
      "editorUrl": "https://printora.ai/en/merch/prod-uuid-001/a1b2c3d4e5f6...hex64",
      "expiresAt": "2026-03-14T10:00:00.000Z"
    }
  }
}
```

> **Note:** `editSession` is automatically created when merch is created. The `editorUrl` redirects to the Konva editor page where the creator can design their merch. The session is valid for 24 hours.

---

### List Merch by Creator

```
GET /api/v1/creators/:creatorId/merch
```

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | String | Filter: `active` or `inactive` |

---

### Get Merch by ID

```
GET /api/v1/creators/:creatorId/merch/:merchId
```

Returns full details including resolved variant list.

---

### Update Merch

```
PUT /api/v1/creators/:creatorId/merch/:merchId
```

All fields are optional — only send the fields you want to change.

**Body (all optional):**

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

**Example — update title and unpublish:**

```json
{
  "title": "Galaxy Art V2",
  "status": "inactive"
}
```

**Response (200):** Returns the updated merch object with resolved variants.

---

### Delete Merch

```
DELETE /api/v1/creators/:creatorId/merch/:merchId
```

---

### Merch Edit Session (Konva Editor)

When merch is created, an edit session is automatically generated. Partners can also request new edit sessions for existing merch.

#### Request New Edit Session

```
POST /api/v1/creators/:creatorId/merch/:merchId/edit-session
```

**Auth:** Partner API key required.

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

> No auth required — the token itself acts as authentication. Used by the Printora frontend to load the Konva editor.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "status": "active",
      "expiresAt": "2026-03-17T10:00:00.000Z",
      "createdAt": "2026-03-16T10:00:00.000Z"
    },
    "merch": {
      "id": "merch-uuid",
      "title": "Galaxy Art T-Shirt",
      "description": "Anya's signature galaxy design",
      "designImageUrl": "https://cdn.partner.com/design.png",
      "konvaMetadata": null,
      "productId": "product-uuid",
      "variantIds": ["var-uuid-1", "var-uuid-2"],
      "product": { "id": "product-uuid", "name": "Premium Unisex T-Shirt", "category": "apparel" },
      "variants": [
        { "id": "var-uuid-1", "color": "White", "colorCode": "#FFFFFF", "size": "S", "endPrice": 11.99 }
      ]
    }
  }
}
```

#### Save Design (Public)

```
POST /api/v1/merch-editor/by-token/:token/save
```

> No auth required — the token itself acts as authentication.

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `konvaMetadata` | Object | **Yes** | Full Konva canvas state JSON |
| `designImageUrl` | String (URL) | No | Rendered mockup image URL (updates merch designImageUrl) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "merch": { "...updated merch object with konvaMetadata..." }
  },
  "message": "Design saved successfully"
}
```

#### Edit Session Rules

| Rule | Detail |
|------|--------|
| **TTL** | 24 hours from creation |
| **Single use** | Session expires after design is saved |
| **Re-requestable** | Partners can create new sessions anytime |
| **Auto-created** | Generated automatically when merch is created |

#### Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 404 | `SESSION_NOT_FOUND` | Token is invalid or does not exist |
| 410 | `SESSION_USED` | Design has already been saved with this token |
| 410 | `SESSION_EXPIRED` | Token has expired (older than 24 hours) |

---

## Creator Analytics

### Get Creator Stats

```
GET /api/v1/creators/:creatorId/stats
```

```json
{
  "success": true,
  "stats": {
    "creatorId": "729f2632-7bc0-4b57-94f8-880508ec1146",
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

### Get Creator Orders

```
GET /api/v1/creators/:creatorId/orders
```

| Query Param | Type | Description |
|-------------|------|-------------|
| `status` | String | Filter by order status |
| `limit` | Integer | Results per page (default: 20) |
| `offset` | Integer | Pagination offset |

```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid",
      "orderNumber": "PO-20260313-001",
      "status": "paid",
      "totalAmount": 11.99,
      "createdAt": "2026-03-13T10:00:00.000Z",
      "customer": { "email": "user@example.com", "name": "John" }
    }
  ],
  "total": 42
}
```

---

## Webhook Changes

All order webhook payloads now include a `creator` field.

- Value is `null` for orders placed without a creator session
- Value is an object for orders placed through Mode B or Mode C sessions

```json
{
  "event": "order.paid",
  "timestamp": "2026-03-13T10:00:00.000Z",
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "PO-20260313-001",
    "creator": {
      "id": "729f2632-7bc0-4b57-94f8-880508ec1146",
      "name": "Anya Artwork",
      "slug": "anya-artwork"
    },
    "customer": { "email": "user@example.com", "name": "John" },
    "totalAmount": 11.99,
    "items": [...]
  }
}
```

This applies to all 4 events: `order.created`, `order.paid`, `order.shipped`, `order.delivered`.

---

## Full Code Example

```javascript
const BASE = 'https://printora-be-staging.vercel.app/api/v1';
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};

// 1. Browse catalog
const { products } = await fetch(`${BASE}/catalog/products`, { headers }).then(r => r.json());
const tshirt = products[0];
const variantIds = tshirt.variants.map(v => v.id);

// 2. Create creator
const { creator } = await fetch(`${BASE}/creators`, {
  method: 'POST', headers,
  body: JSON.stringify({
    name: 'Anya Artwork',
    slug: 'anya-artwork',
    description: 'Galaxy-themed digital artist',
    logoUrl: 'https://cdn.partner.com/anya-logo.png'
  })
}).then(r => r.json());

// 3. Create merch
const { merch } = await fetch(`${BASE}/creators/${creator.id}/merch`, {
  method: 'POST', headers,
  body: JSON.stringify({
    title: 'Galaxy Art T-Shirt',
    productId: tshirt.id,
    variantIds,
    designImageUrl: 'https://cdn.partner.com/anya-galaxy.png'
  })
}).then(r => r.json());

// 4a. Session for specific merch item (Mode C)
const { data: sessionC } = await fetch(`${BASE}/partner-session`, {
  method: 'POST', headers,
  body: JSON.stringify({
    merchId: merch.id,
    userData: { email: 'fan@example.com', name: 'John' },
    successUrl: 'https://partner.com/success',
    failedUrl: 'https://partner.com/failed'
  })
}).then(r => r.json());
// → redirect user to sessionC.redirectUrl

// 4b. Session for all creator merch (Mode B)
const { data: sessionB } = await fetch(`${BASE}/partner-session`, {
  method: 'POST', headers,
  body: JSON.stringify({
    creatorId: creator.id,
    userData: { email: 'fan@example.com', name: 'John' },
    successUrl: 'https://partner.com/success',
    failedUrl: 'https://partner.com/failed'
  })
}).then(r => r.json());
// → redirect user to sessionB.redirectUrl

// 5. Check creator stats
const { stats } = await fetch(`${BASE}/creators/${creator.id}/stats`, { headers }).then(r => r.json());
console.log(`Revenue: $${stats.totalRevenue} from ${stats.totalOrders} orders`);
```

---

## Error Reference

| Status | Message | Cause |
|--------|---------|-------|
| 400 | `At least one of imageUrl, creatorId, or merchId is required` | No session mode provided |
| 400 | `Only one of imageUrl, creatorId, or merchId should be provided` | Multiple modes provided |
| 400 | `All variantIds must belong to the specified productId` | Variant doesn't match product |
| 400 | `variantId does not belong to this merch item` | Selected variant not in merch variantIds |
| 400 | `Merch item is sold out` | Limited edition merch has 0 remaining stock |
| 400 | `Only N units remaining for this merch item` | Requested quantity exceeds remaining stock |
| 403 | `Creator does not belong to this partner` | creatorId is from another partner |
| 403 | `Merch does not belong to a creator of this partner` | merchId is from another partner |
| 404 | `Creator not found` | Invalid creatorId |
| 404 | `Merch not found` | Invalid merchId |

---

## Related Documentation

- [Create Partner Session](./CREATE_PARTNER_SESSION.md) — Full session creation reference (v1.0)
- [Webhooks](./WEBHOOKS.md) — Webhook payload documentation
- [API Reference](./API_REFERENCE.md) — All endpoints overview
- [Authentication](./AUTHENTICATION.md) — API key setup
