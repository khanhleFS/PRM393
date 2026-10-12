import type { KpiCardProps } from '../types/admin-finance.types'

export default function KpiCard({ data }: KpiCardProps) {
  const { title, subtitle, amount, isPrimary, icon: Icon } = data

  const cardBg = isPrimary
    ? 'bg-primary text-on-primary border-transparent'
    : 'bg-surface text-on-surface border-[var(--outline-variant)] stats-glow'

  const iconBg = isPrimary
    ? 'bg-on-primary text-primary'
    : 'bg-primary-container text-on-primary-container'

  return (
    <div className={`flex flex-col justify-between rounded-[1.5rem] border p-6 transition-transform duration-300 hover:-translate-y-1 ${cardBg}`}>
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold leading-tight" title={title}>{title}</h3>
            <p className={`mt-0.5 truncate text-sm ${isPrimary ? 'text-on-primary/80' : 'text-muted-foreground'}`}>{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="truncate text-3xl font-bold tracking-tight" title={amount}>{amount}</span>
      </div>
    </div>
  )
}
