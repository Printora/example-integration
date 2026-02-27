/**
 * Session Creation Page
 *
 * Form page for creating Printora sessions.
 * Features: side-by-side layout, image preview, optional user data, webhook status.
 */

"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { createSessionAction, type FormState } from "@/lib/actions/create-session";
import type { WebhookStoredEvent } from "@/types/printora";

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
  const [state, formAction, isPending] = useActionState(
    createSessionAction,
    initialState
  );
  const [imageUrl, setImageUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<WebhookStoredEvent[]>([]);

  // Redirect to editor on success in new tab
  useEffect(() => {
    if (state.success && state.editorUrl) {
      const timer = setTimeout(() => {
        window.open(state.editorUrl!, "_blank");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.editorUrl]);

  // Fetch webhook events
  useEffect(() => {
    async function fetchWebhooks() {
      try {
        const response = await fetch("/api/events?limit=5");
        if (response.ok) {
          const data = await response.json();
          setWebhookEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch webhook events:", error);
      }
    }

    fetchWebhooks();
    // Poll every 3 seconds for webhook updates
    const interval = setInterval(fetchWebhooks, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Printora Session
          </h1>
          <p className="text-gray-600 mt-2">
            Enter design details to create a new editing session
          </p>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <form action={formAction} className="space-y-6">
              {/* Image Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Design Image
                </h2>
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Image URL *
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    required
                    placeholder="https://example.com/design.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isPending}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {state.errors?.imageUrl && (
                    <p className="mt-1 text-sm text-red-600">
                      {state.errors.imageUrl[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* User Data Section - Optional */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  User Data{" "}
                  <span className="text-sm font-normal text-gray-500">
                    (Optional)
                  </span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
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

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Customer Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
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
                </div>
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

          {/* Right Column - Image Preview */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Image Preview
            </h2>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Design preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">Enter an image URL to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Webhook Status Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Webhook Events
              </h2>
              <p className="text-sm text-gray-500">
                Real-time webhook events from Printora
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>

          {webhookEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm">No webhook events yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhookEvents.map((event) => (
                <div
                  key={event.sessionId}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.receivedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">
                    Session ID: {event.sessionId}
                  </p>
                  {event.payload.data?.orderId && (
                    <p className="text-xs text-gray-600 mt-1">
                      Order ID: {event.payload.data.orderId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
