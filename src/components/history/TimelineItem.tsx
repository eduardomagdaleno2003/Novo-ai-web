import { clsx } from 'clsx'
import { FolderKanban, FileText, RefreshCw, Mail, Clock } from 'lucide-react'
import type { HistorialEvento } from '@/types/database'
import Link from 'next/link'

const eventoConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  proyecto_creado:    { icon: FolderKanban, color: 'text-violet-400', bg: 'bg-violet-950', border: 'border-violet-900/50' },
  documento_creado:   { icon: FileText,     color: 'text-blue-400',   bg: 'bg-blue-950',   border: 'border-blue-900/50'   },
  estado_actualizado: { icon: RefreshCw,    color: 'text-emerald-400',bg: 'bg-emerald-950',border: 'border-emerald-900/50'},
  correo_enviado:     { icon: Mail,         color: 'text-cyan-400',   bg: 'bg-cyan-950',   border: 'border-cyan-900/50'   },
  default:            { icon: Clock,        color: 'text-[#555577]',  bg: 'bg-[#141428]',  border: 'border-[#1e1e35]'    },
}

interface TimelineItemProps {
  evento: HistorialEvento & { proyectos?: { id: string; nombre: string } | null }
  isLast: boolean
}

export function TimelineItem({ evento, isLast }: TimelineItemProps) {
  const config = eventoConfig[evento.tipo_evento] ?? eventoConfig.default
  const Icon = config.icon

  return (
    <div className="relative flex items-start gap-4 pl-2 pb-5">
      <div className={clsx(
        'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border',
        config.bg, config.border
      )}>
        <Icon className={clsx('w-3.5 h-3.5', config.color)} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[#e8e8f0] text-sm leading-snug">{evento.descripcion}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[#555577] text-xs">
            {new Date(evento.created_at).toLocaleDateString('es-MX', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
          {evento.proyectos && (
            <Link
              href={`/projects/${evento.proyectos.id}`}
              className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
            >
              {evento.proyectos.nombre}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
