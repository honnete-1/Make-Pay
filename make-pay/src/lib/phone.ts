import { z } from "zod";

/**
 * Rwandan MTN Mobile Money numbers: 078x / 079x, 10 digits locally,
 * or +250 7[89]x xxx xxx internationally.
 */
export function normalizeMsisdn(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("250") && digits.length === 12) return `0${digits.slice(3)}`;
  return digits;
}

export const msisdnSchema = z
  .string()
  .trim()
  .min(1, "empty") // codes, translated in the checkout UI
  .transform(normalizeMsisdn)
  .refine((v) => v.length === 10, "length")
  .refine((v) => /^07[89]/.test(v), "prefix");

export function formatMsisdn(v: string): string {
  const d = normalizeMsisdn(v).slice(0, 10);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
}

export function maskMsisdn(v: string): string {
  const d = normalizeMsisdn(v);
  if (d.length < 10) return d;
  return `${d.slice(0, 3)} ••• ${d.slice(7)}`;
}
