import type { WebhookStoredEvent, PrintoraWebhookEvent } from "@/types/printora";

/**
 * In-memory webhook event store.
 *
 * Uses a module-scoped array to store events. This is sufficient for demo purposes
 * but will be lost on server restart. For production, use a database.
 *
 * Events are stored in reverse chronological order (newest first).
 */
const events: WebhookStoredEvent[] = [];

/**
 * Maximum number of events to keep in memory.
 * Prevents unbounded memory growth in long-running dev servers.
 */
const MAX_EVENTS = 100;

/**
 * Adds a webhook event to the store.
 * Implements deduplication by event ID to prevent double-processing.
 *
 * @param event - The webhook event to store
 * @param verified - Whether the signature was verified
 * @returns true if event was added, false if duplicate event ID already exists
 */
export function addEvent(
  event: PrintoraWebhookEvent,
  verified: boolean
): boolean {
  // Deduplication: check if sessionId + event type combination already exists
  const existingIndex = events.findIndex(
    (e) => e.sessionId === event.sessionId && e.type === event.event
  );
  if (existingIndex !== -1) {
    // Event already processed — return false without adding
    return false;
  }

  // Create stored event with metadata
  const storedEvent: WebhookStoredEvent = {
    sessionId: event.sessionId,
    receivedAt: new Date(),
    type: event.event,
    payload: event,
    verified,
  };

  // Add to beginning of array (newest first)
  events.unshift(storedEvent);

  // Prevent unbounded growth
  if (events.length > MAX_EVENTS) {
    events.pop();
  }

  return true;
}

/**
 * Retrieves all stored events.
 *
 * @returns Copy of events array (prevents external mutation)
 */
export function getEvents(): WebhookStoredEvent[] {
  return [...events];
}

/**
 * Retrieves a single event by sessionId.
 *
 * @param sessionId - Session ID to look up
 * @returns Event if found, undefined otherwise
 */
export function getEventById(sessionId: string): WebhookStoredEvent | undefined {
  return events.find((e) => e.sessionId === sessionId);
}

/**
 * Filters events by type.
 *
 * @param eventType - Event type to filter by
 * @returns Events matching the specified type
 */
export function getEventsByType(
  eventType: string
): WebhookStoredEvent[] {
  return events.filter((e) => e.type === eventType);
}

/**
 * Searches events by order ID or customer email.
 *
 * @param query - Search term (order ID or email)
 * @returns Events matching the search query
 */
export function searchEvents(query: string): WebhookStoredEvent[] {
  const lowerQuery = query.toLowerCase();
  return events.filter((e) => {
    const orderId = e.payload.data.orderId?.toLowerCase() ?? "";
    const email = e.payload.data.customerEmail?.toLowerCase() ?? "";
    return orderId.includes(lowerQuery) || email.includes(lowerQuery);
  });
}

/**
 * Clears all events from the store.
 * Useful for testing and development.
 */
export function clearEvents(): void {
  events.length = 0;
}

/**
 * Gets current event count.
 */
export function getEventCount(): number {
  return events.length;
}
