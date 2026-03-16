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
const SESSION_PATH = "/api/v1/partner-session";

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
    message: string,
    public details?: unknown
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

  // Generate idempotency key for this request
  const idempotencyKey = crypto.randomUUID();

  console.log(`[Printora API] POST ${url}`);
  console.log(`[Printora API] Request body:`, JSON.stringify(request, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.PRINTORA_API_KEY}`,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(request),
  });

  // Fetch doesn't throw on HTTP errors - must check response.ok manually
  if (!response.ok) {
    let errorData: PrintoraErrorResponse = {};
    try {
      const rawError = await response.json();
      // Handle nested error structure: { success: false, error: { code, message, details } }
      errorData = rawError.error ?? rawError;
    } catch {
      // If parsing fails, use default error data
    }

    console.error(`[Printora API] Error ${response.status}:`, JSON.stringify(errorData, null, 2));

    const errorMessage = errorData.message ?? `HTTP ${response.status}`;
    const errorCode = errorData.code ?? "UNKNOWN";

    if (response.status === 401) {
      throw new PrintoraApiError(401, "AUTH_FAILED", "Authentication failed: Invalid API key");
    }

    if (response.status === 400) {
      throw new PrintoraApiError(400, "VALIDATION_FAILED", `Validation failed: ${errorMessage}`, errorData.details);
    }

    // Generic error for other status codes
    throw new PrintoraApiError(response.status, errorCode, errorMessage, errorData.details);
  }

  const data = await response.json();
  console.log(`[Printora API] Response:`, JSON.stringify(data, null, 2));

  // Handle nested response structure: { success: true, data: { sessionId, redirectUrl, ... } }
  if (data.success && data.data) {
    return data.data as PrintoraSessionResponse;
  }

  return data as PrintoraSessionResponse;
}

// ============ Merch Management ============
// Docs: FRONTEND_INTEGRATION_GUIDE.md > Merch

/**
 * Create merch request — POST /api/v1/creators/:creatorId/merch
 *
 * Fields per docs:
 *  - title (required)
 *  - description
 *  - productId (required, UUID from catalog)
 *  - variantIds (required, UUID[] belonging to productId)
 *  - designImageUrl (required, public URL of design image)
 *  - stockLimit (optional, null = unlimited)
 */
export interface CreateMerchRequest {
  title: string;
  description?: string;
  productId: string;
  variantIds: string[];
  designImageUrl: string;
  stockLimit?: number | null;
}

/**
 * Update merch request — PUT /api/v1/creators/:creatorId/merch/:merchId
 *
 * All fields optional per docs.
 */
/**
 * Update merch request — PUT /api/v1/creators/:creatorId/merch/:merchId
 *
 * All fields optional per CREATOR_SYSTEM.md:
 *  - title, description, designImageUrl
 *  - productId, variantIds (must belong to productId)
 *  - status: "active" | "inactive" | "archived"
 *  - isActive: boolean (quick toggle)
 *  - sortOrder: integer (display order)
 *  - stockLimit: integer | null
 */
export interface UpdateMerchRequest {
  title?: string;
  description?: string;
  productId?: string;
  variantIds?: string[];
  designImageUrl?: string;
  stockLimit?: number | null;
  status?: "active" | "inactive" | "archived";
  isActive?: boolean;
  sortOrder?: number;
}

export interface MerchVariantResponse {
  id: string;
  color: string;
  colorCode: string | null;
  size: string;
  endPrice: number;
}

export interface MerchEditSession {
  sessionId: string;
  token: string;
  editorUrl: string;
  expiresAt: string;
}

export interface MerchResponse {
  id: string;
  title: string;
  description: string;
  designImageUrl: string;
  status: string;
  stockLimit: number | null;
  stockSold: number;
  stockRemaining: number | null;
  isLimitedEdition: boolean;
  konvaMetadata: unknown | null;
  hasDesign: boolean;
  product: {
    id: string;
    name: string;
  };
  variants: MerchVariantResponse[];
  createdAt: string;
  editSession?: MerchEditSession;
}

/**
 * Helper: make authenticated request to Printora API
 */
async function printoraFetch(method: string, path: string, body?: unknown) {
  const url = `${env.PRINTORA_API_URL}${path}`;

  console.log(`[Printora API] ${method} ${url}`);
  if (body) console.log(`[Printora API] Request body:`, JSON.stringify(body, null, 2));

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.PRINTORA_API_KEY}`,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData: PrintoraErrorResponse = {};
    try {
      const rawError = await response.json();
      errorData = rawError.error ?? rawError;
    } catch {
      // If parsing fails, use default error data
    }

    console.error(`[Printora API] Error ${response.status}:`, JSON.stringify(errorData, null, 2));

    const errorMessage = errorData.message ?? `HTTP ${response.status}`;
    const errorCode = errorData.code ?? "UNKNOWN";

    throw new PrintoraApiError(response.status, errorCode, errorMessage, errorData.details);
  }

  const data = await response.json();
  console.log(`[Printora API] Response:`, JSON.stringify(data, null, 2));

  // Handle nested: { success: true, merch: {...} } or { success: true, data: {...} }
  if (data.success) {
    return data.merch ?? data.data ?? data;
  }

  return data;
}

/**
 * Creates a new merch item for a creator
 *
 * POST /api/v1/creators/:creatorId/merch
 */
export async function createCreatorMerch(
  creatorId: string,
  request: CreateMerchRequest
): Promise<MerchResponse> {
  return printoraFetch("POST", `/api/v1/creators/${creatorId}/merch`, request);
}

/**
 * Updates an existing merch item
 *
 * PUT /api/v1/creators/:creatorId/merch/:merchId
 */
export async function updateCreatorMerch(
  creatorId: string,
  merchId: string,
  request: UpdateMerchRequest
): Promise<MerchResponse> {
  return printoraFetch("PUT", `/api/v1/creators/${creatorId}/merch/${merchId}`, request);
}
