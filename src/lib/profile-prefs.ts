/** Session-local passenger preferences — no backend. */

export const PROFILE_PREFS_KEY = "make-pay-profile-v1";

export type ProfilePrefs = {
  displayName: string;
  phone: string;
  /** Prefer MTN MoMo for fare approval (demo hint only). */
  preferMomo: boolean;
  /** Trip / receipt reminders on this device (local flag). */
  notifications: boolean;
};

export const DEFAULT_PROFILE_PREFS: ProfilePrefs = {
  displayName: "",
  phone: "",
  preferMomo: true,
  notifications: true,
};

export function readProfilePrefs(): ProfilePrefs {
  if (typeof window === "undefined") return DEFAULT_PROFILE_PREFS;
  try {
    const raw = localStorage.getItem(PROFILE_PREFS_KEY);
    if (!raw) return DEFAULT_PROFILE_PREFS;
    const parsed = JSON.parse(raw) as Partial<ProfilePrefs>;
    return {
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      preferMomo: typeof parsed.preferMomo === "boolean" ? parsed.preferMomo : true,
      notifications: typeof parsed.notifications === "boolean" ? parsed.notifications : true,
    };
  } catch {
    return DEFAULT_PROFILE_PREFS;
  }
}

export function writeProfilePrefs(prefs: ProfilePrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(prefs));
}

export function clearProfilePrefs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_PREFS_KEY);
}
