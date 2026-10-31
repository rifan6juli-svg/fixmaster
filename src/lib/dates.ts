const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Whole days left, counting a part of a day as one. */
export function daysUntil(date: Date, now = new Date()) {
  return Math.ceil((date.getTime() - now.getTime()) / DAY_IN_MS);
}

/** "30 Okt 2026, 14.05" in the shop's time zone (PRD section 7). */
export function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(date);
}
