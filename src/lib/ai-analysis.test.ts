import { describe, expect, it } from "vitest";
import { analyzeInquiry, sampleInquiry } from "./ai-analysis";
import { addAnalysisTasks, pendingAnalysisTaskCount, useFollowupTasks } from "./copilot";
import { renderHook } from "@testing-library/react";

describe("Análisis de consulta con IA (simulado)", () => {
  const a = analyzeInquiry(sampleInquiry);
  it("Detecta que falta disponibilidad y canal", () => {
    expect(a.missing.some((m) => m.startsWith("Disponibilidad"))).toBe(true);
    expect(a.missing.some((m) => m.startsWith("Canal"))).toBe(true);
  });
  it("Propone tres tareas administrativas", () => {
    expect(a.tasks).toHaveLength(3);
    expect(a.caseName).toBe("Laura Sánchez");
  });
  it("Deriva al profesional si hay contenido clínico", () => {
    expect(analyzeInquiry("Soy Eva Gil, tengo dolor tras el tratamiento").clinicalFlag).toBe(true);
  });
  it("No duplica tareas al convertir dos veces", () => {
    expect(pendingAnalysisTaskCount(a.key, a.tasks)).toBe(3);
    expect(addAnalysisTasks(a.key, a.caseName, a.tasks)).toBe(3);
    expect(addAnalysisTasks(a.key, a.caseName, a.tasks)).toBe(0);
    const tasks = renderHook(() => useFollowupTasks()).result.current;
    expect(tasks.filter((t) => t.caseId === `ia-${a.key}`)).toHaveLength(3);
  });
});
