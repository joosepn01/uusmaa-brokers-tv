"use client";
import { useEffect, useState } from "react";

type WX = { temp: number; code: number } | null;

function codeToIcon(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀", label: "Selge" };
  if (code <= 3) return { icon: "⛅", label: "Vahelduv pilvisus" };
  if (code <= 48) return { icon: "🌫", label: "Udu" };
  if (code <= 57) return { icon: "🌦", label: "Uduvihm" };
  if (code <= 67) return { icon: "🌧", label: "Vihm" };
  if (code <= 77) return { icon: "❄", label: "Lumi" };
  if (code <= 82) return { icon: "🌧", label: "Hoovihm" };
  if (code <= 86) return { icon: "🌨", label: "Lumehoog" };
  if (code <= 99) return { icon: "⛈", label: "Äike" };
  return { icon: "·", label: "" };
}

export default function Weather() {
  const [wx, setWx] = useState<WX>(null);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const r = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=59.437&longitude=24.7535&current=temperature_2m,weather_code&timezone=Europe%2FHelsinki",
          { cache: "no-store" }
        );
        const j = await r.json();
        if (canceled) return;
        setWx({
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
        });
      } catch {
        /* ignore */
      }
    }
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => {
      canceled = true;
      clearInterval(id);
    };
  }, []);

  const meta = codeToIcon(wx?.code ?? -1);

  return (
    <div className="flex items-center gap-[0.9cqw] leading-none">
      <span style={{ fontSize: "3.4cqh", lineHeight: 1 }}>{meta.icon}</span>
      <span
        className="font-display font-light text-white tabular-nums"
        style={{ fontSize: "2.8cqh" }}
      >
        {wx ? `${wx.temp}°` : "—"}
      </span>
      <span
        className="font-mono uppercase tracking-[0.3em] text-white/50"
        style={{ fontSize: "1.2cqh" }}
      >
        Tallinn · {meta.label || "—"}
      </span>
    </div>
  );
}
