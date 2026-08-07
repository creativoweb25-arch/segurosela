"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Menu,
  Phone,
  Clock,
  Settings,
  Facebook,
  Instagram,
  Linkedin,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { fetcher } from "@/lib/fetcher";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { useMounted } from "@/hooks/use-mounted";

const NAV_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#blog", label: "Blog" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const mounted = useMounted();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect if we're on the home page or a sub-page (SSR-safe)
  const isHome = useSyncExternalStore(
    () => () => {},
    () => window.location.pathname === "/",
    () => true,
  );

  useEffect(() => {
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openAdmin = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-admin"));
    }
  };

  // Build nav href: on home, use anchors (#servicios); on sub-pages, use /#servicios
  const navHref = (anchor: string) => (isHome ? anchor : `/${anchor}`);

  return (
    <header aria-label="Encabezado principal" className="sticky top-0 z-50 w-full">
      {/* Utility top bar — dirección, horarios y teléfono alineados a la izquierda */}
      <div
        className="hidden md:block text-white"
        style={{ backgroundColor: "#001e3d" }}
      >
        <div className="container mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
          {/* Left: dirección, horarios, teléfono (en ese orden) */}
          <div className="flex min-w-0 items-center gap-5">
            <a
              href="#contacto"
              className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-[#faae0b]"
              title={settings.address}
            >
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{settings.address}</span>
            </a>
            <span className="flex shrink-0 items-center gap-1.5 opacity-90">
              <Clock className="size-3.5" />
              <span>{settings.schedule}</span>
            </span>
            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
              className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-[#faae0b]"
            >
              <Phone className="size-3.5" />
              <span>{settings.phone}</span>
            </a>
          </div>
          {/* Right: social icons */}
          <div className="flex shrink-0 items-center gap-3">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-colors hover:text-[#faae0b]"
              >
                <Facebook className="size-3.5" />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-colors hover:text-[#faae0b]"
              >
                <Instagram className="size-3.5" />
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="transition-colors hover:text-[#faae0b]"
              >
                <Linkedin className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {settings.logoUrl ? (
              <span
                className="flex items-center px-1 py-1"
                style={{ minHeight: "44px" }}
              >
                <img
                  src={settings.logoUrl}
                  alt={`Logo de ${settings.brandName}`}
                  className="h-10 w-auto object-contain"
                />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span
                  className="grid size-10 place-items-center rounded-md text-lg font-extrabold text-white"
                  style={{ backgroundColor: "#faae0b" }}
                >
                  {settings.logoText}
                </span>
                <span className="hidden sm:flex flex-col leading-tight">
                  <span className="text-sm font-bold uppercase tracking-wide text-[#00455e]">
                    {settings.brandName}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#faae0b]">
                    Seguros & Fianzas
                  </span>
                </span>
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={navHref(link.href)}
                className="relative px-3 py-2 text-sm font-medium text-[#00455e] transition-colors hover:text-[#faae0b]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex font-semibold text-[#212121]"
              style={{ backgroundColor: "#faae0b" }}
            >
              <a href={navHref("#cotizacion")}>Cotización</a>
            </Button>

            <button
              type="button"
              onClick={openAdmin}
              aria-label="Abrir administración"
              className="grid size-9 place-items-center rounded-md text-[#00455e] transition-colors hover:bg-[#00455e]/10 hover:text-[#faae0b]"
            >
              <Settings className="size-4" />
            </button>

            {/* Mobile menu — Sheet only renders after mount to avoid
                Radix ID hydration mismatch (aria-controls IDs differ
                between server and client). */}
            {mounted ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menú"
                    className="grid size-9 place-items-center rounded-md text-[#00455e] transition-colors hover:bg-[#00455e]/10 lg:hidden"
                  >
                    <Menu className="size-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 max-w-[85vw] p-0">
                  <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                  <div
                    className="flex h-16 items-center gap-2 border-b px-4"
                    style={{ backgroundColor: "#00455e" }}
                  >
                    <span
                      className="grid size-9 place-items-center rounded-md text-base font-extrabold text-white"
                      style={{ backgroundColor: "#faae0b" }}
                    >
                      {settings.logoText}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide text-white">
                      {settings.brandName}
                    </span>
                  </div>
                  <nav aria-label="Navegación móvil" className="flex flex-col py-2">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={navHref(link.href)}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-[#00455e]"
                      >
                        {link.label}
                        <ChevronRight className="size-4 opacity-50" />
                      </a>
                    ))}
                  </nav>
                  <div className="mt-auto border-t p-4">
                    <Button
                      asChild
                      className="w-full font-semibold text-[#212121]"
                      style={{ backgroundColor: "#faae0b" }}
                    >
                      <a href={navHref("#cotizacion")} onClick={() => setOpen(false)}>
                        Solicitar Cotización
                      </a>
                    </Button>
                    <a
                      href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                      className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-[#00455e]"
                    >
                      <Phone className="size-4" />
                      {settings.phone}
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <button
                type="button"
                aria-label="Abrir menú"
                className="grid size-9 place-items-center rounded-md text-[#00455e] transition-colors hover:bg-[#00455e]/10 lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
