"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { setCustomFields } from "@/lib/actions";

export function CustomFieldsEditor({
  applicationId,
  initialFields,
}: {
  applicationId: string;
  initialFields: Record<string, string>;
}) {
  const [fields, setFields] = useState(initialFields);
  const [adding, setAdding] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  async function persist(next: Record<string, string>) {
    const previous = fields;
    setFields(next);
    try {
      await setCustomFields(applicationId, next);
    } catch {
      setFields(previous);
      toast.error("Couldn't save field");
    }
  }

  function handleAdd() {
    if (!key.trim()) return;
    persist({ ...fields, [key.trim()]: value.trim() });
    setKey("");
    setValue("");
    setAdding(false);
  }

  function handleRemove(k: string) {
    const next = { ...fields };
    delete next[k];
    persist(next);
  }

  const entries = Object.entries(fields);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#1a1a1a]">Custom Fields</h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-default hover:text-[#1a1a1a]"
        >
          <Plus size={14} />
          Add field
        </button>
      </div>

      {adding && (
        <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Field name"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-gray-400 sm:w-1/3"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-gray-400"
          />
          <button
            onClick={handleAdd}
            className="shrink-0 rounded-md bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-white transition-default hover:bg-black"
          >
            Add
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No custom fields yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map(([k, v]) => (
            <li
              key={k}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm"
            >
              <span className="text-gray-500">{k}</span>
              <span className="flex-1 truncate text-right text-[#1a1a1a]">{v}</span>
              <button
                onClick={() => handleRemove(k)}
                className="shrink-0 text-gray-300 transition-default hover:text-red-600"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
