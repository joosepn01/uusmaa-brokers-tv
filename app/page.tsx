import { readData, type Broker } from "@/lib/store";
import LiveClock from "./components/LiveClock";
import Weather from "./components/Weather";
import PodiumCard from "./components/PodiumCard";
import YearlyList from "./components/YearlyList";

function previousMonthEt(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.toLocaleString("et-EE", { month: "long", year: "numeric" });
}
function currentYearEt(now = new Date()): string {
  return String(now.getFullYear());
}

export default async function Page() {
  const data = await readData();
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

  while (monthly.length < 3) monthly.push(data.brokers[monthly.length]);
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
          <header className="flex items-center justify-between" style={{ height: "5.6cqh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/um-logo.svg" alt="Uus Maa" style={{ height: "4.6cqh" }} />

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
                {currentYearEt()}
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
            {/* LEFT: podium */}
            <section className="col-span-8 flex flex-col" style={{ minHeight: 0 }}>
              {/* Stylized section heading */}
              <div className="relative flex flex-col items-center text-center">
                <span
                  className="font-mono uppercase text-accent-gold"
                  style={{ fontSize: "1.4cqh", letterSpacing: "0.6em", paddingLeft: "0.6em" }}
                >
                  Kuu top
                </span>
                <div className="relative mt-[0.6cqh] flex items-center gap-[1.4cqw]">
                  <span
                    aria-hidden
                    className="block"
                    style={{
                      width: "9cqw",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(231,195,106,0.75))",
                    }}
                  />
                  <h2
                    className="rank-digit rank-digit-gold font-display font-extralight tracking-[-0.03em] first-letter:uppercase"
                    style={{ fontSize: "7.4cqh", lineHeight: "0.9" }}
                  >
                    {previousMonthEt()}
                  </h2>
                  <span
                    aria-hidden
                    className="block"
                    style={{
                      width: "9cqw",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, rgba(231,195,106,0.75), transparent)",
                    }}
                  />
                </div>
              </div>

              {/* Podium - 1st / 2nd / 3rd left-to-right, top-aligned under heading */}
              <div
                className="mt-[4cqh] grid flex-1 grid-cols-12 items-start gap-[1cqw]"
                style={{ minHeight: 0 }}
              >
                <div className="col-span-4 h-[84%]">
                  <PodiumCard broker={first} rank={1} />
                </div>
                <div className="col-span-4 h-[84%]">
                  <PodiumCard broker={second} rank={2} />
                </div>
                <div className="col-span-4 h-[84%]">
                  <PodiumCard broker={third} rank={3} />
                </div>
              </div>
            </section>

            {/* RIGHT: Yearly list (header lives in top bar) */}
            <aside className="col-span-4 flex flex-col" style={{ minHeight: 0 }}>
              <YearlyList brokers={yearly} />
            </aside>
          </div>

          {/* Minimal utility footer */}
          <footer
            className="mt-[5cqh] flex items-center justify-between border-t border-white/10 pt-[2.2cqh]"
            style={{ height: "7.2cqh" }}
          >
            <Weather />

            <LiveClock />
          </footer>
        </div>
      </div>
    </main>
  );
}
