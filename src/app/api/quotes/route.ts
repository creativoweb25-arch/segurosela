import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendQuoteEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** POST /api/quotes — public endpoint: create a quote request + send email notification. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, insuranceType, protectionLevel, message, consent } = body || {}
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Nombre inválido' }, { status: 400 })
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return NextResponse.json({ success: false, error: 'Teléfono inválido' }, { status: 400 })
    }
    if (!insuranceType || typeof insuranceType !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Tipo de seguro requerido' },
        { status: 400 }
      )
    }

    // 1. Save to database
    const quote = await db.quoteRequest.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        insuranceType: insuranceType.trim(),
        protectionLevel: protectionLevel || null,
        message: message || null,
        consent: consent !== false,
      },
    })

    // 2. Send email notification (fire and forget — don't block the response)
    void sendQuoteEmail({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      insuranceType: insuranceType.trim(),
      protectionLevel: protectionLevel || null,
      message: message || null,
    }).catch(() => {})

    return NextResponse.json({ success: true, data: quote }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** GET /api/quotes — admin only: list all quote requests. */
export async function GET() {
  try {
    await requireAdmin()
    const quotes = await db.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ success: true, data: quotes })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
