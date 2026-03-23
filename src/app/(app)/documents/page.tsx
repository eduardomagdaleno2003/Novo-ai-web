import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DocumentsClient } from '@/components/documents/DocumentsClient'
import { FileText } from 'lucide-react'
import type { Documento, Proyecto } from '@/types/database'

export const revalidate = 0

type DocumentoConProyecto = Documento & { proyectos: Pick<Proyecto, 'id' | 'nombre'> | null }

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: _documentos } = await supabase
    .from('documentos')
    .select('*, proyectos(id, nombre)')
    .order('created_at', { ascending: false })
  const documentos = (_documentos ?? []) as DocumentoConProyecto[]

  return (
    <div className="p-8">
      <PageHeader
        title="Documentos"
        description={`${documentos.length} documentos generados por agentes`}
      />

      {documentos.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin documentos"
          description="Los documentos aparecen aquí cuando los agentes los generan"
        />
      ) : (
        <DocumentsClient documentos={documentos} />
      )}
    </div>
  )
}
