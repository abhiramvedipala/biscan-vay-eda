"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Plus, Trash2, UserRound } from "lucide-react";
import { createContact, deleteContact, updateContact } from "@/lib/actions";
import { OUTREACH_STATUS_LABELS, OUTREACH_STATUS_STYLES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import type { Contact, OutreachStatus } from "@/types/database";

const OUTREACH_OPTIONS = Object.entries(OUTREACH_STATUS_LABELS) as [OutreachStatus, string][];

const inputClass =
  "w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none transition-default focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

export function ContactsSection({
  applicationId,
  initialContacts,
}: {
  applicationId: string;
  initialContacts: Contact[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");

  async function handleAdd() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const contact = await createContact({
        application_id: applicationId,
        name: name.trim(),
        title: title.trim() || null,
        email: email.trim() || null,
        linkedin_url: linkedin.trim() || null,
      });
      setContacts((prev) => [contact, ...prev]);
      setName("");
      setTitle("");
      setEmail("");
      setLinkedin("");
      setAdding(false);
    } catch {
      toast.error("Couldn't add contact");
    }
  }

  async function handleStatusChange(contact: Contact, status: OutreachStatus) {
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, outreach_status: status } : c))
    );
    try {
      await updateContact(contact.id, { outreach_status: status });
    } catch {
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, outreach_status: contact.outreach_status } : c))
      );
      toast.error("Couldn't update contact");
    }
  }

  async function handleDelete(contact: Contact) {
    const previous = contacts;
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    try {
      await deleteContact(contact.id, applicationId);
    } catch {
      setContacts(previous);
      toast.error("Couldn't delete contact");
    }
  }

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    toast.success("Email copied");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#1a1a1a]">Contacts</h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-default hover:text-[#1a1a1a]"
        >
          <Plus size={14} />
          Add contact
        </button>
      </div>

      {adding && (
        <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputClass} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass} />
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className={inputClass} />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-md bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-white transition-default hover:bg-black"
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-default hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {contacts.length === 0 && !adding ? (
        <EmptyState icon={UserRound} title="No contacts" description="Add a recruiter or referral to track outreach." />
      ) : (
        <ul className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <li key={contact.id} className="rounded-md border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1a1a1a]">{contact.name}</p>
                  {contact.title && <p className="truncate text-xs text-gray-500">{contact.title}</p>}
                </div>
                <button
                  onClick={() => handleDelete(contact)}
                  className="shrink-0 rounded p-1 text-gray-300 transition-default hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  value={contact.outreach_status}
                  onChange={(e) => handleStatusChange(contact, e.target.value as OutreachStatus)}
                  className={cn(
                    "cursor-pointer rounded-full border-0 px-2 py-0.5 text-xs font-medium outline-none",
                    OUTREACH_STATUS_STYLES[contact.outreach_status]
                  )}
                >
                  {OUTREACH_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {contact.last_contacted && (
                  <span className="text-xs text-gray-400">
                    Last contacted {formatDate(contact.last_contacted)}
                  </span>
                )}
              </div>

              <div className="mt-2 flex gap-3">
                {contact.email && (
                  <button
                    onClick={() => handleCopyEmail(contact.email!)}
                    className="flex items-center gap-1 text-xs text-gray-500 transition-default hover:text-[#1a1a1a]"
                  >
                    <Copy size={12} />
                    Copy email
                  </button>
                )}
                {contact.linkedin_url && (
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 transition-default hover:text-[#1a1a1a]"
                  >
                    <ExternalLink size={12} />
                    LinkedIn
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
