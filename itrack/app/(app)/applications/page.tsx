import { getApplications, getContactStatusByApplication } from "@/lib/data";
import { ApplicationsTable } from "@/components/ApplicationsTable";

export default async function ApplicationsPage() {
  const [applications, contactStatus] = await Promise.all([
    getApplications(),
    getContactStatusByApplication(),
  ]);

  return (
    <ApplicationsTable
      initialApplications={applications}
      initialContactStatus={contactStatus}
    />
  );
}
