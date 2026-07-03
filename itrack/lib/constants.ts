import type { ApplicationStatus, JobType, OutreachStatus } from "@/types/database";

export const STATUS_ORDER: ApplicationStatus[] = [
  "saved",
  "applied",
  "followed_up",
  "oa_assessment",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
  "ghosted",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  followed_up: "Followed Up",
  oa_assessment: "OA / Assessment",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  ghosted: "Ghosted",
};

// Soft pastel background + darker text, per the design spec.
export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  saved: "bg-gray-100 text-gray-600",
  applied: "bg-blue-50 text-blue-700",
  followed_up: "bg-amber-50 text-amber-700",
  oa_assessment: "bg-violet-50 text-violet-700",
  interviewing: "bg-indigo-50 text-indigo-700",
  offer: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
  ghosted: "bg-stone-100 text-stone-600",
};

// Kanban board only shows the active pipeline stages, in order.
export const BOARD_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "followed_up",
  "oa_assessment",
  "interviewing",
  "offer",
  "rejected",
];

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "applied",
  "followed_up",
  "oa_assessment",
  "interviewing",
];

export const RESPONDED_STATUSES: ApplicationStatus[] = [
  "followed_up",
  "oa_assessment",
  "interviewing",
  "offer",
  "rejected",
];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  on_campus: "On-Campus",
  internship: "Internship",
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  other: "Other",
};

export const OUTREACH_STATUS_LABELS: Record<OutreachStatus, string> = {
  not_contacted: "Not Contacted",
  reached_out: "Reached Out",
  responded: "Responded",
  meeting_scheduled: "Meeting Scheduled",
  no_response: "No Response",
};

export const OUTREACH_STATUS_STYLES: Record<OutreachStatus, string> = {
  not_contacted: "bg-gray-100 text-gray-500",
  reached_out: "bg-blue-50 text-blue-700",
  responded: "bg-emerald-50 text-emerald-700",
  meeting_scheduled: "bg-indigo-50 text-indigo-700",
  no_response: "bg-red-50 text-red-700",
};

export const SOURCE_SUGGESTIONS = [
  "LinkedIn",
  "Handshake",
  "Indeed",
  "Company Site",
  "Referral",
  "Career Fair",
  "Other",
];
