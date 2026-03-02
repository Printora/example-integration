# Printora Webhook Integration Guide

This guide covers how to implement and handle webhook events from the Printora Partner API.

## Overview

Webhooks are HTTP POST requests sent to your server when specific events occur in the Printora system. This allows your application to react to order lifecycle events in real-time.

## Webhook Endpoint

Your webhook endpoint should:

- **URL:** Configured in your Printora partner dashboard
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Response Time:** Respond within 5 seconds with a 2xx status

### Endpoint Requirements

```typescript
// Example webhook endpoint structure
POST /api/webhooks HTTP/1.1
Content-Type: application/json
X-Printora-Signature: sha256=abc123...

{
  "sessionId": "xxx-xxx-xxx",
  "event": "order.created",
  "data": { ... },
  "timestamp": "2026-02-27T10:30:00Z"
}
```

## Security: Signature Verification

All webhook requests include an `x-printora-signature` header for security verification.

### Header Format
```
x-printora-signature: sha256=<hmac_hex>
```

### Verification Implementation

**Node.js / TypeScript:**
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  );
}

// Usage
const rawBody = req.body; // Raw request body as string
const signature = req.headers['x-printora-signature'];
const webhookSecret = process.env.PRINTORA_WEBHOOK_SECRET;

if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

**JavaScript:**
```javascript
const crypto = require('crypto');

const webhookSecret = 'your_webhook_secret_here';
const payload = JSON.stringify(req.body);
const signature = req.headers['x-printora-signature'];

const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload, 'utf8')
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(`sha256=${expectedSignature}`),
  Buffer.from(signature)
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

## Webhook Events

### Event Types

| Event | Description | Triggered When |
|-------|-------------|----------------|
| `order.created` | Order has been created | User completes checkout |
| `order.paid` | Order has been paid | Payment is confirmed |
| `order.shipped` | Order has been shipped | Order leaves fulfillment center |
| `order.delivered` | Order has been delivered | Order reaches customer |
| `order.cancelled` | Order has been cancelled | Order is cancelled |

### Event Payload Structure

All webhook events follow this base structure:

```typescript
interface WebhookEvent {
  sessionId: string;      // Session ID linking events to the order
  event: string;          // Event type
  timestamp: string;      // ISO 8601 timestamp
  data: OrderData;        // Event-specific data
}
```

## Order Data Schema

The `data` object varies by event type but generally includes:

```typescript
interface OrderData {
  orderId: string;              // Unique order identifier
  status: string;               // Current order status
  currency: string;             // Currency code (e.g., "USD")
  totalAmount: number;          // Total order amount
  paymentStatus: string;        // Payment status
  paymentMethod?: string;       // Payment method (e.g., "stripe")
  paidAt?: string;              // ISO timestamp when paid
  paymentUrl?: string;          // Payment URL for pending payments
  partnerImageUrl?: string;     // Original image URL from partner
  items?: Array<{               // Order items
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string | null;
    variant?: string | null;
  }>;
  customer?: {                  // Customer information
    email?: string | null;
    phone?: string | null;
    firstName?: string;
    lastName?: string;
  };
  shippingAddress?: {           // Shipping address
    street?: string;
    apartment?: string | null;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
  };
}
```

## Example Payloads

### Order Created Event

```json
{
  "sessionId": "3726a462-e994-4a94-a483-34dd9de8ee90",
  "event": "order.created",
  "timestamp": "2026-02-27T01:02:33.444Z",
  "data": {
    "status": "pending",
    "orderId": "4e4ddce0-9a94-4077-921a-e7b72b2e1e69",
    "currency": "USD",
    "paymentUrl": "https://printora.ai/checkout/pay/abc123...",
    "totalAmount": 25.18,
    "paymentStatus": "pending"
  }
}
```

### Order Paid Event

```json
{
  "sessionId": "3726a462-e994-4a94-a483-34dd9de8ee90",
  "event": "order.paid",
  "timestamp": "2026-02-27T01:43:59.010Z",
  "data": {
    "items": [
      {
        "price": 13.99,
        "variant": null,
        "imageUrl": null,
        "quantity": 1,
        "productName": "Canvas Print - 16x20"
      }
    ],
    "paidAt": "2026-02-27T01:43:58.972Z",
    "status": "processing",
    "orderId": "847f160f-324e-4e24-9a7c-f9215754b870",
    "currency": "USD",
    "customer": {
      "email": "customer@example.com",
      "phone": null,
      "lastName": "Doe",
      "firstName": "John"
    },
    "totalAmount": 20.11,
    "paymentMethod": "stripe",
    "paymentStatus": "paid",
    "partnerImageUrl": "https://example.com/image.jpg",
    "shippingAddress": {
      "city": "San Francisco",
      "state": "CA",
      "street": "123 Main St",
      "country": "United States",
      "zipCode": "94102",
      "lastName": "Doe",
      "apartment": "Apt 4B",
      "firstName": "John"
    }
  }
}
```

## Handling Webhooks

### Best Practices

1. **Always verify signatures** before processing webhook data
2. **Respond quickly** - Return 2xx status within 5 seconds
3. **Use idempotency** - Handle duplicate events gracefully
4. **Process asynchronously** - Queue heavy processing after responding
5. **Log all webhooks** - Keep records for debugging

### Implementation Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body
    const rawBody = await req.text();

    // 2. Verify signature
    const signature = req.headers.get('x-printora-signature');
    const webhookSecret = process.env.PRINTORA_WEBHOOK_SECRET!;

    if (!verifySignature(rawBody, signature!, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 3. Parse payload
    const payload = JSON.parse(rawBody);

    // 4. Check for duplicates (idempotency)
    const isDuplicate = await checkDuplicate(payload.sessionId, payload.event);
    if (isDuplicate) {
      return NextResponse.json({
        received: true,
        duplicate: true
      });
    }

    // 5. Process webhook event
    await processWebhookEvent(payload);

    // 6. Respond quickly
    return NextResponse.json({
      received: true,
      duplicate: false
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  );
}

async function checkDuplicate(sessionId: string, event: string): Promise<boolean> {
  // Implement your duplicate checking logic
  // For example, check database for existing sessionId + event combination
  return false;
}

async function processWebhookEvent(payload: any) {
  // Route to appropriate handler based on event type
  switch (payload.event) {
    case 'order.created':
      await handleOrderCreated(payload);
      break;
    case 'order.paid':
      await handleOrderPaid(payload);
      break;
    case 'order.shipped':
      await handleOrderShipped(payload);
      break;
    case 'order.delivered':
      await handleOrderDelivered(payload);
      break;
    default:
      console.log('Unknown event type:', payload.event);
  }
}
```

## Response Format

### Success Response
```json
{
  "received": true,
  "duplicate": false
}
```

### Duplicate Event Response
```json
{
  "received": true,
  "duplicate": true
}
```
> **Note:** An event is considered duplicate if the same `sessionId` + `event` combination has already been processed.

### Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | `Invalid webhook signature` | Signature verification failed |
| 400 | `Invalid webhook payload` | JSON parsing failed |
| 400 | `Missing required fields` | Required fields are missing |
| 405 | `Method not allowed` | Non-POST request |
| 500 | `Processing failed` | Internal server error |

## Idempotency

Printora may retry webhook delivery if:
- Your endpoint doesn't respond within 5 seconds
- Your endpoint returns a non-2xx status
- Network errors occur

**To handle duplicates:**
1. Store processed `sessionId` + `event` combinations
2. Check for duplicates before processing
3. Return `duplicate: true` for already-processed events

## Testing Webhooks

### Local Testing with Ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose localhost
ngrok http 3000
```

Then configure the ngrok URL in your Printora dashboard:
```
https://abc123.ngrok.io/api/webhooks
```

### Testing with Postman

Use the Printora Postman collection to manually trigger webhooks:

**[View Postman Collection →](https://documenter.getpostman.com/view/31908428/2sBXcHhJd9)**

## Environment Variables

Required environment variables for webhook handling:

| Variable | Description | Example |
|----------|-------------|---------|
| `PRINTORA_WEBHOOK_SECRET` | Secret for signature verification | `whsec_your_webhook_secret_here` |

## Webhook Logging

Printora maintains delivery logs for all webhooks. You can:

- View delivery status via `GET /api/v1/webhooks/logs`
- Resend failed webhooks via `POST /api/v1/webhooks/resend`
- Retry failed deliveries via `POST /api/v1/webhooks/retry`

## Troubleshooting

### Webhook Not Received

1. Check your endpoint is publicly accessible
2. Verify webhook URL in Printora dashboard
3. Check server logs for errors
4. Verify signature verification logic

### Signature Verification Fails

1. Ensure you're using the raw request body (not parsed)
2. Verify `PRINTORA_WEBHOOK_SECRET` is correct
3. Check timing-safe comparison is used

### Duplicate Events

- Implement idempotency checks
- Use `sessionId` + `event` combination as unique key
- Return `duplicate: true` for already-processed events

## Additional Resources

- [Main README](../README.md) - Complete integration guide
- [Postman Documentation](https://documenter.getpostman.com/view/31908428/2sBXcHhJd9) - Interactive API testing
- [Printora Support](mailto:support@printora.ai) - Get help with integration issues
