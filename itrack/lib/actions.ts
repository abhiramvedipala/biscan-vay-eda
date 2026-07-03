"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS } from "@/lib/constants";
import { addDaysToDateString, todayString } from "@/lib/utils";
import type {
  Application,
  ApplicationStatus,
  Contact,
} from "@/types/database";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

function revalidateApplicationPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/board");
  if (id) revalidatePath(`/applications/${id}`);
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  applicationId: string,
  eventType: string,
  description: string
) {
  await supabase.from("activity_log").insert({
    user_id: userId,
    application_id: applicationId,
    event_type: eventType,
    description,
  } as never);
}

export async function createApplication(
  input: Partial<Application> & { company: string; role_title: string }
) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("applications")
    .insert({ ...input, user_id: user.id } as never)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const app = data as unknown as Application;
  await logActivity(supabase, user.id, app.id, "created", "Application created");

  revalidateApplicationPaths(app.id);
  return app;
}

export async function updateApplication(
  id: string,
  patch: Partial<Application>
) {
  const { supabase, user } = await requireUser();

  if (patch.status) {
    const { data: existing } = await supabase
      .from("applications")
      .select("status")
      .eq("id", id)
      .single();

    const prevStatus = (existing as unknown as { status: ApplicationStatus } | null)
      ?.status;

    if (prevStatus && prevStatus !== patch.status) {
      await logActivity(
        supabase,
        user.id,
        id,
        "status_change",
        `Status changed to ${STATUS_LABELS[patch.status]}`
      );
    }
  }

  const { data, error } = await supabase
    .from("applications")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidateApplicationPaths(id);
  return data as unknown as Application;
}

export async function deleteApplications(ids: string[]) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("applications").delete().in("id", ids);
  if (error) throw new Error(error.message);

  revalidateApplicationPaths();
}

export async function markFollowUpDone(id: string) {
  const { supabase, user } = await requireUser();

  await logActivity(supabase, user.id, id, "follow_up", "Follow-up marked done");

  const { error } = await supabase
    .from("applications")
    .update({ next_action_date: null, next_action_note: null } as never)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateApplicationPaths(id);
}

export async function snoozeFollowUp(id: string, days = 3) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("applications")
    .select("next_action_date")
    .eq("id", id)
    .single();

  const base =
    (existing as unknown as { next_action_date: string | null } | null)
      ?.next_action_date ?? todayString();
  const newDate = addDaysToDateString(base, days);

  await logActivity(
    supabase,
    user.id,
    id,
    "follow_up",
    `Follow-up snoozed ${days} days`
  );

  const { error } = await supabase
    .from("applications")
    .update({ next_action_date: newDate } as never)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateApplicationPaths(id);
}

export async function createContact(
  input: Partial<Contact> & { application_id: string }
) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...input, user_id: user.id } as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateApplicationPaths(input.application_id);
  return data as unknown as Contact;
}

export async function updateContact(id: string, patch: Partial<Contact>) {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("contacts")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const contact = data as unknown as Contact;
  revalidateApplicationPaths(contact.application_id);
  return contact;
}

export async function deleteContact(id: string, applicationId: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateApplicationPaths(applicationId);
}

export async function setCustomFields(
  id: string,
  customFields: Record<string, string>
) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("applications")
    .update({ custom_fields: customFields } as never)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateApplicationPaths(id);
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  revalidatePath("/");
}
