import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/slides — list active slides ordered by `order`. */
export async function GET() {
  try {
    const slides = await db.slide.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: slides })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/slides — create a slide (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Título e imagen son requeridos' },
        { status: 400 }
      )
    }
    const slide = await db.slide.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || '',
        description: body.description || null,
        buttonText: body.buttonText || 'Saber Más',
        buttonLink: body.buttonLink || '#cotizacion',
        imageUrl: body.imageUrl,
        order: body.order ?? 0,
        active: body.active !== undefined ? !!body.active : true,
      },
    })
    return NextResponse.json({ success: true, data: slide }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/slides — update a slide by id (admin only). */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, ...rest } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    const data: Record<string, unknown> = {}
    for (const key of [
      'title',
      'subtitle',
      'description',
      'buttonText',
      'buttonLink',
      'imageUrl',
      'order',
      'active',
    ]) {
      if (rest[key] !== undefined) data[key] = rest[key]
    }
    const slide = await db.slide.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: slide })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
