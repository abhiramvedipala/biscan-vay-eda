import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, isPast, isToday, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined, pattern = "MMM d, yyyy") {
  if (!date) return "—";
  try {
    return format(parseISO(date), pattern);
  } catch {
    return date;
  }
}

export function daysSince(date: string | null | undefined) {
  if (!date) return null;
  try {
    return differenceInCalendarDays(new Date(), parseISO(date));
  } catch {
    return null;
  }
}

export function isOverdue(date: string | null | undefined) {
  if (!date) return false;
  try {
    const parsed = parseISO(date);
    return isPast(parsed) && !isToday(parsed);
  } catch {
    return false;
  }
}

export function isDueToday(date: string | null | undefined) {
  if (!date) return false;
  try {
    return isToday(parseISO(date));
  } catch {
    return false;
  }
}

export function addDaysToDateString(date: string, days: number) {
  const parsed = parseISO(date);
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
