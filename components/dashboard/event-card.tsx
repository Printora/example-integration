"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { JsonView, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import type { WebhookStoredEvent } from "@/types/printora";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface EventCardProps {
  event: WebhookStoredEvent;
}

export function EventCard({ event }: EventCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between py-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Type badge with color coding */}
          <Badge variant={getTypeBadgeVariant(event.type)}>
            {formatEventType(event.type)}
          </Badge>
          {/* Timestamp */}
          <span className="text-sm text-muted-foreground">
            {formatEventDate(event.receivedAt)}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "transform rotate-180"
          )}
        />
      </CardHeader>

      {/* Summary info */}
      <CardContent className="text-sm pt-0">
        <p className="text-muted-foreground text-xs">Session: {event.sessionId}</p>
        <p className="font-medium">Order: {event.payload.data.orderId}</p>
        <p>Status: {event.payload.data.status}</p>
        {event.payload.data.paymentStatus && (
          <p>Payment: {event.payload.data.paymentStatus}</p>
        )}
        {event.payload.data.totalAmount && (
          <p>Amount: {event.payload.data.currency} {event.payload.data.totalAmount}</p>
        )}
        {event.payload.data.customer?.email && (
          <p>Customer: {event.payload.data.customer.email}</p>
        )}
        {event.payload.data.items && event.payload.data.items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {event.payload.data.items.length} item(s)
          </p>
        )}
      </CardContent>

      {/* Expanded JSON view */}
      {isExpanded && (
        <CardContent className="border-t pt-4">
          <JsonView data={event.payload} style={darkStyles} />
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Formats an event date for display.
 */
function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formats an event type for human-readable display.
 * Converts "order.created" → "Order Created"
 */
function formatEventType(type: string): string {
  return type
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns the appropriate badge variant for an event type.
 */
function getTypeBadgeVariant(
  type: string
): "default" | "secondary" | "destructive" | "outline" {
  if (type === "order.created" || type === "order.shipped") {
    return "default";
  }
  if (type === "order.paid" || type === "order.delivered") {
    return "secondary";
  }
  return "destructive";
}

export default EventCard;
