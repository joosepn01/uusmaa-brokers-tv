"use client";
import { useEffect, useState } from "react";
import type { Broker, Data } from "@/lib/store";
import LiveClock from "./LiveClock";
import Weather from "./Weather";
import PodiumCard from "./PodiumCard";
import YearlyList from "./YearlyList";
import ThemeToggle from "./ThemeToggle";

type Props = {
  initialData: Data;
  initialLabels: { month: string; year: string };
};

function previousMonthEt(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toLocaleString("et-EE", { month: "long", year: "numeric" });
}
function currentYearEt(now = new Date()): string {
  return String(now.getFullYear());
}

const POLL_MS = 20_000;

export default function Board({ initialData, initialLabels }: Props) {
  const [data, setData] = useState<Data>(initialData);
  const [labels, setLabels] = useState(initialLabels);

  // Re-derive month/year on the client so the heading stays current
  // even if the build is days old. Initial state matches what the
  // server rendered, so no hydration mismatch.
  useEffect(() => {
    const refresh = () =>
      setLabels({ month: previousMonthEt(), year: currentYearEt() });
    refresh();
    const id = setInterval(refresh, 60 * 60 * 1000); // hourly
    return () => clearInterval(id);
  }, []);

  // Poll /api/rankings for live updates. The brokers master list comes
  // from the static build (refreshed daily by the GitHub Action); only
  // the ranking arrays come from KV.
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetch("/api/rankings", { cache: "no-store" });
        if (!r.ok) return;
        const live = (await r.json()) as
          | { monthlyTop?: string[]; yearlyTop?: string[] }
          | null;
        if (cancelled || !live) return;
        if (
          Array.isArray(live.monthlyTop) &&
          Array.isArray(live.yearlyTop)
        ) {
          setData((d) => {
            // Avoid an unnecessary re-render if nothing actually changed.
            if (
              JSON.stringify(d.monthlyTop) === JSON.stringify(live.monthlyTop) &&
              JSON.stringify(d.yearlyTop) === JSON.stringify(live.yearlyTop)
            ) {
              return d;
            }
            return {
              ...d,
              monthlyTop: live.monthlyTop!,
              yearlyTop: live.yearlyTop!,
            };
          });
        }
      } catch {
        // Network blips silently fall back to current state.
      }
    }
    void tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const byId = new Map(data.brokers.map((b) => [b.id, b] as const));
  const monthly: Broker[] = data.monthlyTop
    .map((id) => byId.get(id))
    .filter((b): b is Broker => !!b);
  const orderedYearly: Broker[] = data.yearlyTop
    .map((id) => byId.get(id))
    .filter((b): b is Broker => !!b);
  const inYearly = new Set(orderedYearly.map((b) => b.id));
  const yearly: Broker[] = [
    ...orderedYearly,
    ...data.brokers.filter((b) => !inYearly.has(b.id)),
  ];

  // Pad the podium to 3 with brokers not already on it, so removing a
  // broker in /admin never leaves a slot empty (which would crash
  // PodiumCard on the `broker.name` access).
  const shownInMonthly = new Set(monthly.map((b) => b.id));
  for (const b of data.brokers) {
    if (monthly.length >= 3) break;
    if (!shownInMonthly.has(b.id)) {
      monthly.push(b);
      shownInMonthly.add(b.id);
    }
  }
  const [first, second, third] = monthly;

  return (
    <main className="stage-outer">
      <div className="stage">
        <div className="aurora" />
        <div className="noise" />

        <div
          className="relative z-10 flex h-full w-full flex-col"
          style={{ padding: "2.4cqh 2.6cqw" }}
        >
          {/* Top bar: logo + yearly heading */}
          <header
            className="flex items-center justify-between"
            style={{ height: "5.6cqh" }}
          >
            <div className="relative" style={{ height: "4.6cqh" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/um-logo.svg"
                alt="Uus Maa"
                className="logo-on-dark"
                style={{ height: "4.6cqh" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/um-logo-dark.svg"
                alt="Uus Maa"
                className="logo-on-light"
                style={{ height: "4.6cqh" }}
              />
            </div>

            <div className="flex items-baseline gap-[1cqw] leading-none">
              <span
                className="font-mono uppercase tracking-[0.42em] text-accent-iris"
                style={{ fontSize: "1.2cqh" }}
              >
                Aasta algusest
              </span>
              <span
                className="font-display font-light tracking-tight text-white tabular-nums"
                style={{ fontSize: "3cqh" }}
              >
                {labels.year}
              </span>
              <span
                className="font-mono uppercase tracking-[0.3em] text-white/40"
                style={{ fontSize: "0.95cqh" }}
              >
                · Top {yearly.length}
              </span>
            </div>
          </header>

          {/* Content grid */}
          <div
            className="mt-[3.6cqh] grid flex-1 grid-cols-12 gap-[1.8cqw]"
            style={{ minHeight: 0 }}
          >
            <section
              className="col-span-8 flex flex-col"
              style={{ minHeight: 0 }}
            >
              <div className="relative flex flex-col items-center text-center">
                <span
                  className="font-mono uppercase text-accent-gold"
                  style={{
                    fontSize: "1.4cqh",
                    letterSpacing: "0.6em",
                    paddingLeft: "0.6em",
                  }}
                >
                  Kuu top
                </span>
                <div className="relative mt-[0.6cqh] flex items-center gap-[1.4cqw]">
                  <span
                    aria-hidden
                    className="heading-rule block"
                    style={{ width: "9cqw", height: "1px" }}
                  />
                  <h2
                    className="month-heading font-display font-extralight tracking-[-0.03em] first-letter:uppercase"
                    style={{ fontSize: "7.4cqh", lineHeight: "0.9" }}
                  >
                    {labels.month}
                  </h2>
                  <span
                    aria-hidden
                    className="heading-rule is-right block"
                    style={{ width: "9cqw", height: "1px" }}
                  />
                </div>
              </div>

              <div
                className="mt-[4cqh] grid flex-1 grid-cols-12 items-start gap-[1cqw]"
                style={{ minHeight: 0 }}
              >
                <div className="col-span-4 h-[84%]">
                  {first ? <PodiumCard broker={first} rank={1} /> : null}
                </div>
                <div className="col-span-4 h-[84%]">
                  {second ? <PodiumCard broker={second} rank={2} /> : null}
                </div>
                <div className="col-span-4 h-[84%]">
                  {third ? <PodiumCard broker={third} rank={3} /> : null}
                </div>
              </div>
            </section>

            <aside
              className="col-span-4 flex flex-col"
              style={{ minHeight: 0 }}
            >
              <YearlyList brokers={yearly} />
            </aside>
          </div>

          <footer
            className="mt-[5cqh] flex items-center justify-between border-t border-white/10 pt-[2.2cqh]"
            style={{ height: "7.2cqh" }}
          >
            <Weather />
            <div className="flex items-center gap-[1.4cqw]">
              <LiveClock />
              <ThemeToggle />
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
