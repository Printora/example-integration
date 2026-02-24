/**
 * Printora API Client
 *
 * Typed fetch wrapper for Printora API with error handling.
 * Handles session creation with proper authentication and error responses.
 */

import { env } from "@/lib/env";
import type {
  PrintoraSessionRequest,
  PrintoraSessionResponse,
} from "@/types/printora";

// API endpoint path for session creation
const SESSION_PATH = "/partner/sessions";

// Environment variable override for session path (optional)
const SESSION_PATH_OVERRIDE = process.env.PRINTORA_SESSION_PATH;

/**
 * Custom error class for Printora API errors
 * Extends Error with status code and error code properties
 */
export class PrintoraApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "PrintoraApiError";
  }
}

/**
 * Error response structure from Printora API
 */
interface PrintoraErrorResponse {
  code?: string;
  message?: string;
  details?: unknown;
}

/**
 * Creates a new Printora session
 *
 * @param request - Session creation request with imageUrl, userData, and redirect URLs
 * @returns Promise resolving to session response with sessionId, editorUrl, expiresAt
 * @throws {PrintoraApiError} When API request fails
 */
export async function createSession(
  request: PrintoraSessionRequest
): Promise<PrintoraSessionResponse> {
  const sessionPath = SESSION_PATH_OVERRIDE ?? SESSION_PATH;
  const url = `${env.PRINTORA_API_URL}${sessionPath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.PRINTORA_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  // Fetch doesn't throw on HTTP errors - must check response.ok manually
  if (!response.ok) {
    let errorData: PrintoraErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      // If parsing fails, use default error data
    }

    const errorMessage = errorData.message ?? `HTTP ${response.status}`;
    const errorCode = errorData.code ?? "UNKNOWN";

    if (response.status === 401) {
      throw new PrintoraApiError(401, "AUTH_FAILED", "Authentication failed: Invalid API key");
    }

    if (response.status === 400) {
      throw new PrintoraApiError(400, "VALIDATION_FAILED", `Validation failed: ${errorMessage}`);
    }

    // Generic error for other status codes
    throw new PrintoraApiError(response.status, errorCode, errorMessage);
  }

  return response.json() as Promise<PrintoraSessionResponse>;
}
