import type { AnalysisTaskInput } from "./copilot";

export const sampleInquiry =
  "Hola, soy Laura Sánchez (paciente ficticia). Me atendió la Dra. Lucía Martín hace unas semanas y me gustaría pedir una revisión con el equipo. Esta semana voy un poco liada y no sé qué días podré. Podéis escribirme cuando os venga bien. Gracias.";

export type InquiryAnalysis = {
  key: string;
  caseName: string;
  summary: string;
  missing: string[];
  nextStep: string;
  tasks: AnalysisTaskInput[];
  clinicalFlag: boolean;
};

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h).toString(36);
}

const addDays = (base: string, d: number) => {
  const date = new Date(`${base}T12:00:00`);
  date.setDate(date.getDate() + d);
  return date.toISOString().slice(0, 10);
};

/** Simulación local y determinista: solo extrae información administrativa. */
export function analyzeInquiry(text: string, baseDate = "2026-10-12"): InquiryAnalysis {
  const t = norm(text.trim());
  const name = /soy ([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)?)/.exec(text)?.[1] ?? "Consulta sin nombre";
  const hasChannel = /(correo|email|e-mail|@|telefono|llamad|llamar|\d{9})/.test(t);
  const hasAvailability =
    /(lunes|martes|miercoles|jueves|viernes|sabado|por la manana|por la tarde|a partir de las|\d{1,2}:\d{2}|disponible el)/.test(t) &&
    !/no se que dias|no se cuando/.test(t);
  const clinicalFlag =
    /(dolor|hincha|sangr|infecc|fiebre|alerg|reaccion|complic|botox|toxina|hialuron|dosis|medicac|tratamiento)/.test(t);
  const missing = [
    !hasAvailability ? "Disponibilidad de la paciente: no consta ningún día ni franja horaria." : null,
    !hasChannel ? "Canal de contacto preferido: no indica teléfono ni correo." : null,
    "Permiso de contacto: confirmar que está registrado en la ficha antes de escribir.",
  ].filter((v): v is string => v !== null);
  const pro = /dr[a]?\.? [a-záéíóúñ]+ [a-záéíóúñ]+/i.exec(text)?.[0] ?? "el profesional responsable";
  return {
    key: hash(t),
    caseName: name,
    summary: `${name} solicita coordinar una revisión con el equipo (atención previa con ${pro}). Petición organizativa; no se ha evaluado ningún contenido clínico.`,
    missing,
    nextStep: clinicalFlag
      ? "La consulta menciona aspectos clínicos: derivar a la revisión del profesional responsable antes de cualquier contacto."
      : "Coordinar una revisión con el equipo profesional tras confirmar disponibilidad y canal de contacto.",
    tasks: [
      { title: "Confirmar disponibilidad y canal de contacto preferido", owner: "Recepción", date: addDays(baseDate, 1), priority: "Alta" },
      { title: "Revisar la consulta y aprobar el mensaje de contacto", owner: "Dra. Lucía Martín", date: addDays(baseDate, 2), priority: "Alta" },
      { title: "Coordinar la revisión con el equipo y registrar la cita", owner: "Coordinación · Elena Ruiz", date: addDays(baseDate, 3), priority: "Media" },
    ],
    clinicalFlag,
  };
}
