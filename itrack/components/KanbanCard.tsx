"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { JOB_TYPE_LABELS } from "@/lib/constants";
import { daysSince, isOverdue, cn } from "@/lib/utils";
import type { Application } from "@/types/database";

export function KanbanCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
  });

  const days = daysSince(app.date_applied);
  const overdue = isOverdue(app.next_action_date);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab touch-none rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-default active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-[#1a1a1a]">{app.company}</p>
        {overdue && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />}
      </div>
      <p className="mt-0.5 truncate text-xs text-gray-500">{app.role_title}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{JOB_TYPE_LABELS[app.job_type]}</span>
        {days !== null && <span>{days}d ago</span>}
      </div>
      <Link
        href={`/applications/${app.id}`}
        onPointerDown={(e) => e.stopPropagation()}
        className="mt-2 inline-block text-xs text-gray-400 underline decoration-dotted hover:text-[#1a1a1a]"
      >
        View details
      </Link>
    </div>
  );
}
