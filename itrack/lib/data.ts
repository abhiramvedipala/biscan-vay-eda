import { createClient } from "@/lib/supabase/server";
import type { Application, Contact, ActivityLogEntry } from "@/types/database";

export async function getApplications(): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Application[];
}

export async function getApplication(id: string): Promise<Application | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as Application | null;
}

export async function getContacts(applicationId: string): Promise<Contact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Contact[];
}

export async function getActivityLog(
  applicationId: string
): Promise<ActivityLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ActivityLogEntry[];
}

export async function getRecentActivity(limit = 15): Promise<
  (ActivityLogEntry & { company: string; role_title: string })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, applications!inner(company, role_title)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Array<
    ActivityLogEntry & { applications: { company: string; role_title: string } }
  >).map((row) => ({
    ...row,
    company: row.applications.company,
    role_title: row.applications.role_title,
  }));
}

export async function getContactStatusByApplication(): Promise<
  Record<string, Contact["outreach_status"]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("application_id, outreach_status, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const map: Record<string, Contact["outreach_status"]> = {};
  for (const row of (data ?? []) as unknown as Pick<
    Contact,
    "application_id" | "outreach_status" | "created_at"
  >[]) {
    // Later rows overwrite earlier ones, so each application ends up with its most recent contact.
    map[row.application_id] = row.outreach_status;
  }
  return map;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}
