/**
 * Session Creation Page
 *
 * Form page for creating Printora sessions.
 * Uses React 19's useActionState hook for form state management.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createSessionAction, type FormState } from "@/lib/actions/create-session";

/**
 * Initial state for the form
 */
const initialState: FormState = {
  success: false,
};

/**
 * Session creation form component
 */
export default function SessionCreatePage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createSessionAction,
    initialState
  );

  // Redirect to editor on success
  useEffect(() => {
    if (state.success && state.editorUrl) {
      // Small delay to show success state
      const timer = setTimeout(() => {
        window.location.href = state.editorUrl!;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.editorUrl]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Printora Session
          </h1>
          <p className="text-gray-600 mt-2">
            Enter design details to create a new editing session
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {/* Design Image URL */}
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Design Image URL *
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              required
              placeholder="https://example.com/design.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isPending}
            />
            {state.errors?.imageUrl && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.imageUrl[0]}
              </p>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Customer Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isPending}
            />
            {state.errors?.name && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Customer Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Customer Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="customer@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isPending}
            />
            {state.errors?.email && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* General Form Error */}
          {state.errors?._form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Success Message */}
          {state.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Session created! Redirecting to editor...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating Session..." : "Create Session"}
          </button>
        </form>

        {/* Session ID Display (on success) */}
        {state.success && state.sessionId && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-500">
              Session ID:{" "}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                {state.sessionId}
              </code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
