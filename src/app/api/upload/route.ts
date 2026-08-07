import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

/** Sanitize a filename: keep only safe characters. */
function sanitizeFilename(name: string): string {
  const base = path.basename(name)
  return base
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** POST /api/upload — upload an image file (admin only). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No se envió ningún archivo' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `El archivo es demasiado grande. Máximo permitido: 10 MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        },
        { status: 413 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'El archivo está vacío' },
        { status: 400 }
      )
    }

    const contentType = file.type || ''
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de archivo no permitido: ${contentType || 'desconocido'}. Formatos permitidos: JPG, PNG, WebP, GIF, SVG`,
        },
        { status: 415 }
      )
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Extensión no permitida: ${ext}. Formatos permitidos: JPG, PNG, WebP, GIF, SVG`,
        },
        { status: 415 }
      )
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const timestamp = Date.now()
    const safeName = sanitizeFilename(file.name) || `upload-${timestamp}`
    const filename = `${timestamp}-${safeName}`
    const filepath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      data: { url, filename, size: file.size, type: contentType },
    })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Upload error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
