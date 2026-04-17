import type { Broker } from "@/lib/store";

export default function AllBrokersStrip({ brokers }: { brokers: Broker[] }) {
  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex items-baseline justify-between">
        <div className="font-mono uppercase tracking-[0.4em] text-accent-sky" style={{ fontSize: "1.1cqh" }}>
          Kõik maaklerid
        </div>
        <div className="font-mono uppercase tracking-[0.3em] text-white/40" style={{ fontSize: "0.9cqh" }}>
          {brokers.length} maaklerit
        </div>
      </div>
      <div
        className="mt-[1cqh] grid flex-1 gap-[0.6cqw]"
        style={{ gridTemplateColumns: `repeat(${Math.min(brokers.length, 13)}, minmax(0, 1fr))`, minHeight: 0 }}
      >
        {brokers.map((b, i) => (
          <div
            key={b.id}
            className="group relative flex flex-col items-center overflow-hidden rounded-[1cqw] glass rise"
            style={{ animationDelay: `${900 + i * 50}ms`, padding: "0.8cqh 0.4cqw" }}
          >
            <div
              className="relative overflow-hidden rounded-full ring-1 ring-white/10"
              style={{ height: "6cqh", width: "6cqh" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={b.name} className="h-full w-full object-cover" />
            </div>
            <div
              className="mt-[0.6cqh] w-full truncate text-center font-display font-light leading-tight text-white"
              style={{ fontSize: "1.1cqh" }}
            >
              {b.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
