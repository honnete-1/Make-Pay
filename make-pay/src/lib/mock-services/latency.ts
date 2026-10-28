/**
 * Simulated network latency so loading states are visible and honest.
 * Kept short so the demo stays snappy on slow devices.
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/** Small deterministic string hash (FNV-1a) used for stable demo ids. */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function stableCode(input: string, length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let n = hash(input);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) ^ hash(out + input);
    n >>>= 0;
  }
  return out;
}
