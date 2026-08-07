"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Instagram as InstagramIcon,
  ExternalLink,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { InstagramPost, SiteSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";

const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: "ig1",
    instagramId: null,
    permalink: "https://instagram.com/segurosela",
    imageUrl: "/images/instagram/ig-1.png",
    caption: "Protege lo que más amas 💙 #SegurosELA",
    likes: 124,
    comments: 8,
    postedAt: null,
    order: 0,
    active: true,
  },
  {
    id: "ig2",
    instagramId: null,
    permalink: "https://instagram.com/segurosela",
    imageUrl: "/images/instagram/ig-2.png",
    caption: "Coberturas a tu medida #Seguros #Tijuana",
    likes: 89,
    comments: 4,
    postedAt: null,
    order: 1,
    active: true,
  },
  {
    id: "ig3",
    instagramId: null,
    permalink: "https://instagram.com/segurosela",
    imageUrl: "/images/instagram/ig-3.png",
    caption: "Equipo profesional siempre contigo 🛡️",
    likes: 156,
    comments: 12,
    postedAt: null,
    order: 2,
    active: true,
  },
  {
    id: "ig4",
    instagramId: null,
    permalink: "https://instagram.com/segurosela",
    imageUrl: "/images/instagram/ig-4.png",
    caption: "Empresa 100% Mexicana 🇲🇽",
    likes: 201,
    comments: 15,
    postedAt: null,
    order: 3,
    active: true,
  },
  {
    id: "ig5",
    instagramId: null,
    permalink: "https://instagram.com/segurosela",
    imageUrl: "/images/instagram/ig-5.png",
    caption: "Fianzas rápidas y confiables #Fianzas",
    likes: 73,
    comments: 3,
    postedAt: null,
    order: 4,
    active: true,
  },
  {
    id: "ig6",
    instagramId: null,
    permalink: "https://instagram.com/segurosela",
    imageUrl: "/images/instagram/ig-6.png",
    caption: "Más de 500 clientes protegidos ✨",
    likes: 188,
    comments: 9,
    postedAt: null,
    order: 5,
    active: true,
  },
];

/**
 * Instagram embed using the official Instagram embed.js script.
 * Renders a <blockquote class="instagram-media"> and loads Instagram's
 * embed.js which transforms it into a full embed (image + caption + likes).
 * This is the same method used by WordPress plugins like Balloon.
 */
function InstagramEmbed({
  permalink,
  index,
  mounted,
}: {
  permalink: string;
  index: number;
  mounted: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Instagram's embed.js script once
    if (!document.getElementById("instagram-embedjs")) {
      const script = document.createElement("script");
      script.id = "instagram-embedjs";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Process embeds after a short delay (give the script time to load)
    const timer = setTimeout(() => {
      const w = window as unknown as {
        instgrm?: { Embeds?: { process?: () => void } };
      };
      if (w.instgrm?.Embeds?.process) {
        w.instgrm.Embeds.process();
      }
      setTimeout(() => setLoaded(true), 1500);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 20 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
      className="overflow-hidden rounded-xl border border-slate-200 shadow-sm"
    >
      <div
        ref={containerRef}
        className="instagram-embed-container min-h-[400px] w-full"
      >
        {!loaded && (
          <div className="flex h-[400px] w-full items-center justify-center bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]">
            <div className="flex flex-col items-center gap-3 text-white">
              <InstagramIcon className="size-10 animate-pulse" />
              <span className="text-sm font-medium">
                Cargando publicación...
              </span>
            </div>
          </div>
        )}
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: "0",
            margin: "1px",
            maxWidth: "540px",
            minWidth: "326px",
            padding: "0",
            width: "100%",
          }}
        />
      </div>
    </motion.div>
  );
}

export function InstagramSection() {
  const mounted = useMounted();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetcher<InstagramPost[]>("/api/instagram")
      .then((data) => {
        const list = (data ?? [])
          .filter((p) => p.active)
          .sort((a, b) => a.order - b.order);
        setPosts(list.length > 0 ? list : FALLBACK_POSTS);
      })
      .catch(() => setPosts(FALLBACK_POSTS))
      .finally(() => setLoading(false));
    fetcher<SiteSettings>("/api/settings")
      .then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
  }, []);

  const profileUrl =
    settings.instagramUrl ||
    `https://instagram.com/${settings.instagramUser || "segurosela"}`;
  const username = settings.instagramUser || "segurosela";

  // Split posts: image posts (manual uploads) vs embed posts (live Instagram embeds)
  const imagePosts = posts.filter((p) => p.imageUrl);
  const embedPosts = posts.filter((p) => !p.imageUrl && p.permalink);

  // Extract the embed URL from an Instagram permalink
  // e.g. https://www.instagram.com/p/Cxample/ → https://www.instagram.com/p/Cxample/embed/
  function getEmbedUrl(permalink: string): string {
    try {
      const url = new URL(permalink);
      const parts = url.pathname.split("/").filter(Boolean);
      // /p/{shortcode}/ or /reel/{shortcode}/
      if (parts.length >= 2 && (parts[0] === "p" || parts[0] === "reel")) {
        return `https://www.instagram.com/p/${parts[1]}/embed/`;
      }
    } catch {
      // not a valid URL
    }
    return permalink;
  }

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-heading"
      className="w-full bg-white py-20 sm:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
            style={{
              background:
                "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            }}
          >
            <InstagramIcon className="size-3.5" />
            Instagram Feed
          </span>
          <h2 id="instagram-heading" className="text-3xl font-extrabold text-[#212121] sm:text-4xl">
            Síguenos en Instagram
          </h2>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00455e] transition-colors hover:text-[#faae0b]"
          >
            <InstagramIcon className="size-4" />
            @{username}
          </a>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div
              className="mx-auto mb-4 grid size-14 place-items-center rounded-full text-white"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              }}
            >
              <InstagramIcon className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-[#212121]">
              Próximamente nuevas publicaciones
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Aún no tenemos publicaciones disponibles. ¡Síguenos en Instagram para
              mantenerte al tanto!
            </p>
            <Button
              asChild
              className="mt-5 font-semibold text-white"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              }}
            >
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="size-4" />
                Visitar perfil
              </a>
            </Button>
          </div>
        ) : (
          <>
            {/* Image posts grid (manual uploads) */}
            {imagePosts.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
                {imagePosts.slice(0, 12).map((post, i) => (
                  <motion.a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir publicación en Instagram"
                    initial={mounted ? { opacity: 0, scale: 0.9 } : false}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                    className="group relative block aspect-square overflow-hidden rounded-lg bg-slate-100 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <img
                      src={post.imageUrl}
                      alt={`Publicación de Instagram de Seguros ELA: ${post.caption || "foto"}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(220,39,67,0.85) 0%, rgba(188,24,136,0.85) 100%)",
                      }}
                    >
                      <InstagramIcon className="size-6 text-white drop-shadow-md" />
                      <div className="flex items-center gap-3 text-white">
                        <span className="flex items-center gap-1 text-sm font-semibold">
                          <Heart className="size-4 fill-white" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-semibold">
                          <MessageCircle className="size-4 fill-white" />
                          {post.comments}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-white/90">
                        <ExternalLink className="size-3" />
                        Ver en Instagram
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}

            {/* Embed posts (live Instagram embeds via official embed.js) */}
            {embedPosts.length > 0 && (
              <div className={imagePosts.length > 0 ? "mt-8" : ""}>
                {imagePosts.length > 0 && (
                  <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Publicaciones recientes
                  </p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {embedPosts.map((post, i) => (
                    <InstagramEmbed
                      key={post.id}
                      permalink={post.permalink}
                      index={i}
                      mounted={mounted}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        {!loading && posts.length > 0 && (
          <motion.div
            initial={mounted ? { opacity: 0, y: 16 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-10 text-center"
          >
            <Button
              asChild
              size="lg"
              className="font-semibold text-white"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              }}
            >
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <InstagramIcon className="size-4" />
                Ver más en Instagram
              </a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default InstagramSection;
