import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-6 py-14 text-center">
      <Icon size={28} className="mb-3 text-gray-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[#1a1a1a]">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
