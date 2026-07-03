"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown, X } from "lucide-react";
import { createApplication } from "@/lib/actions";
import { JOB_TYPE_LABELS, SOURCE_SUGGESTIONS, STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { todayString } from "@/lib/utils";
import type { Application, JobType, ApplicationStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none transition-default focus:border-gray-400 focus:ring-2 focus:ring-gray-100";
const labelClass = "text-xs font-medium text-gray-600";

export function NewApplicationSlideOver({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (app: Application) => void;
}) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobType, setJobType] = useState<JobType>("internship");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [dateApplied, setDateApplied] = useState(todayString());
  const [jobLink, setJobLink] = useState("");
  const [source, setSource] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeVersion, setResumeVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setCompany("");
    setRole("");
    setJobType("internship");
    setStatus("applied");
    setDateApplied(todayString());
    setJobLink("");
    setSource("");
    setShowMore(false);
    setLocation("");
    setSalaryRange("");
    setJobDescription("");
    setResumeVersion("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      toast.error("Company and role are required");
      return;
    }

    setSaving(true);
    try {
      const app = await createApplication({
        company: company.trim(),
        role_title: role.trim(),
        job_type: jobType,
        status,
        date_applied: dateApplied || null,
        job_link: jobLink.trim() || null,
        source: source.trim() || null,
        location: location.trim() || null,
        salary_range: salaryRange.trim() || null,
        job_description: jobDescription.trim() || null,
        resume_version: resumeVersion.trim() || null,
        notes: notes.trim() || null,
      });
      onCreated(app);
      toast.success(`Added ${app.company}`);
      reset();
      onClose();
    } catch {
      toast.error("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-black/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-medium text-[#1a1a1a]">New Application</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 transition-default hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Company *</label>
                  <input
                    autoFocus
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Stripe"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Role *</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Software Engineer Intern"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as JobType)}
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
                    <label className={labelClass}>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                      className={inputClass}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Date applied</label>
                    <input
                      type="date"
                      value={dateApplied}
                      onChange={(e) => setDateApplied(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Source</label>
                    <input
                      list="source-suggestions"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className={inputClass}
                      placeholder="LinkedIn"
                    />
                    <datalist id="source-suggestions">
                      {SOURCE_SUGGESTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Job posting link</label>
                  <input
                    value={jobLink}
                    onChange={(e) => setJobLink(e.target.value)}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-default hover:text-[#1a1a1a]"
                >
                  <ChevronDown
                    size={14}
                    className={cn("transition-default", showMore && "rotate-180")}
                  />
                  More details
                </button>

                <AnimatePresence initial={false}>
                  {showMore && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col gap-4 overflow-hidden"
                    >
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Location</label>
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={inputClass}
                          placeholder="Remote / Miami, FL"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Salary range</label>
                        <input
                          value={salaryRange}
                          onChange={(e) => setSalaryRange(e.target.value)}
                          className={inputClass}
                          placeholder="$40–50/hr"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Resume version</label>
                        <input
                          value={resumeVersion}
                          onChange={(e) => setResumeVersion(e.target.value)}
                          className={inputClass}
                          placeholder="Resume_v3.pdf"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Job description</label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          rows={4}
                          className={inputClass}
                          placeholder="Paste the JD here for interview prep..."
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-auto flex gap-2 border-t border-gray-200 px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-default hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white transition-default hover:bg-black disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Add application"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
