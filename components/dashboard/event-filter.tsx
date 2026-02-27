"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const eventOptions = [
  { value: "all", label: "All Events" },
  { value: "order.created", label: "Order Created" },
  { value: "order.paid", label: "Order Paid" },
  { value: "order.shipped", label: "Order Shipped" },
  { value: "order.delivered", label: "Order Delivered" },
];

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

export function EventFilter({ value, onChange }: EventFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <Filter className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={handleChange}
        className={cn(
          "flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "cursor-pointer appearance-none",
          "hover:bg-accent/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "min-w-[180px]"
        )}
      >
        {eventOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow icon */}
      <svg
        className="absolute right-3 h-4 w-4 text-muted-foreground pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

export default EventFilter;
