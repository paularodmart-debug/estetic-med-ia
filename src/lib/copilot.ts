import { useSyncExternalStore } from "react";
import { consultationSchema, type Consultation, type Priority, type TaskStatus } from "./followup";

export type DemoCase = { id: string; name: string; professional: string; lastContact: string; date: string; purpose: string; channel: string | null; permission: string | null; owner: string | null; consultation?: Consultation };
export const demoCases: [DemoCase, DemoCase, DemoCase] = [
  { id: "maria", name: "María García", professional: "Dra. Lucía Martín", lastContact: "09/10/2026", date: "2026-10-12", purpose: "Pendiente de coordinar una revisión con el equipo profesional.", channel: "Correo electrónico", permission: null, owner: null },
  { id: "carmen", name: "Carmen López", professional: "Dr. Javier Ortega", lastContact: "08/10/2026", date: "2026-10-13", purpose: "Pendiente de confirmar disponibilidad para la próxima cita.", channel: null, permission: "Registrado en la ficha ficticia", owner: "Recepción" },
  { id: "ana", name: "Ana Fernández", professional: "Dra. Lucía Martín", lastContact: "10/10/2026", date: "2026-10-14", purpose: "Solicitud de cambio de horario pendiente de respuesta.", channel: "Teléfono", permission: null, owner: "Recepción" },
];
const initialConsultations: Consultation[] = [
  { identifier: "EM-001", objective: demoCases[0].purpose, area: "No indicada", priority: "Alta", information: "Último contacto y canal registrados; permiso y responsable pendientes.", nextAction: "Completar datos y coordinar revisión", date: demoCases[0].date },
  { identifier: "EM-002", objective: demoCases[1].purpose, area: "", priority: "Media", information: "Permiso registrado; canal pendiente.", nextAction: "Confirmar disponibilidad", date: demoCases[1].date },
  { identifier: "EM-003", objective: demoCases[2].purpose, area: "", priority: "Baja", information: "Solicitud de cambio de horario", nextAction: "", date: demoCases[2].date },
];
let cases: DemoCase[] = demoCases.map((c, i) => ({ ...c, consultation: initialConsultations[i] as Consultation }));
const serverCases = cases;
const caseListeners = new Set<() => void>();
export function useDemoCases() { return useSyncExternalStore(l => { caseListeners.add(l); return () => { caseListeners.delete(l); }; }, () => cases, () => serverCases); }
export function addConsultation(input: Consultation) {
  const consultation = consultationSchema.parse(input);
  if (cases.some(c => c.consultation?.identifier.toLowerCase() === consultation.identifier.toLowerCase())) throw new Error("Este identificador ya existe; elige otro.");
  const c: DemoCase = { id: crypto.randomUUID(), name: consultation.identifier, purpose: consultation.objective, professional: "Dra. Lucía Martín", lastContact: "No consta", date: consultation.date, channel: null, permission: null, owner: null, consultation };
  cases = [...cases, c]; caseListeners.forEach(l => l());
  return c;
}
export const quickActions = ["Analizar ficha", "Crear plan de seguimiento", "Redactar mensaje no clínico", "Convertir en tareas", "Qué debe revisar el profesional"] as const;
export const suggestions = ["Crear plan de seguimiento", "Analizar ficha", "Redactar mensaje no clínico"] as const;
export const clinicalRefusal = "No puedo resolver consultas clínicas: no diagnostico, prescribo tratamientos, interpreto fotografías, prometo resultados ni doy recomendaciones médicas. Esta cuestión requiere la revisión del profesional responsable del caso.";
export type FollowupPlan = { summary: string; missing: string[]; action: string; date: string; draft: string; review: string[] };
export type DemoReply = { text: string; plan?: FollowupPlan; convert?: boolean };
export function createPlan(c: DemoCase): FollowupPlan {
  const missing = [!c.channel ? "Canal de contacto preferido" : null, !c.permission ? "Permiso de contacto registrado" : null, !c.owner ? "Responsable del seguimiento" : null].filter((v): v is string => v !== null);
  return {
    summary: `${c.name}: ${c.purpose} Último contacto registrado: ${c.lastContact}. Profesional: ${c.professional}.`,
    missing, action: c.consultation?.nextAction || "Validar los datos de contacto y coordinar disponibilidad con recepción.", date: c.date,
    draft: `Hola, ${c.name.split(" ")[0]}. Te contactamos desde Estetic Med IA para coordinar tu próxima cita. ¿Puedes indicarnos tu disponibilidad? El equipo confirmará el horario contigo. Gracias.`,
    review: ["Validar la ficha y completar los datos organizativos pendientes.", "Aprobar la fecha administrativa orientativa y el borrador antes de contactar.", "Reservar toda valoración clínica al profesional responsable."],
  };
}
export function demoReply(input: string, c: DemoCase): DemoReply {
  const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const clinical = /diagnost|prescrib|recet|dosis|medic|tratamiento|botox|toxina|hialuron|foto|imagen|sintoma|dolor|hincha|alerg|complic|infecc|embaraz|contraindic|resultado|efecto|sangr|piel|inyecc|clinico|clinica|urgenc|fiebre|quemad|riesgo|recomiend|recomenda|deberia tomar|es seguro|es normal|cuantas sesiones/;
  const approved = quickActions.includes(input as typeof quickActions[number]);
  if (!approved && clinical.test(normalized)) return { text: clinicalRefusal };
  const plan = createPlan(c);
  if (normalized.includes("convertir") && normalized.includes("tarea")) return { text: "He preparado las acciones organizativas. Revisa la propuesta y confirma «Convertir en tareas» para añadirlas al seguimiento del caso.", plan, convert: true };
  if (normalized.includes("plan") && normalized.includes("seguimiento")) return { text: "He preparado una propuesta de seguimiento organizativo con los datos de este caso ficticio. Las fechas son orientativas; no son pautas clínicas.", plan };
  if (normalized.includes("analizar") || normalized.includes("falta") || normalized.includes("pendiente")) return { text: `**Datos organizativos pendientes**\n\n${plan.missing.length ? plan.missing.map(x => `- ${x}: no consta.`).join("\n") : "No faltan datos en los campos organizativos de esta demostración."}\n\nNo he completado ningún dato por suposición.` };
  if (normalized.includes("mensaje") || normalized.includes("redactar")) return { text: `**Borrador de mensaje · no enviado**\n\n${plan.draft}\n\nRequiere revisión y permiso de contacto antes de utilizarlo.` };
  if (normalized.includes("revisar") || normalized.includes("profesional")) return { text: `**Revisión del profesional**\n\n${plan.review.map(x => `- ${x}`).join("\n")}` };
  return { text: "Esta demostración puede analizar los datos organizativos de la ficha, preparar un plan de seguimiento, redactar un mensaje no clínico y proponer tareas. No puedo resolver otras preguntas ni completar información que no consta; solicita la revisión del profesional si hay alguna cuestión clínica." };
}
export type FollowupTask = { id: string; caseId: string; title: string; date: string; done: boolean; priority: Priority; owner: string; status: TaskStatus };
let tasks: FollowupTask[] = [];
const listeners = new Set<() => void>();
const serverTasks: FollowupTask[] = [];
export function useFollowupTasks() { return useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, () => tasks, () => serverTasks); }
export function convertPlanToTasks(c: DemoCase, plan: FollowupPlan) {
  if (tasks.some(t => t.caseId === c.id)) return 0;
  const titles = ["Completar y validar los datos organizativos pendientes", "Revisar y aprobar el borrador de contacto", "Coordinar disponibilidad y registrar la respuesta"];
  tasks = [...tasks, ...titles.map((title, i): FollowupTask => ({ id: `${c.id}-${i}`, caseId: c.id, title: i === 2 ? plan.action : title, date: plan.date, done: false, priority: c.consultation?.priority ?? "Media", owner: i === 1 ? c.professional : "Coordinación · Elena Ruiz", status: "Pendiente" }))];
  listeners.forEach(l => l());
  return titles.length;
}
export function setFollowupStatus(id: string, status: TaskStatus) {
  if (!["Pendiente", "En revisión", "Completada"].includes(status)) return;
  tasks = tasks.map(t => t.id === id ? { ...t, status, done: status === "Completada" } : t); listeners.forEach(l => l());
}
export function toggleFollowupTask(id: string) { const task = tasks.find(t => t.id === id); if (task) setFollowupStatus(id, task.done ? "Pendiente" : "Completada"); }
export const formatDemoDate = (date: string) => date ? new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Sin fecha · pendiente de acordar";