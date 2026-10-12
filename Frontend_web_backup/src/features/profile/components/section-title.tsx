import type { SectionTitleProps } from '../types/profile.types'

export function SectionTitle({ icon: Icon, children }: SectionTitleProps) {
  return (
    <h3 className="flex items-center gap-2 px-1 font-serif text-xl font-bold text-on-surface">
      <Icon className="size-5" />
      {children}
    </h3>
  )
}
