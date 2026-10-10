import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { treatments, team, euro } from "@/lib/clinic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estetic Med IA — Clínica de medicina estética" },
      { name: "description", content: "Tratamientos faciales, corporales y láser con criterio médico. Reserva tu cita online." },
      { property: "og:title", content: "Estetic Med IA — Clínica de medicina estética" },
      { property: "og:description", content: "Tratamientos faciales, corporales y láser con criterio médico. Reserva tu cita online." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 md:grid-cols-2 md:pt-20">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Medicina estética · Madrid</p>
          <h1 className="mt-5 text-5xl leading-[1.05] md:text-7xl">
            Tu mejor versión, <span className="italic text-primary">con naturalidad</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Tratamientos personalizados por médicos especialistas, con tecnología de última generación y un trato cercano.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/reservar" className="rounded-full bg-ink px-7 py-3 text-ink-foreground transition hover:bg-ink/85">Reservar cita</Link>
            <Link to="/tratamientos" className="rounded-full border border-border bg-card px-7 py-3 transition hover:bg-accent">Ver tratamientos</Link>
          </div>
        </div>
        <img src={hero} alt="Recepción de la clínica Estetic Med IA" width={1600} height={1008} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft" />
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-6 px-5 md:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Criterio médico", d: "Cada tratamiento lo indica y realiza un médico colegiado." },
          { icon: Sparkles, t: "Resultados naturales", d: "Realzamos tus rasgos sin cambiar quién eres." },
          { icon: HeartHandshake, t: "Seguimiento cercano", d: "Revisión gratuita y acompañamiento tras cada sesión." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl bg-blush p-7">
            <Icon className="size-6 text-primary" />
            <h3 className="mt-4 text-2xl">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-4xl md:text-5xl">Tratamientos destacados</h2>
          <Link to="/tratamientos" className="text-sm text-primary underline-offset-4 hover:underline">Ver todos</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {treatments.slice(0, 4).map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t.category}</p>
              <h3 className="mt-2 text-2xl">{t.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-4 text-sm">Desde <span className="font-semibold">{euro(t.price)}</span></p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <h2 className="text-4xl md:text-5xl">Nuestro equipo</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex size-14 items-center justify-center rounded-full bg-secondary font-display text-xl">
                {m.name.replace(/^(Dra?\.\s)/, "").split(" ").map((w) => w[0]).join("")}
              </div>
              <h3 className="mt-4 text-2xl">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="rounded-[2rem] bg-ink px-8 py-14 text-center text-ink-foreground md:py-20">
          <h2 className="text-4xl md:text-5xl">Primera valoración <span className="italic">gratuita</span></h2>
          <p className="mx-auto mt-4 max-w-md opacity-75">Cuéntanos qué te gustaría mejorar y diseñaremos un plan a tu medida.</p>
          <Link to="/reservar" className="mt-8 inline-block rounded-full bg-secondary px-8 py-3 text-secondary-foreground transition hover:opacity-90">Reservar ahora</Link>
        </div>
      </section>
    </main>
  );
}
