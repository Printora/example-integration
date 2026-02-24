"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EventSearch({
  value,
  onChange,
  placeholder = "Search by order ID or email...",
}: EventSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative flex items-center w-full max-w-md">
      <Search
        className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search events"
      />
    </div>
  );
}

export default EventSearch;
