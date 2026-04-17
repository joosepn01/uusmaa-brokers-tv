import type { Broker } from "@/lib/store";

export default function Ticker({ brokers }: { brokers: Broker[] }) {
  const items = [...brokers, ...brokers];
  return (
    <div className="mt-[1.4vh] overflow-hidden rounded-full glass" style={{ padding: "1vh 0" }}>
      <div className="ticker flex w-max items-center gap-[2.2vw] whitespace-nowrap">
        {items.map((b, i) => (
          <div key={`${b.id}-${i}`} className="flex items-center gap-[0.5vw]">
            <span className="inline-block rounded-full bg-accent-gold/70" style={{ height: "0.5vh", width: "0.5vh" }} />
            <span className="font-display font-light text-white/80" style={{ fontSize: "1.5vh" }}>{b.name}</span>
            <span className="font-mono uppercase tracking-[0.25em] text-white/35" style={{ fontSize: "1vh" }}>{b.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
