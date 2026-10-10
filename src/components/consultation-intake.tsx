import { useState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { addConsultation, type DemoCase } from "@/lib/copilot";
import {
  assessConsultation,
  consultationSchema,
  priorities,
  type Consultation,
} from "@/lib/followup";

export function ConsultationAssessment({ consultation }: { consultation: Consultation }) {
  const assessment = assessConsultation(consultation);
  return (
    <div className="space-y-4 border-y border-border py-4">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h4 className="font-sans text-sm font-semibold">Completitud de la información</h4>
          <span className="text-sm font-semibold" aria-live="polite">
            {assessment.completeness}%
          </span>
        </div>
        <Progress value={assessment.completeness} aria-label="Completitud de la información" />
        <p className="mt-2 text-xs text-muted-foreground">
          {assessment.filled} de 7 campos rellenados · no valida su contenido.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-sans text-sm font-semibold">Lead score organizativo</h4>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
          {assessment.level} · {assessment.points}/5
        </span>
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {assessment.reasons.map((r) => (
          <li key={r}>· {r}</li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Bajo: 0–1 · Medio: 2–3 · Alto: 4–5 puntos. Solo organización; no es un score médico ni
        decide tratamientos.
      </p>
    </div>
  );
}

const empty: Consultation = {
  identifier: "",
  objective: "",
  area: "",
  priority: "Media",
  information: "",
  nextAction: "",
  date: "",
};
export function ConsultationIntake({ onCreated }: { onCreated: (c: DemoCase) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Consultation>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Consultation, string>>>({});
  function update(key: keyof Consultation, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors({});
  }
  return (
    <>
      <Button variant="soft" onClick={() => setOpen(true)}>
        <Plus />
        Nueva consulta
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto rounded-lg">
          <DialogTitle className="font-display text-3xl font-medium">Nueva consulta</DialogTitle>
          <DialogDescription>
            Entrada organizativa · Utiliza únicamente datos ficticios. No incluyas información
            personal real.
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const result = consultationSchema.safeParse(draft);
              if (!result.success) {
                setErrors(
                  Object.fromEntries(
                    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
                  ),
                );
                return;
              }
              try {
                const c = addConsultation(result.data);
                onCreated(c);
                setDraft(empty);
                setErrors({});
                setOpen(false);
                toast.success(`Consulta ${c.name} añadida`);
              } catch (error) {
                setErrors({
                  identifier:
                    error instanceof Error ? error.message : "No se pudo guardar la consulta.",
                });
              }
            }}
          >
            <div className="grid gap-6 md:grid-cols-[1fr_260px]">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="identifier">Identificador del caso *</Label>
                  <Input
                    id="identifier"
                    autoFocus
                    placeholder="EM-004"
                    maxLength={40}
                    value={draft.identifier}
                    onChange={(e) => update("identifier", e.target.value)}
                    aria-invalid={!!errors.identifier}
                    aria-describedby={errors.identifier ? "identifier-error" : undefined}
                  />
                  {errors.identifier && (
                    <p id="identifier-error" role="alert" className="text-xs text-destructive">
                      {errors.identifier}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="objective">Objetivo expresado *</Label>
                  <Textarea
                    id="objective"
                    placeholder="Solicita información sobre disponibilidad"
                    maxLength={500}
                    value={draft.objective}
                    onChange={(e) => update("objective", e.target.value)}
                    aria-invalid={!!errors.objective}
                  />
                  {errors.objective && (
                    <p role="alert" className="text-xs text-destructive">
                      {errors.objective}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="area">Zona de interés</Label>
                    <Input
                      id="area"
                      placeholder="No indicada"
                      maxLength={120}
                      value={draft.area}
                      onChange={(e) => update("area", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="priority">Nivel de prioridad</Label>
                    <select
                      id="priority"
                      value={draft.priority}
                      onChange={(e) => update("priority", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {priorities.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="information">Información disponible</Label>
                  <Textarea
                    id="information"
                    placeholder="Indica lo que consta; no completes por suposición"
                    maxLength={1000}
                    value={draft.information}
                    onChange={(e) => update("information", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nextAction">Próxima acción</Label>
                  <Input
                    id="nextAction"
                    placeholder="Confirmar disponibilidad con coordinación"
                    maxLength={300}
                    value={draft.nextAction}
                    onChange={(e) => update("nextAction", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Fecha prevista</Label>
                  <Input
                    id="date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                  {errors.date && (
                    <p role="alert" className="text-xs text-destructive">
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>
              <aside>
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
                  <ClipboardCheck className="size-4" />
                  PRIORIZACIÓN ORGANIZATIVA
                </p>
                <ConsultationAssessment consultation={draft} />
              </aside>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="ink" type="submit">
                Guardar consulta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
