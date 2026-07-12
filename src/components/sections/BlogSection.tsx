"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, User, ArrowRight, Newspaper } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { Post } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FALLBACK_POSTS: Post[] = [
  {
    id: "b1",
    title: "5 consejos para elegir el mejor seguro de auto",
    slug: "consejos-seguro-auto",
    excerpt:
      "Conoce los puntos clave que debes revisar antes de contratar un seguro de auto en México.",
    content:
      "<p>Elegir un seguro de auto adecuado puede marcar la diferencia entre un siniestro tranquilo y un dolor de cabeza. En este artículo revisamos los 5 puntos esenciales:</p><ul><li>Cobertura amplia vs. limitada</li><li>Suma asegurada y deducible</li><li>Asistencia vial incluida</li><li>Exclusiones más comunes</li><li>Costos y forma de pago</li></ul><p>Un buen asesor te ayudará a comparar opciones entre varias aseguradoras para encontrar la mejor relación cobertura-precio.</p>",
    imageUrl: "/images/blog/blog-1.png",
    category: "Seguros de Auto",
    author: "Seguros ELA",
    views: 142,
    published: true,
    featured: false,
    createdAt: "2024-06-15T10:00:00.000Z",
  },
  {
    id: "b2",
    title: "¿Por qué contratar un seguro de vida?",
    slug: "por-que-seguro-vida",
    excerpt:
      "El seguro de vida es un acto de amor hacia tu familia. Te explicamos sus beneficios.",
    content:
      "<p>El seguro de vida no es para ti, es para los que más amas. Te explicamos las razones más importantes para contratarlo:</p><ul><li>Protección financiera para tu familia</li><li>Pago de deudas pendientes</li><li>Gastos de educación de los hijos</li><li>Tranquilidad emocional</li></ul><p>Existen diferentes modalidades: temporal, entera, universal y dotal. Un asesor puede ayudarte a elegir la ideal.</p>",
    imageUrl: "/images/blog/blog-2.png",
    category: "Seguros de Vida",
    author: "Seguros ELA",
    views: 98,
    published: true,
    featured: false,
    createdAt: "2024-05-20T10:00:00.000Z",
  },
  {
    id: "b3",
    title: "Guía de fianzas para empresas",
    slug: "guia-fianzas-empresas",
    excerpt:
      "Todo lo que necesitas saber sobre fianzas empresariales y su importancia.",
    content:
      "<p>Las fianzas son un instrumento fundamental para las empresas que participan en licitaciones, obras públicas o requieren garantizar obligaciones. En esta guía abordamos:</p><ul><li>Tipos de fianzas: judiciales, administrativas, de fidelidad, de obra</li><li>Requisitos para tramitarlas</li><li>Ventajas competitivas</li><li>Costos y tiempos</li></ul><p>Contar con el respaldo correcto puede abrir puertas a nuevos negocios.</p>",
    imageUrl: "/images/blog/blog-3.png",
    category: "Fianzas",
    author: "Seguros ELA",
    views: 76,
    published: true,
    featured: false,
    createdAt: "2024-04-10T10:00:00.000Z",
  },
];

// Deterministic date formatter — avoids hydration mismatches from locale ICU data
const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

export function BlogSection() {
  const mounted = useMounted();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<Post[]>("/api/posts")
      .then((data) => {
        const list = (data ?? []).filter((p) => p.published);
        setPosts(list.length > 0 ? list : FALLBACK_POSTS);
      })
      .catch(() => setPosts(FALLBACK_POSTS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="blog" aria-labelledby="blog-heading" className="w-full bg-slate-50 py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl text-center mx-auto"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00455e]">
            <Newspaper className="size-4" />
            Blog
          </span>
          <h2 id="blog-heading" className="mt-2 text-3xl font-extrabold text-[#212121] sm:text-4xl">
            Nuestras Publicaciones
          </h2>
          <div
            className="mx-auto mt-4 h-1.5 w-24 rounded-full"
            style={{ backgroundColor: "#faae0b" }}
          />
          <p className="mt-4 text-base text-slate-600">
            Consejos, guías y novedades del mundo de los seguros y fianzas en México.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-slate-500">No hay publicaciones todavía.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <motion.article
                key={post.id}
                initial={mounted ? { opacity: 0, y: 30 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <a
                  href={`/blog/${post.slug}`}
                  className="relative block aspect-video overflow-hidden"
                  aria-label={`Leer: ${post.title}`}
                >
                  <img
                    src={post.imageUrl || "/images/blog/blog-1.png"}
                    alt={`${post.title} - Blog Seguros ELA`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge
                    className="absolute left-3 top-3 border-0 text-[#212121]"
                    style={{ backgroundColor: "#faae0b" }}
                  >
                    {post.category}
                  </Badge>
                </a>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="size-3.5" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="size-3.5" />
                      {post.views}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold leading-snug text-[#212121] transition-colors group-hover:text-[#00455e]">
                    <a href={`/blog/${post.slug}`}>{post.title}</a>
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                    {post.excerpt}
                  </p>
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#00455e] transition-colors hover:text-[#faae0b]"
                  >
                    Leer más
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogSection;
