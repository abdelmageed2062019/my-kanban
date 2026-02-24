"use client";

import * as React from "react";
import { Navbar } from "@/components/Navbar";
import Board from "@/components/Board";

export default function Home() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar
        title="Kanban Board"
        taskCountText="12 tasks"
        searchValue={search}
        onSearchChange={setSearch}
      />
      <main className="px-6 py-6">
        <Board />
      </main>
    </div>
  );
}
