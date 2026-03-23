'use client'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variants = {
  primary:   'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500',
  secondary: 'bg-[#141428] hover:bg-[#1e1e35] text-[#e8e8f0] border border-[#1e1e35]',
  ghost:     'bg-transparent hover:bg-[#141428] text-[#8888aa] hover:text-[#e8e8f0] border border-transparent',
  danger:    'bg-red-950 hover:bg-red-900 text-red-300 border border-red-900',
}

const sizes = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-4 py-2 text-sm',
  lg:  'px-5 py-2.5 text-base',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
