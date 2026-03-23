interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-14 border-b border-[#1e1e35] bg-[#0a0a0f]/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm text-[#555577]">
        <span className="text-[#e8e8f0] font-semibold">{title}</span>
      </div>
    </header>
  )
}
