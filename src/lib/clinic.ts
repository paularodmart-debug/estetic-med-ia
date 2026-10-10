import { useSyncExternalStore } from "react";

export type Treatment = {
  id: string;
  name: string;
  category: "Facial" | "Corporal" | "Láser" | "Bienestar";
  duration: number;
  price: number;
  description: string;
};

export const treatments: Treatment[] = [
  { id: "botox", name: "Toxina botulínica", category: "Facial", duration: 30, price: 280, description: "Suaviza líneas de expresión de frente, entrecejo y patas de gallo con un resultado natural." },
  { id: "acido", name: "Ácido hialurónico", category: "Facial", duration: 45, price: 350, description: "Aporta volumen e hidratación a labios, pómulos y surcos de forma equilibrada." },
  { id: "mesoterapia", name: "Mesoterapia facial", category: "Facial", duration: 40, price: 180, description: "Cóctel de vitaminas y activos que revitaliza y devuelve la luminosidad a la piel." },
  { id: "peeling", name: "Peeling químico", category: "Facial", duration: 45, price: 150, description: "Renueva la superficie de la piel y mejora manchas, textura y poros." },
  { id: "laser", name: "Depilación láser", category: "Láser", duration: 30, price: 90, description: "Tecnología de diodo para una eliminación progresiva y segura del vello." },
  { id: "radiofrecuencia", name: "Radiofrecuencia corporal", category: "Corporal", duration: 50, price: 120, description: "Reafirma y mejora la firmeza de abdomen, brazos y muslos." },
  { id: "hilos", name: "Hilos tensores", category: "Facial", duration: 60, price: 450, description: "Efecto lifting sin cirugía que redefine el óvalo facial." },
  { id: "nutricion", name: "Consulta nutricional", category: "Bienestar", duration: 45, price: 70, description: "Plan personalizado que complementa tus tratamientos desde dentro." },
];

export const team = [
  { name: "Dra. Lucía Martín", role: "Directora médica · Medicina estética facial" },
  { name: "Dr. Javier Ortega", role: "Medicina láser y corporal" },
  { name: "Elena Ruiz", role: "Nutricionista y bienestar" },
];

export type Status = "Confirmada" | "Pendiente" | "Completada" | "Cancelada";
export type Appointment = {
  id: string;
  patient: string;
  phone: string;
  email: string;
  treatmentId: string;
  date: string; // YYYY-MM-DD
  time: string;
  professional: string;
  status: Status;
  notes?: string;
};
export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  since: string;
  notes: string;
};

const today = new Date();
const d = (offset: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};

let patients: Patient[] = [
  { id: "p1", name: "María García", phone: "612 345 678", email: "maria@ejemplo.es", since: "2024-03-12", notes: "Piel sensible. Alergia a la lidocaína tópica." },
  { id: "p2", name: "Carmen López", phone: "622 111 222", email: "carmen@ejemplo.es", since: "2025-01-20", notes: "Sesiones de láser en curso (4/8)." },
  { id: "p3", name: "Ana Fernández", phone: "633 987 654", email: "ana@ejemplo.es", since: "2023-11-02", notes: "Revisión de ácido hialurónico cada 9 meses." },
  { id: "p4", name: "Laura Sánchez", phone: "644 555 010", email: "laura@ejemplo.es", since: "2025-06-15", notes: "Interesada en hilos tensores." },
  { id: "p5", name: "Pablo Moreno", phone: "655 203 404", email: "pablo@ejemplo.es", since: "2026-02-08", notes: "Primera consulta de toxina." },
];

let appointments: Appointment[] = [
  { id: "a1", patient: "María García", phone: "612 345 678", email: "maria@ejemplo.es", treatmentId: "mesoterapia", date: d(0), time: "10:00", professional: "Dra. Lucía Martín", status: "Confirmada" },
  { id: "a2", patient: "Carmen López", phone: "622 111 222", email: "carmen@ejemplo.es", treatmentId: "laser", date: d(0), time: "11:30", professional: "Dr. Javier Ortega", status: "Confirmada" },
  { id: "a3", patient: "Pablo Moreno", phone: "655 203 404", email: "pablo@ejemplo.es", treatmentId: "botox", date: d(0), time: "17:00", professional: "Dra. Lucía Martín", status: "Pendiente" },
  { id: "a4", patient: "Ana Fernández", phone: "633 987 654", email: "ana@ejemplo.es", treatmentId: "acido", date: d(1), time: "12:00", professional: "Dra. Lucía Martín", status: "Confirmada" },
  { id: "a5", patient: "Laura Sánchez", phone: "644 555 010", email: "laura@ejemplo.es", treatmentId: "hilos", date: d(2), time: "16:30", professional: "Dra. Lucía Martín", status: "Pendiente" },
  { id: "a6", patient: "María García", phone: "612 345 678", email: "maria@ejemplo.es", treatmentId: "peeling", date: d(-3), time: "10:30", professional: "Dra. Lucía Martín", status: "Completada" },
  { id: "a7", patient: "Carmen López", phone: "622 111 222", email: "carmen@ejemplo.es", treatmentId: "laser", date: d(-7), time: "11:30", professional: "Dr. Javier Ortega", status: "Completada" },
];

const listeners = new Set<() => void>();
let snapshot = { appointments, patients };
const emit = () => {
  snapshot = { appointments, patients };
  listeners.forEach((l) => l());
};

export function useClinic() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => snapshot,
    () => snapshot,
  );
}

export function addAppointment(a: Omit<Appointment, "id" | "status"> & { status?: Status }) {
  appointments = [...appointments, { ...a, id: crypto.randomUUID(), status: a.status ?? "Pendiente" }];
  if (!patients.some((p) => p.email.toLowerCase() === a.email.toLowerCase())) {
    patients = [...patients, { id: crypto.randomUUID(), name: a.patient, phone: a.phone, email: a.email, since: d(0), notes: a.notes ?? "" }];
  }
  emit();
}

export function setStatus(id: string, status: Status) {
  appointments = appointments.map((a) => (a.id === id ? { ...a, status } : a));
  emit();
}

export function addPatient(p: Omit<Patient, "id" | "since">) {
  patients = [...patients, { ...p, id: crypto.randomUUID(), since: d(0) }];
  emit();
}

export const treatmentById = (id: string) => treatments.find((t) => t.id === id);
export const euro = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const todayISO = () => d(0);
export const timeSlots = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "16:00", "16:30", "17:00", "17:30", "18:30"];
