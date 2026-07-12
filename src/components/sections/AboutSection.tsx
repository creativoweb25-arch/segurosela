"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Award, Users, Building2, Flag } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { useMounted } from "@/hooks/use-mounted";

const FEATURES = [
  "Empresa 100% Mexicana",
  "Atención personalizada",
  "Amplia cartera de aseguradoras",
  "Equipo profesional certificado",
];

const STATS = [
  { value: "10+", label: "Años de trayectoria", icon: Award },
  { value: "500+", label: "Clientes protegidos", icon: Users },
  { value: "11", label: "Aseguradoras aliadas", icon: Building2 },
  { value: "100%", label: "Mexicana", icon: Flag },
];

export function AboutSection() {
  const mounted = useMounted();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
  }, []);

  return (
    <section
      id="nosotros"
      aria-labelledby="about-heading"
      className="relative w-full overflow-hidden bg-slate-50 py-20 sm:py-24"
    >
      {/* Decorative blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "#23a1ea" }}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={mounted ? { opacity: 0, x: -30 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={settings.aboutImageUrl || "/images/hero/hero-family.png"}
                alt="Familia protegida con seguros de Seguros y Fianzas ELA"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,46,63,0) 50%, rgba(10,46,63,0.5) 100%)",
                }}
              />
            </div>
            {/* Experience badge */}
            <motion.div
              initial={mounted ? { opacity: 0, scale: 0.8 } : false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -left-2 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl sm:-left-6 sm:p-5"
            >
              <div
                className="grid size-12 place-items-center rounded-lg text-white"
                style={{ backgroundColor: "#00455e" }}
              >
                <Award className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#00455e]">
                  +{settings.yearsExperience || 10}
                </p>
                <p className="text-xs font-medium text-slate-600">
                  años de trayectoria
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={mounted ? { opacity: 0, x: 30 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#00455e]">
              Conócenos
            </span>
            <h2 id="about-heading" className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
              Quienes Somos
            </h2>
            <div
              className="mt-4 h-1.5 w-24 rounded-full"
              style={{ backgroundColor: "#faae0b" }}
            />
            <p className="mt-6 text-base leading-relaxed text-slate-600">
              {settings.aboutText}
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={mounted ? { opacity: 0, y: 12 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-2.5 text-sm font-medium text-slate-700"
                >
                  <span
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white"
                    style={{ backgroundColor: "#23a1ea" }}
                  >
                    <Check className="size-3.5" />
                  </span>
                  {feature}
                </motion.li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={mounted ? { opacity: 0, y: 16 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
                  >
                    <Icon
                      className="mx-auto mb-1.5 size-5"
                      style={{ color: "#00455e" }}
                    />
                    <p className="text-2xl font-extrabold text-[#212121]">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
