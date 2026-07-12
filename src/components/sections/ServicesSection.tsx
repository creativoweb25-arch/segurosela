"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Building2,
  FileCheck,
  Car,
  HeartPulse,
  ArrowRight,
  User,
  Briefcase,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { Service } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { ServiceDetailDialog } from "@/components/sections/ServiceDetailDialog";

const ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  building: Building2,
  "file-check": FileCheck,
  car: Car,
  "heart-pulse": HeartPulse,
};

interface ServiceTab {
  id: string;
  label: string;
  icon: LucideIcon;
  service: Service;
}

const FALLBACK_SERVICES: Service[] = [
  {
    id: "s1",
    slug: "personal",
    title: "Seguros Personales",
    shortDesc: "Asegura tu familia y patrimonio.",
    description:
      "Entendemos lo importante que es crear un patrimonio, y sabemos que en cuestión de segundo puede verse afectado por un siniestro. En Seguros ELA contamos con una gran variedad de seguros personales que cubren los riesgos que pueden afectar la existencia, integridad y salud.",
    icon: "shield",
    imageUrl: "/images/hero/hero-family.png",
    order: 0,
    active: true,
  },
  {
    id: "s2",
    slug: "empresarial",
    title: "Seguros Empresariales",
    shortDesc: "Protegemos desde pequeñas hasta grandes empresas.",
    description:
      "Aseguramos su compañía en las diferentes actividades y servicios: Comercio, Construcción, Minería, Transformación, Transporte, Logística, etc.",
    icon: "building",
    imageUrl: "/images/hero/hero-business.png",
    order: 1,
    active: true,
  },
  {
    id: "s3",
    slug: "fianzas",
    title: "Fianzas",
    shortDesc: "Garantizamos el cumplimiento de obligaciones.",
    description:
      "Una Fianza es un contrato en el que se garantiza el cumplimiento de las obligaciones contraídas de un tercero. ELA cuenta con área especializada en fianzas y un enfoque que permite entender y resolver oportunamente sus necesidades de Afianzamiento.",
    icon: "file-check",
    imageUrl: "/images/hero/hero-bonds.png",
    order: 2,
    active: true,
  },
];

export function ServicesSection() {
  const mounted = useMounted();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetcher<Service[]>("/api/services")
      .then((data) => {
        const list = (data ?? [])
          .filter((s) => s.active)
          .sort((a, b) => a.order - b.order);
        setServices(list.length > 0 ? list : FALLBACK_SERVICES);
      })
      .catch(() => setServices(FALLBACK_SERVICES))
      .finally(() => setLoading(false));
  }, []);

  const tabs: ServiceTab[] = services.map((service, i) => {
    const Icon = ICONS[service.icon] ?? Shield;
    const labelMap: Record<string, string> = {
      "seguro-salud-y-vida": "Salud y Vida",
      "seguro-auto": "Auto",
      "seguro-empresarial": "Empresarial",
      fianzas: "Fianzas",
      personal: "Seguro Personal",
      empresarial: "Seguro Empresarial",
    };
    return {
      id: service.id || `tab-${i}`,
      label: labelMap[service.slug] || service.title,
      icon: Icon,
      service,
    };
  });

  const current = tabs[activeTab];

  return (
    <section id="servicios" aria-labelledby="services-heading" className="w-full bg-white py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={mounted ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#00455e]">
            Lo que hacemos
          </span>
          <h2 id="services-heading" className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
            Nuestros Servicios
          </h2>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
          <p className="mt-4 text-base text-slate-600">
            Soluciones integrales en seguros y fianzas con la asesoría de
            expertos y el respaldo de las mejores aseguradoras de México.
          </p>
        </motion.div>

        {loading || !current ? (
          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-40 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            {/* Tabs header */}
            <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tabs.map((tab, i) => {
                const isActive = i === activeTab;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`group flex items-center justify-center gap-2.5 rounded-lg px-4 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                      isActive
                        ? "text-white shadow-lg"
                        : "text-[#00455e] hover:text-[#faae0b]"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "#00455e" }
                        : { backgroundColor: "#f5f6f7" }
                    }
                    aria-selected={isActive}
                    role="tab"
                  >
                    <Icon
                      className={`size-5 transition-transform duration-300 ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <motion.div
              key={current.id}
              initial={mounted ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="relative min-h-[280px] overflow-hidden bg-slate-100 lg:min-h-[420px]">
                  {current.service.imageUrl ? (
                    <img
                      src={current.service.imageUrl}
                      alt={`${current.service.title} - Seguros y Fianzas ELA`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#00455e] to-[#23a1ea]">
                      <current.icon className="size-20 text-white/80" />
                    </div>
                  )}
                  {/* Overlay with service label like original site */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span
                      className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#212121]"
                      style={{ backgroundColor: "#faae0b" }}
                    >
                      {current.label}
                    </span>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="grid size-12 place-items-center rounded-xl text-white"
                      style={{ backgroundColor: "#00455e" }}
                    >
                      <current.icon className="size-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#faae0b]">
                      ¡Obtenga una cotización!
                    </span>
                  </div>

                  <h3 className="mb-3 text-2xl font-extrabold text-[#212121] sm:text-3xl">
                    {current.service.title}
                  </h3>

                  <p className="mb-4 text-lg font-semibold text-[#00455e]">
                    {current.service.shortDesc}
                  </p>

                  <p className="mb-8 text-base leading-relaxed text-slate-600">
                    {current.service.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        setDetailService(current.service);
                        setDetailOpen(true);
                      }}
                      className="font-semibold text-[#212121]"
                      style={{ backgroundColor: "#faae0b" }}
                    >
                      <span className="inline-flex items-center gap-2">
                        Saber Más
                        <ArrowRight className="size-4" />
                      </span>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-[#00455e] font-semibold text-[#00455e] hover:bg-[#00455e] hover:text-white"
                    >
                      <a href="#contacto">Contáctanos</a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trust badges row */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  icon: User,
                  title: "Atención Personalizada",
                  desc: "Asesoría dedicada para cada cliente",
                },
                {
                  icon: Briefcase,
                  title: "+10 Años de Experiencia",
                  desc: "Trayectoria respaldando familias y empresas",
                },
                {
                  icon: Handshake,
                  title: "11 Aseguradoras Aliadas",
                  desc: "GNP, Plan Seguro, Atlas, AXA, Zurich, Mapfre, HDI, GMX, Qualitas, Sura, Continental",
                },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={mounted ? { opacity: 0, y: 16 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: "#00455e" }}
                  >
                    <badge.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#212121]">
                      {badge.title}
                    </p>
                    <p className="text-xs text-slate-600">{badge.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service detail dialog with accordions */}
      <ServiceDetailDialog
        service={detailService}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </section>
  );
}

export default ServicesSection;
