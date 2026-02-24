/**
 * Printora Partner Integration Types
 *
 * This file defines TypeScript interfaces for all Printora API contracts.
 * Types provide compile-time safety and enable autocomplete throughout the codebase.
 *
 * Note: These types are based on standard partner integration patterns.
 * Verify exact field names against Printora API documentation during Phase 2.
 */

// ============ Session Creation Types ============

/**
 * User data provided when creating a Printora session
 */
export interface PrintoraUserData {
  email: string;
  name: string;
}

/**
 * Request payload for creating a partner session
 */
export interface PrintoraSessionRequest {
  /** URL to the design image to be edited */
  imageUrl: string;
  /** Customer information for the session */
  userData: PrintoraUserData;
  /** URL to redirect to after successful checkout */
  successUrl: string;
  /** URL to redirect to after failed/cancelled checkout */
  failedUrl: string;
}

/**
 * Response from Printora session creation endpoint
 */
export interface PrintoraSessionResponse {
  /** Unique identifier for the created session */
  sessionId: string;
  /** URL to redirect user to for design editor */
  editorUrl: string;
  /** ISO timestamp when session expires */
  expiresAt: string;
}

// ============ Webhook Event Types ============

/**
 * All possible webhook event types from Printora
 */
export type PrintoraWebhookEventType =
  | "order.created"
  | "order.paid"
  | "order.shipped"
  | "order.delivered";

/**
 * Order data within webhook event payload
 */
export interface PrintoraOrderData {
  /** Unique order identifier */
  orderId: string;
  /** Session ID if order was created from a partner session */
  sessionId?: string;
  /** Current order status */
  status: string;
  /** Customer email from original session */
  customerEmail?: string;
  /** Customer name from original session */
  customerName?: string;
}

/**
 * Webhook event payload from Printora
 */
export interface PrintoraWebhookEvent {
  /** Unique event ID for idempotency */
  id: string;
  /** Event type determining the payload structure */
  type: PrintoraWebhookEventType;
  /** ISO timestamp of when the event occurred */
  timestamp: string;
  /** Event-specific data */
  data: PrintoraOrderData;
}

// ============ Stored Event Types ============

/**
 * Webhook event as stored in our event store
 * Adds metadata to the raw webhook event
 */
export interface WebhookStoredEvent {
  /** Event ID from Printora (same as PrintoraWebhookEvent.id) */
  id: string;
  /** When we received this event */
  receivedAt: Date;
  /** Event type */
  type: PrintoraWebhookEventType;
  /** Full webhook event payload */
  payload: PrintoraWebhookEvent;
  /** Whether signature verification passed */
  verified: boolean;
}

// ============ API Client Types ============

/**
 * Configuration for Printora API client
 */
export interface PrintoraClientConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for API requests */
  apiUrl: string;
}

/**
 * API error response structure
 */
export interface PrintoraApiError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional details */
  details?: unknown;
}
