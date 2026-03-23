import { clsx } from 'clsx'

type BadgeVariant = 'draft' | 'in_progress' | 'completed' | 'active' | 'inactive' | 'default'

const variantStyles: Record<BadgeVariant, string> = {
  draft:       'bg-zinc-800 text-zinc-300 border border-zinc-700',
  in_progress: 'bg-blue-950 text-blue-300 border border-blue-800',
  completed:   'bg-emerald-950 text-emerald-300 border border-emerald-800',
  active:      'bg-violet-950 text-violet-300 border border-violet-800',
  inactive:    'bg-zinc-800 text-zinc-400 border border-zinc-700',
  default:     'bg-zinc-800 text-zinc-300 border border-zinc-700',
}

const variantLabels: Record<string, string> = {
  draft:       'Borrador',
  in_progress: 'En progreso',
  completed:   'Completado',
  active:      'Activo',
  inactive:    'Inactivo',
  word:        'Word',
  excel:       'Excel',
  pdf:         'PDF',
  ppt:         'PowerPoint',
}

interface BadgeProps {
  value: string
  className?: string
}

export function Badge({ value, className }: BadgeProps) {
  const variant = (variantStyles[value as BadgeVariant] ? value : 'default') as BadgeVariant
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      variantStyles[variant],
      className
    )}>
      {variantLabels[value] ?? value}
    </span>
  )
}
