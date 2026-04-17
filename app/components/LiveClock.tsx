"use client";
import { useEffect, useState } from "react";

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";
  const date = now
    ? now.toLocaleDateString("et-EE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="flex items-baseline gap-[0.9cqw] leading-none">
      <span
        className="font-display font-light tracking-tight text-white tabular-nums"
        style={{ fontSize: "3cqh" }}
      >
        {hh}:{mm}
      </span>
      <span
        className="font-display font-light tracking-tight text-white/35 tabular-nums"
        style={{ fontSize: "1.6cqh" }}
      >
        {ss}
      </span>
      <span
        className="font-mono uppercase tracking-[0.3em] text-white/50"
        style={{ fontSize: "1.2cqh" }}
      >
        {date}
      </span>
    </div>
  );
}
