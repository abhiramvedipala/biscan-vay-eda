"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function EditableTextCell({
  value,
  onSave,
  placeholder = "—",
  className,
}: {
  value: string | null;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== (value ?? "")) onSave(draft);
  }

  function startEditing() {
    setDraft(value ?? "");
    setEditing(true);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        className="w-full rounded border border-gray-300 bg-white px-1.5 py-1 text-sm outline-none ring-2 ring-gray-100"
      />
    );
  }

  return (
    <button
      onClick={startEditing}
      className={cn(
        "block w-full truncate rounded px-1.5 py-1 text-left text-sm transition-default hover:bg-gray-50",
        !value && "text-gray-400",
        className
      )}
    >
      {value || placeholder}
    </button>
  );
}

export function EditableDateCell({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (value: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={value ?? ""}
        onBlur={(e) => {
          setEditing(false);
          const newValue = e.target.value || null;
          if (newValue !== value) onSave(newValue);
        }}
        className="w-full rounded border border-gray-300 bg-white px-1.5 py-1 text-sm outline-none ring-2 ring-gray-100"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="block w-full truncate rounded px-1.5 py-1 text-left text-sm transition-default hover:bg-gray-50"
    >
      {value ? new Date(value + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (
        <span className="text-gray-400">—</span>
      )}
    </button>
  );
}

export function EditableSelectCell({
  value,
  options,
  onSave,
  pillClassName,
}: {
  value: string;
  options: Option[];
  onSave: (value: string) => void;
  pillClassName?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <select
        autoFocus
        defaultValue={value}
        onBlur={() => setEditing(false)}
        onChange={(e) => {
          setEditing(false);
          onSave(e.target.value);
        }}
        className="w-full rounded border border-gray-300 bg-white px-1.5 py-1 text-sm outline-none ring-2 ring-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn("block w-full rounded px-1.5 py-1 text-left transition-default hover:bg-gray-50", pillClassName)}
    >
      {options.find((o) => o.value === value)?.label ?? value}
    </button>
  );
}
