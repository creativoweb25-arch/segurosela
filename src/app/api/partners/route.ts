import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/partners — list active partners ordered by `order`. */
export async function GET() {
  try {
    const partners = await db.partner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: partners })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/partners — create a partner (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Nombre es requerido' }, { status: 400 })
    }
    const partner = await db.partner.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl || '',
        order: body.order ?? 0,
        active: body.active !== undefined ? !!body.active : true,
      },
    })
    return NextResponse.json({ success: true, data: partner }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/partners — update a partner by id (admin only). */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, ...rest } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    const data: Record<string, unknown> = {}
    for (const key of ['name', 'logoUrl', 'order', 'active']) {
      if (rest[key] !== undefined) data[key] = rest[key]
    }
    const partner = await db.partner.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: partner })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
