"use client";

import dynamic from "next/dynamic";
import type { Application } from "@/types/database";

// dnd-kit's internal id generator isn't deterministic between server and
// client renders, which produces a hydration mismatch. The board is
// inherently interactive, so skip SSR for it entirely.
const KanbanBoard = dynamic(
  () => import("@/components/KanbanBoard").then((m) => m.KanbanBoard),
  { ssr: false }
);

export function KanbanBoardClientOnly({
  initialApplications,
}: {
  initialApplications: Application[];
}) {
  return <KanbanBoard initialApplications={initialApplications} />;
}
