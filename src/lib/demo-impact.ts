import { assessConsultation } from "./followup";
import type { DemoCase, FollowupTask } from "./copilot";

const referenceIds = ["maria", "carmen", "ana"];
export const demoDurationSeconds = 45;
export function demoSceneAt(seconds: number) {
  return Math.min(3, Math.max(0, Math.floor(seconds / (demoDurationSeconds / 4))));
}
export function demoImpact(cases: DemoCase[], tasks: FollowupTask[]) {
  const reference = cases.filter((c) => referenceIds.includes(c.id));
  return {
    organized: reference.length,
    pending: tasks.filter((t) => t.status !== "Completada").length,
    completed: tasks.filter((t) => t.status === "Completada").length,
    information: reference.length
      ? Math.round(reference.reduce((sum, c) => sum + (c.consultation ? assessConsultation(c.consultation).completeness : 0), 0) / reference.length)
      : 0,
    estimatedMinutes: 45,
  };
}