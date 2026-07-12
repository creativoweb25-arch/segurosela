"use client";

import * as React from "react";
import {
  Images,
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
import type { Slide } from "@/lib/types";

type Draft = {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string | null;
  order: number;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  subtitle: "",
  description: "",
  buttonText: "Saber Más",
  buttonLink: "#cotizacion",
  imageUrl: null,
  order: 0,
  active: true,
};

export function SlidesTab() {
  const [items, setItems] = React.useState<Slide[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Slide[]>("/api/slides");
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

  const startEdit = (s: Slide) => {
    setEditing({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description || "",
      buttonText: s.buttonText,
      buttonLink: s.buttonLink,
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
    if (!editing.imageUrl) {
      toast.error("La imagen de fondo es requerida");
      return;
    }
    setSaving(true);
    const body = {
      ...(editing.id ? { id: editing.id } : {}),
      title: editing.title.trim(),
      subtitle: editing.subtitle,
      description: editing.description || null,
      buttonText: editing.buttonText || "Saber Más",
      buttonLink: editing.buttonLink || "#cotizacion",
      imageUrl: editing.imageUrl,
      order: Number(editing.order) || 0,
      active: editing.active,
    };
    const updated = await apiMutate<Slide>(
      "/api/slides",
      editing.id ? "PUT" : "POST",
      body
    );
    setSaving(false);
    if (updated) {
      toast.success(editing.id ? "Slide actualizado" : "Slide creado");
      setEditing(null);
      await load();
    }
  };

  const remove = async (id: string) => {
    // No DELETE endpoint for slides: deactivate instead.
    const ok = await apiMutate<Slide>("/api/slides", "PUT", {
      id,
      active: false,
    });
    if (ok) {
      toast.success("Slide desactivado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const move = async (s: Slide, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === s.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      apiMutate("/api/slides", "PUT", { id: s.id, order: swap.order }),
      apiMutate("/api/slides", "PUT", { id: swap.id, order: s.order }),
    ]);
    toast.success("Orden actualizado");
    await load();
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Slides del Hero"
        description="Carrusel principal de la página de inicio."
        action={
          <Button
            onClick={startCreate}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-4" />
            Nuevo slide
          </Button>
        }
      />

      <Notice tone="warning">
        Por defecto solo se muestran los slides activos. La opción
        «eliminar» desactiva el slide (lo oculta del sitio y de esta lista al
        recargar).
      </Notice>

      {loading ? (
        <LoadingRow label="Cargando slides…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay slides"
          description="Agrega slides para el carrusel principal del hero."
          icon={Images}
          action={
            <Button
              onClick={startCreate}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Nuevo slide
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
                <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {s.imageUrl && (
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {s.title}
                    </p>
                    {!s.active && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.subtitle}
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
                    aria-label="Desactivar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar slide" : "Nuevo slide"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <ImageUploadField
                label="Imagen de fondo"
                value={editing.imageUrl}
                onChange={(v) => setEditing({ ...editing, imageUrl: v })}
                aspect="aspect-[16/7]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Título">
                  <Input
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                </Field>
                <Field label="Subtítulo">
                  <Input
                    value={editing.subtitle}
                    onChange={(e) =>
                      setEditing({ ...editing, subtitle: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Descripción (opcional)">
                <Textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Texto del botón">
                  <Input
                    value={editing.buttonText}
                    onChange={(e) =>
                      setEditing({ ...editing, buttonText: e.target.value })
                    }
                  />
                </Field>
                <Field label="Enlace del botón">
                  <Input
                    value={editing.buttonLink}
                    onChange={(e) =>
                      setEditing({ ...editing, buttonLink: e.target.value })
                    }
                    placeholder="#cotizacion"
                  />
                </Field>
              </div>
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
        title="Desactivar slide"
        description="El slide se desactivará y desaparecerá del sitio y de esta lista. ¿Confirmar?"
        confirmLabel="Desactivar"
        onConfirm={() => { if (deletingId) void remove(deletingId); }}
      />
    </div>
  );
}
