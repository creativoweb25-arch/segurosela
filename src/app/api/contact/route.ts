import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendContactEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** POST /api/contact — public endpoint: create a contact message + send email notification. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message, consent } = body || {}
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Nombre inválido' }, { status: 400 })
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Mensaje inválido' }, { status: 400 })
    }

    // 1. Save to database
    const contact = await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone || null,
        subject: subject || null,
        message: message.trim(),
        consent: consent !== false,
      },
    })

    // 2. Send email notification (fire and forget — don't block the response)
    void sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      phone: phone || null,
      subject: subject || null,
      message: message.trim(),
    }).catch(() => {})

    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** GET /api/contact — admin only: list all contact messages. */
export async function GET() {
  try {
    await requireAdmin()
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ success: true, data: messages })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
