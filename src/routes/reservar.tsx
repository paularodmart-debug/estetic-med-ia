import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { treatments, team, timeSlots, addAppointment, euro, todayISO, treatmentById } from "@/lib/clinic";

export const Route = createFileRoute("/reservar")({
  validateSearch: (s: Record<string, unknown>): { t?: string } => (typeof s["t"] === "string" ? { t: s["t"] } : {}),
  head: () => ({
    meta: [
      { title: "Reservar cita — Estetic Med IA" },
      { name: "description", content: "Reserva online tu cita o valoración gratuita en Estetic Med IA." },
      { property: "og:title", content: "Reservar cita — Estetic Med IA" },
      { property: "og:description", content: "Elige tratamiento, día y hora en menos de un minuto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = Route.useSearch();
  const [form, setForm] = useState({ treatmentId: t ?? treatments[0]!.id, date: todayISO(), time: "", patient: "", phone: "", email: "", notes: "" });
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const tr = treatmentById(form.treatmentId)!;
  const professional = tr.category === "Bienestar" ? team[2]!.name : tr.category === "Facial" ? team[0]!.name : team[1]!.name;

  if (done)
    return (
      <main className="mx-auto max-w-lg px-5 pt-20 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="mt-4 text-5xl">¡Solicitud recibida!</h1>
        <p className="mt-3 text-muted-foreground">
          {tr.name} el {new Date(form.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} a las {form.time}. Te confirmaremos por teléfono.
        </p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-7 py-3 text-ink-foreground">Volver al inicio</Link>
      </main>
    );

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 md:grid-cols-[1fr_320px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addAppointment({ ...form, professional });
          setDone(true);
        }}
        className="space-y-8"
      >
        <h1 className="text-5xl md:text-6xl">Reserva tu cita</h1>
        <div className="space-y-2">
          <Label>Tratamiento</Label>
          <select value={form.treatmentId} onChange={set("treatmentId")} className="h-11 w-full rounded-lg border border-input bg-card px-3">
            {treatments.map((x) => <option key={x.id} value={x.id}>{x.name} — {euro(x.price)}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Fecha</Label>
          <Input type="date" min={todayISO()} value={form.date} onChange={set("date")} required className="h-11 bg-card" />
        </div>
        <div className="space-y-2">
          <Label>Hora</Label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {timeSlots.map((s) => (
              <button type="button" key={s} onClick={() => setForm({ ...form, time: s })} className={`rounded-lg border py-2 text-sm transition ${form.time === s ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:bg-accent"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Nombre completo</Label><Input required value={form.patient} onChange={set("patient")} className="h-11 bg-card" /></div>
          <div className="space-y-2"><Label>Teléfono</Label><Input required type="tel" value={form.phone} onChange={set("phone")} className="h-11 bg-card" /></div>
          <div className="space-y-2"><Label>Email</Label><Input required type="email" value={form.email} onChange={set("email")} className="h-11 bg-card" /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Comentarios (opcional)</Label><Textarea value={form.notes} onChange={set("notes")} className="bg-card" /></div>
        </div>
        <button disabled={!form.time} className="w-full rounded-full bg-ink py-3.5 text-ink-foreground transition hover:bg-ink/85 disabled:opacity-40 sm:w-auto sm:px-10">
          {form.time ? "Confirmar reserva" : "Elige una hora"}
        </button>
      </form>
      <aside className="h-fit rounded-2xl bg-blush p-7 md:sticky md:top-24">
        <p className="text-xs uppercase tracking-widest text-primary">Resumen</p>
        <h2 className="mt-2 text-3xl">{tr.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tr.description}</p>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Duración</dt><dd>{tr.duration} min</dd></div>
          <div className="flex justify-between"><dt>Profesional</dt><dd>{professional}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Precio</dt><dd>{euro(tr.price)}</dd></div>
        </dl>
      </aside>
    </main>
  );
}
