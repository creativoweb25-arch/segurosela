"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  ChevronRight,
  Clock,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { Post, SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";

const QUICK_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#blog", label: "Blog" },
  { href: "#contacto", label: "Contacto" },
];

// Deterministic date formatter — avoids hydration mismatches from locale ICU data
const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
    fetcher<Post[]>("/api/posts?limit=3")
      .then((data) => setRecentPosts((data ?? []).slice(0, 3)))
      .catch(() => setRecentPosts([]));
  }, []);

  const year = new Date().getFullYear();
  const profileUrl =
    settings.instagramUrl ||
    `https://instagram.com/${settings.instagramUser || "segurosela"}`;

  return (
    <footer
      aria-label="Pie de página - Seguros y Fianzas ELA"
      className="mt-auto w-full text-white"
      style={{ backgroundColor: "#001e3d" }}
    >
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + about */}
          <div>
            {settings.logoUrl ? (
              /* Si hay logo, mostrarlo directamente sobre el fondo oscuro.
                 Ideal para logos blancos sin fondo. */
              <div className="mb-5">
                <img
                  src={settings.logoUrl}
                  alt={`Logo de ${settings.brandName}`}
                  className="h-11 w-auto max-w-[180px] object-contain brightness-0 invert"
                />
              </div>
            ) : (
              /* Si no hay logo, mostrar badge + nombre */
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="grid size-10 place-items-center rounded-md text-lg font-extrabold text-white"
                  style={{ backgroundColor: "#faae0b" }}
                >
                  {settings.logoText}
                </span>
                <span className="text-base font-bold uppercase tracking-wide">
                  {settings.brandName}
                </span>
              </div>
            )}
            <p className="text-sm leading-relaxed text-white/70">
              {settings.aboutText}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="grid size-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-[#faae0b] hover:text-[#212121]"
                >
                  <Facebook className="size-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid size-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-[#faae0b] hover:text-[#212121]"
                >
                  <Instagram className="size-4" />
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="grid size-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-[#faae0b] hover:text-[#212121]"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#faae0b]">
              Enlaces rápidos
            </h2>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-[#23a1ea]"
                  >
                    <ChevronRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#faae0b]">
              Contacto
            </h2>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#23a1ea]" />
                <span>{settings.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-[#23a1ea]"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-[#23a1ea]" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-start gap-2.5 break-all transition-colors hover:text-[#23a1ea]"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-[#23a1ea]" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-[#23a1ea]" />
                <span>{settings.schedule}</span>
              </li>
            </ul>
          </div>

          {/* Recent posts */}
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#faae0b]">
              Publicaciones recientes
            </h2>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-white/60">Sin publicaciones recientes.</p>
            ) : (
              <ul className="space-y-4">
                {recentPosts.map((post) => (
                  <li key={post.id} className="group flex gap-3">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={`${post.title} - Blog Seguros ELA`}
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <a
                        href="#blog"
                        className="line-clamp-2 text-sm font-medium text-white/85 transition-colors group-hover:text-[#23a1ea]"
                      >
                        {post.title}
                      </a>
                      <p className="mt-0.5 text-xs text-white/50">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#23a1ea] transition-colors hover:text-[#faae0b]"
            >
              <Instagram className="size-3.5" />
              Síguenos en Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/60 sm:flex-row sm:px-8">
          <p suppressHydrationWarning>
            Seguros y Fianzas ELA &copy; {year} Todos los Derechos Reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="transition-colors hover:text-white">
              Aviso de Privacidad
            </Link>
            <span className="opacity-30">|</span>
            <a href="#inicio" className="transition-colors hover:text-white">
              Volver arriba
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
