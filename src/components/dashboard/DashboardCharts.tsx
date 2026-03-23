'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'

// ── Types ────────────────────────────────────────────────────────────────────

export type ActivityPoint = {
  fecha: string
  eventos: number
  documentos: number
  correos: number
}

export type DocTypePoint = {
  name: string
  value: number
  color: string
}

export type StatusPoint = {
  name: string
  value: number
  color: string
}

// ── Tooltip styles ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f1a] border border-[#2a2a45] rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-[#8888aa] text-xs mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[#e8e8f0] text-xs font-medium">{p.value}</span>
          <span className="text-[#555577] text-xs">{p.name}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-[#0f0f1a] border border-[#2a2a45] rounded-xl px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: p.payload.color }} />
        <span className="text-[#e8e8f0] text-xs font-medium">{p.payload.name}</span>
        <span className="text-[#8888aa] text-xs">{p.value}</span>
      </div>
    </div>
  )
}

// ── Activity Area Chart ───────────────────────────────────────────────────────

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const hasData = data.some(d => d.eventos > 0)

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-[#555577] text-sm">Sin actividad en los últimos 30 días</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradEventos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDocs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCorreos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" vertical={false} />
        <XAxis
          dataKey="fecha"
          tick={{ fill: '#555577', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#555577', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="eventos"   name="Eventos"    stroke="#7c3aed" strokeWidth={2} fill="url(#gradEventos)"  dot={false} activeDot={{ r: 3, fill: '#7c3aed' }} />
        <Area type="monotone" dataKey="documentos" name="Documentos" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gradDocs)"    dot={false} activeDot={{ r: 3, fill: '#3b82f6' }} />
        <Area type="monotone" dataKey="correos"    name="Correos"    stroke="#06b6d4" strokeWidth={1.5} fill="url(#gradCorreos)" dot={false} activeDot={{ r: 3, fill: '#06b6d4' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Doc Type Pie ─────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.08) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function DocTypePie({ data }: { data: DocTypePoint[] }) {
  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-[#555577] text-sm">Sin documentos</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={36}
            outerRadius={62}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <span className="text-[#8888aa] text-xs">{d.name}</span>
            </div>
            <span className="text-[#e8e8f0] text-xs font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Project Status Bar ────────────────────────────────────────────────────────

export function ProjectStatusBar({ data }: { data: StatusPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) {
    return <p className="text-[#555577] text-sm py-4 text-center">Sin proyectos</p>
  }

  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#8888aa] text-xs">{d.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[#e8e8f0] text-xs font-semibold">{d.value}</span>
              <span className="text-[#555577] text-xs">{total > 0 ? Math.round(d.value / total * 100) : 0}%</span>
            </div>
          </div>
          <div className="h-1.5 bg-[#141428] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${total > 0 ? (d.value / total) * 100 : 0}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Weekly Activity Bar ───────────────────────────────────────────────────────

export function WeeklyBar({ data }: { data: ActivityPoint[] }) {
  const last7 = data.slice(-7)
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={last7} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
        <XAxis dataKey="fecha" tick={{ fill: '#555577', fontSize: 9 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
        <Bar dataKey="documentos" name="Docs"    fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="correos"    name="Correos" fill="#06b6d4" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
