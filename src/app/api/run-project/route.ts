import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { tarea, fechas, agentes } = await req.json()

  if (!tarea?.trim()) {
    return new Response('Falta la descripción del proyecto', { status: 400 })
  }

  const apiUrl = process.env.AGENTS_API_URL

  // ── Cloud mode: proxy to Railway FastAPI ──────────────────────────────────
  if (apiUrl) {
    const upstream = await fetch(`${apiUrl}/run`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tarea, fechas: fechas ?? [] }),
    })

    if (!upstream.ok) {
      return new Response(`__ERROR__: API respondió ${upstream.status}`, { status: 502 })
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  }

  // ── Local dev mode: spawn Python directly ─────────────────────────────────
  const { spawn } = await import('child_process')
  const encoder   = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (line: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line })}\n\n`))
      }

      const python = process.env.PYTHON_PATH ?? '/Library/Frameworks/Python.framework/Versions/3.14/bin/python3'
      const args = ['/Users/eduardomagdaleno/dos_agentes.py', tarea]
      if (fechas?.length) args.push(JSON.stringify(fechas))
      else args.push('[]')
      if (agentes?.length) args.push(JSON.stringify(agentes))
      const proc = spawn(python, args, {
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
        cwd: '/Users/eduardomagdaleno',
      })

      proc.stdout.on('data', (chunk: Buffer) => {
        chunk.toString().split('\n').forEach((l: string) => {
          if (l.trim()) send(l)
        })
      })

      proc.stderr.on('data', (chunk: Buffer) => {
        chunk.toString().split('\n').forEach((l: string) => {
          if (l.trim()) send(`⚠️ ${l}`)
        })
      })

      proc.on('close', (code: number) => {
        send(code === 0 ? '__DONE__' : `__ERROR__: proceso terminó con código ${code}`)
        controller.close()
      })

      proc.on('error', (err: Error) => {
        send(`__ERROR__: ${err.message}`)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
