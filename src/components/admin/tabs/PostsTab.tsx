"use client";

import * as React from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Star,
  StarOff,
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
  SectionHeader,
  apiGet,
  apiMutate,
} from "@/components/admin/shared";
import type { Post } from "@/lib/types";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: null,
  category: "Nuestras Publicaciones",
  author: "Seguros ELA",
  published: true,
  featured: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", {
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

export function PostsTab() {
  const [items, setItems] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Post[]>("/api/posts?all=true");
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

  const startEdit = (p: Post) => {
    setEditing({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      imageUrl: p.imageUrl,
      category: p.category,
      author: p.author,
      published: p.published,
      featured: p.featured,
    });
  };

  const startCreate = () => setEditing({ ...EMPTY_DRAFT });

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!editing.content.trim()) {
      toast.error("El contenido es requerido");
      return;
    }
    setSaving(true);
    const isEdit = !!editing.id;
    const body = {
      title: editing.title.trim(),
      slug: editing.slug.trim() || undefined,
      excerpt: editing.excerpt,
      content: editing.content,
      imageUrl: editing.imageUrl || null,
      category: editing.category,
      author: editing.author,
      published: editing.published,
      featured: editing.featured,
    };
    const updated = await apiMutate<Post>(
      isEdit ? `/api/posts/${editing.id}` : "/api/posts",
      isEdit ? "PUT" : "POST",
      body
    );
    setSaving(false);
    if (updated) {
      toast.success(isEdit ? "Publicación actualizada" : "Publicación creada");
      setEditing(null);
      await load();
    }
  };

  const remove = async (id: string) => {
    const ok = await apiMutate(`/api/posts/${id}`, "DELETE");
    if (ok) {
      toast.success("Publicación eliminada");
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const togglePublished = async (p: Post) => {
    const ok = await apiMutate<Post>(`/api/posts/${p.id}`, "PUT", {
      published: !p.published,
    });
    if (ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === p.id ? { ...i, published: !p.published } : i))
      );
      toast.success(p.published ? "Despublicado" : "Publicado");
    }
  };

  const toggleFeatured = async (p: Post) => {
    const ok = await apiMutate<Post>(`/api/posts/${p.id}`, "PUT", {
      featured: !p.featured,
    });
    if (ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === p.id ? { ...i, featured: !p.featured } : i))
      );
      toast.success(p.featured ? "Quitado de destacados" : "Marcado como destacado");
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Publicaciones"
        description="Administra el blog: crea, edita, publica o elimina posts."
        action={
          <Button
            onClick={startCreate}
            size="lg"
            className="bg-[#00455e] text-white shadow-md hover:bg-[#004a70]"
          >
            <Plus className="mr-2 size-5" />
            Nueva publicación
          </Button>
        }
      />

      {loading ? (
        <LoadingRow label="Cargando publicaciones…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no hay publicaciones"
          description="Crea tu primera publicación para el blog."
          icon={FileText}
          action={
            <Button
              onClick={startCreate}
              className="bg-[#00455e] text-white hover:bg-[#004a70]"
            >
              <Plus className="mr-2 size-4" />
              Nueva publicación
            </Button>
          }
        />
      ) : (
        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-3"
            >
              <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-foreground">
                    {p.title}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {p.category}
                  </Badge>
                  {p.published ? (
                    <Badge className="bg-[#23a1ea] text-[#212121]">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Borrador</Badge>
                  )}
                  {p.featured && (
                    <Badge className="bg-[#faae0b] text-[#212121]">Destacado</Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatDate(p.createdAt)} · {p.author} · {p.views} vistas ·
                  slug: {p.slug}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePublished(p)}
                  aria-label={p.published ? "Despublicar" : "Publicar"}
                  title={p.published ? "Despublicar" : "Publicar"}
                >
                  {p.published ? (
                    <Eye className="size-4 text-[#00455e]" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFeatured(p)}
                  aria-label={p.featured ? "Quitar destacado" : "Destacar"}
                  title={p.featured ? "Quitar destacado" : "Destacar"}
                >
                  {p.featured ? (
                    <Star className="size-4 text-[#faae0b]" />
                  ) : (
                    <StarOff className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(p)}
                  className="text-[#00455e] hover:bg-[#00455e]/10"
                  aria-label="Editar"
                >
                  <Pencil className="mr-1 size-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(p.id)}
                  className="text-destructive hover:text-destructive"
                  aria-label="Eliminar"
                >
                  <Trash2 className="mr-1 size-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar publicación" : "Nueva publicación"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <Field label="Título">
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="Título de la publicación"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Slug" hint="Se autogenera desde el título.">
                  <Input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    placeholder={slugify(editing.title) || "auto"}
                  />
                </Field>
                <Field label="Categoría">
                  <Input
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Autor">
                <Input
                  value={editing.author}
                  onChange={(e) =>
                    setEditing({ ...editing, author: e.target.value })
                  }
                />
              </Field>
              <ImageUploadField
                label="Imagen destacada"
                value={editing.imageUrl}
                onChange={(v) => setEditing({ ...editing, imageUrl: v })}
                aspect="aspect-video"
              />
              <Field label="Extracto" hint="Texto corto que aparece en la tarjeta del blog.">
                <Textarea
                  rows={2}
                  value={editing.excerpt}
                  onChange={(e) =>
                    setEditing({ ...editing, excerpt: e.target.value })
                  }
                />
              </Field>
              <Field
                label="Contenido"
                hint="Puedes usar HTML simple: <p>, <h2>, <ul>, <li>, <strong>, <a>."
              >
                <Textarea
                  rows={10}
                  value={editing.content}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </Field>
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing.published}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, published: v })
                    }
                  />
                  <span className="text-sm font-medium">Publicado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing.featured}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, featured: v })
                    }
                  />
                  <span className="text-sm font-medium">Destacado</span>
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
        title="Eliminar publicación"
        description="Esta acción no se puede deshacer. ¿Estás seguro?"
        confirmLabel="Eliminar"
        onConfirm={() => { if (deletingId) void remove(deletingId); }}
      />
    </div>
  );
}
