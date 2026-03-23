import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { HistoryClient } from '@/components/history/HistoryClient'
import type { HistorialEvento } from '@/types/database'
import { History } from 'lucide-react'

type HistorialConProyecto = HistorialEvento & { proyectos: { id: string; nombre: string } | null }

export const revalidate = 0

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('historial')
    .select('*, proyectos(id, nombre)')
    .order('created_at', { ascending: false })
    .limit(200)
  const historial = (data ?? []) as HistorialConProyecto[]

  return (
    <div className="p-8">
      <PageHeader
        title="Historial"
        description={`${historial.length} evento${historial.length !== 1 ? 's' : ''} registrado${historial.length !== 1 ? 's' : ''}`}
      />

      {historial.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin actividad"
          description="El historial se llena automáticamente cuando creas proyectos y los agentes trabajan"
        />
      ) : (
        <HistoryClient historial={historial} />
      )}
    </div>
  )
}
