"use client";

import * as React from "react";
import { useInterval } from "ahooks";
import type { WebhookStoredEvent } from "@/types/printora";
import { EventList } from "@/components/dashboard/event-list";
import { EventFilter } from "@/components/dashboard/event-filter";
import { EventSearch } from "@/components/dashboard/event-search";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const [events, setEvents] = React.useState<WebhookStoredEvent[]>([]);
  const [filterType, setFilterType] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  async function fetchEvents() {
    const params = new URLSearchParams();
    if (filterType !== "all") params.append("type", filterType);
    if (searchQuery) params.append("q", searchQuery);

    const response = await fetch(`/api/events?${params}`);
    if (response.ok) {
      const data = await response.json();
      setEvents(data);
    }
    setIsLoading(false);
  }

  // Initial fetch
  React.useEffect(() => {
    fetchEvents();
  }, []);

  // Poll every 5 seconds
  // Note: useInterval reads current state values, avoiding closure traps
  useInterval(
    () => {
      fetchEvents();
    },
    5000
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Event Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time webhook events from Printora (updates every 5 seconds)
          </p>
        </CardHeader>
        <CardContent>
          {/* Filter and search controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <EventFilter value={filterType} onChange={setFilterType} />
            <EventSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Event list */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading events...
            </div>
          ) : (
            <EventList
              events={events}
              filterType={filterType}
              searchQuery={searchQuery}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
