import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  accent?: 'purple' | 'blue' | 'cyan' | 'emerald' | 'orange'
  trend?: number   // % change vs previous period, e.g. 12.5 = +12.5%
  sub?: string     // secondary label
}

const accentMap = {
  purple:  { bg: 'bg-violet-950',  icon: 'text-violet-400',  border: 'border-violet-900/50',  glow: 'shadow-violet-900/20'  },
  blue:    { bg: 'bg-blue-950',    icon: 'text-blue-400',    border: 'border-blue-900/50',    glow: 'shadow-blue-900/20'    },
  cyan:    { bg: 'bg-cyan-950',    icon: 'text-cyan-400',    border: 'border-cyan-900/50',    glow: 'shadow-cyan-900/20'    },
  emerald: { bg: 'bg-emerald-950', icon: 'text-emerald-400', border: 'border-emerald-900/50', glow: 'shadow-emerald-900/20' },
  orange:  { bg: 'bg-orange-950',  icon: 'text-orange-400',  border: 'border-orange-900/50',  glow: 'shadow-orange-900/20'  },
}

export function StatCard({ title, value, icon: Icon, accent = 'purple', trend, sub }: StatCardProps) {
  const colors = accentMap[accent]
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0
  const isNeutral  = trend !== undefined && trend === 0

  return (
    <div className={`rounded-2xl bg-[#0f0f1a] border border-[#1e1e35] p-5 hover:border-[#2a2a45] transition-all group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
            isNegative ? 'bg-red-950 text-red-400 border border-red-900/50' :
            'bg-[#141428] text-[#555577] border border-[#1e1e35]'
          }`}>
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral  && <Minus className="w-3 h-3" />}
            {isPositive ? '+' : ''}{trend.toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-[#e8e8f0] text-2xl font-bold leading-none mb-1">{value}</p>
      <p className="text-[#8888aa] text-xs font-medium">{title}</p>
      {sub && <p className="text-[#555577] text-xs mt-0.5">{sub}</p>}
    </div>
  )
}
