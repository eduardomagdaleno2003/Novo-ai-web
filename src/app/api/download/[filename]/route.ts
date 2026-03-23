import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const CARPETA = '/Users/eduardomagdaleno/demoagent'

const mimeTypes: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf:  'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '')
  const filepath = join(CARPETA, safeName)

  if (!existsSync(filepath)) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  const ext = safeName.split('.').pop()?.toLowerCase() ?? ''
  const mime = mimeTypes[ext] ?? 'application/octet-stream'
  const buffer = readFileSync(filepath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${safeName}"`,
    },
  })
}
