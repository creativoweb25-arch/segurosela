"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  X,
} from "lucide-react";
import type { Service, ServiceFeature } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

function parseFeatures(features?: string | null): ServiceFeature[] {
  if (!features) return [];
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface ServiceDetailDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailDialog({
  service,
  open,
  onOpenChange,
}: ServiceDetailDialogProps) {
  if (!service) return null;

  const features = parseFeatures(service.features);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          {/* Dialog content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            {service.imageUrl && (
              <div className="relative h-40 overflow-hidden sm:h-48">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Close button */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-[#00455e] shadow-lg transition-colors hover:bg-white"
                  aria-label="Cerrar"
                >
                  <X className="size-5" />
                </button>
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span
                    className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#212121]"
                    style={{ backgroundColor: "#faae0b" }}
                  >
                    Servicio
                  </span>
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                    {service.title}
                  </h2>
                </div>
              </div>
            )}

            {/* Scrollable content */}
            <div className="max-h-[calc(90vh-12rem)] overflow-y-auto">
              <div className="p-6 sm:p-8">
                {/* Short description */}
                <p className="mb-3 text-lg font-semibold text-[#00455e]">
                  {service.shortDesc}
                </p>

                {/* Full description */}
                <p className="mb-6 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>

                {/* Coberturas with accordions */}
                {features.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#212121]">
                      Coberturas detalladas
                    </h3>
                    <Accordion type="single" collapsible className="space-y-2">
                      {features.map((feature, i) => (
                        <AccordionItem
                          key={i}
                          value={`item-${i}`}
                          className="overflow-hidden rounded-lg border border-slate-200 px-0"
                        >
                          <AccordionTrigger className="flex items-center gap-2 px-4 py-3 text-left text-sm font-bold text-[#212121] hover:no-underline hover:bg-slate-50">
                            <CheckCircle2
                              className="size-4 shrink-0"
                              style={{ color: "#faae0b" }}
                            />
                            <span className="flex-1">{feature.name}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 pt-1 text-sm leading-relaxed text-slate-600">
                            {feature.detail}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {/* CTA */}
                <div
                  className="mt-6 rounded-xl p-5 text-center"
                  style={{ backgroundColor: "#00455e" }}
                >
                  <p className="mb-3 text-sm font-semibold text-white">
                    ¿Interesado en este servicio?
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      asChild
                      className="font-semibold text-[#212121]"
                      style={{ backgroundColor: "#faae0b" }}
                      onClick={() => onOpenChange(false)}
                    >
                      <a href="#cotizacion" className="inline-flex items-center gap-2">
                        Solicitar Cotización
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      className="border-2 border-white bg-transparent font-semibold text-white hover:bg-white hover:text-[#00455e]"
                      onClick={() => onOpenChange(false)}
                    >
                      <a href="#contacto" className="inline-flex items-center gap-2">
                        <Phone className="size-4" />
                        Contactar
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default ServiceDetailDialog;
