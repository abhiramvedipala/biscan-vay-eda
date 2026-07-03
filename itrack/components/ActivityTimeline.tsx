import { History } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types/database";

export function ActivityTimeline({ items }: { items: ActivityLogEntry[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Status changes and follow-ups will appear here."
      />
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
          <div>
            <p className="text-sm text-[#1a1a1a]">{item.description}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {formatDate(item.created_at, "MMM d, yyyy · h:mm a")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
