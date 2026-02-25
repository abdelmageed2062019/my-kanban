"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import Board from "@/components/Board";
import useDebouncedValue from "@/hooks/useDebouncedValue";

export default function Home() {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const { data: taskCount = 0 } = useQuery({
    queryKey: ["taskCount"],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/tasks?_page=1&_per_page=1`);
      if (!response.ok) {
        throw new Error("Failed to fetch task count");
      }
      const json = (await response.json()) as
        | { items?: number; data?: unknown[] }
        | unknown[];
      if (Array.isArray(json)) {
        return json.length;
      }
      if (typeof json.items === "number") {
        return json.items;
      }
      return Array.isArray(json.data) ? json.data.length : 0;
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar
        title="Kanban Board"
        taskCountText={`${taskCount} tasks`}
        searchValue={search}
        onSearchChange={setSearch}
      />
      <main className="px-6 py-6">
        <Board searchQuery={debouncedSearch} />
      </main>
    </div>
  );
}
