// Daily sync: scrape https://uusmaanord.ee/maaklerid/, merge any new
// brokers into data/brokers.json, refresh phone/email/image for existing
// ones. Designed to run from a GitHub Actions cron (no Next.js, no
// dependencies — just plain Node 20 fetch + regex).
//
// Usage:
//   node scripts/sync-brokers.mjs            # writes data/brokers.json
//   node scripts/sync-brokers.mjs --dry-run  # prints changes, writes nothing
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const SOURCE = "https://uusmaanord.ee/maaklerid/";
const ROOT = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const DATA_FILE = path.join(ROOT, "data", "brokers.json");
const DRY_RUN = process.argv.includes("--dry-run");

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function clean(s) {
  return decodeEntities(s).replace(/\s+/g, " ").trim();
}

/**
 * Parse the maaklerid page HTML into an array of brokers.
 * Splits at each `<a href="/maakler/{slug}">` and extracts the fields
 * that follow within the same card block.
 */
function parseBrokers(html) {
  const out = [];
  const seen = new Set();

  // Iterate over every link to /maakler/<slug>. Each broker card opens
  // with one such link wrapping the photo. The name + phone + email
  // appear within the same surrounding container, before the next card.
  const linkRe = /<a\s+href="\/maakler\/([a-z0-9-]+)\/?"\s*>/gi;
  const matches = [...html.matchAll(linkRe)];

  for (let i = 0; i < matches.length; i++) {
    const slug = matches[i][1];
    if (seen.has(slug)) continue; // each broker appears multiple times (photo + "more listings" links)

    const start = matches[i].index;
    // Scope: from this match to the next *different* slug, or end of page.
    let end = html.length;
    for (let j = i + 1; j < matches.length; j++) {
      if (matches[j][1] !== slug) {
        end = matches[j].index;
        break;
      }
    }
    const block = html.slice(start, end);

    // Name: first <h3 ...>...</h3> in the block
    const nameMatch = block.match(/<h3[^>]*>([^<]+)<\/h3>/i);
    if (!nameMatch) continue;
    const name = clean(nameMatch[1]);
    if (!name) continue;

    // Image: first <img src="..."> after the link
    const imgMatch = block.match(/<img[^>]*src="([^"]+)"/i);
    const image = imgMatch ? imgMatch[1] : "";

    // Title: first non-empty text-editor block after the h3
    let title = "";
    const afterName = block.slice(nameMatch.index + nameMatch[0].length);
    const titleMatch = afterName.match(
      /<div class="elementor-widget-container">\s*([^<]+?)\s*<\/div>/i
    );
    if (titleMatch) title = clean(titleMatch[1]);

    // Phone: tel:+... — the source has malformed `<a style="href="tel:...">`,
    // so just match the tel: URI directly.
    const phoneMatch = block.match(/tel:(\+?\d[\d ]*)/i);
    const phone = phoneMatch ? phoneMatch[1].trim() : "";

    // Email: mailto:...
    const emailMatch = block.match(/mailto:([^"' >]+)/i);
    const email = emailMatch ? emailMatch[1].trim() : "";

    seen.add(slug);
    out.push({ id: slug, name, title, phone, email, image });
  }

  return out;
}

function brokerEqual(a, b) {
  return (
    a.name === b.name &&
    a.title === b.title &&
    a.phone === b.phone &&
    a.email === b.email &&
    a.image === b.image
  );
}

// Compare two phone strings ignoring whitespace differences. The source
// page returns phones like `+3725020705` while the office may format
// them as `+372 5020 705`; we treat those as the same number.
function samePhone(a, b) {
  return (a || "").replace(/\s+/g, "") === (b || "").replace(/\s+/g, "");
}

async function main() {
  console.log(`[sync] fetching ${SOURCE}`);
  const res = await fetch(SOURCE, {
    headers: {
      "User-Agent":
        "uusmaa-brokers-tv-sync (+https://github.com/joosepn01/uusmaa-brokers-tv)",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${SOURCE}`);
  }
  const html = await res.text();
  const scraped = parseBrokers(html);
  console.log(`[sync] parsed ${scraped.length} brokers from page`);
  if (scraped.length === 0) {
    console.error("[sync] no brokers parsed — refusing to write empty list");
    process.exit(1);
  }

  const raw = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  const existing = new Map(data.brokers.map((b) => [b.id, b]));

  let added = 0;
  let updated = 0;
  const updatedBrokers = [];

  // Walk existing brokers in original order, refreshing fields from scrape
  // when the broker still exists on the source page.
  for (const b of data.brokers) {
    const fresh = scraped.find((s) => s.id === b.id);
    if (fresh) {
      // Preserve the original `title` if the office wrote a custom one
      // and the source title is generic (heuristic: keep existing title
      // unless the existing one is empty).
      const merged = {
        ...b,
        name: fresh.name || b.name,
        // Keep local phone formatting if the digits haven't actually
        // changed — avoids cosmetic churn in daily diffs.
        phone: samePhone(b.phone, fresh.phone) ? b.phone : (fresh.phone || b.phone),
        email: fresh.email || b.email,
        image: fresh.image || b.image,
        title: b.title || fresh.title,
      };
      if (!brokerEqual(b, merged)) updated++;
      updatedBrokers.push(merged);
    } else {
      // Keep the broker even if not on the source page — could be
      // temporarily delisted; admin can remove manually.
      updatedBrokers.push(b);
    }
  }

  // Append brokers that are on the source but not in our list.
  const newIds = [];
  for (const s of scraped) {
    if (!existing.has(s.id)) {
      updatedBrokers.push(s);
      newIds.push(s.id);
      added++;
    }
  }

  // New brokers go to the bottom of the yearly list, never the podium.
  const yearlySet = new Set(data.yearlyTop);
  const newYearly = [...data.yearlyTop];
  for (const id of newIds) {
    if (!yearlySet.has(id)) newYearly.push(id);
  }

  // Diff brokers + yearly only — lastSyncedAt is bumped only if there's
  // a real content change so we don't rebuild Cloudflare every day for
  // nothing.
  const beforeContent = JSON.stringify({
    brokers: data.brokers,
    yearlyTop: data.yearlyTop,
  });
  const afterContent = JSON.stringify({
    brokers: updatedBrokers,
    yearlyTop: newYearly,
  });
  const changed = beforeContent !== afterContent;

  const next = {
    ...data,
    brokers: updatedBrokers,
    yearlyTop: newYearly,
    ...(changed ? { lastSyncedAt: new Date().toISOString() } : {}),
  };

  console.log(
    `[sync] added=${added} updated=${updated} total=${updatedBrokers.length} changed=${changed}`
  );
  if (added > 0) console.log(`[sync] new broker ids: ${newIds.join(", ")}`);

  if (DRY_RUN) {
    console.log("[sync] dry run — not writing");
    return;
  }

  if (!changed) {
    // Skip writing entirely so nothing shows up in `git status` and the
    // Action's commit step has nothing to do. lastSyncedAt is only
    // updated when there's a real change.
    console.log("[sync] no changes — skipping write");
    return;
  }

  await fs.writeFile(DATA_FILE, after + "\n", "utf8");
  console.log(`[sync] wrote ${DATA_FILE}`);
}

main().catch((err) => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
