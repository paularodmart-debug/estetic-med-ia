import { ClipboardList, CheckCheck, Files, Clock3, FileCheck } from "lucide-react";
import { useDemoCases, useFollowupTasks } from "@/lib/copilot";
import { demoImpact } from "@/lib/demo-impact";
import type { DemoRole } from "@/lib/followup";

export function DemoImpact({ role }: { role: DemoRole }) {
  const cases = useDemoCases();
  const tasks = useFollowupTasks();
  const metrics = demoImpact(cases, tasks);
  return (
    <section aria-label="Métricas de impacto de demostración" className={`mt-6 border-y border-border px-4 py-5 ${role === "Coordinación" ? "bg-secondary/40" : "bg-muted/40"}`}>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5" aria-live="polite" aria-atomic="true">
        {[
          { label: "Consultas organizadas", value: metrics.organized, icon: Files, note: "Tres casos ficticios de referencia" },
          { label: "Tareas pendientes", value: metrics.pending, icon: ClipboardList, note: "Incluye tareas en revisión" },
          { label: "Tareas completadas", value: metrics.completed, icon: CheckCheck, note: "Trabajo administrativo" },
          { label: "Información media disponible", value: `${metrics.information}%`, icon: FileCheck, note: "María, Carmen y Ana" },
          { label: "Tiempo administrativo estimado ahorrado", value: `${metrics.estimatedMinutes} min`, icon: Clock3, note: "Estimación de demostración" },
        ].map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="min-w-0">
            <dt className="flex min-h-10 items-start gap-2 text-xs text-muted-foreground"><Icon className="mt-0.5 size-4 shrink-0 text-primary" />{label}</dt>
            <dd className="mt-1 font-display text-4xl">{value}</dd>
            <dd className="mt-1 text-[11px] text-muted-foreground">{note}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">Métricas de demostración con datos ficticios · No son resultados clínicos ni datos reales.</p>
    </section>
  );
}