import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ListOrdered, MessageCircle, ClipboardList, UserRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoDurationSeconds, demoSceneAt } from "@/lib/demo-impact";

export const demoSteps = ["Seleccionar caso", "Abrir Copiloto", "Revisar propuesta", "Convertir en tareas"] as const;
const scenes = [
  { icon: UserRound, title: "María García", detail: "Caso ficticio · Prioridad alta · Información completa", lines: ["Responsable: Coordinación · Elena Ruiz", "Próxima acción: completar datos y coordinar revisión"] },
  { icon: MessageCircle, title: "Copiloto Estetic Med IA", detail: "Asistente interno · Contexto de María cargado", lines: ["Crear plan de seguimiento", "La decisión corresponde siempre al profesional"] },
  { icon: ClipboardList, title: "Propuesta de seguimiento", detail: "Pendiente de revisión profesional", lines: ["Revisar y aprobar el borrador de contacto", "Completar datos y coordinar revisión", "Fecha administrativa orientativa: 12 de octubre"] },
  { icon: Check, title: "Tareas de seguimiento", detail: "Simulación · Tareas administrativas, no pautas clínicas", lines: ["Validar los datos organizativos", "Revisar el borrador de contacto", "Coordinar revisión y registrar la respuesta"] },
];

export function DemoPreview() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [staticView, setStaticView] = useState(false);
  const reduced = useRef(false);
  const tick = useRef(0);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reduced.current = media.matches; if (media.matches) { setStaticView(true); setPlaying(false); } };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing || staticView) return;
    tick.current = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - tick.current) / 1000;
      tick.current = now;
      setElapsed((value) => Math.min(demoDurationSeconds, value + delta));
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing, staticView]);
  useEffect(() => { if (elapsed >= demoDurationSeconds) setPlaying(false); }, [elapsed]);
  const current = demoSceneAt(elapsed);
  const visible = staticView ? scenes : scenes.filter((_, i) => i === current);
  return (
    <article className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5" aria-label="Demo rápida · 45 segundos">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-2xl">Demo rápida · 45 segundos</h3>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">Duración: 45 segundos</p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{staticView ? "Sin movimiento" : `${Math.floor(elapsed)} / 45 s`}</span>
      </div>
      <div className={`mt-4 ${staticView ? "grid gap-4 sm:grid-cols-2" : "min-h-60"}`}>
        {visible.map((scene) => {
          const i = scenes.indexOf(scene); const Icon = scene.icon;
          return (
            <div key={scene.title} className={`border-l-2 border-primary pl-4 ${staticView ? "" : "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"}`}>
              <p className="text-xs font-semibold text-primary">{i + 1}. {demoSteps[i]}</p>
              <div className="mt-4 flex items-center gap-3"><Icon className="size-6 shrink-0 text-primary" /><h4 className="text-2xl">{scene.title}</h4></div>
              <p className="mt-2 text-xs text-muted-foreground">{scene.detail}</p>
              <ul className="mt-4 space-y-2 text-sm">{scene.lines.map((line) => <li key={line} className="flex gap-2"><span className="text-primary">·</span>{line}</li>)}</ul>
            </div>
          );
        })}
      </div>
      {!staticView && <progress className="mt-4 h-1 w-full accent-primary" max={demoDurationSeconds} value={elapsed} aria-label="Progreso de la demo" />}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="ink" size="icon" title={playing ? "Pausar demo" : "Reproducir demo"} aria-label={playing ? "Pausar demo" : "Reproducir demo"} disabled={staticView} onClick={() => { if (elapsed >= 45) setElapsed(0); setPlaying(!playing); }}>{playing ? <Pause /> : <Play />}</Button>
        <Button variant="outline" size="icon" title="Reiniciar demo" aria-label="Reiniciar demo" onClick={() => { setElapsed(0); setPlaying(false); }}><RotateCcw /></Button>
        <Button variant={staticView ? "secondary" : "ghost"} size="sm" aria-pressed={staticView} onClick={() => { setPlaying(false); setStaticView(!staticView); }}><ListOrdered />{staticView ? "Vista animada" : "Vista estática"}</Button>
        <span role="status" className="text-xs text-muted-foreground">{staticView ? "Los cuatro pasos" : elapsed >= 45 ? "Demo finalizada" : playing ? "Reproduciendo" : "En pausa"}</span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Simulación con datos ficticios · No modifica los casos ni envía mensajes. Solo organización administrativa.</p>
    </article>
  );
}