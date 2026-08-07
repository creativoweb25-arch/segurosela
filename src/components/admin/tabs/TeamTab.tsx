"use client";

import * as React from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
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
import type { TeamMember } from "@/lib/types";

type Draft = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string | null;
  email: string;
  phone: string;
  order: number;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  role: "",
  bio: "",
  imageUrl: null,
  email: "",
  phone: "",
  order: 0,
  active: true,
};

export function TeamTab() {
  const [items, setItems] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<TeamMember[]>("/api/team");
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

  const startEdit = (m: TeamMember) => {
    setEditing({
      id: m.id,
      name: m.name,
      role: m.role,
      bio: m.bio || "",
      imageUrl: m.imageUrl,
      email: m.email || "",
      phone: m.phone || "",
      order: m.order,
      active: m.active,
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
    if (!editing.name.trim() || !editing.role.trim()) {
      toast.error("Nombre y rol son requeridos");
      return;
    }
    setSaving(true);
    const body = {
      ...(editing.id ? { id: editing.id } : {}),
      name: editing.name.trim(),
      role: editing.role.trim(),
      bio: editing.bio || null,
      imageUrl: editing.imageUrl || null,
      email: editing.email || null,
      phone: editing.phone || null,
      order: Number(editing.order) || 0,
      active: editing.active,
    };
    const updated = await apiMutate<TeamMember>(
      "/api/team",
      editing.id ? "PUT" : "POST",
      body
    );
    setSaving(false);
    if (updated) {
      toast.success(editing.id ? "Miembro actualizado" : "Miembro creado");
      setEditing(null);
      await load();
    }
  };

  const remove = async (id: string) => {
    // No DELETE endpoint for team: we deactivate instead so the member
    // disappears from the public site and from this list on next reload.
    const ok = await apiMutate<TeamMember>("/api/team", "PUT", {
      id,
      active: false,
    });
    if (ok) {
      toast.success("Miembro desactivado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const move = async (m: TeamMember, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === m.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      apiMutate("/api/team", "PUT", { id: m.id, order: swap.order }),
      apiMutate("/api/team", "PUT", { id: swap.id, order: m.order }),
    ]);
    toast.success("Orden actualizado");
    await load();
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Equipo"
        description="Miembros del equipo que se muestran en la sección «Equipo»."
        action={
          <Button
            onClick={startCreate}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-4" />
            Nuevo miembro
          </Button>
        }
      />

      <Notice tone="warning">
        Por defecto solo se muestran los miembros activos. Si desactivas uno,
        desaparecerá del sitio público y de esta lista al recargar.
      </Notice>

      {loading ? (
        <LoadingRow label="Cargando equipo…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay miembros"
          description="Agrega a las personas que conforman tu equipo."
          icon={Users}
          action={
            <Button
              onClick={startCreate}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Nuevo miembro
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((m, i, arr) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(m, -1)}
                    disabled={i === 0}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(m, 1)}
                    disabled={i === arr.length - 1}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {m.name}
                    </p>
                    {!m.active && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.role}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                    {m.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" /> {m.email}
                      </span>
                    )}
                    {m.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" /> {m.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(m)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(m.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar miembro" : "Nuevo miembro"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <ImageUploadField
                label="Foto"
                value={editing.imageUrl}
                onChange={(v) => setEditing({ ...editing, imageUrl: v })}
                aspect="aspect-square"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre">
                  <Input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Rol / Puesto">
                  <Input
                    value={editing.role}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value })
                    }
                    placeholder="Director / Asesor de seguros"
                  />
                </Field>
              </div>
              <Field label="Biografía">
                <Textarea
                  rows={4}
                  value={editing.bio}
                  onChange={(e) =>
                    setEditing({ ...editing, bio: e.target.value })
                  }
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input
                    type="email"
                    value={editing.email}
                    onChange={(e) =>
                      setEditing({ ...editing, email: e.target.value })
                    }
                  />
                </Field>
                <Field label="Teléfono">
                  <Input
                    value={editing.phone}
                    onChange={(e) =>
                      setEditing({ ...editing, phone: e.target.value })
                    }
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
        title="Desactivar miembro"
        description="El miembro se desactivará y desaparecerá del sitio público y de esta lista. ¿Confirmar?"
        confirmLabel="Desactivar"
        onConfirm={() => { if (deletingId) void remove(deletingId); }}
      />
    </div>
  );
}
