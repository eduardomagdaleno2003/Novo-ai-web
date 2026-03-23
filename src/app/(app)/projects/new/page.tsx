import { PageHeader } from '@/components/ui/PageHeader'
import { NewProjectForm } from '@/components/projects/NewProjectForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-[#8888aa] hover:text-[#e8e8f0] text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a Proyectos
        </Link>
      </div>
      <PageHeader title="Nuevo Proyecto" description="Crea un proyecto y asígnalo a tus agentes IA" />
      <div className="max-w-xl">
        <NewProjectForm />
      </div>
    </div>
  )
}
