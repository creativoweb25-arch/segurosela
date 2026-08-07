"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  X,
  ChevronRight,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { HealthFair } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { Skeleton } from "@/components/ui/skeleton";

// Deterministic date formatter — avoids hydration mismatches
const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

function formatDayMonth(iso: string): { day: string; month: string; year: string } {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { day: "—", month: "", year: "" };
    return {
      day: String(d.getUTCDate()).padStart(2, "0"),
      month: MONTHS_ES[d.getUTCMonth()],
      year: String(d.getUTCFullYear()),
    };
  } catch {
    return { day: "—", month: "", year: "" };
  }
}

interface HealthFairsCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthFairsCalendar({
  open,
  onOpenChange,
}: HealthFairsCalendarProps) {
  const mounted = useMounted();
  const [fairs, setFairs] = useState<HealthFair[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeState, setActiveState] = useState<string>("Baja California");

  useEffect(() => {
    if (!open) return;
    fetcher<HealthFair[]>("/api/health-fairs")
      .then((data) => {
        setFairs((data ?? []).filter((f) => f.active));
      })
      .catch(() => setFairs([]))
      .finally(() => setLoading(false));
  }, [open]);

  const states = ["Baja California", "Estado de México"];
  const filtered = fairs.filter((f) => f.state === activeState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#212121]">
            <CalendarIcon className="size-6 text-[#00455e]" />
            Calendario de Ferias de Salud
          </DialogTitle>
        </DialogHeader>

        {/* State tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {states.map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => setActiveState(state)}
              className={`rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${
                activeState === state
                  ? "bg-white text-[#00455e] shadow-sm"
                  : "text-slate-600 hover:text-[#00455e]"
              }`}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Fairs list */}
        {loading ? (
          <div className="space-y-4 py-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <CalendarIcon className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="text-sm font-semibold text-[#212121]">
              No hay ferias programadas
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Próximamente anunciaremos nuevas ferias de salud en{" "}
              {activeState}.
            </p>
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto py-2 pr-1">
            {filtered.map((fair, i) => {
              const { day, month, year } = formatDayMonth(fair.date);
              return (
                <motion.div
                  key={fair.id}
                  initial={mounted ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Date badge */}
                  <div
                    className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg py-2 text-white"
                    style={{ backgroundColor: "#00455e" }}
                  >
                    <span className="text-2xl font-extrabold leading-none">
                      {day}
                    </span>
                    <span className="mt-1 text-xs font-bold uppercase">
                      {month}
                    </span>
                    <span className="text-[10px] opacity-80">{year}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#212121]">
                      {fair.title}
                    </h3>
                    {fair.description && (
                      <p className="mt-1 text-sm text-slate-600">
                        {fair.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" style={{ color: "#00455e" }} />
                        {fair.location}
                      </span>
                      {fair.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" style={{ color: "#00455e" }} />
                          {fair.time}
                        </span>
                      )}
                    </div>
                    {fair.address && (
                      <p className="mt-1 text-xs text-slate-400">
                        {fair.address}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">
            ¿Quieres participar en una feria? Contáctanos para más información.
          </p>
          <a
            href="#contacto"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1 text-xs font-bold text-[#00455e] hover:text-[#faae0b]"
          >
            Contactar
            <ChevronRight className="size-3.5" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HealthFairsCalendar;
