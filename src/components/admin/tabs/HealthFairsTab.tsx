"use client";

import * as React from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
  Save,
  Loader2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  LoadingRow,
  SectionHeader,
  apiGet,
  apiMutate,
} from "@/components/admin/shared";
import type { HealthFair } from "@/lib/types";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_ES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const STATES = ["Baja California", "Estado de México"];

type Draft = {
  id?: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  endDate: string;
  location: string;
  state: string;
  address: string;
  time: string;
  order: number;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  location: "",
  state: "Baja California",
  address: "",
  time: "",
  order: 0,
  active: true,
};

function toDateInput(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function getDay(iso: string): number | null {
  if (!iso) return null;
  try {
    return new Date(iso).getUTCDate();
  } catch {
    return null;
  }
}

export function HealthFairsTab() {
  const [items, setItems] = React.useState<HealthFair[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  // Calendar view
  const [calYear, setCalYear] = React.useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = React.useState(new Date().getMonth());
  const [calState, setCalState] = React.useState("Baja California");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all fairs (the public API returns only active, but we use it)
      const data = await apiGet<HealthFair[]>("/api/health-fairs");
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

  const startCreate = () => {
    setEditing({ ...EMPTY_DRAFT, order: items.length + 1 });
    setShowAdd(true);
  };

  const startEdit = (f: HealthFair) => {
    setEditing({
      id: f.id,
      title: f.title,
      description: f.description || "",
      date: toDateInput(f.date),
      endDate: f.endDate ? toDateInput(f.endDate) : "",
      location: f.location,
      state: f.state,
      address: f.address || "",
      time: f.time || "",
      order: f.order,
      active: f.active,
    });
    setShowAdd(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!editing.date) {
      toast.error("La fecha es requerida");
      return;
    }
    if (!editing.location.trim()) {
      toast.error("El lugar es requerido");
      return;
    }
    setSaving(true);
    const body = {
      title: editing.title.trim(),
      description: editing.description.trim() || null,
      date: editing.date,
      endDate: editing.endDate || null,
      location: editing.location.trim(),
      state: editing.state,
      address: editing.address.trim() || null,
      time: editing.time.trim() || null,
      order: editing.order,
      active: editing.active,
    };
    if (editing.id) {
      // Update: delete + create (no PUT endpoint)
      const del = await apiMutate(
        `/api/health-fairs?id=${editing.id}`,
        "DELETE"
      );
      if (del) {
        const created = await apiMutate<HealthFair>(
          "/api/health-fairs",
          "POST",
          body
        );
        if (created) {
          toast.success("Feria actualizada");
          setShowAdd(false);
          await load();
        }
      }
    } else {
      const created = await apiMutate<HealthFair>(
        "/api/health-fairs",
        "POST",
        body
      );
      if (created) {
        toast.success("Feria agregada");
        setShowAdd(false);
        await load();
      }
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    const ok = await apiMutate(`/api/health-fairs?id=${id}`, "DELETE");
    if (ok) {
      toast.success("Feria eliminada");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  // Calendar grid
  const firstDay = new Date(Date.UTC(calYear, calMonth, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const fairsByDay: Record<number, HealthFair[]> = {};
  items
    .filter((f) => f.state === calState)
    .forEach((f) => {
      const d = getDay(f.date);
      const fDate = new Date(f.date);
      if (
        d !== null &&
        fDate.getUTCMonth() === calMonth &&
        fDate.getUTCFullYear() === calYear
      ) {
        if (!fairsByDay[d]) fairsByDay[d] = [];
        fairsByDay[d].push(f);
      }
    });

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Ferias de Salud"
        description="Gestiona el calendario de ferias de salud en Baja California y Estado de México."
        action={
          <Button
            onClick={startCreate}
            className="bg-[#00455e] text-white hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-4" />
            Agregar feria
          </Button>
        }
      />

      {/* Calendar view */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="grid size-8 place-items-center rounded-md border text-slate-600 hover:bg-slate-50"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <h3 className="min-w-[180px] text-center text-base font-bold text-[#212121]">
              {MONTHS_ES[calMonth]} {calYear}
            </h3>
            <button
              onClick={nextMonth}
              className="grid size-8 place-items-center rounded-md border text-slate-600 hover:bg-slate-50"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => setCalState(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                  calState === s
                    ? "bg-white text-[#00455e] shadow-sm"
                    : "text-slate-600 hover:text-[#00455e]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_ES.map((d) => (
            <div
              key={d}
              className="py-1.5 text-center text-xs font-bold uppercase text-slate-400"
            >
              {d}
            </div>
          ))}
          {/* Calendar cells */}
          {cells.map((day, i) => {
            const dayFairs = day ? fairsByDay[day] || [] : [];
            return (
              <div
                key={i}
                className={`min-h-[64px] rounded-md border p-1 ${
                  day
                    ? dayFairs.length > 0
                      ? "border-[#faae0b] bg-[#faae0b]/5"
                      : "border-slate-100 bg-white"
                    : "border-transparent bg-slate-50/50"
                }`}
              >
                {day && (
                  <>
                    <span className="text-xs font-semibold text-slate-500">
                      {day}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayFairs.slice(0, 2).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => startEdit(f)}
                          className="block w-full truncate rounded bg-[#00455e] px-1 py-0.5 text-left text-[10px] font-medium text-white transition-colors hover:bg-[#faae0b] hover:text-[#212121]"
                          title={f.title}
                        >
                          {f.title}
                        </button>
                      ))}
                      {dayFairs.length > 2 && (
                        <span className="text-[10px] text-slate-400">
                          +{dayFairs.length - 2} más
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* List of all fairs */}
      {loading ? (
        <LoadingRow label="Cargando ferias…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay ferias de salud"
          description="Agrega ferias con su fecha, lugar y estado."
          icon={CalendarDays}
          action={
            <Button
              onClick={startCreate}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Agregar feria
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Todas las ferias ({items.length})
          </h3>
          {[...items]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div
                  className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg py-1.5 text-white"
                  style={{ backgroundColor: "#00455e" }}
                >
                  <span className="text-lg font-extrabold leading-none">
                    {new Date(f.date).getUTCDate()}
                  </span>
                  <span className="text-[10px] font-bold uppercase">
                    {MONTHS_ES[new Date(f.date).getUTCMonth()].slice(0, 3)}
                  </span>
                  <span className="text-[9px] opacity-80">
                    {new Date(f.date).getUTCFullYear()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {f.title}
                    </p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {f.state}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {f.location}
                    </span>
                    {f.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {f.time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => startEdit(f)}
                    className="grid size-7 place-items-center rounded text-[#00455e] hover:bg-[#00455e]/10"
                    aria-label="Editar"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(f.id)}
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
              {editing?.id ? "Editar feria de salud" : "Nueva feria de salud"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <Field label="Título *">
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="Feria de Salud Comunitaria - Tijuana"
                />
              </Field>
              <Field label="Descripción (opcional)">
                <Textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Atención médica gratuita, revisiones de salud general…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha *">
                  <Input
                    type="date"
                    value={editing.date}
                    onChange={(e) =>
                      setEditing({ ...editing, date: e.target.value })
                    }
                  />
                </Field>
                <Field label="Fecha de cierre (opcional)">
                  <Input
                    type="date"
                    value={editing.endDate}
                    onChange={(e) =>
                      setEditing({ ...editing, endDate: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Estado *">
                  <select
                    value={editing.state}
                    onChange={(e) =>
                      setEditing({ ...editing, state: e.target.value })
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Horario (opcional)">
                  <Input
                    value={editing.time}
                    onChange={(e) =>
                      setEditing({ ...editing, time: e.target.value })
                    }
                    placeholder="09:00 - 14:00"
                  />
                </Field>
              </div>
              <Field label="Lugar *">
                <Input
                  value={editing.location}
                  onChange={(e) =>
                    setEditing({ ...editing, location: e.target.value })
                  }
                  placeholder="Centro Comunitario Chapultepec"
                />
              </Field>
              <Field label="Dirección (opcional)">
                <Input
                  value={editing.address}
                  onChange={(e) =>
                    setEditing({ ...editing, address: e.target.value })
                  }
                  placeholder="Calle Buenaventura, Fracc. Chapultepec, Tijuana, B.C."
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
                  <input
                    type="checkbox"
                    id="fair-active"
                    checked={editing.active}
                    onChange={(e) =>
                      setEditing({ ...editing, active: e.target.checked })
                    }
                    className="size-4"
                  />
                  <Label htmlFor="fair-active" className="text-sm font-medium">
                    Activo
                  </Label>
                </div>
              </div>
            </div>
          )}
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
              {editing?.id ? "Guardar cambios" : "Agregar feria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Eliminar feria de salud"
        description="La feria se eliminará del calendario. ¿Confirmar?"
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deletingId) void remove(deletingId);
        }}
      />
    </div>
  );
}
