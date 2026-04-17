import { promises as fs } from "fs";
import path from "path";

export type Broker = {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  image: string;
};

export type Data = {
  brokers: Broker[];
  monthlyTop: string[];
  yearlyTop: string[];
  lastSyncedAt?: string;
};

const FILE = path.join(process.cwd(), "data", "brokers.json");

export async function readData(): Promise<Data> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as Data;
  } catch {
    // File missing (first deploy, Vercel cold-start, etc.) —
    // return a safe empty shell so the page never crashes.
    return { brokers: [], monthlyTop: [], yearlyTop: [] };
  }
}

export async function writeData(data: Data): Promise<void> {
  try {
    await fs.writeFile(FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
  } catch {
    // Vercel / read-only filesystems — writes are a no-op.
    // On a real VPS the write always succeeds.
    // eslint-disable-next-line no-console
    console.warn("[brokers-tv] writeData: filesystem is read-only, skipping write.");
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Trigger a background sync if the last sync is older than 24h.
 * Never blocks the caller — errors are swallowed and logged.
 * Safe to call from `readData`-driven server components.
 */
export function ensureDailySync(data: Data): void {
  const last = data.lastSyncedAt ? Date.parse(data.lastSyncedAt) : 0;
  if (Number.isFinite(last) && Date.now() - last < DAY_MS) return;

  // Avoid kicking off more than one sync concurrently.
  const g = globalThis as typeof globalThis & { __umSyncInFlight?: boolean };
  if (g.__umSyncInFlight) return;
  g.__umSyncInFlight = true;

  // Fire-and-forget — import lazily so request handlers don't pay for it.
  (async () => {
    try {
      const { scrapeBrokers, mergeBrokers } = await import("./scraper");
      const scraped = await scrapeBrokers();
      if (scraped.length === 0) return;
      const current = await readData();
      const { brokers, added } = mergeBrokers(current.brokers, scraped);
      const existingYearly = new Set(current.yearlyTop);
      const yearlyTop = [
        ...current.yearlyTop,
        // New brokers go to the bottom of the yearly list.
        ...added.filter((id) => !existingYearly.has(id)),
      ];
      await writeData({
        ...current,
        brokers,
        yearlyTop,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[brokers-tv] daily sync failed:", err);
    } finally {
      g.__umSyncInFlight = false;
    }
  })();
}

export function previousMonthLabel(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function currentYearLabel(now = new Date()): string {
  return String(now.getFullYear());
}
