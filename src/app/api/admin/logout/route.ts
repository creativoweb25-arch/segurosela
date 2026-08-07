import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** POST /api/admin/logout — clear the admin session cookie. */
export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ success: true, data: { authenticated: false } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
