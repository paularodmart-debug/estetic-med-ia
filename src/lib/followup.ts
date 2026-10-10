import { z } from "zod";

export const priorities = ["Baja", "Media", "Alta"] as const;
export type Priority = (typeof priorities)[number];
export const taskStatuses = ["Pendiente", "En revisión", "Completada"] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type DemoRole = "Coordinación" | "Profesional";
const text = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres.`);
export const consultationSchema = z.object({
  identifier: text(40)
    .min(1, "Indica el identificador ficticio.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Usa letras, números, guiones o guion bajo."),
  objective: text(500).min(1, "Indica el objetivo expresado."),
  area: text(120),
  priority: z.enum(priorities),
  information: text(1000),
  nextAction: text(300),
  date: z
    .string()
    .refine(
      (value) =>
        !value ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
          !Number.isNaN(Date.parse(value)) &&
          new Date(value).toISOString().slice(0, 10) === value),
      "Indica una fecha válida.",
    ),
});
export type Consultation = z.infer<typeof consultationSchema>;
export function assessConsultation(c: Consultation) {
  const filled = [
    c.identifier,
    c.objective,
    c.area,
    c.priority,
    c.information,
    c.nextAction,
    c.date,
  ].filter((value) => value.trim().length > 0).length;
  const completeness = Math.round((filled / 7) * 100);
  const priorityPoints = c.priority === "Alta" ? 2 : c.priority === "Media" ? 1 : 0;
  const completenessPoints = completeness >= 85 ? 2 : completeness >= 50 ? 1 : 0;
  const actionPoints = c.nextAction.trim() ? 1 : 0;
  const points = priorityPoints + completenessPoints + actionPoints;
  const level = points >= 4 ? "Alto" : points >= 2 ? "Medio" : "Bajo";
  return {
    completeness,
    filled,
    level,
    points,
    reasons: [
      `Prioridad ${c.priority.toLowerCase()}: ${priorityPoints} puntos`,
      `${completeness}% de información: ${completenessPoints} puntos`,
      `${actionPoints ? "Próxima acción registrada" : "Sin próxima acción"}: ${actionPoints} punto${actionPoints === 1 ? "" : "s"}`,
    ],
  };
}

export function filterTickets<T extends { priority: Priority; status: TaskStatus; owner: string }>(
  tasks: T[],
  filters: { priority: string; status: string; owner: string },
) {
  return tasks.filter(
    (t) =>
      (!filters.priority || t.priority === filters.priority) &&
      (!filters.status || t.status === filters.status) &&
      (!filters.owner || t.owner === filters.owner),
  );
}
