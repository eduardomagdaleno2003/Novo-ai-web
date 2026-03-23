'use client'

import { useState, useMemo } from 'react'
import type { AgenteConDepto } from '@/app/(app)/agents/page'
import { Search } from 'lucide-react'

const DEPTOS = ['Todos', 'Data & Analytics', 'Finance', 'Marketing', 'People & Ops', 'Product & Tech', 'Sales']

const deptoColor: Record<string, { bg: string; text: string; dot: string; avatar: string }> = {
  'Data & Analytics': { bg: 'bg-violet-950', text: 'text-violet-300', dot: 'bg-violet-500', avatar: 'bg-violet-600' },
  'Finance':          { bg: 'bg-emerald-950',text: 'text-emerald-300',dot: 'bg-emerald-500',avatar: 'bg-emerald-600'},
  'Marketing':        { bg: 'bg-pink-950',   text: 'text-pink-300',   dot: 'bg-pink-500',   avatar: 'bg-pink-600'  },
  'People & Ops':     { bg: 'bg-orange-950', text: 'text-orange-300', dot: 'bg-orange-500', avatar: 'bg-orange-600'},
  'Product & Tech':   { bg: 'bg-blue-950',   text: 'text-blue-300',   dot: 'bg-blue-500',   avatar: 'bg-blue-600'  },
  'Sales':            { bg: 'bg-cyan-950',   text: 'text-cyan-300',   dot: 'bg-cyan-500',   avatar: 'bg-cyan-600'  },
  'General':          { bg: 'bg-zinc-900',   text: 'text-zinc-300',   dot: 'bg-zinc-500',   avatar: 'bg-zinc-600'  },
}

function initials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function AgentsGrid({ agentes }: { agentes: AgenteConDepto[] }) {
  const [filtro, setFiltro] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtrados = useMemo(() => {
    const q = search.toLowerCase()
    return agentes.filter(a => {
      const matchDep = filtro === 'Todos' || a.departamento === filtro
      const matchSearch = !q || a.nombre.toLowerCase().includes(q) || a.rol.toLowerCase().includes(q)
      return matchDep && matchSearch
    })
  }, [agentes, filtro, search])

  const porDepto = useMemo(() =>
    DEPTOS.filter(d => d !== 'Todos').reduce((acc, d) => {
      acc[d] = filtrados.filter(a => a.departamento === d)
      return acc
    }, {} as Record<string, AgenteConDepto[]>),
    [filtrados]
  )

  return (
    <div>
      {/* Search + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555577]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar agente..."
            className="w-full bg-[#0f0f1a] border border-[#1e1e35] rounded-xl pl-9 pr-4 py-2 text-[#e8e8f0] text-sm placeholder:text-[#555577] focus:outline-none focus:border-violet-600/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {DEPTOS.map(d => {
            const count = d === 'Todos' ? agentes.length : agentes.filter(a => a.departamento === d).length
            if (d !== 'Todos' && count === 0) return null
            return (
              <button
                key={d}
                onClick={() => setFiltro(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filtro === d
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#0f0f1a] border border-[#1e1e35] text-[#8888aa] hover:text-[#e8e8f0] hover:border-[#2a2a45]'
                }`}
              >
                {d}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            )
          })}
        </div>
        {filtrados.length !== agentes.length && (
          <span className="text-[#555577] text-xs self-center sm:ml-auto">
            {filtrados.length} de {agentes.length}
          </span>
        )}
      </div>

      {filtrados.length === 0 ? (
        <p className="text-[#555577] text-sm py-12 text-center">No hay agentes que coincidan</p>
      ) : filtro === 'Todos' && !search ? (
        <div className="space-y-8">
          {DEPTOS.filter(d => d !== 'Todos').map(depto => {
            const miembros = porDepto[depto]
            if (!miembros?.length) return null
            const c = deptoColor[depto]
            return (
              <div key={depto}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <h2 className="text-[#e8e8f0] text-sm font-semibold">{depto}</h2>
                  <span className="text-[#555577] text-xs">({miembros.length})</span>
                  <div className="flex-1 h-px bg-[#1e1e35]" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {miembros.map(a => <AgentCard key={a.id} agente={a} />)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtrados.map(a => <AgentCard key={a.id} agente={a} />)}
        </div>
      )}
    </div>
  )
}

function AgentCard({ agente }: { agente: AgenteConDepto }) {
  const c = deptoColor[agente.departamento] ?? deptoColor['General']

  return (
    <div className="rounded-2xl bg-[#0f0f1a] border border-[#1e1e35] p-4 hover:border-[#2a2a45] hover:bg-[#111120] transition-all group">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.avatar} flex items-center justify-center flex-shrink-0 text-white text-sm font-bold`}>
          {initials(agente.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[#e8e8f0] text-sm font-semibold truncate group-hover:text-white transition-colors">
            {agente.nombre}
          </p>
          <p className="text-[#8888aa] text-xs truncate">{agente.rol}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#1a1a2e] flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {agente.departamento}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Activo" />
      </div>
    </div>
  )
}
