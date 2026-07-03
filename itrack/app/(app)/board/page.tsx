import { getApplications } from "@/lib/data";
import { KanbanBoardClientOnly } from "@/components/KanbanBoardClientOnly";

export default async function BoardPage() {
  const applications = await getApplications();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium tracking-tight text-[#1a1a1a]">Board</h1>
        <p className="mt-1 text-sm text-gray-500">
          Drag a card to a new column to update its status.
        </p>
      </div>
      <KanbanBoardClientOnly initialApplications={applications} />
    </div>
  );
}
