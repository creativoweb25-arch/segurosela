import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

async function uniqueSlug(base: string, ignoreId: string): Promise<string> {
  let slug = base || 'post'
  let n = 1
  while (true) {
    const existing = await db.post.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

/** GET /api/posts/[id] — get a post by id; increments views for published posts. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await db.post.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    }
    if (post.published) {
      await db.post.update({ where: { id }, data: { views: { increment: 1 } } })
    }
    return NextResponse.json({ success: true, data: { ...post, views: post.published ? post.views + 1 : post.views } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/posts/[id] — update a post (admin only). */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    }
    const data: Record<string, unknown> = {}
    for (const key of [
      'title',
      'content',
      'excerpt',
      'imageUrl',
      'category',
      'author',
      'published',
      'featured',
    ]) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    // Re-slug if title changed and slug not explicitly provided.
    if (body.slug) {
      data.slug = await uniqueSlug(slugify(body.slug), id)
    } else if (body.title && body.title !== existing.title) {
      data.slug = await uniqueSlug(slugify(body.title), id)
    }
    const updated = await db.post.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: updated })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** DELETE /api/posts/[id] — delete a post (admin only). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    await db.post.delete({ where: { id } })
    return NextResponse.json({ success: true, data: { id } })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
