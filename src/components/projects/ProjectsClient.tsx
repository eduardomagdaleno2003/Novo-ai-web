'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Proyecto } from '@/types/database'
import { FolderKanban, Plus, Calendar, Search, FileText, Mail } from 'lucide-react'

const ESTADOS = ['Todos', 'Borrador', 'En Progreso', 'Completado'] as const
const ESTADO_MAP: Record<string, string> = {
  'Borrador': 'draft',
  'En Progreso': 'in_progress',
  'Completado': 'completed',
}

type ProyectoConConteos = Proyecto & { doc_count: number; correo_count: number }

export function ProjectsClient({ proyectos }: { proyectos: ProyectoConConteos[] }) {
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('Todos')

  const filtrados = useMemo(() => {
    const q = search.toLowerCase()
    return proyectos.filter(p => {
      const matchEstado = estado === 'Todos' || p.estado === ESTADO_MAP[estado]
      const matchSearch = !q || p.nombre.toLowerCase().includes(q) || (p.descripcion ?? '').toLowerCase().includes(q)
      return matchEstado && matchSearch
    })
  }, [proyectos, search, estado])

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555577]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl pl-9 pr-4 py-2 text-[#e8e8f0] text-sm placeholder:text-[#555577] focus:outline-none focus:border-violet-600/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                estado === e
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#0f0f1a] border border-[#1e1e35] text-[#8888aa] hover:text-[#e8e8f0] hover:border-[#2a2a45]'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <span className="text-[#555577] text-xs self-center ml-auto hidden sm:block">
          {filtrados.length} de {proyectos.length}
        </span>
      </div>

      {filtrados.length === 0 ? (
        search || estado !== 'Todos' ? (
          <div className="text-center py-16 text-[#555577] text-sm">
            No hay proyectos que coincidan
          </div>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="Sin proyectos"
            description="Crea tu primer proyecto para comenzar a trabajar con los agentes IA"
            action={
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Nuevo Proyecto
              </Link>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <div className="rounded-2xl bg-[#0f0f1a] border border-[#1e1e35] p-5 hover:border-[#2a2a45] hover:bg-[#11112a] transition-all group cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-violet-400" />
                  </div>
                  <Badge value={p.estado} />
                </div>
                <h3 className="text-[#e8e8f0] font-semibold text-sm mb-1.5 group-hover:text-violet-300 transition-colors">
                  {p.nombre}
                </h3>
                {p.descripcion && (
                  <p className="text-[#8888aa] text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
                    {p.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1a1a2e]">
                  <div className="flex items-center gap-1.5 text-[#555577] text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(p.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.doc_count > 0 && (
                      <span className="flex items-center gap-1 text-[#555577] text-xs">
                        <FileText className="w-3 h-3" />
                        {p.doc_count}
                      </span>
                    )}
                    {p.correo_count > 0 && (
                      <span className="flex items-center gap-1 text-[#555577] text-xs">
                        <Mail className="w-3 h-3" />
                        {p.correo_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
