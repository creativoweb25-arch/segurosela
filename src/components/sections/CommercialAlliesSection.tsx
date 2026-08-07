"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Handshake, Calendar } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { CommercialAlly } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";

interface CommercialAlliesSectionProps {
  onShowCalendar?: () => void;
}

export function CommercialAlliesSection({
  onShowCalendar,
}: CommercialAlliesSectionProps) {
  const mounted = useMounted();
  const [allies, setAllies] = useState<CommercialAlly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<CommercialAlly[]>("/api/commercial-allies")
      .then((data) => {
        const list = (data ?? []).filter((a) => a.active);
        setAllies(list);
      })
      .catch(() => setAllies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="aliados-comerciales"
      aria-labelledby="allies-heading"
      className="w-full py-20 sm:py-24"
      style={{ backgroundColor: "#f7f9fb" }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={mounted ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00455e]">
            <Handshake className="size-4" />
            Red de Colaboradores
          </span>
          <h2 id="allies-heading" className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
            Aliados Comerciales Baja California
          </h2>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
          <p className="mt-4 text-base text-slate-600">
            Trabajamos de la mano con instituciones de salud, hospitales y
            organizaciones para brindarte el mejor servicio.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : allies.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Handshake className="mx-auto mb-3 size-12 text-slate-300" />
            <p className="text-sm text-slate-500">
              Próximamente mostraremos a nuestros aliados comerciales.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {allies.map((ally, i) => (
              <motion.a
                key={ally.id}
                href={ally.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={mounted ? { opacity: 0, y: 20 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00455e]/30 hover:shadow-lg"
              >
                {/* Logo or name badge */}
                {ally.logoUrl ? (
                  <div className="flex h-16 w-full items-center justify-center overflow-hidden">
                    <img
                      src={ally.logoUrl}
                      alt={`Logo de ${ally.name}`}
                      className="max-h-16 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-16 w-full items-center justify-center rounded-lg px-3 text-center"
                    style={{ backgroundColor: "#00455e" }}
                  >
                    <span className="text-sm font-bold leading-tight text-white">
                      {ally.name}
                    </span>
                  </div>
                )}
                {/* Name */}
                <p className="text-center text-sm font-semibold leading-tight text-[#212121]">
                  {ally.name}
                </p>
                {ally.description && (
                  <p className="line-clamp-2 text-center text-xs text-slate-500">
                    {ally.description}
                  </p>
                )}
                {/* External link indicator */}
                <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-slate-100 text-slate-400 opacity-0 transition-all duration-300 group-hover:bg-[#faae0b] group-hover:text-[#212121] group-hover:opacity-100">
                  <ExternalLink className="size-3.5" />
                </span>
              </motion.a>
            ))}
          </div>
        )}

        {/* CTA: Calendar of health fairs */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left"
        >
          <div className="flex items-start gap-3">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-xl text-white"
              style={{ backgroundColor: "#00455e" }}
            >
              <Calendar className="size-6" />
            </div>
            <div>
              <h3 id="allies-calendar-heading" className="text-lg font-bold text-[#212121]">
                Calendario de Ferias de Salud
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Consulta las próximas ferias de salud en Baja California y
                Estado de México.
              </p>
            </div>
          </div>
          <Button
            onClick={onShowCalendar}
            className="shrink-0 font-semibold text-[#212121]"
            style={{ backgroundColor: "#faae0b" }}
          >
            <Calendar className="mr-2 size-4" />
            Ver Calendario
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default CommercialAlliesSection;
