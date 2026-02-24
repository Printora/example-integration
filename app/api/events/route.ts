import { NextResponse } from "next/server";
import {
  getEvents,
  getEventsByType,
  searchEvents,
} from "@/lib/webhook-store";

/**
 * GET /api/events
 *
 * Retrieves all stored webhook events for dashboard consumption.
 *
 * Query parameters:
 * - type: Filter by event type (e.g., "order.created", "order.paid")
 * - q: Search by order ID or customer email
 *
 * Returns empty array [] when no events stored.
 * No authentication required (public demo endpoint).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Check for type filter
  const typeFilter = searchParams.get("type");
  // Check for search query
  const searchQuery = searchParams.get("q");

  let events;

  if (typeFilter) {
    // Filter by event type
    events = getEventsByType(typeFilter);
  } else if (searchQuery) {
    // Search by order ID or email
    events = searchEvents(searchQuery);
  } else {
    // Return all events
    events = getEvents();
  }

  // Return copy of events array (prevents external mutation)
  return NextResponse.json(events, { status: 200 });
}

/**
 * POST /api/events
 *
 * Events endpoint does not accept POST requests.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use GET to retrieve events." },
    { status: 405 }
  );
}
