import { useSyncExternalStore } from "react";
import { consultationSchema, type Consultation, type Priority, type TaskStatus } from "./followup";

export type DemoCase = {
  id: string;
  name: string;
  professional: string;
  lastContact: string;
  date: string;
  purpose: string;
  channel: string | null;
  permission: string | null;
  owner: string | null;
  consultation?: Consultation;
};
export const demoCases: [DemoCase, DemoCase, DemoCase] = [
  {
    id: "maria",
    name: "María García",
    professional: "Dra. Lucía Martín",
    lastContact: "09/10/2026",
    date: "2026-10-12",
    purpose: "Pendiente de coordinar una revisión con el equipo profesional.",
    channel: "Correo electrónico",
    permission: "Registrado en la ficha ficticia",
    owner: "Coordinación · Elena Ruiz",
  },
  {
    id: "carmen",
    name: "Carmen López",
    professional: "Dr. Javier Ortega",
    lastContact: "08/10/2026",
    date: "2026-10-13",
    purpose: "Pendiente de confirmar disponibilidad para la próxima cita.",
    channel: null,
    permission: "Registrado en la ficha ficticia",
    owner: "Recepción",
  },
  {
    id: "ana",
    name: "Ana Fernández",
    professional: "Dra. Lucía Martín",
    lastContact: "10/10/2026",
    date: "2026-10-14",
    purpose: "Cambio de horario confirmado y respuesta registrada. Seguimiento resuelto organizativamente.",
    channel: "Teléfono",
    permission: null,
    owner: "Recepción",
  },
];
const initialConsultations: Consultation[] = [
  {
    identifier: "EM-001",
    objective: demoCases[0].purpose,
    area: "Coordinación de revisión",
    priority: "Alta",
    information: "Último contacto, canal, permiso y responsable registrados en la ficha ficticia.",
    nextAction: "Completar datos y coordinar revisión",
    date: demoCases[0].date,
  },
  {
    identifier: "EM-002",
    objective: demoCases[1].purpose,
    area: "",
    priority: "Media",
    information: "Permiso registrado; canal pendiente.",
    nextAction: "",
    date: demoCases[1].date,
  },
  {
    identifier: "EM-003",
    objective: demoCases[2].purpose,
    area: "Coordinación de agenda",
    priority: "Baja",
    information: "Cambio de horario confirmado y respuesta registrada en la ficha ficticia.",
    nextAction: "Seguimiento organizativo cerrado; sin acciones pendientes",
    date: demoCases[2].date,
  },
];
let cases: DemoCase[] = demoCases.map((c, i) => {
  const consultation = initialConsultations[i];
  return consultation ? { ...c, consultation } : c;
});
const serverCases = cases;
const caseListeners = new Set<() => void>();
export function useDemoCases() {
  return useSyncExternalStore(
    (l) => {
      caseListeners.add(l);
      return () => {
        caseListeners.delete(l);
      };
    },
    () => cases,
    () => serverCases,
  );
}
export function addConsultation(input: Consultation) {
  const consultation = consultationSchema.parse(input);
  if (
    cases.some(
      (c) => c.consultation?.identifier.toLowerCase() === consultation.identifier.toLowerCase(),
    )
  )
    throw new Error("Este identificador ya existe; elige otro.");
  const c: DemoCase = {
    id: crypto.randomUUID(),
    name: consultation.identifier,
    purpose: consultation.objective,
    professional: "Dra. Lucía Martín",
    lastContact: "No consta",
    date: consultation.date,
    channel: null,
    permission: null,
    owner: null,
    consultation,
  };
  cases = [...cases, c];
  caseListeners.forEach((l) => l());
  return c;
}
export const quickActions = [
  "Analizar ficha",
  "Crear plan de seguimiento",
  "Redactar mensaje no clínico",
  "Convertir en tareas",
  "Qué debe revisar el profesional",
] as const;
export const suggestions = [
  "Crear plan de seguimiento",
  "Analizar ficha",
  "Redactar mensaje no clínico",
] as const;
export const clinicalRefusal =
  "No puedo resolver consultas clínicas: no diagnostico, prescribo tratamientos, interpreto fotografías, prometo resultados ni doy recomendaciones médicas. Esta cuestión requiere la revisión del profesional responsable del caso.";
export type FollowupPlan = {
  summary: string;
  missing: string[];
  action: string;
  date: string;
  draft: string;
  review: string[];
};
export type DemoReply = { text: string; plan?: FollowupPlan; convert?: boolean };
function isClinicalRequest(input: string) {
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return /diagnost|prescrib|recet|dosis|medic|traitement|tratamiento|botox|toxina|hialuron|foto|imagen|sintoma|dolor|hincha|alerg|complic|infecc|embaraz|contraindic|resultado|efecto|sangr|piel|inyecc|clinico|clinica|urgenc|fiebre|quemad|riesgo|recomiend|recomenda|deberia tomar|es seguro|es normal|cuantas sesiones/.test(
    normalized,
  );
}
export function createPlan(c: DemoCase): FollowupPlan {
  const missing = [
    !c.channel ? "Canal de contacto preferido" : null,
    !c.permission ? "Permiso de contacto registrado" : null,
    !c.owner ? "Responsable del seguimiento" : null,
  ].filter((v): v is string => v !== null);
  return {
    summary: `${c.name}: ${c.purpose} Último contacto registrado: ${c.lastContact}. Profesional: ${c.professional}.`,
    missing,
    action: c.consultation?.nextAction
      ? isClinicalRequest(c.consultation.nextAction)
        ? "Solicitar revisión del profesional; no convertir la solicitud clínica en una indicación."
        : c.consultation.nextAction
      : "Validar los datos de contacto y coordinar disponibilidad con recepción.",
    date: c.date,
    draft: `Hola, ${c.name.split(" ")[0]}. Te contactamos desde Estetic Med IA para coordinar tu próxima cita. ¿Puedes indicarnos tu disponibilidad? El equipo confirmará el horario contigo. Gracias.`,
    review: [
      "Validar la ficha y completar los datos organizativos pendientes.",
      "Aprobar la fecha administrativa orientativa y el borrador antes de contactar.",
      "Reservar toda valoración clínica al profesional responsable.",
    ],
  };
}
export function demoReply(input: string, c: DemoCase): DemoReply {
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const approved = quickActions.includes(input as (typeof quickActions)[number]);
  if (!approved && isClinicalRequest(input)) return { text: clinicalRefusal };
  const plan = createPlan(c);
  if (normalized.includes("convertir") && normalized.includes("tarea"))
    return {
      text: "He preparado las acciones organizativas. Revisa la propuesta y confirma «Convertir en tareas» para añadirlas al seguimiento del caso.",
      plan,
      convert: true,
    };
  if (normalized.includes("plan") && normalized.includes("seguimiento"))
    return {
      text: "He preparado una propuesta de seguimiento organizativo con los datos de este caso ficticio. Las fechas son orientativas; no son pautas clínicas.",
      plan,
    };
  if (
    normalized.includes("analizar") ||
    normalized.includes("falta") ||
    normalized.includes("pendiente")
  )
    return {
      text: `**Datos organizativos pendientes**\n\n${plan.missing.length ? plan.missing.map((x) => `- ${x}: no consta.`).join("\n") : "No faltan datos en los campos organizativos de esta demostración."}\n\nNo he completado ningún dato por suposición.`,
    };
  if (normalized.includes("mensaje") || normalized.includes("redactar"))
    return {
      text: `**Borrador de mensaje · no enviado**\n\n${plan.draft}\n\nRequiere revisión y permiso de contacto antes de utilizarlo.`,
    };
  if (normalized.includes("revisar") || normalized.includes("profesional"))
    return {
      text: `**Revisión del profesional**\n\n${plan.review.map((x) => `- ${x}`).join("\n")}`,
    };
  return {
    text: "Esta demostración puede analizar los datos organizativos de la ficha, preparar un plan de seguimiento, redactar un mensaje no clínico y proponer tareas. No puedo resolver otras preguntas ni completar información que no consta; solicita la revisión del profesional si hay alguna cuestión clínica.",
  };
}
export type FollowupTask = {
  id: string;
  caseId: string;
  title: string;
  date: string;
  done: boolean;
  priority: Priority;
  owner: string;
  status: TaskStatus;
};
const initialTasks: FollowupTask[] = [
  { id: "maria-0", caseId: "maria", title: "Confirmar disponibilidad para la revisión", date: "2026-10-12", done: false, priority: "Alta", owner: "Coordinación · Elena Ruiz", status: "Pendiente" },
  { id: "maria-1", caseId: "maria", title: "Revisar y aprobar el borrador de contacto", date: "2026-10-12", done: false, priority: "Alta", owner: "Dra. Lucía Martín", status: "Pendiente" },
  { id: "maria-2", caseId: "maria", title: "Coordinar revisión y registrar la confirmación", date: "2026-10-12", done: false, priority: "Alta", owner: "Coordinación · Elena Ruiz", status: "Pendiente" },
  { id: "carmen-0", caseId: "carmen", title: "Revisar la ficha y completar el canal de contacto", date: "2026-10-13", done: false, priority: "Media", owner: "Dr. Javier Ortega", status: "En revisión" },
  { id: "ana-0", caseId: "ana", title: "Revisar la solicitud de cambio de horario", date: "2026-10-14", done: true, priority: "Baja", owner: "Dra. Lucía Martín", status: "Completada" },
  { id: "ana-1", caseId: "ana", title: "Confirmar el nuevo horario con recepción", date: "2026-10-14", done: true, priority: "Baja", owner: "Coordinación · Elena Ruiz", status: "Completada" },
  { id: "ana-2", caseId: "ana", title: "Registrar la respuesta y cerrar el seguimiento organizativo", date: "2026-10-14", done: true, priority: "Baja", owner: "Coordinación · Elena Ruiz", status: "Completada" },
];
let tasks: FollowupTask[] = initialTasks;
const listeners = new Set<() => void>();
const serverTasks = initialTasks;
export function organizationalStatus(caseId: string, entries: FollowupTask[]) {
  const caseTasks = entries.filter((t) => t.caseId === caseId);
  if (caseTasks.length && caseTasks.every((t) => t.status === "Completada"))
    return "Resuelto organizativamente";
  if (caseTasks.some((t) => t.status === "En revisión")) return "En revisión organizativa";
  return caseTasks.length ? "Seguimiento pendiente" : "Sin tareas de seguimiento";
}
export function useFollowupTasks() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => tasks,
    () => serverTasks,
  );
}
function pendingPlanTitles(c: DemoCase, plan: FollowupPlan, entries: FollowupTask[]) {
  if (entries.some((t) => t.caseId === c.id && t.id === `${c.id}-plan-0`)) return [];
  return [
    "Completar y validar los datos organizativos pendientes",
    "Revisar y aprobar el borrador de contacto",
    plan.action,
  ].filter((title) => !entries.some((t) => t.caseId === c.id && t.title === title));
}
export function pendingPlanTaskCount(c: DemoCase, entries: FollowupTask[], plan = createPlan(c)) {
  return pendingPlanTitles(c, plan, entries).length;
}
export function convertPlanToTasks(c: DemoCase, plan: FollowupPlan) {
  const titles = pendingPlanTitles(c, plan, tasks);
  if (!titles.length) return 0;
  tasks = [
    ...tasks,
    ...titles.map((title, i): FollowupTask => ({
      id: `${c.id}-plan-${i}`,
      caseId: c.id,
      title,
      date: plan.date,
      done: false,
      priority: c.consultation?.priority ?? "Media",
      owner: title === "Revisar y aprobar el borrador de contacto" ? c.professional : "Coordinación · Elena Ruiz",
      status: "Pendiente",
    })),
  ];
  listeners.forEach((l) => l());
  return titles.length;
}
export function setFollowupStatus(id: string, status: TaskStatus) {
  if (!["Pendiente", "En revisión", "Completada"].includes(status)) return;
  tasks = tasks.map((t) => (t.id === id ? { ...t, status, done: status === "Completada" } : t));
  listeners.forEach((l) => l());
}
export function toggleFollowupTask(id: string) {
  const task = tasks.find((t) => t.id === id);
  if (task) setFollowupStatus(id, task.done ? "Pendiente" : "Completada");
}
export const formatDemoDate = (date: string) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha · pendiente de acordar";
