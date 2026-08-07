import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/commercial-allies — list active commercial allies ordered by `order`. */
export async function GET() {
  try {
    const allies = await db.commercialAlly.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: allies })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/commercial-allies — create a commercial ally (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    if (!body.name || !body.websiteUrl) {
      return NextResponse.json(
        { success: false, error: 'name y websiteUrl son requeridos' },
        { status: 400 }
      )
    }
    const ally = await db.commercialAlly.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl || null,
        websiteUrl: body.websiteUrl,
        description: body.description || null,
        order: body.order ?? 0,
        active: body.active !== undefined ? !!body.active : true,
      },
    })
    return NextResponse.json({ success: true, data: ally }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/commercial-allies — update a commercial ally by id (admin only). */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, ...rest } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    const data: Record<string, unknown> = {}
    for (const key of ['name', 'logoUrl', 'websiteUrl', 'description', 'order', 'active']) {
      if (rest[key] !== undefined) data[key] = rest[key]
    }
    const existing = await db.commercialAlly.findUnique({ where: { id } })
    let ally
    if (existing) {
      ally = await db.commercialAlly.update({ where: { id }, data })
    } else {
      ally = await db.commercialAlly.create({
        data: {
          id,
          name: (data.name as string) || 'Aliado',
          websiteUrl: (data.websiteUrl as string) || '#',
          ...data,
        },
      })
    }
    return NextResponse.json({ success: true, data: ally })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** DELETE /api/commercial-allies?id=xxx — delete a commercial ally (admin only). */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    await db.commercialAlly.delete({ where: { id } })
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
