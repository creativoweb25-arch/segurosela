"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const contactSchema = z.object({
  name: z.string().min(3, "Ingresa tu nombre completo"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Ingresa un asunto"),
  message: z.string().min(10, "Tu mensaje debe tener al menos 10 caracteres"),
  consent: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar el aviso de privacidad"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const mounted = useMounted();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      consent: false,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Error al enviar");
      toast.success("¡Mensaje enviado!", {
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      reset();
    } catch {
      toast.error("No pudimos enviar tu mensaje", {
        description: "Intenta de nuevo o escríbenos a " + settings.email,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: MapPin,
      label: "Dirección",
      value: settings.address,
    },
    {
      icon: Phone,
      label: "Teléfono",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^0-9+]/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: Clock,
      label: "Horario",
      value: settings.schedule,
    },
  ];

  return (
    <section
      id="contacto"
      aria-labelledby="contact-heading"
      className="w-full bg-white py-20 sm:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00455e]">
            <MessageSquare className="size-4" />
            Estamos para ayudarte
          </span>
          <h2 id="contact-heading" className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
            Contáctanos
          </h2>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
          <p className="mt-4 text-base text-slate-600">
            ¿Tienes dudas o necesitas asesoría? Escríbenos y un especialista te
            atenderá a la brevedad.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: contact info + map */}
          <motion.div
            initial={mounted ? { opacity: 0, x: -20 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: "#00455e" }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="block text-sm font-medium text-[#212121] transition-colors hover:text-[#faae0b]"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-[#212121]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Real Google Maps embed — shows red pin marker at the exact location.
                Uses www.google.com/maps which redirects to the embed endpoint
                that reliably displays the marker (gota) on the map. */}
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title={`Ubicación de ${settings.brandName}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  settings.address
                )}&z=16&output=embed&iwloc=A`}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {/* Business info overlay on the map */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:right-auto sm:max-w-xs">
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: "#00455e" }}
                  >
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#212121]">
                      {settings.brandName}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-600">
                      {settings.address}
                    </p>
                  </div>
                </div>
              </div>
              {/* "Ver en Google Maps" button for directions */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  settings.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#00455e] shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
              >
                <MapPin className="size-3.5" />
                Cómo llegar
              </a>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={mounted ? { opacity: 0, x: 20 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8"
          >
            <h3 id="contact-form-heading" className="mb-1 text-xl font-bold text-[#212121]">
              Envíanos un mensaje
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              Completa el formulario y te responderemos lo antes posible.
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
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Teléfono
                  </label>
                  <Input placeholder="66-XXXX-XXXX" {...register("phone")} />
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Asunto *</label>
                <Input
                  placeholder="¿Sobre qué nos quieres contactar?"
                  aria-invalid={!!errors.subject}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mensaje *</label>
                <Textarea
                  rows={4}
                  placeholder="Escribe tu mensaje aquí..."
                  aria-invalid={!!errors.message}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="consent-contact"
                  checked={!!watch("consent")}
                  onCheckedChange={(v) => setValue("consent", v === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="consent-contact"
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
                  y autorizo a Seguros y Fianzas ELA a tratar mis datos para dar
                  seguimiento a mi mensaje.
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
                className="w-full font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: "#00455e" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Mensaje
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

export default ContactSection;
