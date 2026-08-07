"use client";

import * as React from "react";
import { Loader2, UploadCloud, X, ImageIcon, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { authHeaders, clearToken } from "@/lib/admin-token";

/** POST a file to /api/upload and return the public URL. */
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: fd,
  });
  const j = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: { url?: string };
    error?: string;
  };
  if (!res.ok || !j.success || !j.data?.url) {
    throw new Error(j.error || `Error al subir imagen (HTTP ${res.status})`);
  }
  return j.data.url;
}

/** GET helper that unwraps `{success, data}`. */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  const j = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    error?: string;
  };
  if (!res.ok || !j.success) {
    throw new Error(j.error || `HTTP ${res.status}`);
  }
  return (j.data ?? (j as unknown)) as T;
}

/** Helper that performs a JSON request, unwraps `{success, data}` and toasts on error. */
export async function apiMutate<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: authHeaders(
        body ? { "Content-Type": "application/json" } : undefined
      ),
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: T;
      error?: string;
    };
    if (!res.ok || !j.success) {
      // If unauthorized, trigger re-login flow
      if (res.status === 401) {
        clearToken();
        toast.error("Tu sesión ha expirado. Vuelve a iniciar sesión.");
        window.dispatchEvent(new CustomEvent("ela-session-expired"));
        return null;
      }
      throw new Error(j.error || `HTTP ${res.status}`);
    }
    return (j.data ?? (j as unknown)) as T;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    toast.error(msg);
    return null;
  }
}

/** Small labeled input row. */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold text-[#212121]">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Image upload field with preview, manual URL paste support and remove button. */
export function ImageUploadField({
  value,
  onChange,
  label = "Imagen",
  accept = "image/*",
  allowUrl = true,
  aspect = "aspect-video",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
  accept?: string;
  allowUrl?: boolean;
  aspect?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Imagen subida");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="relative w-full overflow-hidden rounded-md border bg-muted">
            <div className={cn("w-full bg-muted", aspect)}>
              <img
                src={value}
                alt={label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Quitar imagen"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/40 text-muted-foreground transition-colors hover:border-[#00455e] hover:text-[#00455e]",
              aspect,
              uploading && "opacity-60"
            )}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <UploadCloud className="size-5" />
                <span className="text-xs font-medium">Haz clic para subir una imagen</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {allowUrl && (
          <div className="flex items-center gap-1.5">
            <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <Input
              type="url"
              placeholder="O pega una URL de imagen…"
              value={value || ""}
              onChange={(e) => onChange(e.target.value || null)}
              className="h-8 text-xs"
            />
          </div>
        )}
      </div>
    </Field>
  );
}

/** Generic confirm dialog for delete / destructive actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  destructive = true,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Empty state for lists. */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Loading spinner row. */
export function LoadingRow({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

/** Small section heading with optional action on the right. */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
      <div>
        <h2 className="text-lg font-bold text-[#212121]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** A small inline notice box. */
export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-xs",
        tone === "info"
          ? "border-[#23a1ea]/40 bg-[#23a1ea]/10 text-[#212121]"
          : "border-amber-300 bg-amber-50 text-amber-900"
      )}
    >
      {children}
    </div>
  );
}
