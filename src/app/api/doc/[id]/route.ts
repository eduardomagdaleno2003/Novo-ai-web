import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

const CARPETA = '/Users/eduardomagdaleno/demoagent'

const mimeTypes: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf:  'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

const tipoExt: Record<string, string> = {
  word: 'docx', excel: 'xlsx', pdf: 'pdf', ppt: 'pptx',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Use direct client (no cookie auth needed — anon key reads are public)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: doc, error } = await supabase
    .from('documentos')
    .select('nombre, tipo, titulo, ruta')
    .eq('id', id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
  }

  // Cloud storage: redirect to public URL
  if (doc.ruta?.startsWith('https://')) {
    return NextResponse.redirect(doc.ruta)
  }

  const ext = tipoExt[doc.tipo] ?? doc.tipo
  const constructedPath = path.join(CARPETA, `${doc.nombre}.${ext}`)

  // Try stored ruta first, validate it stays inside CARPETA, then fall back
  let filepath = constructedPath
  if (doc.ruta) {
    const resolved = path.resolve(doc.ruta)
    if (resolved.startsWith(path.resolve(CARPETA))) {
      filepath = doc.ruta
    }
  }

  if (!existsSync(filepath)) filepath = constructedPath

  if (!existsSync(filepath)) {
    // Last resort: scan folder for any file matching the nombre
    try {
      const { readdirSync } = await import('fs')
      const files = readdirSync(CARPETA)
      const match = files.find(f =>
        f.startsWith(doc.nombre) && f.endsWith(`.${ext}`)
      )
      if (match) filepath = path.join(CARPETA, match)
    } catch {}
  }

  if (!existsSync(filepath)) {
    return NextResponse.json(
      { error: `Archivo no encontrado en servidor: ${doc.nombre}.${ext}` },
      { status: 404 }
    )
  }

  const mime = mimeTypes[ext] ?? 'application/octet-stream'
  const buffer = readFileSync(filepath)
  const dlName = `${(doc.titulo || doc.nombre).replace(/[^\w\s.\-]/g, '_')}.${ext}`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${dlName}"`,
    },
  })
}
