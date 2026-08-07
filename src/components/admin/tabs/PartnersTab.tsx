"use client";

import * as React from "react";
import {
  Handshake,
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
import type { Partner } from "@/lib/types";

type Draft = {
  id?: string;
  name: string;
  logoUrl: string;
  order: number;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  logoUrl: "",
  order: 0,
  active: true,
};

export function PartnersTab() {
  const [items, setItems] = React.useState<Partner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Partner[]>("/api/partners");
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

  const startEdit = (p: Partner) => {
    setEditing({
      id: p.id,
      name: p.name,
      logoUrl: p.logoUrl,
      order: p.order,
      active: p.active,
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
    if (!editing.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setSaving(true);
    const body = {
      ...(editing.id ? { id: editing.id } : {}),
      name: editing.name.trim(),
      logoUrl: editing.logoUrl || "",
      order: Number(editing.order) || 0,
      active: editing.active,
    };
    const updated = await apiMutate<Partner>(
      "/api/partners",
      editing.id ? "PUT" : "POST",
      body
    );
    setSaving(false);
    if (updated) {
      toast.success(editing.id ? "Aliado actualizado" : "Aliado creado");
      setEditing(null);
      await load();
    }
  };

  const remove = async (id: string) => {
    // No DELETE endpoint for partners: deactivate instead.
    const ok = await apiMutate<Partner>("/api/partners", "PUT", {
      id,
      active: false,
    });
    if (ok) {
      toast.success("Aliado desactivado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const move = async (p: Partner, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === p.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      apiMutate("/api/partners", "PUT", { id: p.id, order: swap.order }),
      apiMutate("/api/partners", "PUT", { id: swap.id, order: p.order }),
    ]);
    toast.success("Orden actualizado");
    await load();
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Aliados"
        description="Asegadoras y socios comerciales que aparecen en el carrusel de aliados."
        action={
          <Button
            onClick={startCreate}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-4" />
            Nuevo aliado
          </Button>
        }
      />

      <Notice tone="warning">
        Por defecto solo se muestran los aliados activos. La opción
        «eliminar» desactiva el aliado (lo oculta del sitio y de esta lista al
        recargar).
      </Notice>

      {loading ? (
        <LoadingRow label="Cargando aliados…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay aliados"
          description="Agrega las aseguradoras con las que trabajas."
          icon={Handshake}
          action={
            <Button
              onClick={startCreate}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Nuevo aliado
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((p, i, arr) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(p, -1)}
                    disabled={i === 0}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(p, 1)}
                    disabled={i === arr.length - 1}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-black/5">
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#00455e]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {p.name}
                    </p>
                    {!p.active && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.logoUrl ? "Logo configurado" : "Sin logo"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(p)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(p.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar aliado" : "Nuevo aliado"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <Field label="Nombre">
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="GNP, AXA, MetLife…"
                />
              </Field>
              <ImageUploadField
                label="Logo (opcional — si no se sube, se muestran las iniciales)"
                value={editing.logoUrl || null}
                onChange={(v) => setEditing({ ...editing, logoUrl: v || "" })}
                aspect="aspect-[3/1]"
              />
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
        title="Desactivar aliado"
        description="El aliado se desactivará y desaparecerá del sitio y de esta lista. ¿Confirmar?"
        confirmLabel="Desactivar"
        onConfirm={() => { if (deletingId) void remove(deletingId); }}
      />
    </div>
  );
}
