"use client";

import * as React from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  ImageUploadField,
  LoadingRow,
  Notice,
  SectionHeader,
  apiGet,
  apiMutate,
} from "@/components/admin/shared";
import type { Service } from "@/lib/types";

const ICON_OPTIONS = [
  { value: "shield", label: "Escudo (Shield)" },
  { value: "building", label: "Edificio (Building)" },
  { value: "file-check", label: "Documento verificado (FileCheck)" },
  { value: "car", label: "Auto (Car)" },
  { value: "home", label: "Casa (Home)" },
  { value: "heart", label: "Corazón (Heart)" },
  { value: "umbrella", label: "Paraguas (Umbrella)" },
  { value: "users", label: "Usuarios (Users)" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

type Draft = {
  id?: string;
  slug: string;
  title: string;
  shortDesc: string;
  description: string;
  features: string;
  icon: string;
  imageUrl: string | null;
  order: number;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  slug: "",
  title: "",
  shortDesc: "",
  description: "",
  features: "",
  icon: "shield",
  imageUrl: null,
  order: 0,
  active: true,
};

export function ServicesTab() {
  const [items, setItems] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Service[]>("/api/services");
      setItems(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const startEdit = (s: Service) => {
    setEditing({
      id: s.id,
      slug: s.slug,
      title: s.title,
      shortDesc: s.shortDesc,
      description: s.description,
      features: s.features || "",
      icon: s.icon,
      imageUrl: s.imageUrl,
      order: s.order,
      active: s.active,
    });
  };

  const startCreate = () => {
    const nextOrder = items.length
      ? Math.max(...items.map((i) => i.order)) + 1
      : 1;
    setEditing({ ...EMPTY_DRAFT, order: nextOrder });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    setSaving(true);
    const slug = editing.slug.trim() || slugify(editing.title);
    const id = editing.id || crypto.randomUUID();
    const body = {
      id,
      slug,
      title: editing.title.trim(),
      shortDesc: editing.shortDesc,
      description: editing.description,
      features: editing.features || null,
      icon: editing.icon,
      imageUrl: editing.imageUrl,
      order: Number(editing.order) || 0,
      active: editing.active,
    };
    // PUT /api/services (upsert by id) works for both create and update.
    const updated = await apiMutate<Service>(
      editing.id ? `/api/services/${editing.id}` : "/api/services",
      "PUT",
      body
    );
    setSaving(false);
    if (updated) {
      toast.success(editing.id ? "Servicio actualizado" : "Servicio creado");
      setEditing(null);
      await load();
    }
  };

  const remove = async (id: string) => {
    const ok = await apiMutate(`/api/services/${id}`, "DELETE");
    if (ok) {
      toast.success("Servicio eliminado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const move = async (s: Service, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === s.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      apiMutate(`/api/services/${s.id}`, "PUT", { order: swap.order }),
      apiMutate(`/api/services/${swap.id}`, "PUT", { order: s.order }),
    ]);
    toast.success("Orden actualizado");
    await load();
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Servicios"
        description="Servicios principales que se muestran en la página de inicio."
        action={
          <Button
            onClick={startCreate}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-4" />
            Nuevo servicio
          </Button>
        }
      />

      <Notice tone="warning">
        Por defecto solo se muestran los servicios activos. Si desactivas uno,
        desaparecerá del sitio público y de esta lista al recargar.
      </Notice>

      {loading ? (
        <LoadingRow label="Cargando servicios…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay servicios"
          description="Crea tu primer servicio para mostrarlo en la página principal."
          icon={Briefcase}
          action={
            <Button
              onClick={startCreate}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Nuevo servicio
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((s, i, arr) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(s, -1)}
                    disabled={i === 0}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(s, 1)}
                    disabled={i === arr.length - 1}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-[#00455e]/10 text-[#00455e]">
                  <Briefcase className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {s.title}
                    </p>
                    {!s.active && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.shortDesc || s.description.slice(0, 80)}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    slug: {s.slug} · icon: {s.icon} · orden: {s.order}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(s)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(s.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <Field label="Título">
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="Seguro Personal"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Slug" hint="Se autogenera si lo dejas vacío.">
                  <Input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    placeholder="seguro-personal"
                  />
                </Field>
                <Field label="Ícono">
                  <select
                    value={editing.icon}
                    onChange={(e) =>
                      setEditing({ ...editing, icon: e.target.value })
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Descripción corta" hint="Se muestra en la tarjeta.">
                <Input
                  value={editing.shortDesc}
                  onChange={(e) =>
                    setEditing({ ...editing, shortDesc: e.target.value })
                  }
                  placeholder="Protege lo que más importa…"
                />
              </Field>
              <Field
                label="Descripción completa"
                hint="Se muestra al hacer clic en «Saber Más»."
              >
                <Textarea
                  rows={5}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </Field>
              <ImageUploadField
                label="Imagen del servicio"
                hint="Se muestra en la pestaña del servicio (recomendado: 1344x768px, relación 16:9)"
                value={editing.imageUrl}
                onChange={(v) => setEditing({ ...editing, imageUrl: v })}
                aspect="aspect-video"
              />
              <Field
                label="Coberturas (JSON)"
                hint='Formato: [{"name":"Cobertura 1","detail":"Descripción"}]. Cada item se muestra como una cobertura con check dorado.'
              >
                <Textarea
                  rows={4}
                  value={editing.features}
                  onChange={(e) =>
                    setEditing({ ...editing, features: e.target.value })
                  }
                  placeholder='[{"name":"Gastos Médicos","detail":"Cubre gastos hospitalarios"}]'
                  className="font-mono text-xs"
                />
              </Field>
              <div className="flex items-center gap-4">
                <Field label="Orden">
                  <Input
                    type="number"
                    value={editing.order}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        order: Number(e.target.value) || 0,
                      })
                    }
                    className="w-24"
                  />
                </Field>
                <div className="flex items-center gap-2 pt-5">
                  <Switch
                    checked={editing.active}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, active: v })
                    }
                  />
                  <span className="text-sm">Activo</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Eliminar servicio"
        description="Esta acción no se puede deshacer. ¿Estás seguro?"
        confirmLabel="Eliminar"
        onConfirm={() => { if (deletingId) void remove(deletingId); }}
      />
    </div>
  );
}
