'use client'

import { useState, useMemo } from 'react'
import { FileText, FileSpreadsheet, Presentation, FileType, Download, Search } from 'lucide-react'
import type { Documento, Proyecto } from '@/types/database'

type DocumentoConProyecto = Documento & { proyectos: Pick<Proyecto, 'id' | 'nombre'> | null }

const TIPOS = ['Todos', 'Word', 'Excel', 'PDF', 'PPT']

const tipoMap: Record<string, string> = {
  'Word': 'word', 'Excel': 'excel', 'PDF': 'pdf', 'PPT': 'ppt',
}

const tipoConfig = {
  word:  { icon: FileText,        color: 'text-blue-400',   bg: 'bg-blue-950',   border: 'border-blue-900/50',   label: 'Word' },
  excel: { icon: FileSpreadsheet, color: 'text-emerald-400',bg: 'bg-emerald-950',border: 'border-emerald-900/50', label: 'Excel' },
  pdf:   { icon: FileType,        color: 'text-red-400',    bg: 'bg-red-950',    border: 'border-red-900/50',    label: 'PDF' },
  ppt:   { icon: Presentation,    color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-900/50', label: 'PPT' },
}

const tipoExt: Record<string, string> = {
  word: 'docx', excel: 'xlsx', pdf: 'pdf', ppt: 'pptx',
}

export function DocumentsClient({ documentos }: { documentos: DocumentoConProyecto[] }) {
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('Todos')

  const filtered = useMemo(() => {
    return documentos.filter(d => {
      const matchTipo = tipoFiltro === 'Todos' || d.tipo === tipoMap[tipoFiltro]
      const q = search.toLowerCase()
      const matchSearch = !q ||
        d.titulo.toLowerCase().includes(q) ||
        (d.proyectos?.nombre ?? '').toLowerCase().includes(q)
      return matchTipo && matchSearch
    })
  }, [documentos, search, tipoFiltro])

  // Group by project
  const byProject = useMemo(() => {
    const map = new Map<string, { nombre: string; docs: DocumentoConProyecto[] }>()
    for (const d of filtered) {
      const key = d.proyectos?.nombre ?? 'Sin proyecto'
      if (!map.has(key)) map.set(key, { nombre: key, docs: [] })
      map.get(key)!.docs.push(d)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555577]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl pl-9 pr-4 py-2 text-[#e8e8f0] text-sm placeholder:text-[#555577] focus:outline-none focus:border-violet-600/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {TIPOS.map(t => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                tipoFiltro === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#0f0f1a] border border-[#1e1e35] text-[#8888aa] hover:text-[#e8e8f0] hover:border-[#2a2a45]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#555577] text-sm">
          No hay documentos que coincidan con tu búsqueda
        </div>
      ) : (
        <div className="space-y-10">
          {byProject.map(([projectName, { docs }]) => (
            <div key={projectName}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[#e8e8f0] text-sm font-semibold">{projectName}</h2>
                <span className="text-[#555577] text-xs">({docs.length})</span>
                <div className="flex-1 h-px bg-[#1e1e35]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {docs.map(doc => {
                  const cfg = tipoConfig[doc.tipo as keyof typeof tipoConfig] ?? tipoConfig.pdf
                  const Icon = cfg.icon
                  const ext = tipoExt[doc.tipo] ?? doc.tipo
                  return (
                    <div
                      key={doc.id}
                      className="rounded-2xl bg-[#0f0f1a] border border-[#1e1e35] p-4 hover:border-[#2a2a45] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${cfg.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[#e8e8f0] text-sm font-semibold leading-snug truncate group-hover:text-white transition-colors">
                              {doc.titulo}
                            </p>
                            <p className="text-[#555577] text-xs mt-0.5 truncate">{doc.nombre}.{ext}</p>
                          </div>
                        </div>
                        <a
                          href={`/api/doc/${doc.id}`}
                          download={`${doc.nombre}.${ext}`}
                          title="Descargar"
                          className="w-8 h-8 rounded-lg bg-[#141428] border border-[#1e1e35] hover:border-violet-600/50 hover:bg-violet-600/10 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <Download className="w-3.5 h-3.5 text-[#555577] group-hover:text-violet-400 transition-colors" />
                        </a>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#1a1a2e] flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[#555577] text-xs">
                          {new Date(doc.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
