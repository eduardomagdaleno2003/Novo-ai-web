'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Zap, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Users, Mail } from 'lucide-react'
import type { Agente } from '@/types/database'

// ── Department helpers ────────────────────────────────────────────────────────

type AgenteConDepto = Agente & { departamento: string }

const deptoColor: Record<string, { bg: string; text: string; dot: string; avatar: string }> = {
  'Data & Analytics': { bg: 'bg-violet-950', text: 'text-violet-300', dot: 'bg-violet-500', avatar: 'bg-violet-600' },
  'Finance':          { bg: 'bg-emerald-950', text: 'text-emerald-300', dot: 'bg-emerald-500', avatar: 'bg-emerald-600' },
  'Marketing':        { bg: 'bg-pink-950',    text: 'text-pink-300',   dot: 'bg-pink-500',   avatar: 'bg-pink-600' },
  'People & Ops':     { bg: 'bg-orange-950',  text: 'text-orange-300', dot: 'bg-orange-500', avatar: 'bg-orange-600' },
  'Product & Tech':   { bg: 'bg-blue-950',    text: 'text-blue-300',   dot: 'bg-blue-500',   avatar: 'bg-blue-600' },
  'Sales':            { bg: 'bg-cyan-950',    text: 'text-cyan-300',   dot: 'bg-cyan-500',   avatar: 'bg-cyan-600' },
  'General':          { bg: 'bg-zinc-900',    text: 'text-zinc-300',   dot: 'bg-zinc-500',   avatar: 'bg-zinc-600' },
}

const DEPTO_ORDER = ['Product & Tech','Data & Analytics','Finance','Marketing','People & Ops','Sales','General']

function initials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getDepto(a: Agente): string {
  try {
    const parsed = JSON.parse(a.descripcion ?? '{}')
    return parsed.departamento ?? 'General'
  } catch { return 'General' }
}

function agoDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

const EMAIL_LABELS = [
  { de: 'Carlos M.',   para: 'Miguel Á.', desc: 'Brief — solicita reporte financiero y dashboard' },
  { de: 'Carlos M.',   para: 'Laura S.',  desc: 'Brief — solicita deck ejecutivo y acta de arranque' },
  { de: 'Miguel Á.',   para: 'Laura S.',  desc: 'Comparte datos clave de los Excel' },
  { de: 'Miguel Á.',   para: 'Carlos M.', desc: 'Confirmación del análisis completo' },
  { de: 'Laura S.',    para: 'Miguel Á.', desc: 'Acuse de datos y confirmación de slides usados' },
  { de: 'Laura S.',    para: 'Carlos M.', desc: 'Confirmación del deck y acta de arranque' },
]

const DEFAULT_DATES = [
  { date: agoDate(6), time: '09:12' },
  { date: agoDate(6), time: '09:31' },
  { date: agoDate(4), time: '10:05' },
  { date: agoDate(4), time: '10:48' },
  { date: agoDate(3), time: '09:55' },
  { date: agoDate(3), time: '11:22' },
]

// ── Component ─────────────────────────────────────────────────────────────────

type Phase = 'step1' | 'step2' | 'step3' | 'running' | 'done' | 'error'

export function NewProjectForm() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [runAgents, setRunAgents] = useState(true)
  const [phase, setPhase] = useState<Phase>('step1')

  // Step 2 — agent selection
  const [agentes, setAgentes] = useState<AgenteConDepto[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingAgentes, setLoadingAgentes] = useState(false)

  // Step 3 — email dates
  const [emailDates, setEmailDates] = useState(DEFAULT_DATES)

  // Terminal
  const [lines, setLines] = useState<string[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines])

  // ── Step 1 → Step 2 ───────────────────────────────────────────────────────

  async function goToStep2() {
    if (!nombre.trim()) return
    setLoadingAgentes(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase.from('agentes').select('*').order('created_at', { ascending: true })
    const raw = (data ?? []) as Agente[]
    const withDepto: AgenteConDepto[] = raw.map(a => ({ ...a, departamento: getDepto(a) }))
    setAgentes(withDepto)
    setLoadingAgentes(false)
    setPhase('step2')
  }

  function toggleAgent(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === agentes.length) setSelected(new Set())
    else setSelected(new Set(agentes.map(a => a.id)))
  }

  function updateEmailDate(i: number, field: 'date' | 'time', value: string) {
    setEmailDates(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  // ── Final submit ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    const selectedAgentes = agentes.filter(a => selected.has(a.id))
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    if (!runAgents) {
      const { data, error } = await supabase.from('proyectos').insert({
        nombre, descripcion: descripcion || null, estado: 'in_progress'
      }).select().single()
      if (error || !data) return
      await supabase.from('historial').insert({
        proyecto_id: data.id, tipo_evento: 'proyecto_creado',
        descripcion: `Proyecto "${nombre}" creado`
      })
      if (selectedAgentes.length > 0) {
        await supabase.from('historial').insert({
          proyecto_id: data.id, tipo_evento: 'agentes_asignados',
          descripcion: `Equipo asignado: ${selectedAgentes.map(a => a.nombre).join(', ')}`
        })
      }
      router.push(`/projects/${data.id}`)
      router.refresh()
      return
    }

    setPhase('running')
    const teamNote = selectedAgentes.length > 0
      ? ` Equipo asignado: ${selectedAgentes.map(a => `${a.nombre} (${a.departamento})`).join(', ')}.`
      : ''
    const tarea = `${nombre}${descripcion ? '. ' + descripcion : ''}${teamNote}`
    const fechas = emailDates.map(e => `${e.date} ${e.time}`)

    setLines([`🚀 Iniciando proyecto: ${nombre}...`])
    if (selectedAgentes.length > 0) {
      setLines(prev => [...prev, `👥 Equipo: ${selectedAgentes.map(a => a.nombre).join(', ')}`])
    }

    const res = await fetch('/api/run-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tarea, fechas }),
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
        try {
          const { line } = JSON.parse(part.replace(/^data:\s*/, '').trim())
          if (line === '__DONE__') {
            setPhase('done')
          } else if (line.startsWith('__ERROR__')) {
            setPhase('error')
            setLines(prev => [...prev, line])
          } else if (line.startsWith('__PROJECT_ID__:')) {
            setProjectId(line.split(':')[1])
          } else {
            setLines(prev => [...prev, line])
          }
        } catch {}
      }
    }

    router.refresh()
  }

  // ── Group agents by dept ──────────────────────────────────────────────────

  const byDepto = DEPTO_ORDER.reduce((acc, d) => {
    const members = agentes.filter(a => a.departamento === d)
    if (members.length) acc.push({ depto: d, members })
    return acc
  }, [] as { depto: string; members: AgenteConDepto[] }[])

  // ── Progress bar ──────────────────────────────────────────────────────────

  const steps = runAgents
    ? ['Datos', 'Agentes', 'Fechas de correos']
    : ['Datos', 'Agentes']

  function ProgressBar({ current }: { current: number }) {
    return (
      <div className="flex items-center gap-2 mb-6">
        {steps.map((label, i) => (
          <>
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < current ? 'bg-[#2a2a45] border border-violet-600/40 text-violet-400'
                : i === current ? 'bg-violet-600 text-white'
                : 'bg-[#1e1e35] text-[#555577]'
              }`}>{i + 1}</div>
              <span className={`text-xs ${i === current ? 'text-violet-300 font-medium' : 'text-[#555577]'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div key={`sep-${i}`} className={`flex-1 h-px ${i < current ? 'bg-violet-600/30' : 'bg-[#1e1e35]'}`} />
            )}
          </>
        ))}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (phase === 'step1') {
    return (
      <div className="space-y-4">
        <ProgressBar current={0} />

        <div>
          <label className="block text-[#8888aa] text-xs font-medium mb-1.5 uppercase tracking-wider">Nombre *</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Plan de expansión Q2 2025"
            className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl px-4 py-2.5 text-[#e8e8f0] text-sm placeholder:text-[#555577] focus:outline-none focus:border-violet-600/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#8888aa] text-xs font-medium mb-1.5 uppercase tracking-wider">Descripción</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Contexto adicional para los agentes..."
            className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl px-4 py-2.5 text-[#e8e8f0] text-sm placeholder:text-[#555577] focus:outline-none focus:border-violet-600/50 transition-colors resize-none"
          />
        </div>

        <div
          onClick={() => setRunAgents(v => !v)}
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
            runAgents ? 'bg-violet-600/10 border-violet-600/30' : 'bg-[#0f0f1a] border-[#1e1e35]'
          }`}
        >
          <div>
            <p className={`text-sm font-medium ${runAgents ? 'text-violet-300' : 'text-[#8888aa]'}`}>
              Ejecutar agentes IA automáticamente
            </p>
            <p className="text-xs text-[#555577] mt-0.5">Excel de datos + Presentación PPT generados al instante</p>
          </div>
          <div className={`w-10 h-5 rounded-full transition-all relative ${runAgents ? 'bg-violet-600' : 'bg-[#1e1e35]'}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${runAgents ? 'left-5' : 'left-0.5'}`} />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" disabled={!nombre.trim() || loadingAgentes} onClick={goToStep2}>
            {loadingAgentes ? 'Cargando...' : <><Users className="w-4 h-4" /> Siguiente</>}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'step2') {
    return (
      <div className="space-y-4">
        <ProgressBar current={1} />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#e8e8f0] text-sm font-semibold">Seleccionar Agentes</h3>
            <p className="text-[#555577] text-xs mt-0.5">
              Elige quién trabajará en este proyecto ({selected.size} seleccionados)
            </p>
          </div>
          <button
            onClick={selectAll}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            {selected.size === agentes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
          {byDepto.map(({ depto, members }) => {
            const c = deptoColor[depto] ?? deptoColor['General']
            return (
              <div key={depto}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <span className="text-[#e8e8f0] text-xs font-semibold">{depto}</span>
                  <span className="text-[#555577] text-xs">({members.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {members.map(a => {
                    const isSelected = selected.has(a.id)
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAgent(a.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-violet-600/15 border-violet-600/40'
                            : 'bg-[#0f0f1a] border-[#1e1e35] hover:border-[#2a2a45]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                          isSelected ? 'bg-violet-600 border-violet-600' : 'border-[#2a2a45]'
                        }`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                              <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className={`w-7 h-7 rounded-lg ${c.avatar} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials(a.nombre)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate transition-colors ${isSelected ? 'text-violet-200' : 'text-[#e8e8f0]'}`}>
                            {a.nombre}
                          </p>
                          <p className="text-[#555577] text-xs truncate">{a.rol}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-1 border-t border-[#1e1e35]">
          {runAgents ? (
            <Button type="button" onClick={() => setPhase('step3')}>
              <Mail className="w-4 h-4" /> Siguiente
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              <ArrowRight className="w-4 h-4" /> Crear Proyecto
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => setPhase('step1')}>
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'step3') {
    return (
      <div className="space-y-4">
        <ProgressBar current={2} />

        <div>
          <h3 className="text-[#e8e8f0] text-sm font-semibold">Fechas de los correos</h3>
          <p className="text-[#555577] text-xs mt-0.5">Elige cuándo se envió cada email dentro del proyecto</p>
        </div>

        <div className="space-y-2">
          {EMAIL_LABELS.map((lbl, i) => (
            <div key={i} className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[#e8e8f0] text-xs font-semibold">{lbl.de}</span>
                    <span className="text-[#555577] text-xs">→</span>
                    <span className="text-violet-300 text-xs font-semibold">{lbl.para}</span>
                  </div>
                  <p className="text-[#555577] text-xs truncate">{lbl.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="date"
                    value={emailDates[i].date}
                    onChange={e => updateEmailDate(i, 'date', e.target.value)}
                    className="bg-[#141428] border border-[#1e1e35] rounded-lg px-2 py-1.5 text-[#e8e8f0] text-xs focus:outline-none focus:border-violet-600/50 transition-colors"
                  />
                  <input
                    type="time"
                    value={emailDates[i].time}
                    onChange={e => updateEmailDate(i, 'time', e.target.value)}
                    className="bg-[#141428] border border-[#1e1e35] rounded-lg px-2 py-1.5 text-[#e8e8f0] text-xs focus:outline-none focus:border-violet-600/50 transition-colors w-24"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1 border-t border-[#1e1e35]">
          <Button type="button" onClick={handleSubmit}>
            <Zap className="w-4 h-4" /> Crear y Ejecutar
          </Button>
          <Button type="button" variant="secondary" onClick={() => setPhase('step2')}>
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </div>
      </div>
    )
  }

  // Terminal / done / error
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#080810] border border-[#1e1e35] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e1e35]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[#555577] text-xs font-mono ml-2">novo-ia — agentes</span>
          {phase === 'running' && (
            <span className="ml-auto flex items-center gap-1.5 text-[#555577] text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ejecutando
            </span>
          )}
          {phase === 'done' && <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> completado</span>}
          {phase === 'error' && <span className="ml-auto flex items-center gap-1.5 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" /> error</span>}
        </div>
        <div ref={logRef} className="h-80 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className={
              line.includes('✅') ? 'text-emerald-400' :
              line.includes('📧') ? 'text-cyan-400' :
              line.includes('🔧') ? 'text-violet-400' :
              line.includes('👥') ? 'text-blue-400 font-medium' :
              line.includes('📘')||line.includes('📗')||line.includes('📕')||line.includes('📙') ? 'text-blue-400' :
              line.includes('🤖') ? 'text-yellow-400 font-bold mt-2' :
              line.includes('⚠️') ? 'text-red-400' :
              line.includes('═') ? 'text-[#1e1e35]' :
              'text-[#8888aa]'
            }>{line}</div>
          ))}
          {phase === 'running' && <div className="text-violet-400 animate-pulse">▌</div>}
        </div>
      </div>

      {phase === 'done' && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/50 border border-emerald-900/50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 text-sm font-medium">Proyecto completado</p>
              <p className="text-emerald-600 text-xs">Documentos generados y guardados en Supabase</p>
            </div>
          </div>
          {projectId && (
            <Button size="sm" onClick={() => router.push(`/projects/${projectId}`)}>
              Ver proyecto <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
