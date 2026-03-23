import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  ActivityChart, DocTypePie, ProjectStatusBar, WeeklyBar,
  type ActivityPoint, type DocTypePoint, type StatusPoint,
} from '@/components/dashboard/DashboardCharts'
import Link from 'next/link'
import type { Proyecto, HistorialEvento } from '@/types/database'
import { FolderKanban, CheckCircle2, Bot, ArrowRight, FileText, Mail, Plus, TrendingUp } from 'lucide-react'

export const revalidate = 0

// Build last-N-days date keys
function buildDayKeys(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function pct(a: number, b: number) {
  if (b === 0) return a > 0 ? 100 : 0
  return Math.round(((a - b) / b) * 100)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const thirtyAgo = new Date()
  thirtyAgo.setDate(thirtyAgo.getDate() - 30)
  const sixtyAgo = new Date()
  sixtyAgo.setDate(sixtyAgo.getDate() - 60)

  const [rProyectos, rDocs, rAgentes, rCorreos, rHistorial30, rProyectosRecientes] = await Promise.all([
    supabase.from('proyectos').select('id,estado,created_at'),
    supabase.from('documentos').select('tipo,created_at'),
    supabase.from('agentes').select('id', { count: 'exact', head: true }),
    supabase.from('correos').select('id', { count: 'exact', head: true }),
    supabase.from('historial').select('tipo_evento,created_at').gte('created_at', sixtyAgo.toISOString()).order('created_at', { ascending: true }),
    supabase.from('proyectos').select('id,nombre,estado,created_at').order('created_at', { ascending: false }).limit(6),
  ])

  const proyectos  = rProyectos.data ?? []
  const docs       = rDocs.data ?? []
  const historial  = rHistorial30.data ?? []
  const recientes  = (rProyectosRecientes.data ?? []) as Pick<Proyecto, 'id' | 'nombre' | 'estado' | 'created_at'>[]

  // ── Stat counts ───────────────────────────────────────────────────────────

  const now30ago    = thirtyAgo.toISOString()
  const totalProys  = proyectos.length
  const completados = proyectos.filter(p => p.estado === 'completed').length
  const totalDocs   = docs.length
  const totalAgentes = rAgentes.count ?? 0

  // Trends: compare last 30d vs prior 30d
  const proys30     = proyectos.filter(p => p.created_at >= now30ago).length
  const proys30prev = proyectos.filter(p => p.created_at >= sixtyAgo.toISOString() && p.created_at < now30ago).length
  const docs30      = docs.filter(d => d.created_at >= now30ago).length
  const docs30prev  = docs.filter(d => d.created_at >= sixtyAgo.toISOString() && d.created_at < now30ago).length

  // ── Activity over last 30 days ────────────────────────────────────────────

  const dayKeys = buildDayKeys(30)
  const activityData: ActivityPoint[] = dayKeys.map(key => {
    const dayEvents = historial.filter(h => h.created_at.startsWith(key))
    return {
      fecha:      new Date(key + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
      eventos:    dayEvents.length,
      documentos: dayEvents.filter(h => h.tipo_evento === 'documento_creado').length,
      correos:    dayEvents.filter(h => h.tipo_evento === 'correo_enviado').length,
    }
  })

  // ── Document type breakdown ───────────────────────────────────────────────

  const docTypeData: DocTypePoint[] = [
    { name: 'Excel', value: docs.filter(d => d.tipo === 'excel').length, color: '#10b981' },
    { name: 'PPT',   value: docs.filter(d => d.tipo === 'ppt').length,   color: '#f97316' },
    { name: 'Word',  value: docs.filter(d => d.tipo === 'word').length,   color: '#3b82f6' },
    { name: 'PDF',   value: docs.filter(d => d.tipo === 'pdf').length,    color: '#ef4444' },
  ].filter(d => d.value > 0)

  // ── Project status distribution ───────────────────────────────────────────

  const statusData: StatusPoint[] = [
    { name: 'Completados',  value: proyectos.filter(p => p.estado === 'completed').length,  color: '#10b981' },
    { name: 'En Progreso',  value: proyectos.filter(p => p.estado === 'in_progress').length, color: '#7c3aed' },
    { name: 'Borrador',     value: proyectos.filter(p => p.estado === 'draft').length,       color: '#555577' },
  ]

  // ── Recent historial for feed ─────────────────────────────────────────────

  const { data: feedData } = await supabase
    .from('historial')
    .select('*, proyectos(id,nombre)')
    .order('created_at', { ascending: false })
    .limit(8)
  const feed = (feedData ?? []) as (HistorialEvento & { proyectos: { id: string; nombre: string } | null })[]

  const feedIcon: Record<string, string> = {
    documento_creado:   '📄',
    correo_enviado:     '📧',
    proyecto_creado:    '📁',
    estado_actualizado: '🔄',
    agentes_asignados:  '👥',
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vista general de tu plataforma de agentes IA"
        action={
          <Link href="/projects/new" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </Link>
        }
      />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Proyectos"
          value={totalProys}
          icon={FolderKanban}
          accent="purple"
          trend={pct(proys30, proys30prev)}
          sub={`${proys30} este mes`}
        />
        <StatCard
          title="Completados"
          value={completados}
          icon={CheckCircle2}
          accent="emerald"
          trend={totalProys > 0 ? Math.round((completados / totalProys) * 100) : 0}
          sub={`${totalProys > 0 ? Math.round((completados / totalProys) * 100) : 0}% del total`}
        />
        <StatCard
          title="Documentos"
          value={totalDocs}
          icon={FileText}
          accent="blue"
          trend={pct(docs30, docs30prev)}
          sub={`${docs30} este mes`}
        />
        <StatCard
          title="Agentes"
          value={totalAgentes}
          icon={Bot}
          accent="cyan"
          sub="Equipo completo activo"
        />
      </div>

      {/* ── Activity chart (full width) ── */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Actividad — últimos 30 días</CardTitle>
            <p className="text-[#555577] text-xs mt-0.5">Eventos, documentos generados y correos enviados</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#555577]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded bg-violet-500 inline-block" /> Eventos</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded bg-blue-500 inline-block" /> Docs</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded bg-cyan-500 inline-block" /> Correos</span>
          </div>
        </CardHeader>
        <ActivityChart data={activityData} />
      </Card>

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Proyectos recientes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
            <Link href="/projects" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <div className="space-y-1">
            {recientes.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[#555577] text-sm mb-2">Sin proyectos</p>
                <Link href="/projects/new" className="text-violet-400 text-xs hover:text-violet-300">Crear uno →</Link>
              </div>
            )}
            {recientes.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#141428] transition-colors group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FolderKanban className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  <p className="text-[#e8e8f0] text-xs font-medium truncate group-hover:text-violet-300 transition-colors">{p.nombre}</p>
                </div>
                <Badge value={p.estado} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Doc types donut */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Documentos por Tipo</CardTitle>
            <Link href="/documents" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <DocTypePie data={docTypeData} />
        </Card>

        {/* Project status + weekly bar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Estado de Proyectos</CardTitle>
            <span className="text-[#555577] text-xs">{totalProys} total</span>
          </CardHeader>
          <ProjectStatusBar data={statusData} />
          <div className="mt-5 pt-4 border-t border-[#1e1e35]">
            <p className="text-[#8888aa] text-xs mb-2">Últimos 7 días</p>
            <WeeklyBar data={activityData} />
          </div>
        </Card>
      </div>

      {/* ── Feed de actividad ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Feed de Actividad</CardTitle>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <Link href="/history" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            Ver historial completo <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {feed.length === 0 && <p className="text-[#555577] text-sm py-4 col-span-2">Sin actividad reciente</p>}
          {feed.map(h => (
            <div key={h.id} className="flex items-start gap-3 py-2.5 border-b border-[#1a1a2e] last:border-0">
              <span className="text-base leading-none mt-0.5 flex-shrink-0">{feedIcon[h.tipo_evento] ?? '🔹'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[#e8e8f0] text-xs leading-snug truncate">{h.descripcion}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[#555577] text-xs">
                    {new Date(h.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {h.proyectos && (
                    <Link href={`/projects/${h.proyectos.id}`} className="text-violet-400 text-xs hover:text-violet-300 transition-colors truncate max-w-[120px]">
                      {h.proyectos.nombre}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
