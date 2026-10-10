import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { demoImpact, demoDurationSeconds, demoSceneAt } from "./demo-impact";
import { useDemoCases, useFollowupTasks, convertPlanToTasks, createPlan, pendingPlanTaskCount, setFollowupStatus } from "./copilot";

describe("Impacto organizativo de demostración", () => {
  const getCases = () => renderHook(() => useDemoCases()).result.current;
  const getTasks = () => renderHook(() => useFollowupTasks()).result.current;
  it("Cuenta las tres consultas de referencia", () => {
    expect(demoImpact(getCases(), getTasks()).organized).toBe(3);
  });
  it("Cuenta cuatro tareas abiertas, incluida la revisión", () => {
    expect(demoImpact(getCases(), getTasks()).pending).toBe(4);
  });
  it("Cuenta tres tareas completadas", () => {
    expect(demoImpact(getCases(), getTasks()).completed).toBe(3);
  });
  it("Promedia solo la información de María, Carmen y Ana", () => {
    const reference = getCases();
    const first = reference[0];
    if (!first) throw new Error("Falta referencia");
    expect(demoImpact([...reference, { ...first, id: "extra" }], getTasks()).information).toBe(90);
  });
  it("Conserva los 45 minutos como estimación separada", () => {
    expect(demoImpact([], []).estimatedMinutes).toBe(45);
  });
  it("Actualiza contadores al completar y reabrir", () => {
    act(() => setFollowupStatus("maria-0", "Completada"));
    expect(demoImpact(getCases(), getTasks())).toMatchObject({ pending: 3, completed: 4 });
    act(() => setFollowupStatus("maria-0", "Pendiente"));
    expect(demoImpact(getCases(), getTasks())).toMatchObject({ pending: 4, completed: 3 });
  });
  it("Previsualiza y añade dos tareas nuevas de María, sin duplicar la existente ni la segunda pulsación", () => {
    const maria = getCases().find((c) => c.id === "maria");
    if (!maria) throw new Error("Falta María");
    expect(pendingPlanTaskCount(maria, getTasks())).toBe(2);
    act(() => { expect(convertPlanToTasks(maria, createPlan(maria))).toBe(2); });
    expect(getTasks().filter((t) => t.caseId === "maria")).toHaveLength(5);
    act(() => { expect(convertPlanToTasks(maria, createPlan(maria))).toBe(0); });
    expect(pendingPlanTaskCount(maria, getTasks())).toBe(0);
  });
  it("La mini-demo dura 45 segundos y recorre cuatro escenas", () => {
    expect(demoDurationSeconds).toBe(45);
    expect([0, 12, 24, 36, 45].map(demoSceneAt)).toEqual([0, 1, 2, 3, 3]);
  });
});