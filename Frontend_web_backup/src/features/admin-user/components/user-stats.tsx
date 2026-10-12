import { Users, BookOpen, UserPlus } from 'lucide-react'
import type { StatCardProps, UserStatsSectionProps } from '../types/admin-user.types'

function StatCard({ label, value, icon, iconBg, isActive, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20 ${isActive
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-outline-variant bg-surface-container-low hover:border-primary/40'
        }`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <p className={`text-[11px] font-bold uppercase tracking-wider leading-tight ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}>
          {label}
        </p>
        <div className={`shrink-0 rounded-lg p-2 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-2xl font-black ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
        {value.toLocaleString('vi-VN')}
      </p>
    </button>
  )
}

export function UserStatsSection({ stats, activeStat, onStatClick }: UserStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Tổng người dùng"
        value={stats.totalUsers}
        icon={<Users className="h-4 w-4" />}
        iconBg="bg-primary/10 text-primary"
        isActive={activeStat === 'total'}
        onClick={() => onStatClick('total')}
      />
      <StatCard
        label="Tác giả"
        value={stats.totalAuthors}
        icon={<BookOpen className="h-4 w-4" />}
        iconBg="bg-violet-500/10 text-violet-600"
        isActive={activeStat === 'author'}
        onClick={() => onStatClick('author')}
      />
      <StatCard
        label="Chờ duyệt"
        value={stats.pendingRequests}
        icon={<UserPlus className="h-4 w-4" />}
        iconBg="bg-amber-500/10 text-amber-600"
        isActive={activeStat === 'pending'}
        onClick={() => onStatClick('pending')}
      />
    </div>
  )
} 