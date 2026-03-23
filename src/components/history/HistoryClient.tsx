'use client'

import { useState, useMemo } from 'react'
import { TimelineItem } from './TimelineItem'
import type { HistorialEvento } from '@/types/database'
import { FolderKanban, FileText, RefreshCw, Mail, Clock, Users } from 'lucide-react'

type HistorialConProyecto = HistorialEvento & { proyectos: { id: string; nombre: string } | null }

const FILTROS = [
  { label: 'Todo', value: 'todos', icon: Clock },
  { label: 'Proyectos', value: 'proyecto_creado', icon: FolderKanban },
  { label: 'Documentos', value: 'documento_creado', icon: FileText },
  { label: 'Correos', value: 'correo_enviado', icon: Mail },
  { label: 'Estados', value: 'estado_actualizado', icon: RefreshCw },
  { label: 'Agentes', value: 'agentes_asignados', icon: Users },
]

export function HistoryClient({ historial }: { historial: HistorialConProyecto[] }) {
  const [filtro, setFiltro] = useState('todos')

  const filtrados = useMemo(() =>
    filtro === 'todos' ? historial : historial.filter(h => h.tipo_evento === filtro),
    [historial, filtro]
  )

  // Group by date
  const porFecha = useMemo(() => {
    const grupos: Record<string, HistorialConProyecto[]> = {}
    for (const h of filtrados) {
      const fecha = new Date(h.created_at).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      if (!grupos[fecha]) grupos[fecha] = []
      grupos[fecha].push(h)
    }
    return Object.entries(grupos)
  }, [filtrados])

  return (
    <div>
      {/* Filtros por tipo */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {FILTROS.map(f => {
          const count = f.value === 'todos' ? historial.length : historial.filter(h => h.tipo_evento === f.value).length
          if (f.value !== 'todos' && count === 0) return null
          return (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filtro === f.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#0f0f1a] border border-[#1e1e35] text-[#8888aa] hover:text-[#e8e8f0] hover:border-[#2a2a45]'
              }`}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
              <span className={`ml-0.5 ${filtro === f.value ? 'opacity-75' : 'opacity-50'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtrados.length === 0 ? (
        <p className="text-[#555577] text-sm py-12 text-center">Sin eventos de este tipo</p>
      ) : (
        <div className="max-w-2xl space-y-8">
          {porFecha.map(([fecha, eventos]) => (
            <div key={fecha}>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[#555577] text-xs font-medium capitalize">{fecha}</p>
                <div className="flex-1 h-px bg-[#1e1e35]" />
                <span className="text-[#555577] text-xs">{eventos.length}</span>
              </div>
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-[#1e1e35]" />
                <div className="space-y-1">
                  {eventos.map((evento, i) => (
                    <TimelineItem
                      key={evento.id}
                      evento={evento}
                      isLast={i === eventos.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
