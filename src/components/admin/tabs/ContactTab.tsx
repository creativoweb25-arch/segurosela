"use client";

import * as React from "react";
import { Mail, Phone, Calendar, MessageSquare, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  LoadingRow,
  SectionHeader,
  apiGet,
} from "@/components/admin/shared";
import type { ContactMessage } from "@/lib/types";

type ContactRow = ContactMessage & {
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

export function ContactTab() {
  const [items, setItems] = React.useState<ContactRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<ContactRow[]>("/api/contact");
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
        title="Mensajes de contacto"
        description="Mensajes recibidos desde el formulario de contacto."
      />

      {loading ? (
        <LoadingRow label="Cargando mensajes…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay mensajes todavía"
          description="Los mensajes que envíen los visitantes desde el formulario de contacto aparecerán aquí."
          icon={Mail}
        />
      ) : (
        <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
          {items.map((m) => {
            const id = m.id || `${m.email}-${m.createdAt || ""}`;
            const isOpen = expanded === id;
            return (
              <div key={id} className="rounded-lg border bg-white">
                <button
                  onClick={() => setExpanded(isOpen ? null : id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#00455e]/10 text-[#00455e]">
                    <MessageSquare className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {m.name}
                      </p>
                      {m.subject && (
                        <Badge variant="outline" className="text-[10px]">
                          {m.subject}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.email}
                      {m.phone && ` · ${m.phone}`}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground">
                    <Calendar className="mr-1 inline size-3" />
                    {formatDate(m.createdAt)}
                  </div>
                </button>
                {isOpen && (
                  <div className="space-y-2 border-t bg-muted/30 p-3 text-xs">
                    <div>
                      <p className="mb-0.5 font-semibold uppercase tracking-wide text-muted-foreground">
                        Mensaje
                      </p>
                      <p className="whitespace-pre-wrap text-foreground">
                        {m.message}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a
                        href={`mailto:${m.email}`}
                        className="inline-flex items-center gap-1 text-[#00455e] hover:underline"
                      >
                        <Mail className="size-3" />
                        {m.email}
                        <ExternalLink className="size-2.5" />
                      </a>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone.replace(/[^0-9+]/g, "")}`}
                          className="inline-flex items-center gap-1 text-[#00455e] hover:underline"
                        >
                          <Phone className="size-3" />
                          {m.phone}
                        </a>
                      )}
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
