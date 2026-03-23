import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#141428] border border-[#1e1e35] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#555577]" />
      </div>
      <h3 className="text-[#e8e8f0] font-semibold text-base mb-1">{title}</h3>
      <p className="text-[#8888aa] text-sm max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
