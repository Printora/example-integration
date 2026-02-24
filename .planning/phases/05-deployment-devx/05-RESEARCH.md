# Phase 5: Deployment & Developer Experience - Research

**Researched:** 2026-02-24
**Domain:** Vercel Deployment, Next.js 16, Environment Variables, Webhook Testing
**Confidence:** HIGH

## Summary

Phase 5 focuses on deployment configuration and developer experience documentation. The application uses Next.js 16.1.6, which offers zero-configuration deployment on Vercel through automatic framework detection. The primary technical considerations are: (1) environment variable configuration through Vercel's dashboard with proper server/client separation using T3 Env validation, (2) webhook endpoint accessibility at the deployed URL, (3) comprehensive README documentation for partner onboarding, and (4) integration test examples demonstrating webhook signature verification and payload handling.

Next.js 16 requires Node.js 20.9.0+ for deployment on Vercel. The zero-config deployment works through Vercel's automatic framework detection - no vercel.json is needed unless custom configuration is required. Environment variables are configured through Vercel's dashboard with three scopes: Production (all commits to main branch), Preview (pull requests), and Development (local development via Vercel CLI). Server-side variables (PRINTORA_API_KEY, PRINTORA_WEBHOOK_SECRET) must NOT have the NEXT_PUBLIC_ prefix, while client-accessible variables require it.

For webhook testing, ngrok is the standard local development tool that creates a public HTTPS tunnel to localhost. Vercel provides webhook testing capabilities through deployed preview URLs. The integration test examples should demonstrate the full webhook flow: signature generation using HMAC-SHA256, payload construction following the PrintoraWebhookEvent type structure, and curl commands for testing both successful and failure scenarios.

**Primary recommendation:** Use Vercel's built-in Next.js 16 support with zero configuration, configure environment variables through Vercel dashboard (not .env files in production), and provide README documentation with step-by-step local development and deployment instructions plus sample curl commands for webhook testing.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | React framework with App Router | Built by Vercel, zero-config deployment, automatic framework detection |
| Vercel | Platform | Deployment infrastructure | Official Next.js hosting platform, automatic builds, environment variable management |
| T3 Env | 0.13.10 | Type-safe environment validation | Prevents runtime crashes from missing variables, integrates with Zod schemas |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ngrok | CLI | Local webhook testing | Developing webhook endpoints locally before deploying |
| Vercel CLI | Latest | Local environment variable sync | When you want to pull production environment variables locally |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel zero-config | vercel.json | Only use if custom rewrites, headers, or redirects are needed |
| ngrok | localtunnel, cloudflare tunnel | ngrok is more reliable for HTTPS webhooks with consistent URLs |
| Vercel dashboard | .env.production | Environment variables in Vercel dashboard are encrypted and never committed to git |

**Installation:**
```bash
# Vercel CLI (for local development)
npm i -g vercel

# ngrok (for local webhook testing)
# Download from https://ngrok.com/download or use:
brew install ngrok  # macOS
choco install ngrok # Windows
```

## Architecture Patterns

### Recommended Project Structure

```
example-integration/
├── .env.example          # Template for required environment variables
├── README.md             # Comprehensive setup and deployment docs
├── next.config.ts        # Minimal/empty - zero-config deployment
├── vercel.json           # OPTIONAL: only if custom config needed
├── app/
│   └── api/
│       └── webhooks/
│           └── route.ts  # POST endpoint at /api/webhooks
├── lib/
│   ├── env.ts            # T3 Env configuration
│   └── webhook-verify.ts # HMAC-SHA256 verification
└── tests/
    └── webhooks/
        └── examples.md   # Sample webhook payloads and curl commands
```

### Pattern 1: Vercel Environment Variable Configuration

**What:** Configure environment variables through Vercel dashboard rather than committed files.

**When to use:** All production and preview deployments. Variables are encrypted and scoped per environment.

**Example:**

Vercel Dashboard Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| PRINTORA_API_KEY | sk_live_... | Production, Preview, Development |
| PRINTORA_API_URL | https://api.printora.ai | Production |
| PRINTORA_API_URL | https://api-staging.printora.ai | Preview, Development |
| PRINTORA_WEBHOOK_SECRET | whsec_... | Production, Preview, Development |
| NEXT_PUBLIC_APP_URL | https://your-app.vercel.app | Production |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 | Development |

**Source:** Vercel Environment Variables Documentation (verified 2025)

### Pattern 2: Zero-Configuration Deployment

**What:** Deploy Next.js 16 to Vercel without any configuration files.

**When to use:** Standard Next.js applications without custom routing or headers.

**Example:**
```bash
# One-time setup
vercel login

# Deploy to production
vercel --prod

# Or connect git repository for automatic deployments
# Vercel automatically detects Next.js and builds
```

**Source:** Next.js Deployment Documentation (verified 2025)

### Pattern 3: Webhook Testing with ngrok

**What:** Expose local webhook endpoint publicly for testing during development.

**When to use:** Testing webhook signature verification and payload handling before deploying.

**Example:**
```bash
# Start ngrok tunnel
ngrok http 3000

# Output shows public URL like: https://abc123.ngrok.io
# Use this URL in Printora webhook configuration

# Test webhook endpoint
curl -X POST https://abc123.ngrok.io/api/webhooks \
  -H "Content-Type: application/json" \
  -H "x-printora-signature: sha256=..." \
  -d '{"id":"evt_123","type":"order.created",...}'
```

**Source:** ngrok Documentation (verified 2025)

### Pattern 4: README Documentation Structure

**What:** Comprehensive documentation covering setup, deployment, and webhook testing.

**When to use:** All partner-facing integration examples.

**Example Structure:**
```markdown
# Printora Partner Integration Example

## Overview
[Project description and purpose]

## Prerequisites
- Node.js 20.9.0+
- Printora API credentials

## Quick Start
1. Clone repository
2. Configure environment variables
3. Install dependencies
4. Run development server

## Environment Variables
[Table of required variables with descriptions]

## Deployment to Vercel
[Step-by-step deployment instructions]

## Webhook Testing
[Sample payloads and curl commands]

## Project Structure
[Directory layout explanation]
```

**Source:** GitHub README Best Practices (verified 2025)

### Anti-Patterns to Avoid

- **Committing .env files to git**: Secrets in version control are a security risk. Use .env.example as template only.
- **NEXT_PUBLIC_ prefix on secrets**: Never prefix sensitive variables with NEXT_PUBLIC_ - they become visible in client-side JavaScript.
- **Hardcoding environment-specific values**: Use environment variables, not conditional logic based on process.env.NODE_ENV.
- **Skipping environment variable validation**: Always validate required variables at startup to fail fast with clear error messages.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment variable validation | Custom Zod schemas for env vars | @t3-oss/env-nextjs | Provides type-safe env parsing, validation, and client/server separation in one package |
| Deployment configuration | Custom build scripts and Docker configs | Vercel zero-config | Automatic framework detection, optimized caching, and incremental static regeneration |
| Webhook signature verification | Custom HMAC implementations | Node.js built-in crypto module | Timing-safe comparison, well-tested, prevents timing attacks |
| Local tunneling for webhooks | Custom nginx or SSH tunnels | ngrok | HTTPS support, consistent public URLs, replay capability for debugging |

**Key insight:** Custom environment variable handling is a common source of security vulnerabilities and runtime errors. T3 Env provides a battle-tested solution that integrates perfectly with Next.js 16's server/client boundary separation. For deployment, Vercel's zero-config approach eliminates an entire class of deployment-related bugs related to build configuration and caching.

## Common Pitfalls

### Pitfall 1: Missing NEXT_PUBLIC_ Prefix for Client Variables

**What goes wrong:** Client-side code cannot access environment variables that aren't prefixed with NEXT_PUBLIC_.

**Why it happens:** Next.js intentionally limits client-side variable exposure for security. Server-side variables are only available in API routes, Server Components, and Server Actions.

**How to avoid:** Mark client-accessible variables with NEXT_PUBLIC_ prefix. Only include values that are safe to expose to browsers (e.g., app URL, feature flags). Never include API keys or secrets with this prefix.

**Warning signs:** `process.env.VARIABLE_NAME` returns `undefined` in client components or browser console.

### Pitfall 2: Environment Variable Scope Mismatch

**What goes wrong:** Development works locally but deployed version fails with "missing environment variable" error.

**Why it happens:** Vercel has three environment scopes (Production, Preview, Development). Variables may be configured for one scope but not the others.

**How to avoid:** When adding variables in Vercel dashboard, select all applicable environments. Use the "Include in" checkboxes to ensure variables are available where needed.

**Warning signs:** Build succeeds but runtime shows validation errors from T3 Env, or works on main branch but fails on PRs.

### Pitfall 3: Webhook Signature Verification Fails in Production

**What goes wrong:** Webhook signature verification works locally but fails with 401 after deployment.

**Why it happens:** Different webhook secret between environments, or payload encoding differences (whitespace, line endings).

**How to avoid:** Ensure PRINTORA_WEBHOOK_SECRET matches exactly across environments. Use raw body for signature calculation (read before JSON parsing). Printora should send consistent URL-encoded payloads.

**Warning signs:** All webhook requests return 401 Unauthorized, logs show "Invalid webhook signature".

### Pitfall 4: Node.js Version Incompatibility

**What goes wrong:** Deployment fails with "Unsupported Node.js version" or build succeeds but runtime errors occur.

**Why it happens:** Next.js 16 requires Node.js 20.9.0+. Default Node version on some platforms may be older.

**How to avoid:** Specify Node version in package.json using the `engines` field or add `.nvmrc` file. Vercel automatically uses Node.js 20+ for Next.js 16 projects.

**Warning signs:** Build failures mentioning unsupported features, syntax errors in production only.

### Pitfall 5: README Outdated with Project Structure

**What goes wrong:** Developers follow README instructions but encounter file paths that don't exist or commands that fail.

**Why it happens:** Project evolves but documentation isn't updated to match current structure.

**How to avoid:** Keep README in sync with codebase. Use scripts in package.json to abstract complex commands. Document the actual file structure, not an idealized version.

**Warning signs:** Multiple developers asking same setup questions, issues referencing incorrect paths.

## Code Examples

Verified patterns from official sources:

### Vercel Environment Variable Configuration (Dashboard)

```bash
# Via Vercel Dashboard:
# Settings > Environment Variables > Add New

# Required variables for this project:
PRINTORA_API_KEY=sk_live_your_key_here
PRINTORA_API_URL=https://api.printora.ai
PRINTORA_WEBHOOK_SECRET=whsec_your_secret_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Via Vercel CLI:
vercel env add PRINTORA_API_KEY
# Then paste value and select environments (Production, Preview, Development)
```

**Source:** Vercel Environment Variables Documentation (2025)

### Sample Webhook Test Payload

```json
{
  "id": "evt_abc123xyz",
  "type": "order.created",
  "timestamp": "2025-02-24T10:30:00Z",
  "data": {
    "orderId": "ord_12345",
    "sessionId": "sess_67890",
    "status": "created",
    "customerEmail": "customer@example.com",
    "customerName": "Jane Doe"
  }
}
```

### Webhook Signature Generation (for testing)

```typescript
import { createHmac } from "node:crypto";

function generateWebhookSignature(payload: string, secret: string): string {
  const signature = createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");
  return `sha256=${signature}`;
}

// Usage:
const payload = JSON.stringify({
  id: "evt_test123",
  type: "order.paid",
  timestamp: new Date().toISOString(),
  data: { orderId: "ord_test", status: "paid" }
});

const secret = process.env.PRINTORA_WEBHOOK_SECRET;
const signature = generateWebhookSignature(payload, secret);
console.log(`x-printora-signature: ${signature}`);
```

**Source:** lib/webhook-verify.ts in project (verified implementation)

### curl Command for Testing Webhooks

```bash
# Generate signature first using the script above
# Then test with curl:

curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "x-printora-signature: sha256=CALCULATED_SIGNATURE_HERE" \
  -d '{
    "id": "evt_test123",
    "type": "order.created",
    "timestamp": "2025-02-24T10:30:00Z",
    "data": {
      "orderId": "ord_12345",
      "status": "created",
      "customerEmail": "test@example.com"
    }
  }'

# Expected response for valid signature:
# {"received":true,"duplicate":false}

# Expected response for invalid signature:
# {"error":"Invalid webhook signature"} (status 401)
```

**Source:** Based on app/api/webhooks/route.ts implementation

### Testing Duplicate Event Handling

```bash
# First request: returns duplicate: false
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "x-printora-signature: sha256=VALID_SIGNATURE" \
  -d '{"id":"evt_dupetest","type":"order.paid","timestamp":"2025-02-24T10:30:00Z","data":{"orderId":"ord_123","status":"paid"}}'

# Response: {"received":true,"duplicate":false}

# Second request with same event ID: returns duplicate: true
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "x-printora-signature: sha256=VALID_SIGNATURE" \
  -d '{"id":"evt_dupetest","type":"order.paid","timestamp":"2025-02-24T10:30:00Z","data":{"orderId":"ord_123","status":"paid"}}'

# Response: {"received":true,"duplicate":true}
```

**Source:** Based on webhook store deduplication in lib/webhook-store.ts

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `vercel build` scripts | Automatic framework detection | Next.js 12+ | Build configuration is automatic, no custom scripts needed |
| `next.config.js` with complex rewrites | Minimal `next.config.ts` | Next.js 13+ | App Router eliminates most routing configuration needs |
| Server-side environment variables in client | T3 Env with client/server separation | 2023 | Type-safe env validation prevents runtime crashes and security leaks |
| Manual webhook signature testing | ngrok with replay capability | 2020+ | Faster debugging with request inspection and replay |

**Deprecated/outdated:**

- **vercel.json for basic Next.js apps:** No longer needed unless using custom rewrites, headers, or redirects. Zero-config deployment works for standard applications.
- **next-env for type generation:** Next.js 16 includes built-in type generation. `next-env` package is deprecated.
- **Separate .env files per environment:** Vercel dashboard manages environment-specific variables better than committing .env.production files.
- **Custom webhook testing scripts:** ngrok provides superior debugging with web UI, request inspection, and replay capability.

## Open Questions

1. **Printora webhook retry policy**
   - What we know: Webhooks need idempotent handling (duplicate event IDs return duplicate: true)
   - What's unclear: Exact retry schedule, exponential backoff parameters, max retry attempts
   - Recommendation: Document assumption of standard Stripe-like retry behavior (15m, 1h, 6h, 1d, 2d) in README, allow for unlimited retries by always returning 200 OK

2. **Printora staging environment webhook URL**
   - What we know: PRINTORA_API_URL can be set to staging URL
   - What's unclear: Whether staging and production use same webhook endpoint or different URLs
   - Recommendation: Use environment variables for all URLs, document that partners should configure webhooks per environment (staging vs production)

## Sources

### Primary (HIGH confidence)

- **Next.js Documentation** - https://nextjs.org/docs/deployment
  - Verified: Next.js 16 zero-config deployment on Vercel
  - Verified: Node.js 20.9.0+ requirement
  - Verified: Environment variable handling with NEXT_PUBLIC_ prefix

- **Vercel Documentation** - https://vercel.com/docs/deployments/overview
  - Verified: Automatic framework detection for Next.js
  - Verified: Environment variable scopes (Production, Preview, Development)
  - Verified: Git integration with automatic deployments

- **@t3-oss/env-nextjs GitHub** - https://github.com/t3-oss/t3-env
  - Verified: Client/server variable separation
  - Verified: Zod integration for validation
  - Verified: SKIP_ENV_VALIDATION option for Docker builds

- **Project source code** - C:/Users/Public/Documents/Project/example-integration
  - Verified: lib/env.ts - T3 Env configuration
  - Verified: lib/webhook-verify.ts - HMAC-SHA256 timing-safe verification
  - Verified: app/api/webhooks/route.ts - Idempotent webhook handling
  - Verified: types/printora.ts - PrintoraWebhookEvent type structure

### Secondary (MEDIUM confidence)

- **ngrok Documentation** - https://ngrok.com/docs
  - Verified: HTTP tunnel creation with `ngrok http 3000`
  - Verified: HTTPS support for webhook endpoints
  - Verified: Web UI for request inspection

- **Vercel Environment Variables** - https://vercel.com/docs/projects/environment-variables
  - Verified: Dashboard configuration workflow
  - Verified: Environment-specific variable scoping
  - Verified: Secret encryption and never exposed in client bundles

### Tertiary (LOW confidence)

- **Webhook testing patterns** - Multiple community sources
  - Sample curl commands for webhook testing
  - Common webhook event payload structures
  - Note: Should be validated against actual Printora API documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Vercel and Next.js documentation directly supports findings
- Architecture: HIGH - Verified against official documentation and project source code
- Pitfalls: HIGH - Based on common deployment issues documented in Vercel/Next.js troubleshooting guides

**Research date:** 2026-02-24
**Valid until:** 2026-05-24 (90 days - deployment patterns are stable, but Next.js and Vercel features evolve)
