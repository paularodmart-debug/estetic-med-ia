import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock } from "lucide-react";
import { treatments, euro } from "@/lib/clinic";

export const Route = createFileRoute("/tratamientos")({
  head: () => ({
    meta: [
      { title: "Tratamientos — Estetic Med IA" },
      { name: "description", content: "Toxina botulínica, ácido hialurónico, láser, mesoterapia y más. Precios y duración." },
      { property: "og:title", content: "Tratamientos — Estetic Med IA" },
      { property: "og:description", content: "Descubre nuestros tratamientos faciales, corporales y láser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const cats = ["Todos", "Facial", "Corporal", "Láser", "Bienestar"] as const;

function Page() {
  const [cat, setCat] = useState<(typeof cats)[number]>("Todos");
  const list = cat === "Todos" ? treatments : treatments.filter((t) => t.category === cat);
  return (
    <main className="mx-auto max-w-6xl px-5 pt-14">
      <h1 className="text-5xl md:text-6xl">Tratamientos</h1>
      <p className="mt-3 max-w-lg text-muted-foreground">Precios orientativos. El plan definitivo se define en tu valoración médica.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${cat === c ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:bg-accent"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {list.map((t) => (
          <article key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary">{t.category}</p>
                <h2 className="mt-1 text-3xl">{t.name}</h2>
              </div>
              <p className="whitespace-nowrap text-lg font-semibold">{euro(t.price)}</p>
            </div>
            <p className="mt-3 flex-1 text-muted-foreground">{t.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="size-4" /> {t.duration} min</span>
              <Link to="/reservar" search={{ t: t.id }} className="rounded-full bg-ink px-5 py-2 text-sm text-ink-foreground hover:bg-ink/85">Reservar</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
