"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { deleteApplications, updateApplication } from "@/lib/actions";
import { JOB_TYPE_LABELS, SOURCE_SUGGESTIONS, STATUS_LABELS, STATUS_ORDER, STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ContactsSection } from "@/components/ContactsSection";
import { CustomFieldsEditor } from "@/components/CustomFieldsEditor";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import type { Application, ApplicationStatus, ActivityLogEntry, Contact, JobType } from "@/types/database";

const inputClass =
  "w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none transition-default focus:border-gray-400 focus:ring-2 focus:ring-gray-100";
const labelClass = "text-xs font-medium text-gray-500";

export function ApplicationDetail({
  application,
  contacts,
  activity,
}: {
  application: Application;
  contacts: Contact[];
  activity: ActivityLogEntry[];
}) {
  const router = useRouter();
  const [app, setApp] = useState(application);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  function field<K extends keyof Application>(key: K, value: Application[K]) {
    const previous = app[key];
    setApp((prev) => ({ ...prev, [key]: value }));
    updateApplication(app.id, { [key]: value } as Partial<Application>).catch(() => {
      setApp((prev) => ({ ...prev, [key]: previous }));
      toast.error("Couldn't save — try again");
    });
  }

  async function handleDelete() {
    if (!confirm(`Delete the application for ${app.company}? This can't be undone.`)) return;
    try {
      await deleteApplications([app.id]);
      toast.success("Application deleted");
      router.push("/applications");
    } catch {
      toast.error("Couldn't delete — try again");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <input
            defaultValue={app.company}
            onBlur={(e) => e.target.value !== app.company && field("company", e.target.value)}
            className="rounded-md border border-transparent px-1.5 py-0.5 text-xl font-medium tracking-tight text-[#1a1a1a] outline-none transition-default hover:border-gray-200 focus:border-gray-300"
          />
          <input
            defaultValue={app.role_title}
            onBlur={(e) => e.target.value !== app.role_title && field("role_title", e.target.value)}
            className="mt-0.5 block rounded-md border border-transparent px-1.5 py-0.5 text-sm text-gray-500 outline-none transition-default hover:border-gray-200 focus:border-gray-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={app.status}
            onChange={(e) => field("status", e.target.value as ApplicationStatus)}
            className={cn(
              "cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium outline-none",
              STATUS_STYLES[app.status]
            )}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="rounded-md p-2 text-gray-300 transition-default hover:bg-red-50 hover:text-red-600"
            title="Delete application"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Type</label>
              <select
                value={app.job_type}
                onChange={(e) => field("job_type", e.target.value as JobType)}
                className={inputClass}
              >
                {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Source</label>
              <input
                list="source-suggestions"
                defaultValue={app.source ?? ""}
                onBlur={(e) => field("source", e.target.value || null)}
                className={inputClass}
              />
              <datalist id="source-suggestions">
                {SOURCE_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Date applied</label>
              <input
                type="date"
                defaultValue={app.date_applied ?? ""}
                onChange={(e) => field("date_applied", e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Location</label>
              <input
                defaultValue={app.location ?? ""}
                onBlur={(e) => field("location", e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Salary range</label>
              <input
                defaultValue={app.salary_range ?? ""}
                onBlur={(e) => field("salary_range", e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Resume version</label>
              <input
                defaultValue={app.resume_version ?? ""}
                onBlur={(e) => field("resume_version", e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className={labelClass}>Job posting link</label>
              <div className="flex items-center gap-2">
                <input
                  defaultValue={app.job_link ?? ""}
                  onBlur={(e) => field("job_link", e.target.value || null)}
                  className={inputClass}
                  placeholder="https://..."
                />
                {app.job_link && (
                  <a
                    href={app.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md p-2 text-gray-400 transition-default hover:bg-gray-50 hover:text-[#1a1a1a]"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <label className={labelClass}>Next action</label>
            <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="date"
                defaultValue={app.next_action_date ?? ""}
                onChange={(e) => field("next_action_date", e.target.value || null)}
                className={inputClass}
              />
              <input
                defaultValue={app.next_action_note ?? ""}
                onBlur={(e) => field("next_action_note", e.target.value || null)}
                placeholder="e.g. email recruiter"
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <button
              onClick={() => setDescriptionOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-medium text-[#1a1a1a]">Job Description</span>
              <ChevronDown
                size={16}
                className={cn("text-gray-400 transition-default", descriptionOpen && "rotate-180")}
              />
            </button>
            {descriptionOpen && (
              <div className="mt-3">
                <textarea
                  defaultValue={app.job_description ?? ""}
                  onBlur={(e) => field("job_description", e.target.value || null)}
                  rows={10}
                  placeholder="Paste the job description here..."
                  className={cn(inputClass, "whitespace-pre-wrap")}
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <label className={labelClass}>Notes</label>
            <textarea
              defaultValue={app.notes ?? ""}
              onBlur={(e) => field("notes", e.target.value || null)}
              rows={4}
              className={cn(inputClass, "mt-1.5")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <ContactsSection applicationId={app.id} initialContacts={contacts} />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <CustomFieldsEditor applicationId={app.id} initialFields={app.custom_fields} />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-medium text-[#1a1a1a]">Activity</h3>
            <ActivityTimeline items={activity} />
          </div>
        </div>
      </div>
    </div>
  );
}
