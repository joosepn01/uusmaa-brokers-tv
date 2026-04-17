import type { Broker } from "@/lib/store";

export default function YearlyList({ brokers }: { brokers: Broker[] }) {
  return (
    <ol className="flex flex-1 flex-col gap-[0.6cqh] overflow-hidden" style={{ minHeight: 0 }}>
      {brokers.map((b, i) => {
        const rank = i + 1;
        const isTop = rank <= 3;
        return (
          <li
            key={b.id}
            className="group relative overflow-hidden rounded-[1cqw] glass rise"
            style={{ animationDelay: `${600 + i * 70}ms`, padding: "0.7cqh 0.8cqw" }}
          >
            <div className="flex items-center gap-[0.8cqw]">
              <div
                className={`flex shrink-0 items-center justify-center rounded-[0.7cqw] font-display font-light tabular-nums ${
                  isTop
                    ? rank === 1
                      ? "bg-gradient-to-br from-[#FFE69A] to-[#8D6A1F] text-black"
                      : rank === 2
                      ? "bg-gradient-to-br from-white/90 to-white/30 text-black"
                      : "bg-gradient-to-br from-[#F7BF8A] to-[#5F3817] text-white"
                    : "bg-white/5 text-white/70 ring-1 ring-white/10"
                }`}
                style={{ height: "3.6cqh", width: "3.6cqh", fontSize: "2.2cqh" }}
              >
                {rank}
              </div>
              <div
                className="relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/10"
                style={{ height: "4cqh", width: "4cqh" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.name} className="h-full w-full object-cover object-top" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="truncate font-display font-light leading-tight tracking-tight text-white"
                  style={{ fontSize: "1.8cqh" }}
                >
                  {b.name}
                </div>
              </div>
              <div
                className="font-mono uppercase tracking-[0.3em] text-white/30"
                style={{ fontSize: "0.8cqh" }}
              >
                #{String(rank).padStart(2, "0")}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
