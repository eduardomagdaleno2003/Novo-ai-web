'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Bot, Zap, CheckCircle2, XCircle } from 'lucide-react'

export function RunAgentsForm() {
  const router = useRouter()
  const [tarea, setTarea] = useState('')
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [lines])

  async function handleRun() {
    if (!tarea.trim() || running) return
    setRunning(true)
    setLines([])
    setStatus('running')

    const res = await fetch('/api/run-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tarea }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        if (!part.startsWith('data:')) continue
        const json = part.replace(/^data:\s*/, '').trim()
        if (!json) continue
        try {
          const { line } = JSON.parse(json)
          if (line === '__DONE__') {
            setStatus('done')
            setRunning(false)
            setTimeout(() => router.refresh(), 500)
          } else if (line.startsWith('__ERROR__')) {
            setStatus('error')
            setRunning(false)
            setLines(prev => [...prev, line])
          } else {
            setLines(prev => [...prev, line])
          }
        } catch {}
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[#8888aa] text-xs font-medium mb-1.5 uppercase tracking-wider">
          Proyecto para los agentes
        </label>
        <div className="flex gap-2">
          <input
            value={tarea}
            onChange={e => setTarea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRun()}
            placeholder="Ej: Plan de expansión de ventas Q2 2025"
            disabled={running}
            className="flex-1 bg-[#0f0f1a] border border-[#1e1e35] rounded-xl px-4 py-2.5 text-[#e8e8f0] text-sm placeholder:text-[#555577] focus:outline-none focus:border-violet-600/50 transition-colors disabled:opacity-50"
          />
          <Button onClick={handleRun} disabled={running || !tarea.trim()}>
            <Zap className="w-4 h-4" />
            {running ? 'Ejecutando...' : 'Ejecutar'}
          </Button>
        </div>
      </div>

      {/* Terminal */}
      {(lines.length > 0 || running) && (
        <div className="rounded-xl bg-[#080810] border border-[#1e1e35] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e1e35]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-[#555577] text-xs font-mono ml-2">agentes — terminal</span>
            {status === 'running' && (
              <span className="ml-auto flex items-center gap-1.5 text-[#555577] text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ejecutando
              </span>
            )}
            {status === 'done' && (
              <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> completado
              </span>
            )}
            {status === 'error' && (
              <span className="ml-auto flex items-center gap-1.5 text-red-400 text-xs">
                <XCircle className="w-3.5 h-3.5" /> error
              </span>
            )}
          </div>
          <div ref={logRef} className="h-72 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5">
            {lines.map((line, i) => (
              <div key={i} className={
                line.includes('✅') ? 'text-emerald-400' :
                line.includes('📧') ? 'text-cyan-400' :
                line.includes('🔧') ? 'text-violet-400' :
                line.includes('📘') || line.includes('📗') || line.includes('📕') || line.includes('📙') ? 'text-blue-400' :
                line.includes('🤖') ? 'text-yellow-400 font-bold' :
                line.includes('⚠️') ? 'text-red-400' :
                line.includes('═') ? 'text-[#2a2a45]' :
                'text-[#8888aa]'
              }>
                {line}
              </div>
            ))}
            {running && (
              <div className="text-violet-400 animate-pulse">▌</div>
            )}
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/50 border border-emerald-900/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 text-sm font-medium">Proyecto completado</p>
            <p className="text-emerald-600 text-xs">Los documentos y el historial ya están disponibles en la app</p>
          </div>
        </div>
      )}
    </div>
  )
}
