import { useState } from "react";
import { ClipboardList, Check, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Copilot, CopilotAvatar } from "@/components/copilot";
import {
  demoCases,
  useDemoCases,
  useFollowupTasks,
  toggleFollowupTask,
  formatDemoDate,
  createPlan,
} from "@/lib/copilot";
import { ConsultationIntake, ConsultationAssessment } from "@/components/consultation-intake";
import { TaskInbox } from "@/components/task-inbox";
import type { DemoRole } from "@/lib/followup";

export function CaseWorkspace({ role }: { role: DemoRole }) {
  const cases = useDemoCases();
  const [caseId, setCaseId] = useState(demoCases[0].id);
  const [open, setOpen] = useState(false);
  const selected = cases.find((c) => c.id === caseId) ?? demoCases[0];
  const allTasks = useFollowupTasks();
  const tasks = allTasks.filter((t) => t.caseId === selected.id);
  return (
    <>
      <section className="mt-8 border-y border-border py-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary">
              {role === "Profesional" ? "EL ESPACIO DEL PROFESIONAL" : "EL ESPACIO DE COORDINACIÓN"}
            </p>
            <h2 className="mt-1 text-3xl">Cada caso, un siguiente paso.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <ConsultationIntake onCreated={(c) => setCaseId(c.id)} />
            {role === "Profesional" && (
              <Button variant="ink" onClick={() => setOpen(true)}>
                <MessageCircle />
                Abrir Copiloto
                <ArrowUpRight />
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div>
            <h3 className="mb-3 font-sans text-xs font-semibold text-muted-foreground">
              CASOS FICTICIOS · {cases.length}
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[650px] lg:flex-col lg:overflow-y-auto">
              {cases.map((c) => (
                <Button
                  key={c.id}
                  variant={c.id === selected.id ? "secondary" : "ghost"}
                  onClick={() => setCaseId(c.id)}
                  aria-pressed={c.id === selected.id}
                  className="h-auto min-w-44 shrink-0 justify-start gap-3 whitespace-normal p-3 text-left"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card font-display text-lg">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="min-w-0 break-words">
                    {c.name}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {allTasks.filter((t) => t.caseId === c.id && !t.done).length || "Sin"} tareas
                      pendientes
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-3xl">{selected.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Caso ficticio · {selected.professional}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                Seguimiento organizativo
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{selected.purpose}</p>
            {selected.consultation && (
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <div>
                  <dt className="inline">Identificador: </dt>
                  <dd className="inline text-foreground">{selected.consultation.identifier}</dd>
                </div>
                <div>
                  <dt className="inline">Zona de interés: </dt>
                  <dd className="inline text-foreground">
                    {selected.consultation.area || "No consta"}
                  </dd>
                </div>
                <div>
                  <dt className="inline">Prioridad: </dt>
                  <dd className="inline text-foreground">{selected.consultation.priority}</dd>
                </div>
              </dl>
            )}
            {selected.consultation && (
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Información disponible: </span>
                {selected.consultation.information || "No consta"}
              </p>
            )}
            {selected.consultation && (
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                <p>
                  <span className="text-muted-foreground">Próxima acción: </span>
                  {selected.consultation.nextAction || "No consta"}
                </p>
                <p>
                  <span className="text-muted-foreground">Fecha prevista: </span>
                  {formatDemoDate(selected.consultation.date)}
                </p>
              </div>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm sm:grid-cols-4">
              {[
                ["Último contacto", selected.lastContact],
                ["Canal preferido", selected.channel ?? "No consta"],
                ["Permiso de contacto", selected.permission ?? "No consta"],
                ["Responsable", selected.owner ?? "Sin asignar"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words">{value}</dd>
                </div>
              ))}
            </dl>
            {role === "Coordinación" && selected.consultation && (
              <ConsultationAssessment consultation={selected.consultation} />
            )}
            {role === "Profesional" && (
              <div className="mt-4 border-l-2 border-primary pl-4">
                <h4 className="font-sans text-sm font-semibold">
                  Puntos que requieren revisión profesional
                </h4>
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {createPlan(selected).review.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 font-sans text-sm font-semibold">
                <ClipboardList className="size-4 text-primary" />
                Lista de seguimiento
              </h4>
              <span aria-live="polite" className="text-xs text-muted-foreground">
                {tasks.filter((t) => t.done).length}/{tasks.length} completadas
              </span>
            </div>
            {tasks.length ? (
              <ul className="mt-3 divide-y divide-border">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 py-3">
                    <Button
                      variant={t.done ? "secondary" : "outline"}
                      size="icon-sm"
                      aria-label={`${t.done ? "Reabrir" : "Completar"}: ${t.title}`}
                      aria-pressed={t.done}
                      onClick={() => toggleFollowupTask(t.id)}
                      className="mt-0.5 shrink-0"
                    >
                      {t.done && <Check />}
                    </Button>
                    <div>
                      <p
                        className={`text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}
                      >
                        {t.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDemoDate(t.date)} · Fecha administrativa orientativa
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex items-center gap-3 bg-muted/50 p-4">
                <CopilotAvatar />
                <div>
                  <p className="text-sm">Aún no hay tareas de seguimiento.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pendiente de propuesta y revisión profesional.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {role === "Profesional" && (
          <Button
            onClick={() => setOpen(true)}
            variant="ink"
            className="fixed bottom-5 right-5 z-40 h-12 gap-2 px-4 shadow-soft"
            aria-label={`Abrir Copiloto para ${selected.name}`}
            title="Abrir Copiloto"
          >
            <MessageCircle />
            <span className="hidden sm:inline">Copiloto</span>
          </Button>
        )}
        <Copilot
          selectedCase={selected}
          open={open && role === "Profesional"}
          onOpenChange={setOpen}
        />
      </section>
      {role === "Coordinación" && (
        <TaskInbox
          onViewCase={(id) => {
            setCaseId(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
}
