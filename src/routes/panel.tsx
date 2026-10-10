import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Users, Euro, Clock3, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CaseWorkspace } from "@/components/case-workspace";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useClinic,
  treatmentById,
  setStatus,
  addPatient,
  euro,
  todayISO,
  type Status,
} from "@/lib/clinic";
import type { DemoRole } from "@/lib/followup";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel de gestión — Estetic Med IA" },
      {
        name: "description",
        content:
          "Consultas ficticias, priorización organizativa y tareas de seguimiento con el Copiloto Estetic Med IA.",
      },
      { property: "og:title", content: "Panel de gestión — Estetic Med IA" },
      {
        property: "og:description",
        content:
          "Demo de seguimiento organizativo: consultas, tareas y revisión profesional con el Copiloto.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Panel,
});

const statusStyle: Record<Status, string> = {
  Confirmada: "bg-success/15 text-success",
  Pendiente: "bg-secondary text-secondary-foreground",
  Completada: "bg-muted text-muted-foreground",
  Cancelada: "bg-destructive/10 text-destructive",
};

function Panel() {
  const [role, setRole] = useState<DemoRole>("Profesional");
  const [tab, setTab] = useState<"agenda" | "pacientes">("agenda");
  const { appointments, patients } = useClinic();
  const today = todayISO();
  const todays = appointments.filter((a) => a.date === today && a.status !== "Cancelada");
  const upcoming = appointments
    .filter((a) => a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const revenue = appointments
    .filter((a) => a.status === "Completada")
    .reduce((s, a) => s + (treatmentById(a.treatmentId)?.price ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-5 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Gestión interna · Demo</p>
          <h1 className="mt-2 text-5xl">Panel de la clínica</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Estetic Med IA convierte cada consulta en un siguiente paso organizado, revisable y seguro para el equipo de la clínica.
          </p>
        </div>
        <div className="flex rounded-full border border-border bg-card p-1">
          {(["agenda", "pacientes"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "ink" : "ghost"}
              onClick={() => setTab(t)}
              className="rounded-full px-5 capitalize"
              aria-pressed={tab === t}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <p className="text-xs text-muted-foreground">
          Datos ficticios · Sesión de demo · Se reinicia al recargar
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="demo-role">Rol de demostración</Label>
          <select
            id="demo-role"
            value={role}
            onChange={(e) => setRole(e.target.value as DemoRole)}
            className="h-9 rounded-full border border-input bg-card px-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option>Coordinación</option>
            <option>Profesional</option>
          </select>
        </div>
      </div>
      <CaseWorkspace role={role} />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={CalendarDays} label="Citas hoy" value={todays.length} />
        <Stat
          icon={Clock3}
          label="Pendientes"
          value={appointments.filter((a) => a.status === "Pendiente").length}
        />
        <Stat icon={Users} label="Pacientes" value={patients.length} />
        <Stat icon={Euro} label="Facturado" value={euro(revenue)} />
      </div>

      {tab === "agenda" ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-2xl">Próximas citas</h2>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.map((a) => {
              const t = treatmentById(a.treatmentId);
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div className="w-28 shrink-0">
                    <p className="font-semibold">{a.time}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.date === today
                        ? "Hoy"
                        : new Date(a.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{a.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {t?.name} · {a.professional}
                    </p>
                  </div>
                  <select
                    value={a.status}
                    onChange={(e) => {
                      setStatus(a.id, e.target.value as Status);
                      toast.success(`Cita ${e.target.value.toLowerCase()}`);
                    }}
                    className={`w-fit rounded-full border-0 px-3 py-1.5 text-xs font-medium ${statusStyle[a.status]}`}
                  >
                    {(["Pendiente", "Confirmada", "Completada", "Cancelada"] as Status[]).map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Patients />
      )}
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-blush p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 font-display text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Patients() {
  const { patients, appointments } = useClinic();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const list = useMemo(
    () =>
      patients.filter((p) => (p.name + p.email + p.phone).toLowerCase().includes(q.toLowerCase())),
    [patients, q],
  );

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-card pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2 text-sm text-ink-foreground">
              <Plus className="size-4" /> Nuevo paciente
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium">
                Nuevo paciente
              </DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                addPatient({
                  name: String(f.get("name")),
                  phone: String(f.get("phone")),
                  email: String(f.get("email")),
                  notes: String(f.get("notes")),
                });
                setOpen(false);
                toast.success("Paciente añadido");
              }}
            >
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input name="phone" required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label>Notas clínicas</Label>
                <Textarea name="notes" />
              </div>
              <button className="w-full rounded-full bg-ink py-2.5 text-ink-foreground">
                Guardar
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {list.map((p) => {
          const visits = appointments.filter((a) => a.email === p.email);
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-secondary font-display text-lg">
                  {p.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {p.phone} · {p.email}
                  </p>
                </div>
              </div>
              {p.notes && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">{p.notes}</p>}
              <p className="mt-3 text-xs text-muted-foreground">
                Paciente desde{" "}
                {new Date(p.since).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}{" "}
                · {visits.length} citas
              </p>
            </article>
          );
        })}
        {list.length === 0 && <p className="text-muted-foreground">No hay resultados.</p>}
      </div>
    </section>
  );
}
