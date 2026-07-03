import { notFound } from "next/navigation";
import { getApplication, getContacts, getActivityLog } from "@/lib/data";
import { ApplicationDetail } from "@/components/ApplicationDetail";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) notFound();

  const [contacts, activity] = await Promise.all([
    getContacts(id),
    getActivityLog(id),
  ]);

  return (
    <ApplicationDetail application={application} contacts={contacts} activity={activity} />
  );
}
