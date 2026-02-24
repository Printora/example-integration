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

    // Derive default URLs from APP_URL if not provided
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const finalSuccessUrl = successUrl ?? `${appUrl}/callback/success`;
    const finalFailedUrl = failedUrl ?? `${appUrl}/callback/failed`;

    // Call Printora API client
    const response = await createSession({
      imageUrl,
      userData,
      successUrl: finalSuccessUrl,
      failedUrl: finalFailedUrl,
    });

    // Return session data
    return NextResponse.json(
      {
        sessionId: response.sessionId,
        editorUrl: response.editorUrl,
        expiresAt: response.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Printora API errors
    if (error instanceof Error && "status" in error && "code" in error) {
      const apiError = error as { status: number; code: string; message: string };
      return NextResponse.json(
        {
          error: apiError.message,
          code: apiError.code,
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
