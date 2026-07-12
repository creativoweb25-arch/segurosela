"use client";

import * as React from "react";
import {
  Instagram,
  Plus,
  Trash2,
  Save,
  Loader2,
  RefreshCw,
  ExternalLink,
  Heart,
  MessageCircle,
  Info,
  Sparkles,
  Link2,
  ListPlus,
  ImageIcon,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { InstagramPost, SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";

type Draft = {
  imageUrl: string | null;
  permalink: string;
  caption: string;
  likes: number;
  comments: number;
  postedAt: string;
  active: boolean;
};

const EMPTY_DRAFT: Draft = {
  imageUrl: null,
  permalink: "",
  caption: "",
  likes: 0,
  comments: 0,
  postedAt: new Date().toISOString().slice(0, 10),
  active: true,
};

const IG_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[^/]+/i;

function isValidIgUrl(url: string): boolean {
  return IG_URL_REGEX.test(url.trim());
}

export function InstagramTab({
  onGoToSettings,
}: {
  onGoToSettings: () => void;
}) {
  const [items, setItems] = React.useState<InstagramPost[]>([]);
  const [settings, setSettings] = React.useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const [addMode, setAddMode] = React.useState<"image" | "embed">("embed");
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [showBulk, setShowBulk] = React.useState(false);
  const [bulkUrls, setBulkUrls] = React.useState("");
  const [bulkSaving, setBulkSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [posts, s] = await Promise.all([
        apiGet<InstagramPost[]>("/api/instagram"),
        apiGet<SiteSettings>("/api/settings"),
      ]);
      setItems(posts);
      setSettings({ ...DEFAULT_SETTINGS, ...s });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const sync = async () => {
    const username = settings.instagramUser?.trim();
    if (!username) {
      toast.error("Configura un usuario de Instagram en Personalización");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch("/api/instagram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        data?: Array<{ imageUrl: string; permalink: string }>;
        error?: string;
      };
      if (j.success && Array.isArray(j.data) && j.data.length > 0) {
        toast.success(j.message || `Se encontraron ${j.data.length} posts`);
        let imported = 0;
        for (const item of j.data) {
          const ok = await apiMutate<InstagramPost>("/api/instagram", "POST", {
            imageUrl: item.imageUrl,
            permalink: item.permalink,
            caption: "",
            likes: 0,
            comments: 0,
            active: true,
          });
          if (ok) imported += 1;
        }
        toast.success(`Se importaron ${imported} posts`);
        await load();
      } else {
        toast.warning(
          j.message ||
            j.error ||
            "Instagram bloquea la sincronización automática. Usa el modo Embed (solo URL) o sube imágenes manualmente."
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const startEdit = (post: InstagramPost) => {
    setEditingId(post.id);
    setAddMode(post.imageUrl ? "image" : "embed");
    setDraft({
      imageUrl: post.imageUrl,
      permalink: post.permalink,
      caption: post.caption || "",
      likes: post.likes,
      comments: post.comments,
      postedAt: post.postedAt
        ? new Date(post.postedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      active: post.active,
    });
    setShowAdd(true);
  };

  const save = async () => {
    if (addMode === "image" && !draft.imageUrl) {
      toast.error("La imagen es requerida");
      return;
    }
    if (!draft.permalink.trim() || !isValidIgUrl(draft.permalink)) {
      toast.error("Pega una URL válida de Instagram (ej: https://www.instagram.com/p/...)");
      return;
    }
    setSaving(true);
    const body = {
      imageUrl: addMode === "image" ? draft.imageUrl : null,
      permalink: draft.permalink.trim(),
      caption: draft.caption || null,
      likes: Number(draft.likes) || 0,
      comments: Number(draft.comments) || 0,
      postedAt: draft.postedAt ? new Date(draft.postedAt).toISOString() : null,
      active: draft.active,
    };
    if (editingId) {
      // Update existing post
      const ok = await apiMutate<InstagramPost>(
        `/api/instagram?id=${editingId}`,
        "PUT",
        body
      );
      setSaving(false);
      if (ok) {
        toast.success("Post actualizado");
        setDraft(EMPTY_DRAFT);
        setEditingId(null);
        setShowAdd(false);
        await load();
      }
    } else {
      // Create new post
      const ok = await apiMutate<InstagramPost>("/api/instagram", "POST", body);
      setSaving(false);
      if (ok) {
        toast.success(
          addMode === "embed"
            ? "Post agregado (se mostrará como embed en vivo)"
            : "Post agregado"
        );
        setDraft(EMPTY_DRAFT);
        setShowAdd(false);
        await load();
      }
    }
  };

  const saveBulk = async () => {
    const urls = bulkUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    const valid = urls.filter(isValidIgUrl);
    if (valid.length === 0) {
      toast.error("Pega al menos una URL válida de Instagram (una por línea)");
      return;
    }
    setBulkSaving(true);
    let imported = 0;
    let failed = false;
    for (const url of valid) {
      const ok = await apiMutate<InstagramPost>("/api/instagram", "POST", {
        imageUrl: null,
        permalink: url,
        caption: null,
        likes: 0,
        comments: 0,
        active: true,
      });
      if (!ok) {
        // Stop on first failure — apiMutate already showed the error toast
        // (e.g. "Tu sesión ha expirado" for 401, or the specific error message)
        failed = true;
        break;
      }
      imported += 1;
    }
    setBulkSaving(false);
    if (imported > 0) {
      toast.success(
        `Se importaron ${imported} de ${valid.length} posts como embed`
      );
      setBulkUrls("");
      setShowBulk(false);
      await load();
    } else if (!failed) {
      // Only show this if no specific error was already toasted by apiMutate
      toast.error("No se pudieron importar los posts");
    }
  };

  const remove = async (id: string) => {
    const ok = await apiMutate(`/api/instagram?id=${id}`, "DELETE");
    if (ok) {
      toast.success("Post eliminado");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Instagram"
        description="Gestiona el feed de Instagram que se muestra en la página principal."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulk(true)}
              className="border-[#00455e] text-[#00455e] hover:bg-[#00455e]/10"
            >
              <ListPlus className="mr-2 size-4" />
              Importar URLs
            </Button>
            <Button
              onClick={() => {
                setAddMode("embed");
                setDraft(EMPTY_DRAFT);
                setEditingId(null);
                setShowAdd(true);
              }}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Agregar post
            </Button>
          </div>
        }
      />

      {/* Username card */}
      <div className="rounded-lg border bg-gradient-to-r from-[#00455e] to-[#212121] p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-white/15">
              <Instagram className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">
                Usuario configurado
              </p>
              <p className="font-bold">
                @{settings.instagramUser || "— sin configurar —"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGoToSettings}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Editar en Personalización
            </Button>
            <Button
              size="sm"
              onClick={sync}
              disabled={syncing}
              className="bg-[#faae0b] text-[#212121] hover:bg-[#e89d05]"
            >
              {syncing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              Sincronizar
            </Button>
          </div>
        </div>
      </div>

      <Notice tone="info">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">Dos formas de mostrar tus posts:</p>
            <p>
              <strong>1. Embed en vivo (recomendado):</strong> Pega solo la URL
              del post de Instagram. Se mostrará el post real (imagen + caption +
              likes) usando el embed oficial de Instagram. Funciona 100% sin
              bloqueos.
            </p>
            <p>
              <strong>2. Imagen + enlace:</strong> Sube una imagen y pega la URL.
              Se muestra en una cuadrícula limpia de miniaturas cuadradas.
            </p>
            <p className="text-xs opacity-80">
              La sincronización automática desde el perfil suele fallar porque
              Instagram bloquea el acceso público (error 429). El modo embed es la
              alternativa confiable.
            </p>
          </div>
        </div>
      </Notice>

      {loading ? (
        <LoadingRow label="Cargando posts…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay posts de Instagram"
          description="Agrega posts pegando la URL de Instagram (embed en vivo) o subiendo imágenes."
          icon={Instagram}
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBulk(true)}
                className="border-[#00455e] text-[#00455e] hover:bg-[#00455e]/10"
              >
                <ListPlus className="mr-2 size-4" />
                Importar URLs
              </Button>
              <Button
                onClick={() => {
                  setAddMode("embed");
                  setDraft(EMPTY_DRAFT);
                  setEditingId(null);
                  setShowAdd(true);
                }}
                className="bg-[#00455e] text-white hover:bg-[#004a70]"
              >
                <Plus className="mr-2 size-4" />
                Agregar post
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-lg border bg-white"
            >
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.caption || "Instagram post"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] p-3 text-center text-white">
                    <Link2 className="mb-2 size-8" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide">
                      Embed en vivo
                    </p>
                    <p className="mt-1 line-clamp-2 text-[10px] opacity-90">
                      {p.permalink}
                    </p>
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Heart className="size-3" />
                    {p.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-3" />
                    {p.comments}
                  </span>
                  <a
                    href={p.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 hover:text-[#faae0b]"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              {p.caption && (
                <p className="line-clamp-2 px-2 py-1.5 text-[11px] text-muted-foreground">
                  {p.caption}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 border-t px-2 py-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {p.imageUrl ? "Imagen" : "Embed"}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => startEdit(p)}
                    className="grid size-7 place-items-center rounded text-[#00455e] hover:bg-[#00455e]/10"
                    aria-label="Editar"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(p.id)}
                    className="grid size-7 place-items-center rounded text-destructive hover:bg-destructive/10"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#faae0b]" />
              {editingId ? "Editar post de Instagram" : "Agregar post de Instagram"}
            </DialogTitle>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setAddMode("embed")}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                addMode === "embed"
                  ? "bg-white text-[#00455e] shadow-sm"
                  : "text-slate-600 hover:text-[#00455e]"
              }`}
            >
              <Link2 className="size-4" />
              Embed en vivo
            </button>
            <button
              type="button"
              onClick={() => setAddMode("image")}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                addMode === "image"
                  ? "bg-white text-[#00455e] shadow-sm"
                  : "text-slate-600 hover:text-[#00455e]"
              }`}
            >
              <ImageIcon className="size-4" />
              Imagen + enlace
            </button>
          </div>

          <div className="space-y-3 py-1">
            {addMode === "image" && (
              <ImageUploadField
                label="Imagen del post *"
                value={draft.imageUrl}
                onChange={(v) => setDraft({ ...draft, imageUrl: v })}
                aspect="aspect-square"
              />
            )}
            <Field
              label="URL del post de Instagram *"
              hint="Ej: https://www.instagram.com/p/Cxample/ o /reel/Cxample/"
            >
              <Input
                type="url"
                value={draft.permalink}
                onChange={(e) =>
                  setDraft({ ...draft, permalink: e.target.value })
                }
                placeholder="https://www.instagram.com/p/…"
              />
            </Field>
            {addMode === "embed" && (
              <Notice tone="info">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  <p className="text-xs">
                    En modo embed, el post se mostrará con el reproductor oficial
                    de Instagram (imagen + caption + likes reales). No necesitas
                    subir ninguna imagen.
                  </p>
                </div>
              </Notice>
            )}
            {addMode === "image" && (
              <>
                <Field label="Caption (opcional)">
                  <Textarea
                    rows={2}
                    value={draft.caption}
                    onChange={(e) =>
                      setDraft({ ...draft, caption: e.target.value })
                    }
                    placeholder="Texto del post…"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Likes">
                    <Input
                      type="number"
                      min={0}
                      value={draft.likes}
                      onChange={(e) =>
                        setDraft({ ...draft, likes: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Comentarios">
                    <Input
                      type="number"
                      min={0}
                      value={draft.comments}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          comments: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field label="Fecha del post">
                    <Input
                      type="date"
                      value={draft.postedAt}
                      onChange={(e) =>
                        setDraft({ ...draft, postedAt: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={draft.active}
                onCheckedChange={(v) => setDraft({ ...draft, active: v })}
              />
              <span className="text-sm font-medium">Activo</span>
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
              {editingId ? "Guardar cambios" : "Agregar post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk import dialog */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListPlus className="size-4 text-[#faae0b]" />
              Importar múltiples URLs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">
              Pega una URL de Instagram por línea. Se crearán como posts en modo
              embed (se muestran con el reproductor oficial de Instagram).
            </p>
            <Textarea
              rows={8}
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder={
                "https://www.instagram.com/p/Cxample1/\nhttps://www.instagram.com/p/Cxample2/\nhttps://www.instagram.com/reel/Cxample3/"
              }
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Formatos válidos: /p/{"{shortcode}"}/, /reel/{"{shortcode}"}/,
              /tv/{"{shortcode}"}/
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulk(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveBulk}
              disabled={bulkSaving}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              {bulkSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ListPlus className="mr-2 size-4" />
              )}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Eliminar post de Instagram"
        description="El post se eliminará del feed público. ¿Confirmar?"
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deletingId) void remove(deletingId);
        }}
      />
    </div>
  );
}
