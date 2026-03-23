'use client'

import { useState } from 'react'
import {
  FileText, FileSpreadsheet, Presentation, FileType,
  Clock, Download, Mail, Activity, Paperclip,
} from 'lucide-react'
import type { Documento, HistorialEvento, Correo } from '@/types/database'

// ── Document helpers ─────────────────────────────────────────────────────────

const tipoConfig = {
  word:  { icon: FileText,        color: 'text-blue-400',   bg: 'bg-blue-950',   border: 'border-blue-900/50',   label: 'Word' },
  excel: { icon: FileSpreadsheet, color: 'text-emerald-400',bg: 'bg-emerald-950',border: 'border-emerald-900/50', label: 'Excel' },
  pdf:   { icon: FileType,        color: 'text-red-400',    bg: 'bg-red-950',    border: 'border-red-900/50',    label: 'PDF' },
  ppt:   { icon: Presentation,    color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-900/50', label: 'PPT' },
}

const tipoExt: Record<string, string> = {
  word: 'docx', excel: 'xlsx', pdf: 'pdf', ppt: 'pptx',
}

// Which sender attaches which document type
// Adjuntos por remitente — todos los docs que ese agente generó
const SENDER_ADJUNTO: Record<string, string[]> = {
  'miguel ángel torres': ['excel'],
  'miguel angel torres': ['excel'],
  'laura sánchez':       ['ppt', 'word'],
  'laura sanchez':       ['ppt', 'word'],
  'carlos mendoza':      ['word'],
}

function getAdjuntos(correo: Correo, documentos: Documento[]): Documento[] {
  const tipos = SENDER_ADJUNTO[correo.de.toLowerCase().trim()] ?? []
  if (!tipos.length) return []
  return documentos.filter(d => tipos.includes(d.tipo))
}

// ── Email helpers ─────────────────────────────────────────────────────────────

const agenteMeta: Array<{ names: string[]; color: string; bg: string; rol: string; email: string }> = [
  { names: ['carlos mendoza', 'jefe'],     color: 'text-blue-100',   bg: 'bg-blue-600',   rol: 'Director General',           email: 'carlos.mendoza@novo-ia.com' },
  { names: ['miguel ángel torres', 'miguel angel torres', 'analista'], color: 'text-violet-100', bg: 'bg-violet-600', rol: 'Analista Senior de Datos', email: 'miguel.torres@novo-ia.com' },
  { names: ['laura sánchez', 'laura sanchez', 'rh'], color: 'text-orange-100', bg: 'bg-orange-600', rol: 'Directora de Estrategia', email: 'laura.sanchez@novo-ia.com' },
]

function getAgenteMeta(nombre: string) {
  const key = nombre.toLowerCase().trim()
  const found = agenteMeta.find(a => a.names.some(n => key.includes(n) || n.includes(key)))
  if (found) return found
  const slug = key.replace(/\s+/g, '.')
  return { color: 'text-zinc-100', bg: 'bg-zinc-600', rol: nombre, email: `${slug}@novo-ia.com` }
}

function initials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || nombre.slice(0, 2).toUpperCase()
}

function renderMensaje(texto: string) {
  return texto.split('\n').map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <span key={li}>
        {parts.map((part, pi) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={pi} className="text-[#d0d0e8] font-semibold">{part.slice(2, -2)}</strong>
            : <span key={pi}>{part}</span>
        )}
        {li < texto.split('\n').length - 1 && <br />}
      </span>
    )
  })
}

function descargarEml(correo: Correo, adjuntos: Documento[]) {
  const meta = getAgenteMeta(correo.de)
  const destMeta = getAgenteMeta(correo.para)
  const fecha = new Date(correo.created_at).toUTCString()

  const adjuntosHeader = adjuntos.map(doc => {
    const ext = tipoExt[doc.tipo] ?? doc.tipo
    return `X-Attachment: ${doc.nombre}.${ext}`
  }).join('\r\n')

  const eml = [
    `MIME-Version: 1.0`,
    `From: ${correo.de.charAt(0).toUpperCase() + correo.de.slice(1)} <${meta.email}>`,
    `To: ${correo.para.charAt(0).toUpperCase() + correo.para.slice(1)} <${destMeta.email}>`,
    `Subject: ${correo.asunto}`,
    `Date: ${fecha}`,
    adjuntosHeader,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    correo.mensaje ?? '',
    adjuntos.length ? `\n\n[Adjuntos: ${adjuntos.map(d => `${d.nombre}.${tipoExt[d.tipo] ?? d.tipo}`).join(', ')}]` : '',
  ].filter(Boolean).join('\r\n')

  const blob = new Blob([eml], { type: 'message/rfc822' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${correo.de}_${correo.asunto.slice(0, 40).replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.eml`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

const TABS = ['Actividad', 'Documentos', 'Correos'] as const
type Tab = typeof TABS[number]

interface Props {
  documentos: Documento[]
  historial: HistorialEvento[]
  correos: Correo[]
}

export function ProjectTabs({ documentos, historial, correos }: Props) {
  const [tab, setTab] = useState<Tab>('Actividad')

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Documentos',  value: documentos.length, icon: FileText,  color: 'text-blue-400' },
          { label: 'Correos',     value: correos.length,    icon: Mail,      color: 'text-violet-400' },
          { label: 'Actividades', value: historial.length,  icon: Activity,  color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-[#0f0f1a] border border-[#1e1e35] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#141428] border border-[#1e1e35] flex items-center justify-center flex-shrink-0">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-[#e8e8f0] text-lg font-bold leading-none">{value}</p>
              <p className="text-[#555577] text-xs mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#1e1e35]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === t
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-[#8888aa] hover:text-[#e8e8f0]'
            }`}
          >
            {t}
            {t === 'Correos' && correos.length > 0 && (
              <span className="ml-1.5 text-xs bg-[#1e1e35] text-[#8888aa] px-1.5 py-0.5 rounded-full">
                {correos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Actividad ── */}
      {tab === 'Actividad' && (
        <div className="space-y-3">
          {historial.length === 0 && (
            <p className="text-[#555577] text-sm py-8 text-center">Sin actividad registrada</p>
          )}
          {historial.map((h, i) => (
            <div key={h.id} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[#141428] border border-[#1e1e35] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3 h-3 text-[#555577]" />
                </div>
                {i < historial.length - 1 && <div className="w-px h-4 bg-[#1e1e35] mt-1" />}
              </div>
              <div className="min-w-0 pb-3">
                <p className="text-[#e8e8f0] text-xs leading-snug">{h.descripcion}</p>
                <p className="text-[#555577] text-xs mt-0.5">
                  {new Date(h.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Documentos ── */}
      {tab === 'Documentos' && (
        <div className="space-y-2">
          {documentos.length === 0 && (
            <p className="text-[#555577] text-sm py-8 text-center">Sin documentos generados</p>
          )}
          {documentos.map(doc => {
            const cfg = tipoConfig[doc.tipo as keyof typeof tipoConfig] ?? tipoConfig.pdf
            const Icon = cfg.icon
            const ext = tipoExt[doc.tipo] ?? doc.tipo
            return (
              <div key={doc.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#0f0f1a] border border-[#1e1e35] hover:border-[#2a2a45] transition-all group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#e8e8f0] text-sm font-medium truncate">{doc.titulo}</p>
                    <p className="text-[#555577] text-xs">{doc.nombre}.{ext}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[#555577] text-xs hidden sm:block">
                    {new Date(doc.created_at).toLocaleDateString('es-MX')}
                  </span>
                  <a
                    href={`/api/doc/${doc.id}`}
                    download={`${doc.nombre}.${ext}`}
                    className="w-8 h-8 rounded-lg bg-[#141428] border border-[#1e1e35] hover:border-violet-600/50 hover:bg-violet-600/10 flex items-center justify-center transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#555577] group-hover:text-violet-400 transition-colors" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Correos ── */}
      {tab === 'Correos' && (
        <div className="space-y-4">
          {correos.length === 0 && (
            <p className="text-[#555577] text-sm py-8 text-center">Sin correos registrados en este proyecto</p>
          )}
          {correos.map(correo => {
            const meta     = getAgenteMeta(correo.de)
            const ini      = initials(correo.de)
            const adjuntos = getAdjuntos(correo, documentos)
            const fechaCorta = new Date(correo.created_at).toLocaleDateString('es-MX', {
              weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
            })

            return (
              <div key={correo.id} className="rounded-2xl bg-[#0c0c18] border border-[#1e1e35] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e1e35] bg-[#0f0f1a]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0 text-sm font-bold ${meta.color}`}>
                      {ini}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#e8e8f0] text-sm font-semibold">
                          {correo.de.charAt(0).toUpperCase() + correo.de.slice(1)}
                        </p>
                        <span className="text-[#555577] text-xs">&lt;{meta.email}&gt;</span>
                      </div>
                      <p className="text-[#555577] text-xs">
                        Para: <span className="text-[#8888aa]">
                          {correo.para.charAt(0).toUpperCase() + correo.para.slice(1)}
                          {' '}&lt;{getAgenteMeta(correo.para).email}&gt;
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span className="text-[#555577] text-xs hidden sm:block">{fechaCorta}</span>
                    <button
                      onClick={() => descargarEml(correo, adjuntos)}
                      title="Descargar .eml"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141428] border border-[#1e1e35] hover:border-violet-600/50 hover:bg-violet-600/10 transition-colors text-[#555577] hover:text-violet-400 text-xs"
                    >
                      <Download className="w-3 h-3" />
                      .eml
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div className="px-5 pt-4 pb-2">
                  <p className="text-[#e8e8f0] text-sm font-semibold">{correo.asunto}</p>
                </div>

                {/* Body */}
                <div className="px-5 pb-4">
                  <div className="text-[#9999bb] text-sm leading-relaxed whitespace-pre-wrap font-[system-ui]">
                    {correo.mensaje ? renderMensaje(correo.mensaje) : (
                      <span className="text-[#555577] italic">Sin contenido</span>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                {adjuntos.length > 0 && (
                  <div className="px-5 pb-5">
                    <div className="border-t border-[#1e1e35] pt-3">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Paperclip className="w-3.5 h-3.5 text-[#555577]" />
                        <span className="text-[#555577] text-xs font-medium">
                          {adjuntos.length} archivo{adjuntos.length > 1 ? 's' : ''} adjunto{adjuntos.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {adjuntos.map(doc => {
                          const cfg = tipoConfig[doc.tipo as keyof typeof tipoConfig] ?? tipoConfig.pdf
                          const Icon = cfg.icon
                          const ext = tipoExt[doc.tipo] ?? doc.tipo
                          return (
                            <a
                              key={doc.id}
                              href={`/api/doc/${doc.id}`}
                              download={`${doc.nombre}.${ext}`}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg} border ${cfg.border} hover:brightness-110 transition-all group/att`}
                            >
                              <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0`} />
                              <div className="min-w-0">
                                <p className={`text-xs font-medium ${cfg.color} truncate max-w-[160px]`}>{doc.titulo}</p>
                                <p className="text-[#555577] text-xs">{doc.nombre}.{ext}</p>
                              </div>
                              <Download className={`w-3 h-3 ${cfg.color} opacity-50 group-hover/att:opacity-100 transition-opacity ml-1`} />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
