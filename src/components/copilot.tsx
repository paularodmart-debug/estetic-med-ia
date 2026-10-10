import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import {
  Check,
  ClipboardList,
  CalendarDays,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  demoReply,
  suggestions,
  quickActions,
  convertPlanToTasks,
  formatDemoDate,
  useFollowupTasks,
  type DemoCase,
  type FollowupPlan,
} from "@/lib/copilot";

export function CopilotAvatar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-secondary font-display text-2xl italic text-foreground"
    >
      em
      <span className="mb-3 size-1 rounded-full bg-primary" />
    </span>
  );
}
type ChatMessage = UIMessage & { plan?: FollowupPlan | undefined };
type History = Record<string, ChatMessage[]>;

export function Copilot({
  selectedCase,
  open,
  onOpenChange,
}: {
  selectedCase: DemoCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [history, setHistory] = useState<History>({});
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(860px,94dvh)] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-lg p-0"
        aria-describedby="copilot-description"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5 py-4 pr-12">
          <CopilotAvatar />
          <div className="min-w-0">
            <DialogTitle className="font-display text-2xl font-medium leading-tight">
              Copiloto Estetic Med IA
            </DialogTitle>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              Asistente interno <span className="text-primary">· Demo</span>
            </p>
          </div>
        </div>
        <DialogDescription
          id="copilot-description"
          className="shrink-0 border-b border-border bg-muted/50 px-5 py-3 text-xs"
        >
          Caso ficticio <span className="font-semibold text-foreground">{selectedCase.name}</span> ·{" "}
          {selectedCase.professional}
        </DialogDescription>
        {open && (
          <ChatSession
            key={selectedCase.id}
            selectedCase={selectedCase}
            initialMessages={history[selectedCase.id]}
            onMessages={(messages) =>
              setHistory((prev) => ({ ...prev, [selectedCase.id]: messages }))
            }
          />
        )}
        <p className="flex shrink-0 items-start justify-center gap-2 border-t border-border bg-card px-4 py-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
          La IA organiza la información; la decisión corresponde siempre al profesional
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ChatSession({
  selectedCase,
  initialMessages,
  onMessages,
}: {
  selectedCase: DemoCase;
  initialMessages?: ChatMessage[] | undefined;
  onMessages: (messages: ChatMessage[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () =>
      initialMessages ?? [
        {
          id: "welcome",
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `Hola. Tengo cargado el caso ficticio de **${selectedCase.name}**.\n\n${selectedCase.purpose}\n\n¿Qué quieres preparar para su seguimiento?`,
            },
          ],
        },
      ],
  );
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  const tasks = useFollowupTasks();
  const converted = tasks.some((t) => t.caseId === selectedCase.id);
  useEffect(() => {
    textarea.current?.focus();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function save(next: ChatMessage[]) {
    setMessages(next);
    onMessages(next);
  }
  function send(text: string) {
    if (!text.trim() || locked.current) return;
    locked.current = true;
    const next: ChatMessage[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: text.trim() }] },
    ];
    save(next);
    setInput("");
    setBusy(true);
    textarea.current?.focus();
    timer.current = setTimeout(() => {
      const reply = demoReply(text.trim(), selectedCase);
      save([
        ...next,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [{ type: "text", text: reply.text }],
          plan: reply.plan,
        },
      ]);
      locked.current = false;
      setBusy(false);
      textarea.current?.focus();
    }, 850);
  }
  function convert(plan: FollowupPlan) {
    const count = convertPlanToTasks(selectedCase, plan);
    if (!count) return;
    save([
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `**${count} tareas añadidas al seguimiento de ${selectedCase.name}.**\n\nPuedes verlas y marcarlas en el Panel clínica. El borrador no se ha enviado y no se ha reservado ninguna cita.`,
          },
        ],
      },
    ]);
    toast.success(`${count} tareas añadidas al caso de ${selectedCase.name}`);
    textarea.current?.focus();
  }
  return (
    <>
      <Conversation className="min-h-0" aria-label="Conversación del Copiloto">
        <ConversationContent className="gap-5 p-5">
          {messages.map((m) => (
            <Message key={m.id} from={m.role} className="max-w-full">
              {m.role === "assistant" && (
                <p className="text-[11px] font-semibold text-primary">
                  Copiloto · Asistente interno
                </p>
              )}
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-ink group-[.is-user]:text-ink-foreground"
                    : "w-full"
                }
              >
                {m.parts.map((part, i) =>
                  part.type === "text" ? (
                    <MessageResponse key={i}>{part.text}</MessageResponse>
                  ) : null,
                )}
              </MessageContent>
              {m.plan && (
                <PlanCards
                  plan={m.plan}
                  converted={converted}
                  onConvert={() => convert(m.plan as FollowupPlan)}
                />
              )}
            </Message>
          ))}
          {messages.length === 1 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  onClick={() => send(s)}
                  className="h-auto min-h-16 justify-between whitespace-normal px-3 py-3 text-left text-xs"
                >
                  {s}
                  <ArrowUpRight className="shrink-0 text-primary" />
                </Button>
              ))}
            </div>
          )}
          {busy && (
            <div role="status" className="text-sm text-muted-foreground">
              <Shimmer>El Copiloto está escribiendo…</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton aria-label="Ir al último mensaje" />
      </Conversation>
      <div className="shrink-0 border-t border-border bg-background px-4 pb-4 pt-3">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="soft"
              size="sm"
              className="shrink-0 rounded-full"
              disabled={busy}
              onClick={() => send(action)}
            >
              {action}
            </Button>
          ))}
        </div>
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputTextarea
            ref={textarea}
            aria-label="Mensaje para el Copiloto"
            placeholder="Prepara el seguimiento de este caso…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-14 max-h-28"
          />
          <PromptInputFooter className="justify-between">
            <span className="text-[11px] text-muted-foreground">
              Solo organización · Datos ficticios
            </span>
            <PromptInputSubmit
              status={busy ? "submitted" : "ready"}
              disabled={busy || !input.trim()}
              aria-label="Enviar mensaje"
              className="size-8 shrink-0"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}

function PlanCards({
  plan,
  converted,
  onConvert,
}: {
  plan: FollowupPlan;
  converted: boolean;
  onConvert: () => void;
}) {
  return (
    <div className="mt-1 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <FileText className="size-4" />
            Resumen del caso
          </p>
          <p className="text-sm leading-relaxed">{plan.summary}</p>
        </article>
        <article className="rounded-lg border border-border bg-muted/60 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <ClipboardList className="size-4" />
            Datos pendientes
          </p>
          <ul className="space-y-1.5 text-sm">
            {plan.missing.map((x) => (
              <li key={x}>
                · {x} <span className="text-muted-foreground">— no consta</span>
              </li>
            ))}
            {!plan.missing.length && <li>Campos organizativos completos.</li>}
          </ul>
        </article>
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-semibold text-primary">Próxima acción</p>
          <p className="text-sm leading-relaxed">{plan.action}</p>
        </article>
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <CalendarDays className="size-4" />
            Fecha orientativa
          </p>
          <p className="font-display text-2xl">{formatDemoDate(plan.date)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Propuesta administrativa de demo · pendiente de aprobación
          </p>
        </article>
      </div>
      <article className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-primary">Borrador de mensaje · No enviado</p>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Copiar borrador"
            title="Copiar borrador"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(plan.draft);
                toast.success("Borrador copiado");
              } catch {
                toast.error("No se pudo copiar el borrador");
              }
            }}
          >
            <Copy />
          </Button>
        </div>
        <p className="mt-2 text-sm leading-relaxed">{plan.draft}</p>
      </article>
      <Button onClick={onConvert} disabled={converted} variant="ink" className="w-full sm:w-auto">
        {converted ? <Check /> : <ClipboardList />}
        {converted ? "Tareas añadidas al caso" : "Convertir en tareas"}
      </Button>
    </div>
  );
}
