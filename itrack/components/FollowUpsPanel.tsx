"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Clock3 } from "lucide-react";
import { markFollowUpDone, snoozeFollowUp } from "@/lib/actions";
import { formatDate, isOverdue } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import type { Application } from "@/types/database";

export function FollowUpsPanel({ initialItems }: { initialItems: Application[] }) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();

  function removeLocally(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleMarkDone(app: Application) {
    removeLocally(app.id);
    startTransition(async () => {
      try {
        await markFollowUpDone(app.id);
        toast.success(`Marked ${app.company} follow-up done`);
      } catch {
        setItems((prev) => [app, ...prev]);
        toast.error("Couldn't update — try again");
      }
    });
  }

  function handleSnooze(app: Application) {
    removeLocally(app.id);
    startTransition(async () => {
      try {
        await snoozeFollowUp(app.id, 3);
        toast.success(`Snoozed ${app.company} for 3 days`);
      } catch {
        setItems((prev) => [app, ...prev]);
        toast.error("Couldn't update — try again");
      }
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Check}
        title="All caught up"
        description="No follow-ups are due right now."
      />
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
      {items.map((app) => {
        const overdue = isOverdue(app.next_action_date);
        return (
          <li key={app.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/applications/${app.id}`}
                className="truncate text-sm font-medium text-[#1a1a1a] hover:underline"
              >
                {app.company} — {app.role_title}
              </Link>
              <p
                className={`mt-0.5 truncate text-xs ${
                  overdue ? "text-red-600" : "text-gray-500"
                }`}
              >
                {overdue ? "Overdue" : "Due"} {formatDate(app.next_action_date)}
                {app.next_action_note ? ` · ${app.next_action_note}` : ""}
              </p>
            </div>
            <button
              onClick={() => handleSnooze(app)}
              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs text-gray-500 transition-default hover:bg-gray-50"
              title="Snooze +3 days"
            >
              <Clock3 size={14} />
              <span className="hidden sm:inline">+3d</span>
            </button>
            <button
              onClick={() => handleMarkDone(app)}
              className="flex shrink-0 items-center gap-1 rounded-md bg-gray-100 px-2 py-1.5 text-xs font-medium text-[#1a1a1a] transition-default hover:bg-gray-200"
              title="Mark done"
            >
              <Check size={14} />
              <span className="hidden sm:inline">Done</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
