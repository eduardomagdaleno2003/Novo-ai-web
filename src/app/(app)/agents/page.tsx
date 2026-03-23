import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { AgentsGrid } from '@/components/agents/AgentsGrid'
import type { Agente } from '@/types/database'

export const revalidate = 0

export type AgenteConDepto = Agente & { departamento: string }

export default async function AgentsPage() {
  const supabase = await createClient()
  const { data: _agentes } = await supabase
    .from('agentes')
    .select('*')
    .order('created_at', { ascending: true })
  const raw = (_agentes ?? []) as Agente[]

  const agentes: AgenteConDepto[] = raw.map(a => {
    let depto = 'General'
    try {
      const parsed = JSON.parse(a.descripcion ?? '{}')
      depto = parsed.departamento ?? 'General'
    } catch {}
    return { ...a, departamento: depto }
  })

  return (
    <div className="p-8">
      <PageHeader
        title={`Equipo de Agentes (${agentes.length})`}
        description="Agentes IA organizados por departamento"
      />
      <AgentsGrid agentes={agentes} />
    </div>
  )
}
