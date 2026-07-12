import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/health-fairs — list active health fairs ordered by date asc. */
export async function GET() {
  try {
    const fairs = await db.healthFair.findMany({
      where: { active: true },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ success: true, data: fairs })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/health-fairs — create a health fair (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    if (!body.title || !body.date || !body.location || !body.state) {
      return NextResponse.json(
        { success: false, error: 'title, date, location y state son requeridos' },
        { status: 400 }
      )
    }
    const fair = await db.healthFair.create({
      data: {
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location,
        state: body.state,
        address: body.address || null,
        time: body.time || null,
        imageUrl: body.imageUrl || null,
        order: body.order ?? 0,
        active: body.active !== undefined ? !!body.active : true,
      },
    })
    return NextResponse.json({ success: true, data: fair }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** DELETE /api/health-fairs?id=xxx — delete a health fair (admin only). */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    await db.healthFair.delete({ where: { id } })
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
