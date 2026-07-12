import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PostContent } from "@/components/blog/PostContent";

const SITE_URL = "https://segurosela.com.mx";

/** Generate static metadata for SEO */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });

  if (!post || !post.published) {
    return {
      title: "Post no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `${post.title} | Blog Seguros ELA`;
  const description = post.excerpt;

  return {
    title,
    description,
    keywords: [post.category, "seguros", "Tijuana", "Seguros ELA"],
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author],
      tags: [post.category],
      images: post.imageUrl
        ? [
            {
              url: post.imageUrl,
              width: 1152,
              height: 864,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

// No generateStaticParams — pages are rendered on-demand (force-dynamic)
// This prevents database queries during build (Vercel doesn't have SQLite at build time)
export const dynamic = "force-dynamic";

/** Increment view count (server-side, fire and forget) */
async function incrementViews(postId: string) {
  try {
    await db.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
  } catch {
    // ignore errors on view increment
  }
}

/** Fetch related posts (same category, excluding current) */
async function getRelatedPosts(category: string, excludeId: string) {
  const related = await db.post.findMany({
    where: {
      published: true,
      category,
      id: { not: excludeId },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      category: true,
      createdAt: true,
    },
  });
  // If not enough in same category, fill with any published
  if (related.length < 3) {
    const extra = await db.post.findMany({
      where: {
        published: true,
        id: { notIn: [excludeId, ...related.map((r) => r.id)] },
      },
      take: 3 - related.length,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        category: true,
        createdAt: true,
      },
    });
    return [...related, ...extra];
  }
  return related;
}

// Deterministic date formatter — avoids hydration mismatches
const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
function formatDateLong(iso: Date): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug } });

  if (!post || !post.published) {
    notFound();
  }

  // Increment views (fire and forget)
  void incrementViews(post.id);

  // Get related posts
  const related = await getRelatedPosts(post.category, post.id);

  // JSON-LD Article structured data
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl ? `${SITE_URL}${post.imageUrl}` : undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.createdAt.toISOString(),
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Seguros y Fianzas ELA",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo/ela-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <Header />
      <main className="flex-1">
        {/* Breadcrumb — integrated into the hero header to avoid gaps */}
        <header
          className="relative overflow-hidden text-white"
          style={{ backgroundColor: "#00455e" }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ backgroundColor: "#faae0b" }}
            />
            <div
              className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl"
              style={{ backgroundColor: "#23a1ea" }}
            />
          </div>
          {/* Breadcrumb inside the teal header */}
          <nav
            className="relative border-b border-white/10"
            aria-label="Navegación"
          >
            <div className="mx-auto max-w-4xl px-4 py-2.5 sm:px-8">
              <ol className="flex items-center gap-2 text-xs text-white/60">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-[#faae0b]"
                  >
                    Inicio
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href="/#blog"
                    className="transition-colors hover:text-[#faae0b]"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="truncate font-medium text-[#faae0b]" aria-current="page">
                  {post.title}
                </li>
              </ol>
            </div>
          </nav>

          {/* Post title and meta inside the same teal header */}
          <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#212121]"
                style={{ backgroundColor: "#faae0b" }}
              >
                {post.category}
              </span>
              <span className="text-xs text-white/70">
                {formatDateLong(post.createdAt)}
              </span>
              <span className="text-xs text-white/70">·</span>
              <span className="text-xs text-white/70">
                {post.views} vistas
              </span>
              <span className="text-xs text-white/70">·</span>
              <span className="text-xs text-white/70">{post.author}</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl sm:leading-tight" style={{ color: "#ffffff" }}>
              {post.title}
            </h1>
            <p className="mt-4 text-sm text-white/80 sm:text-base">
              {post.excerpt}
            </p>
          </div>
        </header>

        {/* Featured image — below the header, no overlap */}
        {post.imageUrl && (
          <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-8 sm:pt-8">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-64 w-full object-cover sm:h-96"
              />
            </div>
          </div>
        )}

        {/* Article content */}
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
          <PostContent html={post.content} />

          {/* Share buttons */}
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: "#e7e7ea" }}>
            <span className="text-sm font-semibold text-slate-600">
              Comparte este artículo:
            </span>
            <div className="flex gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `${SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-110"
                aria-label="Compartir en Facebook"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${encodeURIComponent(`${SITE_URL}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-full bg-black text-white transition-transform hover:scale-110"
                aria-label="Compartir en Twitter/X"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  post.title + " " + `${SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
                aria-label="Compartir en WhatsApp"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `${SITE_URL}/blog/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-full bg-[#0A66C2] text-white transition-transform hover:scale-110"
                aria-label="Compartir en LinkedIn"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-10 overflow-hidden rounded-2xl p-8 text-center text-white shadow-lg sm:p-10"
            style={{ backgroundColor: "#00455e" }}
          >
            <h2 className="text-xl font-bold sm:text-2xl">
              ¿Necesitas asesoría sobre este tema?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
              En Seguros y Fianzas ELA te ayudamos a proteger lo que más valoras.
              Cotiza gratis y recibe asesoría personalizada de nuestros expertos.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/#cotizacion"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-[#212121] transition-transform hover:scale-105"
                style={{ backgroundColor: "#faae0b" }}
              >
                Solicitar Cotización Gratis
              </Link>
              <a
                href="tel:6632064190"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[#00455e]"
              >
                📞 66-3206-4190
              </a>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section
            className="border-t bg-slate-50 py-16"
            style={{ borderColor: "#e7e7ea" }}
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-8">
              <h2 className="mb-8 text-2xl font-extrabold text-[#212121]">
                Artículos relacionados
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderColor: "#e7e7ea" }}
                  >
                    {r.imageUrl && (
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <span
                        className="mb-2 inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#212121]"
                        style={{ backgroundColor: "#faae0b" }}
                      >
                        {r.category}
                      </span>
                      <h3 className="mb-2 line-clamp-2 text-sm font-bold text-[#212121] transition-colors group-hover:text-[#00455e]">
                        {r.title}
                      </h3>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {r.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
