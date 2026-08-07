import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/services — list active services ordered by `order`. */
export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: services })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/services — upsert (update a single service by id from body). */
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
      'slug',
      'title',
      'shortDesc',
      'description',
      'icon',
      'imageUrl',
      'order',
      'active',
    ]) {
      if (rest[key] !== undefined) data[key] = rest[key]
    }
    const existing = await db.service.findUnique({ where: { id } })
    let service
    if (existing) {
      service = await db.service.update({ where: { id }, data })
    } else {
      service = await db.service.create({
        data: {
          id,
          slug: (data.slug as string) || 'service',
          title: (data.title as string) || 'Servicio',
          shortDesc: (data.shortDesc as string) || '',
          description: (data.description as string) || '',
          ...data,
        },
      })
    }
    return NextResponse.json({ success: true, data: service })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
