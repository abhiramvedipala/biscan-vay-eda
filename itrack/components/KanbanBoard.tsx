"use client";

import { useState } from "react";
import { DndContext, DragOverlay, useDroppable, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { updateApplication } from "@/lib/actions";
import { BOARD_STATUSES, STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { KanbanCard } from "@/components/KanbanCard";
import type { Application, ApplicationStatus } from "@/types/database";

function Column({
  status,
  apps,
}: {
  status: ApplicationStatus;
  apps: Application[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-gray-200 bg-gray-50/60 transition-default",
        isOver && "border-gray-400 bg-gray-100"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-gray-400">{apps.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {apps.map((app) => (
          <KanbanCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);

  const boardApps = applications.filter((a) => BOARD_STATUSES.includes(a.status));
  const activeApp = applications.find((a) => a.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = String(active.id);
    const newStatus = over.id as ApplicationStatus;
    const app = applications.find((a) => a.id === appId);
    if (!app || app.status === newStatus) return;

    const previousStatus = app.status;
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    updateApplication(appId, { status: newStatus }).catch(() => {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: previousStatus } : a))
      );
      toast.error("Couldn't update status — try again");
    });
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {BOARD_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            apps={boardApps.filter((a) => a.status === status)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp && <KanbanCard app={activeApp} />}
      </DragOverlay>
    </DndContext>
  );
}
