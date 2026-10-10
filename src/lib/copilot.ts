import { useSyncExternalStore } from "react";

export type DemoCase = { id: string; name: string; professional: string; lastContact: string; date: string; purpose: string; channel: string | null; permission: string | null; owner: string | null };
export const demoCases: [DemoCase, DemoCase, DemoCase] = [
  { id: "maria", name: "María García", professional: "Dra. Lucía Martín", lastContact: "09/10/2026", date: "2026-10-12", purpose: "Pendiente de coordinar una revisión con el equipo profesional.", channel: "Correo electrónico", permission: null, owner: null },
  { id: "carmen", name: "Carmen López", professional: "Dr. Javier Ortega", lastContact: "08/10/2026", date: "2026-10-13", purpose: "Pendiente de confirmar disponibilidad para la próxima cita.", channel: null, permission: "Registrado en la ficha ficticia", owner: "Recepción" },
  { id: "ana", name: "Ana Fernández", professional: "Dra. Lucía Martín", lastContact: "10/10/2026", date: "2026-10-14", purpose: "Solicitud de cambio de horario pendiente de respuesta.", channel: "Teléfono", permission: null, owner: "Recepción" },
];
export const quickActions = ["Analizar ficha", "Crear plan de seguimiento", "Redactar mensaje no clínico", "Convertir en tareas", "Qué debe revisar el profesional"] as const;
export const suggestions = ["Crear plan de seguimiento", "Analizar ficha", "Redactar mensaje no clínico"] as const;
export const clinicalRefusal = "No puedo resolver consultas clínicas: no diagnostico, prescribo tratamientos, interpreto fotografías, prometo resultados ni doy recomendaciones médicas. Esta cuestión requiere la revisión del profesional responsable del caso.";
export type FollowupPlan = { summary: string; missing: string[]; action: string; date: string; draft: string; review: string[] };
export type DemoReply = { text: string; plan?: FollowupPlan; convert?: boolean };
export function createPlan(c: DemoCase): FollowupPlan {
  const missing = [!c.channel ? "Canal de contacto preferido" : null, !c.permission ? "Permiso de contacto registrado" : null, !c.owner ? "Responsable del seguimiento" : null].filter((v): v is string => v !== null);
  return {
    summary: `${c.name}: ${c.purpose} Último contacto registrado: ${c.lastContact}. Profesional: ${c.professional}.`,
    missing, action: "Validar los datos de contacto y coordinar disponibilidad con recepción.", date: c.date,
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
export type FollowupTask = { id: string; caseId: string; title: string; date: string; done: boolean };
let tasks: FollowupTask[] = [];
const listeners = new Set<() => void>();
const serverTasks: FollowupTask[] = [];
export function useFollowupTasks() { return useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, () => tasks, () => serverTasks); }
export function convertPlanToTasks(c: DemoCase, plan: FollowupPlan) {
  if (tasks.some(t => t.caseId === c.id)) return 0;
  const titles = ["Completar y validar los datos organizativos pendientes", "Revisar y aprobar el borrador de contacto", "Coordinar disponibilidad y registrar la respuesta"];
  tasks = [...tasks, ...titles.map((title, i) => ({ id: `${c.id}-${i}`, caseId: c.id, title, date: plan.date, done: false }))];
  listeners.forEach(l => l());
  return titles.length;
}
export function toggleFollowupTask(id: string) { tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t); listeners.forEach(l => l()); }
export const formatDemoDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" });