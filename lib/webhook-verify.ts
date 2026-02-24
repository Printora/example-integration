import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Verifies webhook signature using HMAC-SHA256 with timing-safe comparison.
 *
 * Security considerations:
 * - Uses crypto.timingSafeEqual() instead of === to prevent timing attacks
 * - Buffers ensure constant-time comparison regardless of string length
 * - Raw payload (not parsed JSON) must be used for signature computation
 *
 * @param rawBody - The raw request body text (MUST be read before JSON parsing)
 * @param signature - The signature header value (e.g., "sha256=abc123...")
 * @returns true if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  // Reject if signature header is missing
  if (!signature) {
    return false;
  }

  // Get webhook secret from validated environment
  const secret = env.PRINTORA_WEBHOOK_SECRET;

  // Compute expected signature using HMAC-SHA256
  const expectedSignature = `sha256=${createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex")}`;

  // Use timing-safe comparison to prevent timing attacks
  // Buffer conversion is required for timingSafeEqual
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    // Buffer length mismatch means signatures can't be equal
    return false;
  }
}

/**
 * Extracts and verifies signature from headers.
 * Convenience wrapper for API route handlers.
 *
 * @param signatureHeader - Raw header value (may be null or string)
 * @param rawBody - Raw request body
 * @returns Object with isValid boolean and optional error message
 */
export function validateWebhookRequest(
  signatureHeader: string | null,
  rawBody: string
): { isValid: boolean; error?: string } {
  const isValid = verifyWebhookSignature(rawBody, signatureHeader);

  if (!isValid) {
    return {
      isValid: false,
      error: signatureHeader
        ? "Invalid webhook signature"
        : "Missing webhook signature header",
    };
  }

  return { isValid: true };
}
