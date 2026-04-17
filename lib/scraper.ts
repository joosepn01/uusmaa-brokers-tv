/**
 * Scrapes the Uus Maa Nord broker list from the public website.
 * Pure regex-based (no cheerio dependency) so it works out of the box.
 *
 * Source: https://uusmaanord.ee/maaklerid/
 *
 * The broker listing uses cards that roughly follow this structure:
 *   <a href="/maaklerid/<slug>/">...<img src="<image>" alt="<name>">...
 *     <h[2-4]>Name</h[2-4]>
 *     <div>...Title...</div>
 *     <a href="tel:...">...</a>
 *     <a href="mailto:...">...</a>
 *   </a>
 *
 * We extract each <a> block whose href contains /maaklerid/<slug>/ (not
 * the index itself), then sniff name, image, title, phone and email out
 * of it with tolerant regexes. If the markup changes on the site we
 * fall back to only the fields we can find.
 */

import type { Broker } from "./store";

export type ScrapedBroker = {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  image: string;
};

const LIST_URL = "https://uusmaanord.ee/maaklerid/";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/õ/g, "o")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

export async function scrapeBrokers(): Promise<ScrapedBroker[]> {
  const res = await fetch(LIST_URL, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; UusMaaNordTV/1.0; +uusmaanord.ee)",
    },
  });
  if (!res.ok) throw new Error(`Broker list fetch failed: ${res.status}`);
  const html = await res.text();

  // Grab anchor blocks that link to an individual broker page.
  // Match <a ... href="...maaklerid/<slug>/"...>...</a> non-greedy.
  const cardRe =
    /<a\b[^>]*\bhref=["'][^"']*\/maaklerid\/([a-z0-9\-]+)\/["'][^>]*>([\s\S]*?)<\/a>/gi;

  const byId = new Map<string, ScrapedBroker>();
  let match: RegExpExecArray | null;
  while ((match = cardRe.exec(html)) !== null) {
    const slugFromHref = match[1];
    const inner = match[2];

    // Skip empty/nav anchors
    if (!/<img|<h[1-6]/i.test(inner)) continue;

    const imgMatch = inner.match(
      /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*(?:\balt=["']([^"']*)["'])?/i
    );
    const altMatch =
      imgMatch?.[2] ??
      inner.match(/<img\b[^>]*\balt=["']([^"']+)["']/i)?.[1] ??
      "";

    const headingMatch = inner.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const name = stripTags(headingMatch?.[1] ?? altMatch ?? "");

    if (!name) continue;

    // Title: first non-heading text block under the heading.
    let title = "";
    if (headingMatch) {
      const rest = inner.slice(
        (headingMatch.index ?? 0) + headingMatch[0].length
      );
      const titleMatch =
        rest.match(/<(?:p|div|span)[^>]*>([\s\S]*?)<\/(?:p|div|span)>/i);
      if (titleMatch) title = stripTags(titleMatch[1]);
    }

    const phoneMatch = inner.match(/href=["']tel:([^"']+)["']/i);
    const emailMatch = inner.match(/href=["']mailto:([^"']+)["']/i);

    const image = imgMatch?.[1] ?? "";
    const id = slugFromHref || slugify(name);

    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name,
        title,
        phone: phoneMatch ? decodeEntities(phoneMatch[1]).replace(/\s+/g, " ").trim() : "",
        email: emailMatch ? decodeEntities(emailMatch[1]).trim() : "",
        image,
      });
    }
  }

  return [...byId.values()];
}

/**
 * Merge scraped brokers into the existing broker list:
 *  - existing entries are updated in-place (name/title/phone/email/image refreshed)
 *  - new entries are appended to the end
 *  - deletions on the site are NOT removed locally — we don't want
 *    manual ranking picks to evaporate if the site briefly omits someone
 *
 * Returns the merged list and the list of newly-discovered broker IDs.
 */
export function mergeBrokers(
  existing: Broker[],
  scraped: ScrapedBroker[]
): { brokers: Broker[]; added: string[] } {
  const byId = new Map(existing.map((b) => [b.id, { ...b }]));
  const added: string[] = [];

  for (const s of scraped) {
    const prev = byId.get(s.id);
    if (prev) {
      byId.set(s.id, {
        ...prev,
        name: s.name || prev.name,
        title: s.title || prev.title,
        phone: s.phone || prev.phone,
        email: s.email || prev.email,
        image: s.image || prev.image,
      });
    } else {
      byId.set(s.id, { ...s });
      added.push(s.id);
    }
  }

  // Preserve original order; append new IDs at the end.
  const merged: Broker[] = [
    ...existing.map((b) => byId.get(b.id)!).filter(Boolean),
    ...added.map((id) => byId.get(id)!).filter(Boolean),
  ];
  return { brokers: merged, added };
}
