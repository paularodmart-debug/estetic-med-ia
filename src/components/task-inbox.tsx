import { useState } from "react";
import { ArrowUpRight, Check, ClipboardList, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatDemoDate, setFollowupStatus, useDemoCases, useFollowupTasks } from "@/lib/copilot";
import { filterTickets, priorities, taskStatuses, type TaskStatus } from "@/lib/followup";

export function TaskInbox({ onViewCase }: { onViewCase: (id: string) => void }) {
  const tasks = useFollowupTasks();
  const cases = useDemoCases();
  const [filters, setFilters] = useState({ priority: "", status: "", owner: "" });
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = tasks.find((t) => t.id === detailId);
  const detailCase = cases.find((c) => c.id === detail?.caseId);
  const visible = filterTickets(tasks, filters);
  const owners = Array.from(new Set(tasks.map((t) => t.owner)));
  const selectClass =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  return (
    <section className="mt-8 border-b border-border pb-8" aria-label="Tareas de seguimiento">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-primary">BANDEJA DE TRABAJO</p>
          <h2 className="mt-1 text-3xl">Tareas de seguimiento</h2>
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {tasks.filter((t) => t.status === "Pendiente").length} pendientes ·{" "}
          {tasks.filter((t) => t.status === "En revisión").length} en revisión ·{" "}
          {tasks.filter((t) => t.done).length} completadas
        </p>
      </div>
      <div className="my-5 flex flex-wrap items-end gap-3">
        <Filter className="mb-2 size-4 text-primary" />
        {(
          [
            { key: "priority", label: "Prioridad", options: priorities },
            { key: "status", label: "Estado", options: taskStatuses },
            { key: "owner", label: "Responsable", options: owners },
          ] as const
        ).map((f) => (
          <div key={f.key} className="min-w-40 flex-1 space-y-1.5">
            <Label htmlFor={`filter-${f.key}`}>{f.label}</Label>
            <select
              id={`filter-${f.key}`}
              className={selectClass}
              value={filters[f.key]}
              onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
            >
              <option value="">Todos</option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
        <Button variant="ghost" onClick={() => setFilters({ priority: "", status: "", owner: "" })}>
          Limpiar filtros
        </Button>
      </div>
      <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
        {visible.length} de {tasks.length} tareas · Fechas administrativas, no pautas clínicas
      </p>
      {visible.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {visible.map((t) => {
            const c = cases.find((c) => c.id === t.caseId);
            return (
              <li
                key={t.id}
                className="grid items-center gap-4 py-4 md:grid-cols-[1fr_200px_170px]"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {c?.name ?? "Caso no disponible"}
                    </span>
                    <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[11px]">
                      Prioridad {t.priority.toLowerCase()}
                    </span>
                  </div>
                  <Button
                    variant="link"
                    className={`h-auto justify-start whitespace-normal p-0 text-left text-foreground ${t.done ? "line-through" : ""}`}
                    onClick={() => setDetailId(t.id)}
                  >
                    {t.title}
                    <ArrowUpRight />
                  </Button>
                </div>
                <div className="text-xs">
                  <p>{t.owner}</p>
                  <p className="mt-1 text-muted-foreground">{formatDemoDate(t.date)}</p>
                </div>
                <div>
                  <Label htmlFor={`status-${t.id}`} className="sr-only">
                    Estado de {t.title}
                  </Label>
                  <select
                    id={`status-${t.id}`}
                    className={selectClass}
                    value={t.status}
                    onChange={(e) => setFollowupStatus(t.id, e.target.value as TaskStatus)}
                  >
                    {taskStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="border-y border-dashed border-border py-10 text-center">
          <ClipboardList className="mx-auto mb-3 size-6 text-primary" />
          <p className="text-sm">
            {tasks.length ? "No hay tareas con estos filtros." : "Aún no hay tareas en la bandeja."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {tasks.length
              ? "Prueba otra combinación o limpia los filtros."
              : "Pendiente de propuestas del Copiloto y confirmación profesional."}
          </p>
        </div>
      )}
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-lg">
          <DialogTitle className="pr-4 font-display text-3xl font-medium">
            Detalle de tarea
          </DialogTitle>
          <DialogDescription>
            Seguimiento organizativo · Caso ficticio {detailCase?.name}
          </DialogDescription>
          {detail && (
            <>
              <h3 className="font-sans text-base font-semibold">{detail.title}</h3>
              <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
                {[
                  ["Prioridad", detail.priority],
                  ["Responsable ficticio", detail.owner],
                  ["Fecha límite", formatDemoDate(detail.date)],
                  ["Estado", detail.status],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-muted-foreground">{key}</dt>
                    <dd className="mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h4 className="font-sans text-xs font-semibold text-primary">CONTEXTO DEL CASO</h4>
                <p className="mt-2 text-sm">{detailCase?.purpose}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Información disponible: {detailCase?.consultation?.information || "No consta"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Profesional: {detailCase?.professional}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                La finalización registra trabajo organizativo, no una decisión médica.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="ink"
                  disabled={detail.done}
                  onClick={() => setFollowupStatus(detail.id, "Completada")}
                >
                  <Check />
                  {detail.done ? "Tarea completada" : "Marcar como completada"}
                </Button>
                <Button
                  variant="soft"
                  onClick={() => {
                    onViewCase(detail.caseId);
                    setDetailId(null);
                  }}
                >
                  Ver caso
                  <ArrowUpRight />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
