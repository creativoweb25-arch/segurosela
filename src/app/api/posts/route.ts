import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Build a URL-friendly slug from a title. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

/** Ensure a slug is unique by appending -2, -3, ... if needed. */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || 'post'
  let n = 1
  while (true) {
    const existing = await db.post.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

/** GET /api/posts — list published posts (?all=true shows unpublished, admin only). */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    if (all) {
      await requireAdmin()
    }
    const posts = await db.post.findMany({
      where: all ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: posts })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/posts — create a post (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { title, content, excerpt, imageUrl, category, author, published, featured } = body
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Título y contenido son requeridos' },
        { status: 400 }
      )
    }
    let slug = body.slug ? slugify(body.slug) : ''
    if (!slug) slug = slugify(title)
    slug = await uniqueSlug(slug)
    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content,
        imageUrl: imageUrl || null,
        category: category || 'Nuestras Publicaciones',
        author: author || 'Seguros ELA',
        published: published !== undefined ? !!published : true,
        featured: !!featured,
      },
    })
    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
