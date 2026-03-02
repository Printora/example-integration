# Printora Partner Integration Example

A complete example implementation demonstrating how to integrate with the Printora Partner API. This project showcases the full integration flow including session creation, webhook handling, and order management.

## What This Example Demonstrates

This example integration shows how to:

1. **Create Partner Sessions** - Generate sessions with customer images and data, receiving redirect URLs for Printora's design editor
2. **Handle Webhook Events** - Receive and verify webhook events for order lifecycle updates (created, paid, shipped, delivered)
3. **Order Dashboard** - View and manage orders created through partner sessions

### Integration Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your App      │    │  Printora API    │    │  Printora App   │
│                 │    │                  │    │                 │
│ 1. Create       │───▶│ 2. Generate      │───▶│ 3. Design &     │
│    Session      │    │    Session       │    │    Customize    │
│                 │    │                  │    │                 │
│ 5. Receive      │◀───│ 4. Send          │◀───│ Complete        │
│    Webhook      │    │    Webhook       │    │ Checkout        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Requirements

### Prerequisites

Before running this example, you need:

- **Node.js 20.9.0 or higher**
- **npm, yarn, pnpm, or bun** package manager
- **Printora Partner Credentials**:
  - API Key (`PRINTORA_API_KEY`)
  - Webhook Secret (`PRINTORA_WEBHOOK_SECRET`)

### Getting Printora Credentials

1. Contact Printora to become a partner
2. Receive your partner API credentials:
   - API Key (starts with `pk_test_` for test environment)
   - Webhook Secret (starts with `whsec_`)

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Required: Your Printora API credentials
PRINTORA_API_KEY=pk_test_your_api_key_here
PRINTORA_API_URL=https://api-staging.printora.ai
PRINTORA_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Required: Your application URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Environment
NODE_ENV=development
```

> **Note:** See [`.env.example`](.env.example) for a template.

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd example-integration
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Printora credentials.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
example-integration/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create-session/       # Session creation demo
│   ├── dashboard/            # Order management dashboard
│   ├── callback/             # Success/failure pages
│   └── api/
│       └── webhooks/         # Webhook endpoint
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   └── printora.ts           # Printora API client
└── docs/
    └── WEBHOOK-INTEGRATION.md # Detailed webhook documentation
```

## Features

### 1. Session Creation

Create a partner session with customer data:

```typescript
const response = await fetch('/api/partners/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': PRINTORA_API_KEY,
  },
  body: JSON.stringify({
    image_url: 'https://example.com/customer-image.jpg',
    user_data: {
      email: 'customer@example.com',
      name: 'Customer Name',
    },
  }),
});
```

### 2. Webhook Handling

Receive secure webhook events with signature verification:

```typescript
// Webhook endpoint receives events:
// - order.created
// - order.paid
// - order.shipped
// - order.delivered
```

See [docs/WEBHOOK-INTEGRATION.md](docs/WEBHOOK-INTEGRATION.md) for detailed webhook documentation.

## API Reference

### Authentication

All API requests require authentication using your Partner API Key in the Authorization header:

```http
Authorization: Bearer partner_test_api_key_example
```

**API Key Format:**
- Test mode: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx`
- Live mode: `pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx`

> **Note:** Replace the `x` characters with your actual API key received from Printora.

### Base URLs

| Environment | Base URL |
| --- | --- |
| **Production** | `https://api.printora.ai` |
| **Staging** | `https://api-staging.printora.ai` |

### Partner API Endpoints

#### Session Management

**Create Partner Session**
```
POST /api/v1/partner-session
```

Creates a new partner session and returns a redirect URL for the end-user.

**Request Body:**
```json
{
  "image_url": "https://example.com/customer-image.jpg",
  "user_data": {
    "email": "customer@example.com",
    "name": "Customer Name"
  }
}
```

**Response (201 Created):**
```json
{
  "session_id": "cc8930e4-621a-4a94-a483-34dd9de8ee90",
  "redirect_url": "https://printora.ai/customize?session=xxx",
  "image_url": "https://example.com/customer-image.jpg",
  "created_at": "2026-02-27T10:30:00Z"
}
```

#### Order Management

**Get Partner Orders**
```
GET /api/v1/partners/:partnerId/orders
```

Retrieve all orders created through your partner sessions.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Number of orders to return (default: 20) |
| `offset` | number | Number of orders to skip (default: 0) |
| `status` | string | Filter by order status |

**Response:**
```json
{
  "orders": [
    {
      "order_id": "ord_abc123",
      "session_id": "sess_x1y2z3",
      "status": "processing",
      "total_amount": 29.99,
      "currency": "USD",
      "created_at": "2026-02-27T10:40:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

#### Webhook Management

**View Webhook Logs**
```
GET /api/v1/webhooks/logs
```

View the delivery logs of all webhooks sent to your endpoint.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `session_id` | string | Filter by session ID |
| `event` | string | Filter by event type |
| `status` | string | Filter by delivery status |

**Resend Webhook**
```
POST /api/v1/webhooks/resend
```

Manually resend a webhook to your endpoint.

**Request Body:**
```json
{
  "webhook_log_id": "log_abc123"
}
```

**Retry Failed Webhook**
```
POST /api/v1/webhooks/retry
```

Retry a failed webhook delivery.

**Request Body:**
```json
{
  "webhook_log_id": "log_xyz789"
}
```

### Webhook Events

Your webhook endpoint will receive notifications for the following events:

| Event | Description |
|-------|-------------|
| `order.created` | When a user completes checkout |
| `order.paid` | When payment is confirmed |
| `order.shipped` | When the order is shipped |
| `order.delivered` | When the order is delivered |
| `order.cancelled` | When an order is cancelled |

**Webhook Payload Example:**
```json
{
  "sessionId": "cc8930e4-621a-xxxxx-xxxxx",
  "event": "order.created",
  "data": {
    "order_id": "ord_abc123",
    "session_id": "sess_x1y2z3",
    "status": "pending",
    "total_amount": 29.99,
    "currency": "USD"
  },
  "timestamp": "2026-01-30T10:40:00Z"
}
```

### Rate Limits

| Metric | Limit |
| --- | --- |
| Requests per minute | 60 |
| Requests per day | 10,000 |

**Rate limit headers are included in every response:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1738234567
```

### Session Lifecycle

Understanding the session flow is important for integration:

- **Redirect URL expiry:** 15 minutes from creation
- **Session expiry:** 24 hours after user first accesses the redirect URL
- **Session statuses:** `pending` → `active` → `completed` / `expired` / `cancelled`

### API Scope

This API is designed **exclusively for partner backend integration**.

**Partners CAN:**
- ✅ Create print sessions for end-users
- ✅ Retrieve orders created through their sessions
- ✅ Manage webhook deliveries and view logs

**Partners CANNOT:**
- ❌ Access cart endpoints (internal frontend use only)
- ❌ Access checkout endpoints (internal frontend use only)
- ❌ Access user authentication or product management endpoints

## Postman Collection

A complete Postman collection with all endpoints is available for testing:

**[View Postman Documentation →](https://documenter.getpostman.com/view/31908428/2sBXcHhJd9)**

### Getting Started with Postman

1. **Import the collection** - Click "Run in Postman" on the documentation page
2. **Set up your environment** - Select the appropriate environment (Staging/Production)
3. **Configure your API key** - Update the `PARTNER_API_KEY` variable
4. **Test the flow** - Start with "Create Session" to test the integration
5. **Review responses** - Check the response examples to understand the data structure
6. **Implement webhooks** - Set up your webhook endpoint to receive order notifications

## Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run deploy:vercel
```

Or push to your Git repository and import into Vercel.

**Important:** Add your environment variables in Vercel's dashboard:
- `PRINTORA_API_KEY`
- `PRINTORA_API_URL`
- `PRINTORA_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Other Platforms

This Next.js app can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted

## Documentation

- [Webhook Integration Details](docs/WEBHOOK-INTEGRATION.md)
- [Printora API Documentation](https://docs.printora.ai) (if available)

## Support

For issues or questions:
- Check the [Printora documentation](https://docs.printora.ai)
- Contact Printora support
- Open an issue in this repository

## License

This example code is provided as-is for integration purposes.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Environment:** [@t3-oss/env-nextjs](https://env.t3.gg/)
