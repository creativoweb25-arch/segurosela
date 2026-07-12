"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { Slide, SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_SLIDES: Slide[] = [
  {
    id: "s1",
    title: "Protege lo que más valoras",
    subtitle: "Seguros Personales y Empresariales",
    description:
      "Más de 10 años brindando tranquilidad a familias y empresas en Tijuana con las mejores aseguradoras.",
    buttonText: "Saber Más",
    buttonLink: "#cotizacion",
    imageUrl: "/images/hero/hero-family.png",
    order: 0,
    active: true,
  },
  {
    id: "s2",
    title: "Soluciones empresariales a tu medida",
    subtitle: "Seguros Empresariales",
    description:
      "Coberturas diseñadas para proteger tu negocio, activos y equipo de trabajo frente a cualquier imprevisto.",
    buttonText: "Saber Más",
    buttonLink: "#cotizacion",
    imageUrl: "/images/hero/hero-business.png",
    order: 1,
    active: true,
  },
  {
    id: "s3",
    title: "Fianzas confiables y rápidas",
    subtitle: "Servicio de Fianzas",
    description:
      "Gestión ágil de fianzas judiciales, administrativas y de fidelidad para cumplir con tus obligaciones.",
    buttonText: "Saber Más",
    buttonLink: "#cotizacion",
    imageUrl: "/images/hero/hero-bonds.png",
    order: 2,
    active: true,
  },
];

const AUTO_ADVANCE_MS = 6000;

export function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetcher<Slide[]>("/api/slides")
      .then((data) => {
        const list = (data ?? []).filter((s) => s.active).sort((a, b) => a.order - b.order);
        setSlides(list.length > 0 ? list : FALLBACK_SLIDES);
      })
      .catch(() => setSlides(FALLBACK_SLIDES))
      .finally(() => setLoading(false));
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
  }, []);

  const go = useCallback((next: number, dir = 1) => {
    setDirection(dir);
    setIndex((curr) => {
      const total = slides.length || 1;
      return ((next % total) + total) % total;
    });
  }, [slides.length]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section id="inicio" aria-labelledby="hero-heading" className="relative w-full">
      {/* Carousel */}
      <div className="relative w-full overflow-hidden bg-[#212121]">
        <div
          className="relative w-full"
          style={{ minHeight: "min(85vh, 720px)" }}
        >
          {loading || !current ? (
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {/* Background image */}
                <img
                  src={current.imageUrl}
                  alt={`${current.title} - Seguros y Fianzas ELA`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Dark teal gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, rgba(10,46,63,0.92) 0%, rgba(0,90,135,0.78) 45%, rgba(0,90,135,0.35) 100%)",
                  }}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Content overlay */}
          {!loading && current && (
            <div className="relative z-10 mx-auto flex h-full min-h-[min(85vh,720px)] max-w-7xl items-center px-4 sm:px-8">
              <div className="max-w-2xl py-16">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${current.id}`}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    {current.subtitle && (
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#212121]"
                        style={{ backgroundColor: "#faae0b" }}
                      >
                        <ChevronRight className="size-3.5" />
                        {current.subtitle}
                      </span>
                    )}
                    <h1 id="hero-heading" className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                      {current.title}
                    </h1>
                    {current.description && (
                      <p className="max-w-xl text-base text-white/85 sm:text-lg">
                        {current.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        asChild
                        size="lg"
                        className="font-semibold text-[#212121]"
                        style={{ backgroundColor: "#faae0b" }}
                      >
                        <a href={current.buttonLink || "#cotizacion"}>
                          {current.buttonText || "Saber Más"}
                          <ArrowRight className="size-4" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/40 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
                      >
                        <a href="#cotizacion">Cotización</a>
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Slide indicators */}
          {!loading && slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Ir al slide ${i + 1}`}
                  onClick={() => go(i, i > index ? 1 : -1)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 28 : 8,
                    backgroundColor: i === index ? "#faae0b" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
