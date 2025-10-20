import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function GlassCard({ 
  children, 
  className = '',
  hover = false 
}: GlassCardProps) {
  return (
    <div 
      className={`
        bg-white/80 dark:bg-[#1C2B49]/80 
        backdrop-blur-xl 
        border border-white/20 dark:border-[#F6C445]/20
        shadow-2xl 
        rounded-3xl 
        transition-all duration-300
        ${hover ? 'hover:shadow-3xl hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}