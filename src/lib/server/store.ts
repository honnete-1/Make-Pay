import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { PaymentResult, Receipt, Trip, TripSummary } from "@/types";
import { SEED_HISTORY } from "@/lib/mock-services/receipt.mock";

export const SEED_SESSION = "seed";

export type StoredTrip = Trip & { sessionId: string; summary?: TripSummary };
export type StoredReceipt = Receipt & { sessionId: string };
export type StoredPayment = PaymentResult & { sessionId: string; tripId: string };

interface StoreFile {
  trips: StoredTrip[];
  receipts: StoredReceipt[];
  payments: StoredPayment[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memory: StoreFile | null = null;

function seedReceipts(): StoredReceipt[] {
  return SEED_HISTORY.map((r) => ({ ...r, sessionId: SEED_SESSION }));
}

function emptyStore(): StoreFile {
  return { trips: [], receipts: seedReceipts(), payments: [] };
}

function load(): StoreFile {
  if (memory) return memory;
  try {
    if (existsSync(STORE_PATH)) {
      memory = JSON.parse(readFileSync(STORE_PATH, "utf8")) as StoreFile;
      return memory;
    }
  } catch {
    /* corrupt file — reseat */
  }
  memory = emptyStore();
  persist();
  return memory;
}

function persist() {
  if (!memory) return;
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(memory, null, 2), "utf8");
}

export function listReceipts(sessionId: string): Receipt[] {
  const store = load();
  return store.receipts
    .filter((r) => r.sessionId === sessionId || r.sessionId === SEED_SESSION)
    .map(({ sessionId: _s, ...r }) => r)
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
}

export function addReceipt(sessionId: string, receipt: Receipt): Receipt {
  const store = load();
  store.receipts = [{ ...receipt, sessionId }, ...store.receipts.filter((r) => r.id !== receipt.id)];
  persist();
  return receipt;
}

export function clearReceipts(sessionId: string) {
  const store = load();
  store.receipts = store.receipts.filter((r) => r.sessionId !== sessionId);
  persist();
}

export function saveTrip(sessionId: string, trip: Trip, summary?: TripSummary): Trip & { summary?: TripSummary } {
  const store = load();
  const row: StoredTrip = { ...trip, sessionId, summary };
  const i = store.trips.findIndex((t) => t.id === trip.id && t.sessionId === sessionId);
  if (i >= 0) store.trips[i] = row;
  else store.trips.unshift(row);
  persist();
  return toPublicTrip(row);
}

export function toPublicTrip(row: StoredTrip): Trip & { summary?: TripSummary } {
  const { sessionId: _s, ...rest } = row;
  return rest;
}

export function getTrip(sessionId: string, id: string): StoredTrip | undefined {
  return load().trips.find((t) => t.id === id && t.sessionId === sessionId);
}

export function savePayment(sessionId: string, tripId: string, result: PaymentResult): StoredPayment {
  const store = load();
  const row: StoredPayment = { ...result, sessionId, tripId };
  store.payments = [row, ...store.payments.filter((p) => p.reference !== result.reference)];
  persist();
  return row;
}

export function getPayment(sessionId: string, reference: string): StoredPayment | undefined {
  return load().payments.find((p) => p.reference === reference && p.sessionId === sessionId);
}
