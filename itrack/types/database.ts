export type JobType =
  | "on_campus"
  | "internship"
  | "full_time"
  | "part_time"
  | "contract"
  | "other";

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "followed_up"
  | "oa_assessment"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "ghosted";

export type OutreachStatus =
  | "not_contacted"
  | "reached_out"
  | "responded"
  | "meeting_scheduled"
  | "no_response";

export interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  company: string;
  role_title: string;
  job_type: JobType;
  status: ApplicationStatus;
  date_applied: string | null;
  next_action_date: string | null;
  next_action_note: string | null;
  job_link: string | null;
  source: string | null;
  location: string | null;
  salary_range: string | null;
  job_description: string | null;
  resume_version: string | null;
  notes: string | null;
  custom_fields: Record<string, string>;
}

export interface Contact {
  id: string;
  application_id: string;
  created_at: string;
  name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  outreach_status: OutreachStatus;
  last_contacted: string | null;
  notes: string | null;
}

export interface ActivityLogEntry {
  id: string;
  application_id: string;
  created_at: string;
  event_type: string;
  description: string;
}

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: Application;
        Insert: Partial<Application> & {
          company: string;
          role_title: string;
        };
        Update: Partial<Application>;
      };
      contacts: {
        Row: Contact;
        Insert: Partial<Contact> & { application_id: string };
        Update: Partial<Contact>;
      };
      activity_log: {
        Row: ActivityLogEntry;
        Insert: Partial<ActivityLogEntry> & {
          application_id: string;
          event_type: string;
          description: string;
        };
        Update: Partial<ActivityLogEntry>;
      };
    };
  };
}
