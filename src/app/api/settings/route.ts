import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/settings — returns the singleton SiteSettings (auto-creates defaults if missing). */
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({
      where: { id: 'singleton' },
    })
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'singleton' } })
    }
    return NextResponse.json({ success: true, data: settings })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** PUT /api/settings — update settings fields (admin only). */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const allowed = [
      'brandName',
      'tagline',
      'logoUrl',
      'logoText',
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'darkColor',
      'phone',
      'whatsapp',
      'email',
      'address',
      'schedule',
      'instagramUser',
      'instagramUrl',
      'facebookUrl',
      'linkedinUrl',
      'yearsExperience',
      'aboutText',
      'aboutImageUrl',
    ] as const
    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }

    const updated = await db.siteSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    })
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
