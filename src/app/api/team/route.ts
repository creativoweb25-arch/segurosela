import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/team — list active team members ordered by `order`. */
export async function GET() {
  try {
    const team = await db.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, data: team })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** POST /api/team — create a team member (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    if (!body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Nombre y rol son requeridos' },
        { status: 400 }
      )
    }
    const member = await db.teamMember.create({
      data: {
        name: body.name,
        role: body.role,
        bio: body.bio || null,
        imageUrl: body.imageUrl || null,
        email: body.email || null,
        phone: body.phone || null,
        order: body.order ?? 0,
        active: body.active !== undefined ? !!body.active : true,
      },
    })
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/team — update a team member by id (admin only). */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, ...rest } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }
    const data: Record<string, unknown> = {}
    for (const key of ['name', 'role', 'bio', 'imageUrl', 'email', 'phone', 'order', 'active']) {
      if (rest[key] !== undefined) data[key] = rest[key]
    }
    const member = await db.teamMember.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: member })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
