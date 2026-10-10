import { describe, expect, it } from "vitest";
import { clinicalRefusal, createPlan, demoCases, demoReply, convertPlanToTasks } from "./copilot";

describe("Límites del Copiloto de demostración", () => {
  const c = demoCases[0];
  it.each([
    ["No diagnosticar", "¿Qué diagnóstico tiene?"],
    ["No prescribir", "Prescribe un tratamiento para María"],
    ["No interpretar fotografías", "Interpreta esta fotografía"],
    ["No prometer resultados", "Promete resultados del seguimiento"],
    ["No recomendar médicamente", "¿Qué medicamento recomiendas?"],
    ["Priorizar el límite frente a acciones", "Crea un plan de seguimiento con dosis de botox"],
  ])("%s", (_, input) => { expect(demoReply(input, c)).toEqual({ text: clinicalRefusal }); });
  it("No inventar datos ausentes", () => {
    const incomplete = demoCases[1];
    expect(createPlan(incomplete).missing).toEqual(["Canal de contacto preferido"]);
    expect(demoReply("¿Cuál es el canal de contacto?", incomplete).plan).toBeUndefined();
    expect(incomplete.channel).toBeNull();
  });
  it("Crear un plan con contexto del caso seleccionado", () => {
    expect(demoReply("Crear plan de seguimiento", demoCases[1]).plan?.summary).toContain("Carmen López");
    expect(createPlan(demoCases[1]).missing).toEqual(["Canal de contacto preferido"]);
  });
  it("Convertir próximas acciones en tareas sin duplicarlas", () => {
    const fresh = { ...c, id: "TEST-CONVERSION" };
    expect(convertPlanToTasks(fresh, createPlan(fresh))).toBe(3);
    expect(convertPlanToTasks(fresh, createPlan(fresh))).toBe(0);
  });
});