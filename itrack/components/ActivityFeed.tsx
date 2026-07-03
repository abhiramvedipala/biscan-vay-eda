import { History } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types/database";

export function ActivityFeed({
  items,
}: {
  items: (ActivityLogEntry & { company: string; role_title: string })[];
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Status changes and follow-ups will show up here."
      />
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 px-4 py-3">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#1a1a1a]">
              <span className="font-medium">{item.company}</span> — {item.description}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {item.role_title} · {formatDate(item.created_at, "MMM d, yyyy · h:mm a")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
