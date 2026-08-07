"use client";

import * as React from "react";
import { Save, Loader2, Palette, Phone, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  ImageUploadField,
  LoadingRow,
  Notice,
  SectionHeader,
  apiGet,
  apiMutate,
} from "@/components/admin/shared";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";

export function SettingsTab() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<SiteSettings>("/api/settings");
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar");
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const payload: Partial<SiteSettings> = {
      brandName: settings.brandName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      logoText: settings.logoText,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      darkColor: settings.darkColor,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      schedule: settings.schedule,
      instagramUser: settings.instagramUser,
      instagramUrl: settings.instagramUrl,
      facebookUrl: settings.facebookUrl,
      linkedinUrl: settings.linkedinUrl,
      yearsExperience: Number(settings.yearsExperience) || 0,
      aboutText: settings.aboutText,
      aboutImageUrl: settings.aboutImageUrl,
    };
    const updated = await apiMutate<SiteSettings>("/api/settings", "PUT", payload);
    setSaving(false);
    if (updated) {
      setSettings({ ...DEFAULT_SETTINGS, ...updated });
      toast.success("Configuración guardada");
    }
  };

  if (loading || !settings) {
    return <LoadingRow label="Cargando configuración…" />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Personalización"
        description="Edita la identidad visual, contacto y textos generales del sitio."
        action={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Guardar cambios
          </Button>
        }
      />

      {/* Identidad */}
      <section className="space-y-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#212121]">
          <Palette className="size-4" />
          Identidad de marca
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre de marca">
            <Input
              value={settings.brandName}
              onChange={(e) => update("brandName", e.target.value)}
            />
          </Field>
          <Field label="Tagline / Lema">
            <Input
              value={settings.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </Field>
          <Field label="Texto del logo (cuando no hay imagen)" className="md:col-span-2">
            <Input
              value={settings.logoText}
              onChange={(e) => update("logoText", e.target.value)}
              maxLength={6}
            />
          </Field>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Logo (PNG/SVG con transparencia recomendado)"
              value={settings.logoUrl}
              onChange={(v) => update("logoUrl", v)}
              aspect="aspect-[3/1]"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <ColorField
            label="Color primario"
            value={settings.primaryColor}
            onChange={(v) => update("primaryColor", v)}
          />
          <ColorField
            label="Color secundario"
            value={settings.secondaryColor}
            onChange={(v) => update("secondaryColor", v)}
          />
          <ColorField
            label="Color de acento"
            value={settings.accentColor}
            onChange={(v) => update("accentColor", v)}
          />
          <ColorField
            label="Color oscuro"
            value={settings.darkColor}
            onChange={(v) => update("darkColor", v)}
          />
        </div>
      </section>

      {/* Contacto */}
      <section className="space-y-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#212121]">
          <Phone className="size-4" />
          Contacto
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Teléfono">
            <Input
              value={settings.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="WhatsApp (opcional)">
            <Input
              value={settings.whatsapp || ""}
              onChange={(e) => update("whatsapp", e.target.value || null)}
              placeholder="66-xxxx-xxxx"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Horario">
            <Input
              value={settings.schedule}
              onChange={(e) => update("schedule", e.target.value)}
            />
          </Field>
          <Field label="Dirección" className="md:col-span-2">
            <Input
              value={settings.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Redes */}
      <section className="space-y-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#212121]">
          <Share2 className="size-4" />
          Redes sociales
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Usuario de Instagram" hint="Sin @, solo el nombre de usuario.">
            <Input
              value={settings.instagramUser || ""}
              onChange={(e) => update("instagramUser", e.target.value || null)}
              placeholder="segurosela"
            />
          </Field>
          <Field label="URL de Instagram">
            <Input
              value={settings.instagramUrl || ""}
              onChange={(e) => update("instagramUrl", e.target.value || null)}
              placeholder="https://instagram.com/segurosela"
            />
          </Field>
          <Field label="URL de Facebook">
            <Input
              value={settings.facebookUrl || ""}
              onChange={(e) => update("facebookUrl", e.target.value || null)}
              placeholder="https://facebook.com/…"
            />
          </Field>
          <Field label="URL de LinkedIn">
            <Input
              value={settings.linkedinUrl || ""}
              onChange={(e) => update("linkedinUrl", e.target.value || null)}
              placeholder="https://linkedin.com/…"
            />
          </Field>
        </div>
      </section>

      {/* Nosotros */}
      <section className="space-y-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#212121]">
          <FileText className="size-4" />
          Sección "Nosotros"
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Años de experiencia">
            <Input
              type="number"
              min={0}
              value={settings.yearsExperience}
              onChange={(e) =>
                update("yearsExperience", Number(e.target.value) || 0)
              }
            />
          </Field>
          <Field label="Texto «Quiénes somos»" className="md:col-span-3">
            <Textarea
              rows={5}
              value={settings.aboutText}
              onChange={(e) => update("aboutText", e.target.value)}
            />
          </Field>
          <div className="md:col-span-3">
            <ImageUploadField
              label="Imagen «Quiénes somos»"
              hint="Imagen que se muestra en la sección Nosotros (recomendado: 720x900px, relación 4:5)"
              value={settings.aboutImageUrl}
              onChange={(v) => update("aboutImageUrl", v)}
              aspect="aspect-[4/5]"
            />
          </div>
        </div>
      </section>

      <Notice tone="info">
        Los cambios de colores y logo se aplican en cuanto guardas. Recarga el sitio para
        ver el resultado final en todas las secciones.
      </Notice>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00455e] text-white hover:bg-[#004a70]"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border bg-white p-0.5"
          aria-label={`${label} selector`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </Field>
  );
}
