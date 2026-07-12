"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { Partner } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";

const FALLBACK_PARTNERS: Partner[] = [
  { id: "p1", name: "AXA", logoUrl: "AXA", order: 0, active: true },
  { id: "p2", name: "GNP", logoUrl: "GNP", order: 1, active: true },
  { id: "p3", name: "MetLife", logoUrl: "MetLife", order: 2, active: true },
  { id: "p4", name: "Mapfre", logoUrl: "Mapfre", order: 3, active: true },
  { id: "p5", name: "Quálitas", logoUrl: "Quálitas", order: 4, active: true },
  { id: "p6", name: "Zurich", logoUrl: "Zurich", order: 5, active: true },
];

const isDataUri = (s: string) => s.startsWith("data:") || s.startsWith("http") || s.startsWith("/");

export function PartnersSection() {
  const mounted = useMounted();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<Partner[]>("/api/partners")
      .then((data) => {
        const list = (data ?? [])
          .filter((p) => p.active)
          .sort((a, b) => a.order - b.order);
        setPartners(list.length > 0 ? list : FALLBACK_PARTNERS);
      })
      .catch(() => setPartners(FALLBACK_PARTNERS))
      .finally(() => setLoading(false));
  }, []);

  // Duplicate list for seamless marquee
  const loopPartners = partners.length > 0 ? [...partners, ...partners] : [];

  return (
    <section
      id="aliados"
      aria-labelledby="partners-heading"
      className="w-full bg-[#212121] py-16"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-9 text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#23a1ea]">
            <ShieldCheck className="size-4" />
            Respaldo y confianza
          </span>
          <h2 id="partners-heading" className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            Nuestras Aseguradoras Aliadas
          </h2>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/70">
            Trabajamos con las aseguradoras líderes del país para ofrecerte la mejor
            cobertura y los precios más competitivos.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="group relative overflow-hidden">
            {/* Edge fade overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#212121] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#212121] to-transparent" />

            {/* Marquee */}
            <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-4 group-hover:[animation-play-state:paused]">
              {loopPartners.map((partner, i) => {
                const isImage = isDataUri(partner.logoUrl);
                return (
                  <div
                    key={`${partner.id}-${i}`}
                    className="flex h-24 min-w-[170px] items-center justify-center rounded-lg bg-white px-6 py-4 shadow-md transition-transform hover:scale-105"
                    title={partner.name}
                  >
                    {isImage ? (
                      <img
                        src={partner.logoUrl}
                        alt={`Logo de ${partner.name}`}
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-extrabold tracking-tight text-[#00455e]">
                        {partner.logoUrl || partner.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Marquee keyframes injected once */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

export default PartnersSection;
