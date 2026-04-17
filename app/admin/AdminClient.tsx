"use client";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Broker, Data } from "@/lib/store";

function SortableRow({
  broker,
  rank,
  onRemove,
  accent,
}: {
  broker: Broker;
  rank: number;
  onRemove?: () => void;
  accent?: "gold" | "silver" | "bronze" | "default";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: broker.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const badge =
    accent === "gold"
      ? "bg-gradient-to-br from-[#FFE69A] to-[#8D6A1F] text-black"
      : accent === "silver"
      ? "bg-gradient-to-br from-white/90 to-white/30 text-black"
      : accent === "bronze"
      ? "bg-gradient-to-br from-[#F7BF8A] to-[#5F3817] text-white"
      : "bg-white/5 text-white/70 ring-1 ring-white/10";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-4 rounded-2xl glass px-4 py-3 transition-transform hover:-translate-y-0.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg text-white/40 hover:text-white/90 active:cursor-grabbing"
        aria-label="Drag"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl font-display text-[22px] font-light tabular-nums ${badge}`}
      >
        {rank}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={broker.image}
        alt={broker.name}
        className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[18px] font-light leading-tight text-white">
          {broker.name}
        </div>
        <div className="truncate font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          {broker.title}
        </div>
      </div>
      {onRemove ? (
        <button
          onClick={onRemove}
          className="rounded-full bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:bg-accent-coral/20 hover:text-accent-coral"
        >
          Eemalda
        </button>
      ) : null}
    </div>
  );
}

export default function AdminClient({ initial }: { initial: Data }) {
  const [brokers] = useState<Broker[]>(initial.brokers);
  const [monthly, setMonthly] = useState<string[]>(initial.monthlyTop);
  const [yearly, setYearly] = useState<string[]>(initial.yearlyTop);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"idle" | "ok" | "err">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("admin");
    return () => document.documentElement.classList.remove("admin");
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const byId = useMemo(() => new Map(brokers.map((b) => [b.id, b])), [brokers]);
  const available = useMemo(
    () => brokers.filter((b) => !yearly.includes(b.id)),
    [brokers, yearly]
  );

  function onMonthlyEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setMonthly((ids) =>
      arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    );
  }
  function onYearlyEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setYearly((ids) =>
      arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    );
  }

  async function save() {
    // Static-export friendly: download a brokers.json the user can commit
    // to the repo. Cloudflare Pages rebuilds automatically on push.
    setSaving(true);
    setSaved("idle");
    try {
      const next: Data = {
        ...initial,
        brokers,
        monthlyTop: monthly,
        yearlyTop: yearly,
      };
      const blob = new Blob([JSON.stringify(next, null, 2) + "\n"], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "brokers.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSaved("ok");
      setTimeout(() => setSaved("idle"), 2500);
    } catch {
      setSaved("err");
    } finally {
      setSaving(false);
    }
  }

  function addToMonthly(id: string) {
    if (monthly.includes(id)) return;
    if (monthly.length >= 3) return;
    setMonthly((m) => [...m, id]);
  }
  function removeFromMonthly(id: string) {
    setMonthly((m) => m.filter((x) => x !== id));
  }
  function addToYearly(id: string) {
    if (yearly.includes(id)) return;
    setYearly((y) => [...y, id]);
  }
  function removeFromYearly(id: string) {
    setYearly((y) => y.filter((x) => x !== id));
  }

  return (
    <main className="relative min-h-screen w-full pb-24">
      <div className="aurora" />
      <div className="noise" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-8 py-10">
        <header className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[12px] uppercase tracking-[0.4em] text-white/50">
              Admin
            </div>
            <h1 className="mt-2 font-display text-[40px] font-light tracking-tight text-white">
              Maaklerite edetabel
            </h1>
            <p className="mt-2 text-[14px] text-white/55">
              Lohista muutmaks järjekorda. Kuu poodiumil on täpselt 3 kohta. Salvestamine laeb alla
              uue <code className="font-mono text-accent-gold">brokers.json</code> faili — aseta see
              repo <code className="font-mono text-accent-gold">data/</code> kausta ja pushi
              GitHubi, Cloudflare Pages uuendab ekraani automaatselt.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="rounded-full glass px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-white/70 hover:text-white"
            >
              Ava ekraan ↗
            </a>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-white px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-black disabled:opacity-60"
            >
              {saving ? "Laen alla…" : saved === "ok" ? "Fail alla laetud ✓" : saved === "err" ? "Viga" : "Lae alla JSON"}
            </button>
          </div>
        </header>

        {mounted ? (
          <div className="mt-10 grid grid-cols-12 gap-6">
            <section className="col-span-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-[22px] font-light text-white">
                  Kuu poodium <span className="text-white/40">· Top 3</span>
                </h2>
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                  {monthly.length}/3
                </div>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onMonthlyEnd}>
                <SortableContext items={monthly} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2.5">
                    {monthly.map((id, i) => {
                      const b = byId.get(id);
                      if (!b) return null;
                      return (
                        <SortableRow
                          key={id}
                          broker={b}
                          rank={i + 1}
                          accent={i === 0 ? "gold" : i === 1 ? "silver" : "bronze"}
                          onRemove={() => removeFromMonthly(id)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {monthly.length < 3 ? (
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                    Lisa poodiumile
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brokers
                      .filter((b) => !monthly.includes(b.id))
                      .map((b) => (
                        <button
                          key={b.id}
                          onClick={() => addToMonthly(b.id)}
                          className="rounded-full glass px-3.5 py-1.5 text-[12px] text-white/80 hover:text-white"
                        >
                          + {b.name}
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="col-span-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-[22px] font-light text-white">
                  Aasta algusest <span className="text-white/40">· Edetabel</span>
                </h2>
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                  {yearly.length} maaklerit
                </div>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onYearlyEnd}>
                <SortableContext items={yearly} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2.5">
                    {yearly.map((id, i) => {
                      const b = byId.get(id);
                      if (!b) return null;
                      return (
                        <SortableRow
                          key={id}
                          broker={b}
                          rank={i + 1}
                          accent={i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "default"}
                          onRemove={() => removeFromYearly(id)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {available.length > 0 ? (
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                    Lisa aasta edetabelisse
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {available.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => addToYearly(b.id)}
                        className="rounded-full glass px-3.5 py-1.5 text-[12px] text-white/80 hover:text-white"
                      >
                        + {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : (
          <div className="mt-16 text-center font-mono text-[12px] uppercase tracking-[0.3em] text-white/40">
            Loading…
          </div>
        )}
      </div>
    </main>
  );
}
