import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { ProjectActions } from '@/components/projects/ProjectActions'
import { ProjectTabs } from '@/components/projects/ProjectTabs'
import Link from 'next/link'
import type { Proyecto, Documento, HistorialEvento, Correo } from '@/types/database'
import { ArrowLeft, Calendar, Hash } from 'lucide-react'

export const revalidate = 0

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from('proyectos').select('*').eq('id', id).single(),
    supabase.from('documentos').select('*').eq('proyecto_id', id).order('created_at', { ascending: true }),
    supabase.from('historial').select('*').eq('proyecto_id', id).order('created_at', { ascending: false }).limit(30),
    supabase.from('correos').select('*').eq('proyecto_id', id).order('created_at', { ascending: true }),
  ])

  const proyecto  = r1.data as Proyecto | null
  const documentos = (r2.data ?? []) as Documento[]
  const historial  = (r3.data ?? []) as HistorialEvento[]
  const correos    = (r4.data ?? []) as Correo[]

  if (!proyecto) notFound()

  const metaItems = [
    { label: 'Estado',    value: <Badge value={proyecto.estado} /> },
    { label: 'Creado',    value: new Date(proyecto.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Documentos', value: documentos.length },
    { label: 'Correos',    value: correos.length },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-[#555577] hover:text-[#e8e8f0] text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Proyectos
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-[#e8e8f0] leading-tight">{proyecto.nombre}</h1>
            <Badge value={proyecto.estado} />
          </div>
          {proyecto.descripcion && (
            <p className="text-[#8888aa] text-sm max-w-2xl mt-1 leading-relaxed">{proyecto.descripcion}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[#555577] text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(proyecto.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 text-[#555577] text-xs font-mono">
              <Hash className="w-3 h-3" />
              {proyecto.id.slice(0, 8)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ProjectActions proyecto={proyecto} />
        </div>
      </div>

      <ProjectTabs documentos={documentos} historial={historial} correos={correos} />
    </div>
  )
}
