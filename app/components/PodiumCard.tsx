import type { Broker } from "@/lib/store";

type Props = { broker: Broker; rank: 1 | 2 | 3 };

const META = {
  1: {
    digit: "rank-digit-gold",
    ring: "gold-border",
    imgPct: "82%",
    nameSize: "3.8cqh",
    digitSize: "12cqh",
    extra: "pulse-gold animate-floaty",
    accent: "from-accent-gold/30 via-accent-gold/10 to-transparent",
    badge: "bg-gradient-to-br from-[#FFE69A] to-[#8D6A1F] text-black",
    medal: "Esimene koht",
    delay: "400ms",
  },
  2: {
    digit: "rank-digit-silver",
    ring: "silver-border",
    imgPct: "78%",
    nameSize: "3.8cqh",
    digitSize: "10.5cqh",
    extra: "",
    accent: "from-white/20 via-white/5 to-transparent",
    badge: "bg-gradient-to-br from-white/90 to-white/40 text-black",
    medal: "Teine koht",
    delay: "200ms",
  },
  3: {
    digit: "rank-digit-bronze",
    ring: "bronze-border",
    imgPct: "76%",
    nameSize: "3.8cqh",
    digitSize: "9.5cqh",
    extra: "",
    accent: "from-[#E9A66E]/25 via-[#A0632A]/10 to-transparent",
    badge: "bg-gradient-to-br from-[#F7BF8A] to-[#5F3817] text-white",
    medal: "Kolmas koht",
    delay: "600ms",
  },
} as const;

export default function PodiumCard({ broker, rank }: Props) {
  const m = META[rank];
  return (
    <div
      className={`relative h-full w-full ${m.ring} glass-strong rounded-[2.4cqw] shine ${m.extra} rise overflow-hidden`}
      style={{ animationDelay: m.delay }}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[2.4cqw] bg-gradient-to-b ${m.accent}`}
      />

      <div className="relative grid h-full w-full" style={{ gridTemplateRows: "auto 1fr auto", padding: "1.8cqh 1.6cqw 2.6cqh" }}>
        {/* Top row: medal badge + small rank number */}
        <div className="flex items-center justify-between">
          <div
            className={`rank-digit ${m.digit} font-display leading-[1.1]`}
            style={{ fontSize: m.digitSize, paddingTop: "0.4cqh" }}
          >
            {rank}
          </div>
          <div
            className={`rounded-full font-mono uppercase tracking-[0.3em] ${m.badge}`}
            style={{ fontSize: "0.95cqh", padding: "0.5cqh 0.9cqw" }}
          >
            {m.medal}
          </div>
        </div>

        {/* Avatar (centered in remaining space) */}
        <div className="flex items-center justify-center" style={{ minHeight: 0 }}>
          <div
            className="relative aspect-square overflow-hidden rounded-full pop"
            style={{ width: m.imgPct, animationDelay: m.delay }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={broker.image}
              alt={broker.name}
              className="h-full w-full rounded-full object-cover object-top"
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
          </div>
        </div>

        {/* Identity */}
        <div className="mt-[3cqh] text-center">
          <div
            className="font-display font-light leading-[1.0] tracking-[-0.02em] text-white"
            style={{ fontSize: m.nameSize }}
          >
            {broker.name}
          </div>
        </div>
      </div>
    </div>
  );
}
