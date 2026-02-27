import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook-verify";
import { addEvent } from "@/lib/webhook-store";
import type { PrintoraWebhookEvent } from "@/types/printora";

/**
 * POST /api/webhooks
 *
 * Webhook endpoint for receiving Printora events.
 * Verifies HMAC-SHA256 signature before processing.
 *
 * Security:
 * - Signature must match x-printora-signature header
 * - Timing-safe comparison prevents timing attacks
 * - Raw body used for signature (read before JSON parsing)
 *
 * Behavior:
 * - 401: Invalid or missing signature
 * - 400: Malformed payload (missing required fields)
 * - 200: Event received (duplicate: true if event ID already exists)
 */
export async function POST(request: Request) {
  // Extract signature header
  const signature = request.headers.get("x-printora-signature");

  // Log all headers for debugging
  console.log("[webhook] Received headers:", {
    signature,
    contentType: request.headers.get("content-type"),
    allHeaders: Object.fromEntries(request.headers.entries()),
  });

  // CRITICAL: Read raw body FIRST before JSON parsing
  // Signature verification requires the exact raw payload
  const rawBody = await request.text();

  // Verify signature - reject if invalid
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // Parse JSON after signature is verified
  let event: PrintoraWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PrintoraWebhookEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!event.sessionId || !event.event || !event.timestamp || !event.data) {
    return NextResponse.json(
      { error: "Invalid webhook payload: missing required fields" },
      { status: 400 }
    );
  }

  // Store event (returns false if duplicate sessionId exists)
  const added = addEvent(event, true);

  // Log successful storage
  console.log(
    `[webhook] Received event ${event.sessionId} (${event.event}) ${added ? "stored" : "(duplicate)"}`
  );

  // Always return 200 OK - idempotent endpoint
  // Include duplicate flag so caller knows if event was new
  return NextResponse.json(
    {
      received: true,
      duplicate: !added,
    },
    { status: 200 }
  );
}

/**
 * GET /api/webhooks
 *
 * Webhook endpoint health check.
 * Returns method not allowed for non-POST requests.
 */
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST for webhooks." },
    { status: 405 }
  );
}
