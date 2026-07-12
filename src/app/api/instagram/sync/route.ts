import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/instagram/sync
 * Body: { username: string }
 *
 * Attempts to fetch the public Instagram profile page and extract recent
 * post thumbnails. Instagram frequently blocks server-side scraping, so
 * any failure is returned gracefully with `{success:false, message}` —
 * the admin can still add posts manually.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const username = (body?.username as string | undefined)?.trim()
    if (!username) {
      return NextResponse.json(
        { success: false, error: 'username es requerido' },
        { status: 400 }
      )
    }

    const url = `https://www.instagram.com/${encodeURIComponent(username)}/`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    let res: Response
    try {
      res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      })
    } catch (fetchErr) {
      clearTimeout(timeout)
      return NextResponse.json({
        success: false,
        message:
          'No se pudo conectar a Instagram desde el servidor. Puedes agregar los posts manualmente desde el panel.',
        error: fetchErr instanceof Error ? fetchErr.message : 'fetch_failed',
      })
    }
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        message: `Instagram respondió con código ${res.status}. Es posible que el perfil sea privado o que Instagram haya bloqueado la solicitud. Puedes agregar los posts manualmente.`,
        status: res.status,
      })
    }

    const html = await res.text()

    // Try to extract image URLs from the page. Instagram embeds JSON in
    // <script type="application/ld+json"> tags and also has og:image meta.
    const imageRegex =
      /https:\/\/(scontent[^"'\s]+\.(?:jpg|jpeg|png|webp))/g
    const matches = new Set<string>()
    let m: RegExpExecArray | null
    while ((m = imageRegex.exec(html)) !== null) {
      matches.add(m[0])
    }

    // Permalink candidates from the page.
    const permalinkRegex = /https:\/\/www\.instagram\.com\/(?:p|reel)\/[^"'\s/?]+/g
    const permalinks = new Set<string>()
    while ((m = permalinkRegex.exec(html)) !== null) {
      permalinks.add(m[0])
    }

    if (matches.size === 0) {
      return NextResponse.json({
        success: false,
        message:
          'No se pudieron extraer imágenes del perfil. Instagram normalmente bloquea la lectura automatizada. Te recomendamos agregar los posts manualmente con la URL de la imagen y el permalink.',
        username,
      })
    }

    const images = Array.from(matches).slice(0, 12)
    const links = Array.from(permalinks)
    const items = images.map((imageUrl, i) => ({
      imageUrl,
      permalink: links[i] || `https://www.instagram.com/${encodeURIComponent(username)}/`,
      caption: '',
      likes: 0,
      comments: 0,
    }))

    return NextResponse.json({
      success: true,
      data: items,
      username,
      count: items.length,
      message: `Se encontraron ${items.length} publicaciones. Revisa los resultados antes de importar.`,
    })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err?.status === 401 || err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: 'Error inesperado al sincronizar con Instagram.', error: msg },
      { status: 500 }
    )
  }
}
