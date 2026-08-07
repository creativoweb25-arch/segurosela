"use client";

import * as React from "react";
import {
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  LoadingRow,
  SectionHeader,
  apiGet,
} from "@/components/admin/shared";
import type { QuoteRequest } from "@/lib/types";

type QuoteRow = QuoteRequest & {
  id?: string;
  status?: string;
  createdAt?: string;
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function QuotesTab() {
  const [items, setItems] = React.useState<QuoteRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<QuoteRow[]>("/api/quotes");
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Cotizaciones"
        description="Solicitudes de cotización recibidas desde el formulario público."
      />

      {loading ? (
        <LoadingRow label="Cargando cotizaciones…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay cotizaciones todavía"
          description="Las solicitudes que envíen los visitantes desde el formulario aparecerán aquí."
          icon={ClipboardList}
        />
      ) : (
        <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
          {items.map((q) => {
            const id = q.id || `${q.email}-${q.createdAt || ""}`;
            const isOpen = expanded === id;
            return (
              <div key={id} className="rounded-lg border bg-white">
                <button
                  onClick={() => setExpanded(isOpen ? null : id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#faae0b]/15 text-[#faae0b]">
                    <Shield className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {q.name}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {q.insuranceType}
                      </Badge>
                      {q.protectionLevel && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {q.protectionLevel}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {q.email} · {q.phone}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground">
                    <Calendar className="mr-1 inline size-3" />
                    {formatDate(q.createdAt)}
                  </div>
                </button>
                {isOpen && (
                  <div className="space-y-2 border-t bg-muted/30 p-3 text-xs">
                    {q.message && (
                      <div>
                        <p className="mb-0.5 font-semibold uppercase tracking-wide text-muted-foreground">
                          Mensaje
                        </p>
                        <p className="whitespace-pre-wrap text-foreground">
                          {q.message}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a
                        href={`mailto:${q.email}`}
                        className="inline-flex items-center gap-1 text-[#00455e] hover:underline"
                      >
                        <Mail className="size-3" />
                        {q.email}
                        <ExternalLink className="size-2.5" />
                      </a>
                      <a
                        href={`tel:${q.phone.replace(/[^0-9+]/g, "")}`}
                        className="inline-flex items-center gap-1 text-[#00455e] hover:underline"
                      >
                        <Phone className="size-3" />
                        {q.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
