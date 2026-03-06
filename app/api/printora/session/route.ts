/**
 * Printora Session API Route
 *
 * POST endpoint for creating Printora sessions.
 * Validates request body with Zod and calls the Printora API client.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/printora-client";

/**
 * Request body validation schema
 */
const createSessionSchema = z.object({
  imageUrl: z.string().url("Invalid URL format for imageUrl"),
  userData: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
  }),
  successUrl: z.string().url("Invalid URL format for successUrl").optional(),
  failedUrl: z.string().url("Invalid URL format for failedUrl").optional(),
});

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
      return NextResponse.json(
        {
          error: "Validation failed",
          fields: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { imageUrl, userData, successUrl, failedUrl } = validationResult.data;

    // Use provided URLs when available, otherwise fall back to app URLs or hardcoded defaults
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

    const finalSuccessUrl = successUrl || (isLocalhost ? "https://google.com" : `${appUrl}/callback/success`);
    const finalFailedUrl = failedUrl || (isLocalhost ? "https://printora.ai" : `${appUrl}/callback/failed`);

    // Split name into firstName and lastName
    const nameParts = userData.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Call Printora API client with firstName and lastName
    const response = await createSession({
      imageUrl,
      userData: {
        email: userData.email,
        name: userData.name,
        firstName,
        lastName,
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
