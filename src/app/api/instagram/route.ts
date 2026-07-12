import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/instagram — list active instagram posts ordered by `order`. */
export async function GET() {
  try {
    const posts = await db.instagramPost.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: posts })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/instagram — create an instagram post (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    if (!body.permalink) {
      return NextResponse.json(
        { success: false, error: 'permalink es requerido' },
        { status: 400 }
      )
    }
    const post = await db.instagramPost.create({
      data: {
        instagramId: body.instagramId || null,
        permalink: body.permalink,
        imageUrl: body.imageUrl || null,
        caption: body.caption || null,
        likes: body.likes ?? 0,
        comments: body.comments ?? 0,
        postedAt: body.postedAt ? new Date(body.postedAt) : null,
        order: body.order ?? 0,
        active: body.active !== undefined ? !!body.active : true,
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

/** PUT /api/instagram?id=xxx — update an instagram post (admin only). */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    const body = await req.json()
    const data: Record<string, unknown> = {}
    for (const key of ['permalink', 'imageUrl', 'caption', 'likes', 'comments', 'order', 'active']) {
      if (body[key] !== undefined) data[key] = body[key]
    }
    if (body.postedAt !== undefined) {
      data.postedAt = body.postedAt ? new Date(body.postedAt) : null
    }
    const post = await db.instagramPost.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: post })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** DELETE /api/instagram?id=xxx — delete an instagram post (admin only). */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    await db.instagramPost.delete({ where: { id } })
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
