import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import type { ApplicationStatus } from "@/types/database";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
