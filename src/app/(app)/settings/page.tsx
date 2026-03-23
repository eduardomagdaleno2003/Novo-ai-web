import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Database, Bot, Zap, Webhook, Mail, Shield, CheckCircle2, Clock } from 'lucide-react'

const integraciones = [
  {
    icon: Database, name: 'Supabase',
    description: 'Base de datos PostgreSQL en tiempo real',
    status: 'connected', color: 'text-emerald-400', bg: 'bg-emerald-950', border: 'border-emerald-900/50',
  },
  {
    icon: Bot, name: 'Groq AI',
    description: 'Motor de inferencia LLaMA 3.3 70B',
    status: 'connected', color: 'text-violet-400', bg: 'bg-violet-950', border: 'border-violet-900/50',
  },
  {
    icon: Webhook, name: 'n8n',
    description: 'Automatización de workflows visuales',
    status: 'pending', color: 'text-[#555577]', bg: 'bg-[#141428]', border: 'border-[#1e1e35]',
  },
  {
    icon: Mail, name: 'Correo Automático',
    description: 'Envío de notificaciones por email',
    status: 'pending', color: 'text-[#555577]', bg: 'bg-[#141428]', border: 'border-[#1e1e35]',
  },
  {
    icon: Zap, name: 'Vercel',
    description: 'Deploy automático y edge functions',
    status: 'pending', color: 'text-[#555577]', bg: 'bg-[#141428]', border: 'border-[#1e1e35]',
  },
  {
    icon: Shield, name: 'Autenticación',
    description: 'Supabase Auth — multiusuario',
    status: 'pending', color: 'text-[#555577]', bg: 'bg-[#141428]', border: 'border-[#1e1e35]',
  },
]

const sysInfo = [
  { label: 'Plataforma', value: 'NOVO IA Materialidad v1.0' },
  { label: 'Stack',      value: 'Next.js 15 + Supabase' },
  { label: 'Modelo IA',  value: 'LLaMA 3.3 70B (Groq)' },
  { label: 'Entorno',    value: process.env.NODE_ENV ?? 'development' },
]

export default function SettingsPage() {
  const connected = integraciones.filter(i => i.status === 'connected').length
  const total     = integraciones.length

  return (
    <div className="p-8">
      <PageHeader
        title="Configuración"
        description={`${connected} de ${total} integraciones activas`}
      />

      {/* Sistema info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sysInfo.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] p-4">
            <p className="text-[#555577] text-xs uppercase tracking-wider mb-1">{label}</p>
            <p className="text-[#e8e8f0] text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Integraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
          <span className="text-xs text-[#555577]">
            <span className="text-emerald-400 font-medium">{connected}</span> activas · {total - connected} próximamente
          </span>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {integraciones.map((item) => {
            const Icon = item.icon
            const isConnected = item.status === 'connected'
            return (
              <div
                key={item.name}
                className={`rounded-2xl p-5 border transition-all ${
                  isConnected
                    ? 'bg-[#0c0c18] border-[#1e1e35] hover:border-[#2a2a45]'
                    : 'bg-[#0a0a0f] border-[#1a1a2a] opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-xs bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-[#141428] text-[#555577] border border-[#1e1e35] px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Próximamente
                    </span>
                  )}
                </div>
                <h3 className="text-[#e8e8f0] font-semibold text-sm mb-1">{item.name}</h3>
                <p className="text-[#8888aa] text-xs">{item.description}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
