/**
 * Printora Session API Route
 *
 * POST endpoint for creating Printora sessions.
 * Supports all 3 integration flows:
 *   - Flow A: imageUrl (custom image upload)
 *   - Flow B: creatorId (creator storefront)
 *   - Flow C: merchId (direct merch link)
 *
 * Validates request body with Zod and calls the Printora API client.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/printora-client";

/**
 * Request body validation schema.
 * Exactly one of imageUrl, creatorId, or merchId must be provided.
 */
const createSessionSchema = z.object({
  imageUrl: z.string().url("Invalid URL format for imageUrl").optional(),
  creatorId: z.string().uuid("Invalid UUID format for creatorId").optional(),
  merchId: z.string().uuid("Invalid UUID format for merchId").optional(),
  variantId: z.string().uuid("Invalid UUID format for variantId").optional(),
  quantity: z.number().int().min(1).max(100).optional().default(1),
  userData: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
  }).optional(),
  successUrl: z.string().url("Invalid URL format for successUrl").optional(),
  failedUrl: z.string().url("Invalid URL format for failedUrl").optional(),
}).refine(
  (data) => {
    const modes = [data.imageUrl, data.creatorId, data.merchId].filter(Boolean);
    return modes.length === 1;
  },
  { message: "Provide exactly one of imageUrl, creatorId, or merchId" }
);

/**
 * POST /api/printora/session
 *
 * Creates a new Printora session and returns the editor URL.
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = createSessionSchema.safeParse(body);

    if (!validationResult.success) {
      // Return 400 with field errors
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const formErrors = validationResult.error.flatten().formErrors;
      return NextResponse.json(
        {
          error: "Validation failed",
          fields: fieldErrors,
          form: formErrors,
        },
        { status: 400 }
      );
    }

    const { imageUrl, creatorId, merchId, variantId, quantity, userData, successUrl, failedUrl } = validationResult.data;

    // Use provided URLs when available, otherwise fall back to app URLs or hardcoded defaults
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

    const finalSuccessUrl = successUrl || (isLocalhost ? "https://google.com" : `${appUrl}/callback/success`);
    const finalFailedUrl = failedUrl || (isLocalhost ? "https://printora.ai" : `${appUrl}/callback/failed`);

    // Split name into firstName and lastName
    const nameParts = (userData?.name ?? "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Call Printora API client — pass exactly one mode field
    const response = await createSession({
      ...(imageUrl && { imageUrl }),
      ...(creatorId && { creatorId }),
      ...(merchId && { merchId }),
      ...(variantId && { variantId }),
      ...(quantity && quantity > 1 && { quantity }),
      userData: {
        email: userData?.email || undefined,
        name: userData?.name || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
      successUrl: finalSuccessUrl,
      failedUrl: finalFailedUrl,
    });

    // Return session data
    return NextResponse.json(
      {
        sessionId: response.sessionId,
        editorUrl: response.redirectUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Printora API errors
    if (error instanceof Error && "status" in error && "code" in error) {
      const apiError = error as { status: number; code: string; message: string; details?: unknown };
      return NextResponse.json(
        {
          error: apiError.message,
          code: apiError.code,
          details: apiError.details,
        },
        { status: apiError.status }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
