"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, ShieldCheck, Clock, BadgeCheck, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { useMounted } from "@/hooks/use-mounted";

const quoteSchema = z.object({
  name: z.string().min(3, "Ingresa tu nombre completo"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(7, "Ingresa un teléfono válido"),
  insuranceType: z.string().min(1, "Selecciona un tipo de seguro"),
  protectionLevel: z.string().min(1, "Selecciona un nivel de protección"),
  message: z.string().optional(),
  consent: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar el aviso de privacidad"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const INSURANCE_TYPES = [
  "Seguro de vida",
  "Seguro de auto",
  "Seguro de casa",
  "Seguro de viaje",
  "Seguro de negocio",
];

const PROTECTION_LEVELS = [
  "$0 - $250 MXN/mes",
  "$250 - $500 MXN/mes",
  "$500 - $1,000 MXN/mes",
  "$1,000 - $2,500 MXN/mes",
  "Más de $2,500 MXN/mes",
];

export function QuoteSection() {
  const mounted = useMounted();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
  }, []);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      insuranceType: "",
      protectionLevel: "",
      message: "",
      consent: false,
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const onSubmit = async (values: QuoteFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Error al enviar");
      toast.success("¡Cotización solicitada!", {
        description: "Nos pondremos en contacto contigo en breve.",
      });
      reset();
    } catch {
      toast.error("No pudimos enviar tu solicitud", {
        description: "Intenta de nuevo o llámanos directamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="cotizacion"
      aria-labelledby="quote-heading"
      className="relative w-full overflow-hidden py-20 sm:py-24"
      style={{ backgroundColor: "#00455e" }}
    >
      {/* Decorative shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "#23a1ea" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "#faae0b" }}
      />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Left column: heading + trust */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#faae0b]">
              <ShieldCheck className="size-4" />
              Cotización sin costo
            </span>
            <h2 id="quote-heading" className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              Solicite una cotización gratuita
            </h2>
            <p className="mt-4 max-w-md text-base text-white/85">
              Completa el formulario y un asesor especializado te contactará para
              diseñar la cobertura ideal para ti o tu empresa.
            </p>

            <a
              href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              <span
                className="grid size-11 place-items-center rounded-full text-[#212121]"
                style={{ backgroundColor: "#faae0b" }}
              >
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-white/70">
                  Llámanos ahora
                </span>
                <span className="block text-lg font-bold text-white">
                  {settings.phone}
                </span>
              </span>
            </a>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: BadgeCheck, text: "Asesoría sin compromiso" },
                { icon: ShieldCheck, text: "Coberturas a tu medida" },
                { icon: Clock, text: "Respuesta en menos de 24h" },
                { icon: BadgeCheck, text: "100% confidencial" },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 text-sm font-medium text-white/90"
                >
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full text-[#212121]"
                    style={{ backgroundColor: "#23a1ea" }}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right column: form */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 30 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <h3 id="quote-form-heading" className="mb-1 text-xl font-bold text-[#212121]">
              Formulario de cotización
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              Todos los campos marcados con * son obligatorios.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Nombre completo *
                  </label>
                  <Input
                    placeholder="Tu nombre"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Teléfono *
                  </label>
                  <Input
                    placeholder="66-XXXX-XXXX"
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Correo electrónico *
                </label>
                <Input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Tipo de seguro *
                  </label>
                  <Select
                    value={watch("insuranceType")}
                    onValueChange={(v) => setValue("insuranceType", v)}
                  >
                    <SelectTrigger className="w-full" aria-invalid={!!errors.insuranceType}>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.insuranceType && (
                    <p className="text-xs text-destructive">
                      {errors.insuranceType.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Nivel de protección *
                  </label>
                  <Select
                    value={watch("protectionLevel")}
                    onValueChange={(v) => setValue("protectionLevel", v)}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.protectionLevel}
                    >
                      <SelectValue placeholder="Selecciona un rango" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROTECTION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.protectionLevel && (
                    <p className="text-xs text-destructive">
                      {errors.protectionLevel.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Mensaje (opcional)
                </label>
                <Textarea
                  rows={3}
                  placeholder="Cuéntanos qué deseas proteger..."
                  {...register("message")}
                />
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="consent-quote"
                  checked={!!watch("consent")}
                  onCheckedChange={(v) => setValue("consent", v === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="consent-quote"
                  className="text-xs leading-relaxed text-slate-600"
                >
                  Acepto el{" "}
                  <a
                    href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#00455e] underline underline-offset-2 transition-colors hover:text-[#faae0b]"
                  >
                    aviso de privacidad
                  </a>{" "}
                  y autorizo a Seguros y Fianzas ELA a contactarme para dar
                  seguimiento a mi solicitud.
                </label>
              </div>
              {errors.consent && (
                <p className="-mt-2 text-xs text-destructive">
                  {errors.consent.message}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full font-semibold text-[#212121] disabled:opacity-70"
                style={{ backgroundColor: "#faae0b" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Solicitud
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default QuoteSection;
