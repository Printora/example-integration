/**
 * Server Action for Session Creation
 *
 * Handles form submission from the session creation page.
 * Uses 'use server' directive for Next.js Server Actions.
 */

"use server";

import { z } from "zod";
import type { PrintoraApiError } from "@/lib/printora-client";

/**
 * Form state interface for useActionState
 */
export interface FormState {
  success: boolean;
  errors?: Record<string, string[]>;
  editorUrl?: string;
  sessionId?: string;
}

/**
 * Zod validation schema for session creation form
 */
const createSessionFormSchema = z.object({
  imageUrl: z.string().url("Invalid URL format"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

/**
 * Server Action for creating a Printora session
 *
 * Called by the form on /create-session page.
 * Validates form data and calls the Printora API endpoint.
 *
 * @param prevState - Previous form state (required by useActionState)
 * @param formData - Form data from the submitted form
 * @returns FormState with success flag and editor URL or errors
 */
export async function createSessionAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract values from form data
  const rawData = {
    imageUrl: formData.get("imageUrl"),
    name: formData.get("name"),
    email: formData.get("email"),
  };

  // Validate with Zod schema
  const validationResult = createSessionFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { imageUrl, name, email } = validationResult.data;

  // Derive callback URLs from app URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${appUrl}/callback/success`;
  const failedUrl = `${appUrl}/callback/failed`;

  try {
    // Call the API route (server-side fetch)
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/printora/session`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        userData: { name, email },
        successUrl,
        failedUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return API error messages
      return {
        success: false,
        errors: {
          _form: [data.error ?? "Failed to create session"],
        },
      };
    }

    // Success - return editor URL for redirect
    return {
      success: true,
      editorUrl: data.editorUrl,
      sessionId: data.sessionId,
    };
  } catch (error) {
    // Handle network errors
    return {
      success: false,
      errors: {
        _form: ["Network error: Failed to connect to API"],
      },
    };
  }
}
