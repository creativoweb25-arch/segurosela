import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/session — report whether the current request is authenticated. */
export async function GET() {
  try {
    const authenticated = await verifySession()
    return NextResponse.json({ success: true, authenticated })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
