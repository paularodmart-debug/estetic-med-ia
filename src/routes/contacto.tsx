import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Estetic Med IA" },
      { name: "description", content: "Dirección, teléfono y horario de la clínica Estetic Med IA en Madrid." },
      { property: "og:title", content: "Contacto — Estetic Med IA" },
      { property: "og:description", content: "Escríbenos o visítanos en nuestra clínica de Madrid." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-5 pt-14 md:grid-cols-2">
      <div>
        <h1 className="text-5xl md:text-6xl">Hablemos</h1>
        <p className="mt-3 text-muted-foreground">Resolvemos tus dudas sin compromiso.</p>
        <ul className="mt-8 space-y-5">
          {[
            { i: MapPin, t: "Calle de Serrano 45, 28001 Madrid" },
            { i: Phone, t: "+34 910 000 000" },
            { i: Mail, t: "hola@esteticmedia.es" },
            { i: Clock, t: "L–V 9:30–20:00 · S 10:00–14:00" },
          ].map(({ i: I, t }) => (
            <li key={t} className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary"><I className="size-5" /></span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (e.target as HTMLFormElement).reset();
          toast.success("Mensaje enviado. Te responderemos en menos de 24 h.");
        }}
        className="space-y-4 rounded-2xl border border-border bg-card p-7"
      >
        <div className="space-y-2"><Label>Nombre</Label><Input required className="h-11" /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" required className="h-11" /></div>
        <div className="space-y-2"><Label>Mensaje</Label><Textarea required rows={5} /></div>
        <button className="w-full rounded-full bg-ink py-3 text-ink-foreground hover:bg-ink/85">Enviar mensaje</button>
      </form>
    </main>
  );
}
