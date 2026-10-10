import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  assessConsultation,
  consultationSchema,
  filterTickets,
  type Consultation,
} from "./followup";
import {
  addConsultation,
  convertPlanToTasks,
  createPlan,
  setFollowupStatus,
  useFollowupTasks,
  toggleFollowupTask,
  useDemoCases,
  organizationalStatus,
} from "./copilot";

const full: Consultation = {
  identifier: "TEST-004",
  objective: "Coordinar disponibilidad",
  area: "Facial",
  priority: "Alta",
  information: "Canal pendiente",
  nextAction: "Confirmar disponibilidad",
  date: "2026-10-20",
};
describe("Priorización exclusivamente organizativa", () => {
  it("María comienza con información completa, prioridad alta y varias tareas pendientes", () => {
    const cases = renderHook(() => useDemoCases());
    const tasks = renderHook(() => useFollowupTasks());
    const maria = cases.result.current.find((c) => c.id === "maria");
    expect(maria?.consultation?.priority).toBe("Alta");
    if (!maria?.consultation) throw new Error("Falta la consulta de María");
    expect(assessConsultation(maria.consultation).completeness).toBe(100);
    expect(createPlan(maria).missing).toEqual([]);
    const pending = tasks.result.current.filter((t) => t.caseId === "maria");
    expect(pending).toHaveLength(3);
    expect(pending.every((t) => t.status === "Pendiente" && !t.done)).toBe(true);
    expect(convertPlanToTasks(maria, createPlan(maria))).toBe(0);
    cases.unmount(); tasks.unmount();
  });
  it("Carmen comienza incompleta, con score medio y una sola tarea en revisión", () => {
    const cases = renderHook(() => useDemoCases());
    const tasks = renderHook(() => useFollowupTasks());
    const carmen = cases.result.current.find((c) => c.id === "carmen");
    if (!carmen?.consultation) throw new Error("Falta la consulta de Carmen");
    expect(assessConsultation(carmen.consultation)).toMatchObject({ completeness: 71, level: "Medio" });
    expect(tasks.result.current.filter((t) => t.caseId === "carmen")).toHaveLength(1);
    expect(tasks.result.current.find((t) => t.caseId === "carmen")?.status).toBe("En revisión");
    cases.unmount(); tasks.unmount();
  });
  it("Ana comienza resuelta organizativamente y reabrir una tarea revierte la resolución", () => {
    const tasks = renderHook(() => useFollowupTasks());
    const ana = tasks.result.current.filter((t) => t.caseId === "ana");
    expect(ana).toHaveLength(3);
    expect(ana.every((t) => t.done && t.status === "Completada")).toBe(true);
    expect(organizationalStatus("ana", tasks.result.current)).toBe("Resuelto organizativamente");
    act(() => toggleFollowupTask("ana-0"));
    expect(organizationalStatus("ana", tasks.result.current)).toBe("Seguimiento pendiente");
    act(() => toggleFollowupTask("ana-0"));
    expect(organizationalStatus("ana", tasks.result.current)).toBe("Resuelto organizativamente");
    expect(organizationalStatus("missing", tasks.result.current)).toBe("Sin tareas de seguimiento");
    tasks.unmount();
  });
  it("Calcula completitud sobre los siete campos rellenados", () => {
    expect(assessConsultation(full).completeness).toBe(100);
    expect(assessConsultation({ ...full, area: "", information: "", date: "" }).completeness).toBe(
      57,
    );
  });
  it("Asigna niveles Bajo, Medio y Alto según prioridad, completitud y acción", () => {
    expect(assessConsultation(full).level).toBe("Alto");
    expect(assessConsultation({ ...full, priority: "Baja" }).level).toBe("Medio");
    expect(
      assessConsultation({
        ...full,
        priority: "Baja",
        area: "",
        information: "",
        nextAction: "",
        date: "",
      }).level,
    ).toBe("Bajo");
  });
  it("No usa contenido médico ni zona de interés para puntuar", () => {
    expect(
      assessConsultation({
        ...full,
        objective: "Diagnóstico",
        area: "Dolor",
        information: "Síntomas",
      }),
    ).toEqual(assessConsultation(full));
  });
  it("No convierte una próxima acción clínica en una recomendación o tarea médica", () => {
    const c = addConsultation({
      ...full,
      identifier: "TEST-SAFETY",
      nextAction: "Prescribir dosis de botox",
    });
    expect(createPlan(c).action).toBe(
      "Solicitar revisión del profesional; no convertir la solicitud clínica en una indicación.",
    );
  });
  it("Explica los tres factores y no cuenta espacios como próxima acción", () => {
    expect(assessConsultation(full).reasons).toHaveLength(3);
    expect(assessConsultation({ ...full, nextAction: "   " }).points).toBe(4);
  });
  it("Valida identificadores, límites y fechas antes de guardar", () => {
    expect(consultationSchema.safeParse({ ...full, identifier: "<script>" }).success).toBe(false);
    expect(consultationSchema.safeParse({ ...full, information: "x".repeat(1001) }).success).toBe(
      false,
    );
    expect(consultationSchema.safeParse({ ...full, date: "2026-02-30" }).success).toBe(false);
  });
  it("Guarda el caso y conserva sus datos para el plan sin inventar contacto", () => {
    const c = addConsultation(full);
    expect(c.purpose).toBe(full.objective);
    expect(c.channel).toBeNull();
    expect(createPlan(c).action).toBe(full.nextAction);
    expect(convertPlanToTasks(c, createPlan(c))).toBe(3);
    expect(convertPlanToTasks(c, createPlan(c))).toBe(0);
    expect(() => addConsultation(full)).toThrow("ya existe");
  });
  it("Combina filtros de prioridad, estado y responsable", () => {
    const tasks = [
      { id: "1", priority: "Alta" as const, status: "En revisión" as const, owner: "Elena" },
      { id: "2", priority: "Baja" as const, status: "Completada" as const, owner: "Lucía" },
    ];
    expect(
      filterTickets(tasks, { priority: "Alta", status: "En revisión", owner: "Elena" }).map(
        (t) => t.id,
      ),
    ).toEqual(["1"]);
    expect(filterTickets(tasks, { priority: "Alta", status: "Completada", owner: "" })).toEqual([]);
  });
  it("Sincroniza los tres estados del ticket con la lista del caso", () => {
    const c = addConsultation({ ...full, identifier: "TEST-STATUS" });
    convertPlanToTasks(c, createPlan(c));
    const { result, unmount } = renderHook(() => useFollowupTasks());
    const id = `${c.id}-0`;
    expect(result.current.find((t) => t.id === id)).toMatchObject({
      priority: "Alta",
      status: "Pendiente",
      done: false,
      owner: "Coordinación · Elena Ruiz",
      date: "2026-10-20",
    });
    act(() => setFollowupStatus(id, "En revisión"));
    expect(result.current.find((t) => t.id === id)).toMatchObject({
      status: "En revisión",
      done: false,
    });
    act(() => setFollowupStatus(id, "Completada"));
    expect(result.current.find((t) => t.id === id)).toMatchObject({
      status: "Completada",
      done: true,
    });
    act(() => toggleFollowupTask(id));
    expect(result.current.find((t) => t.id === id)).toMatchObject({
      status: "Pendiente",
      done: false,
    });
    unmount();
  });
});
