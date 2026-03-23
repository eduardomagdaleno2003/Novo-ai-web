import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProjectsClient } from '@/components/projects/ProjectsClient'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const revalidate = 0

export default async function ProjectsPage() {
  const supabase = await createClient()

  const [{ data: _proyectos }, { data: docCounts }, { data: corrCounts }] = await Promise.all([
    supabase.from('proyectos').select('*').order('created_at', { ascending: false }),
    supabase.from('documentos').select('proyecto_id'),
    supabase.from('correos').select('proyecto_id'),
  ])

  const proyectos = (_proyectos ?? []).map(p => ({
    ...p,
    doc_count:    (docCounts  ?? []).filter(d => d.proyecto_id === p.id).length,
    correo_count: (corrCounts ?? []).filter(c => c.proyecto_id === p.id).length,
  }))

  return (
    <div className="p-8">
      <PageHeader
        title="Proyectos"
        description={`${proyectos.length} proyecto${proyectos.length !== 1 ? 's' : ''} en total`}
        action={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </Link>
        }
      />
      <ProjectsClient proyectos={proyectos} />
    </div>
  )
}
