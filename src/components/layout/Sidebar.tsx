'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  FileText,
  History,
  Settings,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/projects',   label: 'Proyectos',    icon: FolderKanban },
  { href: '/agents',     label: 'Agentes',      icon: Bot },
  { href: '/documents',  label: 'Documentos',   icon: FileText },
  { href: '/history',    label: 'Historial',    icon: History },
  { href: '/settings',   label: 'Configuración',icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0a0a0f] border-r border-[#1e1e35] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-[#1e1e35]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[#e8e8f0] font-bold text-sm">NOVO IA</span>
            <p className="text-[#555577] text-xs">Multi-Agent Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-600/20'
                  : 'text-[#8888aa] hover:text-[#e8e8f0] hover:bg-[#141428]'
              )}
            >
              <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-violet-400' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e1e35]">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            E
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#e8e8f0] text-xs font-medium truncate">Eduardo</p>
            <p className="text-[#555577] text-xs truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
