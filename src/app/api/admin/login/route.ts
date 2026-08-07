import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, getAdminCredentials } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** POST /api/admin/login — authenticate admin and create a session cookie. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const username = (body?.username as string | undefined)?.trim() || ''
    const password = (body?.password as string | undefined) || ''
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      )
    }
    const creds = getAdminCredentials()
    if (username !== creds.username || password !== creds.password) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    // Ensure the Admin row exists in the DB (auto-create if missing).
    await db.admin.upsert({
      where: { username: creds.username },
      update: { password: creds.password },
      create: { username: creds.username, password: creds.password, name: 'Administrador' },
    })
    const token = await createSession(username)
    return NextResponse.json({
      success: true,
      data: { username, authenticated: true, token },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
