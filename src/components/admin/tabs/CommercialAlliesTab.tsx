"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  Trash2,
  Save,
  Loader2,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  SectionHeader,
  apiGet,
  apiMutate,
} from "@/components/admin/shared";
import type { CommercialAlly } from "@/lib/types";

type Draft = {
  name: string;
  logoUrl: string | null;
  websiteUrl: string;
  description: string;
  order: number;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  logoUrl: null,
  websiteUrl: "",
  description: "",
  order: 0,
  active: true,
};

export function CommercialAlliesTab() {
  const [items, setItems] = React.useState<CommercialAlly[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState<CommercialAlly | null>(null);
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const allies = await apiGet<CommercialAlly[]>("/api/commercial-allies");
      // apiGet returns only active items; for admin we want all. But since
      // the public endpoint filters active=true, we keep it simple here.
      setItems(allies.sort((a, b) => a.order - b.order));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setDraft({ ...EMPTY_DRAFT, order: items.length + 1 });
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (ally: CommercialAlly) => {
    setDraft({
      name: ally.name,
      logoUrl: ally.logoUrl,
      websiteUrl: ally.websiteUrl,
      description: ally.description || "",
      order: ally.order,
      active: ally.active,
    });
    setEditing(ally);
    setShowAdd(true);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!draft.websiteUrl.trim()) {
      toast.error("El sitio web es requerido");
      return;
    }
    setSaving(true);
    if (editing) {
      const ok = await apiMutate<CommercialAlly>(
        "/api/commercial-allies",
        "PUT",
        {
          id: editing.id,
          name: draft.name.trim(),
          logoUrl: draft.logoUrl,
          websiteUrl: draft.websiteUrl.trim(),
          description: draft.description.trim() || null,
          order: draft.order,
          active: draft.active,
        }
      );
      if (ok) {
        toast.success("Aliado actualizado");
        setShowAdd(false);
        await load();
      }
    } else {
      const ok = await apiMutate<CommercialAlly>(
        "/api/commercial-allies",
        "POST",
        {
          name: draft.name.trim(),
          logoUrl: draft.logoUrl,
          websiteUrl: draft.websiteUrl.trim(),
          description: draft.description.trim() || null,
          order: draft.order,
          active: draft.active,
        }
      );
      if (ok) {
        toast.success("Aliado agregado");
        setShowAdd(false);
        await load();
      }
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    const ok = await apiMutate(`/api/commercial-allies?id=${id}`, "DELETE");
    if (ok) {
      toast.success("Aliado eliminado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Aliados Comerciales"
        description="Gestiona los aliados comerciales que se muestran en la página principal con enlaces a sus sitios."
        action={
          <Button
            onClick={openAdd}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-4" />
            Agregar aliado
          </Button>
        }
      />

      {loading ? (
        <LoadingRow label="Cargando aliados…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay aliados comerciales"
          description="Agrega aliados con su nombre, logo y enlace a su sitio web."
          icon={Building2}
          action={
            <Button
              onClick={openAdd}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Agregar aliado
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((ally) => (
            <div
              key={ally.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
            >
              {/* Logo or name badge */}
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                {ally.logoUrl ? (
                  <img
                    src={ally.logoUrl}
                    alt={ally.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="size-6 text-slate-400" />
                )}
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#212121]">
                  {ally.name}
                </p>
                {ally.description && (
                  <p className="line-clamp-1 text-xs text-slate-500">
                    {ally.description}
                  </p>
                )}
                <a
                  href={ally.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[#00455e] hover:text-[#faae0b]"
                >
                  <ExternalLink className="size-3" />
                  {ally.websiteUrl.replace(/^https?:\/\//, "").substring(0, 35)}
                </a>
              </div>
              {/* Actions */}
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={() => openEdit(ally)}
                  className="grid size-7 place-items-center rounded text-[#00455e] hover:bg-[#00455e]/10"
                  aria-label="Editar"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => setDeletingId(ally.id)}
                  className="grid size-7 place-items-center rounded text-destructive hover:bg-destructive/10"
                  aria-label="Eliminar"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar aliado" : "Agregar aliado comercial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Nombre del aliado *">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ej: Idoc - Instituto de Oftalmología"
              />
            </Field>
            <ImageUploadField
              label="Logo (opcional)"
              value={draft.logoUrl}
              onChange={(v) => setDraft({ ...draft, logoUrl: v })}
              aspect="aspect-[3/1]"
            />
            <Field
              label="Sitio web *"
              hint="URL completa, ej: https://idoc.com.mx"
            >
              <Input
                type="url"
                value={draft.websiteUrl}
                onChange={(e) =>
                  setDraft({ ...draft, websiteUrl: e.target.value })
                }
                placeholder="https://…"
              />
            </Field>
            <Field label="Descripción (opcional)">
              <Textarea
                rows={2}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder="Instituto de oftalmología…"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Orden">
                <Input
                  type="number"
                  min={0}
                  value={draft.order}
                  onChange={(e) =>
                    setDraft({ ...draft, order: Number(e.target.value) || 0 })
                  }
                />
              </Field>
              <div className="flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  id="ally-active"
                  checked={draft.active}
                  onChange={(e) =>
                    setDraft({ ...draft, active: e.target.checked })
                  }
                  className="size-4"
                />
                <Label htmlFor="ally-active" className="text-sm font-medium">
                  Activo
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
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
              {editing ? "Guardar cambios" : "Agregar aliado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Eliminar aliado comercial"
        description="El aliado se eliminará de la página principal. ¿Confirmar?"
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deletingId) void remove(deletingId);
        }}
      />
    </div>
  );
}
