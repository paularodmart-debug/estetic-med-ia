import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/tratamientos", label: "Tratamientos" },
  { to: "/contacto", label: "Contacto" },
  { to: "/panel", label: "Ver demo para clínicas" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="font-display text-2xl tracking-tight text-foreground">
      Estetic Med <span className="italic text-primary">IA</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }} activeOptions={{ exact: l.to === "/" }}>
              {l.label}
            </Link>
          ))}
          <Link to="/reservar" className="rounded-full bg-ink px-5 py-2 text-sm text-ink-foreground transition hover:bg-ink/85">
            Reservar cita
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú" aria-expanded={open}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 py-4 md:hidden">
          {[...links, { to: "/reservar", label: "Reservar cita" } as const].map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 text-base hover:bg-accent">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Estetic Med <span className="italic">IA</span></p>
          <p className="mt-2 text-sm opacity-70">Medicina estética con criterio médico y resultados naturales.</p>
        </div>
        <div className="text-sm opacity-80">
          <p>Calle de Serrano 45, 28001 Madrid</p>
          <p>+34 910 000 000 · hola@esteticmedia.es</p>
        </div>
        <div className="text-sm opacity-80">
          <p>Lunes a viernes 9:30 – 20:00</p>
          <p>Sábados 10:00 – 14:00</p>
        </div>
      </div>
      <p className="border-t border-sidebar-border py-5 text-center text-xs opacity-60">© 2026 Estetic Med IA</p>
    </footer>
  );
}
