import { useState } from "react";
import { Wand2, ShieldCheck, ListChecks, ClipboardList, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { analyzeInquiry, sampleInquiry, type InquiryAnalysis } from "@/lib/ai-analysis";
import {
  addAnalysisTasks,
  formatDemoDate,
  pendingAnalysisTaskCount,
  useFollowupTasks,
} from "@/lib/copilot";

export function AiInquiry() {
  const [text, setText] = useState(sampleInquiry);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InquiryAnalysis | null>(null);
  const [confirm, setConfirm] = useState(false);
  const tasks = useFollowupTasks();
  const pending = result ? pendingAnalysisTaskCount(result.key, result.tasks, tasks) : 0;

  const analyze = () => {
    if (!text.trim()) {
      toast.error("Escribe una consulta ficticia para analizar.");
      return;
    }
    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(analyzeInquiry(text));
      setLoading(false);
    }, 900);
  };

  return (
    <section
      id="analizar-ia"
      aria-labelledby="analizar-ia-title"
      className="mt-8 rounded-3xl border border-primary/30 bg-blush p-6 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">IA en el flujo de la clínica</p>
          <h2 id="analizar-ia-title" className="mt-2 text-4xl">Analizar una consulta con IA</h2>
          <p className="mt-2 font-display text-xl italic text-muted-foreground">
            De una consulta desordenada a un siguiente paso revisable en segundos.
          </p>
        </div>
        <span className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
          Datos ficticios · Experiencia de demostración
        </span>
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-card px-4 py-3 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        La IA organiza información y propone próximos pasos administrativos. No diagnostica, no prescribe y no sustituye al profesional médico.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <Label htmlFor="ai-inquiry">Consulta ficticia de paciente (editable)</Label>
          <Textarea
            id="ai-inquiry"
            value={text}
            maxLength={1200}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 min-h-44 bg-card"
          />
          <Button onClick={analyze} disabled={loading} variant="ink" className="mt-3 rounded-full px-6">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            Analizar consulta
          </Button>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-5" aria-live="polite">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> La IA está organizando la consulta…
            </p>
          ) : !result ? (
            <div className="text-sm text-muted-foreground">
              <p className="font-display text-2xl text-foreground">Aún sin análisis</p>
              <p className="mt-2">
                Pulsa «Analizar consulta» para obtener un resumen administrativo, la información pendiente, el próximo paso y tres tareas sugeridas.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                Análisis de demostración generado por IA
              </p>
              <Block title="Resumen administrativo"><p>{result.summary}</p></Block>
              <Block title="Información pendiente">
                <ul className="list-disc space-y-1 pl-5">{result.missing.map((m) => <li key={m}>{m}</li>)}</ul>
              </Block>
              <Block title="Próximo paso recomendado">
                <p className="flex gap-2"><ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />{result.nextStep}</p>
              </Block>
              <Block title="Tareas sugeridas">
                <ul className="space-y-2">
                  {result.tasks.map((t) => (
                    <li key={t.title} className="rounded-lg bg-muted px-3 py-2">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.owner} · {formatDemoDate(t.date)} (orientativa) · Prioridad {t.priority.toLowerCase()}
                      </p>
                    </li>
                  ))}
                </ul>
              </Block>
              <Button
                variant="ink"
                className="rounded-full"
                disabled={pending === 0}
                onClick={() => setConfirm(true)}
              >
                <ListChecks className="size-4" />
                {pending === 0 ? "Tareas ya añadidas" : "Convertir en tareas"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-medium">
              Añadir {pending} {pending === 1 ? "tarea" : "tareas"} a la bandeja
            </DialogTitle>
            <DialogDescription>
              Tareas administrativas, no pautas clínicas. Se añadirán a «Tareas de seguimiento» para el caso ficticio {result?.caseName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button
              variant="ink"
              className="rounded-full"
              onClick={() => {
                if (!result) return;
                const n = addAnalysisTasks(result.key, result.caseName, result.tasks);
                setConfirm(false);
                if (n) toast.success(`${n} tareas añadidas a la bandeja de trabajo`);
                else toast.info("Estas tareas ya estaban en la bandeja; no se han duplicado.");
              }}
            >
              <ClipboardList className="size-4" /> Confirmar · Añadir {pending} tareas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-lg">{title}</h3>
      {children}
    </div>
  );
}
