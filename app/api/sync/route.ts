import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";
import { scrapeBrokers, mergeBrokers } from "@/lib/scraper";

// Forces a fresh scrape of uusmaanord.ee/maaklerid and merges the
// result into data/brokers.json. New brokers are appended to the
// bottom of yearlyTop. Existing rankings are preserved.
export const dynamic = "force-dynamic";

async function runSync() {
  const scraped = await scrapeBrokers();
  const current = await readData();
  const { brokers, added } = mergeBrokers(current.brokers, scraped);
  const existingYearly = new Set(current.yearlyTop);
  const yearlyTop = [
    ...current.yearlyTop,
    ...added.filter((id) => !existingYearly.has(id)),
  ];
  await writeData({
    ...current,
    brokers,
    yearlyTop,
    lastSyncedAt: new Date().toISOString(),
  });
  return { scraped: scraped.length, added };
}

export async function POST() {
  try {
    const result = await runSync();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Allow GET too so you can hit it from a browser or simple cron.
export const GET = POST;
