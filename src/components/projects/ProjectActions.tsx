'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Proyecto } from '@/types/database'
import { Trash2, Check, X, Loader2 } from 'lucide-react'

interface Props { proyecto: Proyecto }

const ESTADO_LABELS: Record<string, string> = {
  draft:       'Borrador',
  in_progress: 'En Progreso',
  completed:   'Completado',
}

export function ProjectActions({ proyecto }: Props) {
  const router = useRouter()
  const [loading, setLoading]       = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved]           = useState(false)

  async function cambiarEstado(nuevoEstado: string) {
    if (nuevoEstado === proyecto.estado) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('proyectos').update({ estado: nuevoEstado }).eq('id', proyecto.id)
    await supabase.from('historial').insert({
      proyecto_id: proyecto.id,
      tipo_evento: 'estado_actualizado',
      descripcion: `Estado cambiado a "${ESTADO_LABELS[nuevoEstado] ?? nuevoEstado}"`,
    })
    router.refresh()
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function eliminarProyecto() {
    setLoading(true)
    const supabase = createClient()
    await Promise.all([
      supabase.from('historial').delete().eq('proyecto_id', proyecto.id),
      supabase.from('documentos').delete().eq('proyecto_id', proyecto.id),
      supabase.from('correos').delete().eq('proyecto_id', proyecto.id),
    ])
    await supabase.from('proyectos').delete().eq('id', proyecto.id)
    router.push('/projects')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {/* Estado selector */}
      <div className="relative flex items-center gap-2">
        <select
          value={proyecto.estado}
          onChange={e => cambiarEstado(e.target.value)}
          disabled={loading}
          className="bg-[#0f0f1a] border border-[#1e1e35] rounded-xl px-3 py-2 text-[#e8e8f0] text-sm focus:outline-none focus:border-violet-600/50 transition-colors appearance-none pr-8 disabled:opacity-50"
        >
          {Object.entries(ESTADO_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400 animate-spin pointer-events-none" />}
        {saved && !loading && <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />}
      </div>

      {/* Delete — inline confirm */}
      {confirming ? (
        <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-900/50 rounded-xl px-3 py-1.5">
          <span className="text-red-300 text-xs">¿Eliminar?</span>
          <button
            onClick={eliminarProyecto}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-red-300 hover:text-white bg-red-600 hover:bg-red-500 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Sí
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex items-center text-[#555577] hover:text-[#e8e8f0] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <Button variant="danger" size="sm" onClick={() => setConfirming(true)} disabled={loading}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  )
}
