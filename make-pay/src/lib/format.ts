const rwf = new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 });

export function formatRWF(n: number, withUnit = true): string {
  const s = rwf.format(Math.round(n));
  return withUnit ? `${s}\u00A0RWF` : s;
}

export function formatKm(km: number, digits = 1): string {
  return `${km.toFixed(digits)} km`;
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function formatMinutes(sec: number): string {
  const m = Math.max(1, Math.round(sec / 60));
  return `${m} min`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
  }).format(new Date(iso));
}

export function greeting(date = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Kigali" }).format(date));
  if (h < 12) return "Mwaramutse";
  if (h < 18) return "Mwiriwe";
  return "Muraho";
}
