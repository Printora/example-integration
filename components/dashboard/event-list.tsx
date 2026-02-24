"use client";

import * as React from "react";
import type { WebhookStoredEvent } from "@/types/printora";
import { EventCard } from "@/components/dashboard/event-card";

export interface EventListProps {
  events: WebhookStoredEvent[];
  filterType: string;
  searchQuery: string;
}

export function EventList({
  events,
  filterType,
  searchQuery,
}: EventListProps) {
  // Filter events based on type and search query
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      // Type filter
      if (filterType !== "all" && event.type !== filterType) {
        return false;
      }
      // Search filter (order ID or email)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const orderId = event.payload.data.orderId?.toLowerCase() ?? "";
        const email = event.payload.data.customerEmail?.toLowerCase() ?? "";
        return orderId.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [events, filterType, searchQuery]);

  // Empty state
  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No events found.</p>
        <p className="text-sm">Try adjusting your filters or wait for new events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default EventList;
