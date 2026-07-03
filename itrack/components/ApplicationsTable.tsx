"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpDown, Download, Plus, Search, Trash2 } from "lucide-react";
import {
  JOB_TYPE_LABELS,
  OUTREACH_STATUS_LABELS,
  OUTREACH_STATUS_STYLES,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_STYLES,
} from "@/lib/constants";
import { updateApplication, deleteApplications } from "@/lib/actions";
import { formatDate, cn } from "@/lib/utils";
import { StatusPill } from "@/components/StatusPill";
import { EditableTextCell, EditableDateCell, EditableSelectCell } from "@/components/EditableCell";
import { NewApplicationSlideOver } from "@/components/NewApplicationSlideOver";
import { EmptyState } from "@/components/EmptyState";
import type { Application, ApplicationStatus, OutreachStatus } from "@/types/database";
import { Inbox } from "lucide-react";

type SortKey = "company" | "role_title" | "status" | "date_applied" | "next_action_date";
type SortDir = "asc" | "desc";

const STATUS_OPTIONS = STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] }));
const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function toCsvValue(value: string | null | undefined) {
  const v = value ?? "";
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function ApplicationsTable({
  initialApplications,
  initialContactStatus,
}: {
  initialApplications: Application[];
  initialContactStatus: Record<string, OutreachStatus>;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [contactStatus] = useState(initialContactStatus);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date_applied");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let rows = applications;

    if (statusFilter !== "all") rows = rows.filter((a) => a.status === statusFilter);
    if (jobTypeFilter !== "all") rows = rows.filter((a) => a.job_type === jobTypeFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role_title.toLowerCase().includes(q) ||
          (a.notes ?? "").toLowerCase().includes(q)
      );
    }

    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [applications, statusFilter, jobTypeFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function patchLocal(id: string, patch: Partial<Application>) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function handleFieldSave(id: string, patch: Partial<Application>) {
    const previous = applications.find((a) => a.id === id);
    patchLocal(id, patch);
    startTransition(async () => {
      try {
        await updateApplication(id, patch);
      } catch {
        if (previous) patchLocal(id, previous);
        toast.error("Couldn't save — try again");
      }
    });
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} application(s)? This can't be undone.`)) return;

    const previous = applications;
    setApplications((prev) => prev.filter((a) => !selected.has(a.id)));
    setSelected(new Set());
    startTransition(async () => {
      try {
        await deleteApplications(ids);
        toast.success(`Deleted ${ids.length} application(s)`);
      } catch {
        setApplications(previous);
        toast.error("Couldn't delete — try again");
      }
    });
  }

  function handleBulkStatus(status: ApplicationStatus) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    const previous = applications;
    setApplications((prev) =>
      prev.map((a) => (selected.has(a.id) ? { ...a, status } : a))
    );
    startTransition(async () => {
      try {
        await Promise.all(ids.map((id) => updateApplication(id, { status })));
        toast.success(`Updated ${ids.length} application(s) to ${STATUS_LABELS[status]}`);
      } catch {
        setApplications(previous);
        toast.error("Couldn't update — try again");
      }
    });
  }

  function handleExportCsv() {
    const headers = [
      "Company",
      "Role",
      "Type",
      "Status",
      "Date Applied",
      "Next Action Date",
      "Next Action Note",
      "Source",
      "Location",
      "Salary Range",
      "Job Link",
      "Resume Version",
      "Notes",
    ];
    const rows = filtered.map((a) => [
      a.company,
      a.role_title,
      JOB_TYPE_LABELS[a.job_type],
      STATUS_LABELS[a.status],
      a.date_applied ?? "",
      a.next_action_date ?? "",
      a.next_action_note ?? "",
      a.source ?? "",
      a.location ?? "",
      a.salary_range ?? "",
      a.job_link ?? "",
      a.resume_version ?? "",
      a.notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `itrack-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-[#1a1a1a]">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} of {applications.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-default hover:bg-gray-50"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => setSlideOverOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white transition-default hover:bg-black"
          >
            <Plus size={14} />
            New Application
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or notes..."
            className="w-full rounded-md border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none transition-default focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none transition-default focus:border-gray-400"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={jobTypeFilter}
          onChange={(e) => setJobTypeFilter(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none transition-default focus:border-gray-400"
        >
          <option value="all">All types</option>
          {JOB_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md bg-gray-50 px-4 py-2.5">
          <span className="text-sm font-medium text-[#1a1a1a]">{selected.size} selected</span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleBulkStatus(e.target.value as ApplicationStatus);
              e.target.value = "";
            }}
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none"
          >
            <option value="" disabled>
              Change status to...
            </option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 transition-default hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No applications found"
          description={
            applications.length === 0
              ? "Add your first application to start tracking your job search."
              : "Try adjusting your search or filters."
          }
          action={
            applications.length === 0 && (
              <button
                onClick={() => setSlideOverOpen(true)}
                className="rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white transition-default hover:bg-black"
              >
                New Application
              </button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {(
                    [
                      ["company", "Company"],
                      ["role_title", "Role"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <th key={key} className="px-3 py-2.5 text-left font-medium text-gray-500">
                      <button
                        onClick={() => toggleSort(key)}
                        className="flex items-center gap-1 hover:text-[#1a1a1a]"
                      >
                        {label}
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">Type</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">
                    <button
                      onClick={() => toggleSort("status")}
                      className="flex items-center gap-1 hover:text-[#1a1a1a]"
                    >
                      Status
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">
                    <button
                      onClick={() => toggleSort("date_applied")}
                      className="flex items-center gap-1 hover:text-[#1a1a1a]"
                    >
                      Date Applied
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">
                    <button
                      onClick={() => toggleSort("next_action_date")}
                      className="flex items-center gap-1 hover:text-[#1a1a1a]"
                    >
                      Next Action
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">Source</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                    <td className="px-3 py-1.5">
                      <input
                        type="checkbox"
                        checked={selected.has(app.id)}
                        onChange={() => toggleSelected(app.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className="block truncate rounded px-1.5 py-1 font-medium text-[#1a1a1a] hover:underline"
                      >
                        {app.company}
                      </Link>
                    </td>
                    <td className="max-w-[220px] px-1 py-1.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className="block truncate rounded px-1.5 py-1 text-gray-700 hover:underline"
                      >
                        {app.role_title}
                      </Link>
                    </td>
                    <td className="px-1 py-1.5">
                      <EditableSelectCell
                        value={app.job_type}
                        options={JOB_TYPE_OPTIONS}
                        onSave={(v) => handleFieldSave(app.id, { job_type: v as Application["job_type"] })}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleFieldSave(app.id, { status: e.target.value as ApplicationStatus })
                        }
                        className={cn(
                          "cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
                          STATUS_STYLES[app.status]
                        )}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-1 py-1.5">
                      <EditableDateCell
                        value={app.date_applied}
                        onSave={(v) => handleFieldSave(app.id, { date_applied: v })}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <EditableDateCell
                        value={app.next_action_date}
                        onSave={(v) => handleFieldSave(app.id, { next_action_date: v })}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <EditableTextCell
                        value={app.source}
                        onSave={(v) => handleFieldSave(app.id, { source: v || null })}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      {contactStatus[app.id] ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                            OUTREACH_STATUS_STYLES[contactStatus[app.id]]
                          )}
                        >
                          {OUTREACH_STATUS_LABELS[contactStatus[app.id]]}
                        </span>
                      ) : (
                        <span className="px-1.5 text-xs text-gray-400">No contact</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition-default hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#1a1a1a]">{app.company}</p>
                    <p className="truncate text-sm text-gray-500">{app.role_title}</p>
                  </div>
                  <StatusPill status={app.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{JOB_TYPE_LABELS[app.job_type]}</span>
                  <span>Applied {formatDate(app.date_applied)}</span>
                  {app.next_action_date && <span>Next: {formatDate(app.next_action_date)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <NewApplicationSlideOver
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        onCreated={(app) => setApplications((prev) => [app, ...prev])}
      />
    </div>
  );
}
