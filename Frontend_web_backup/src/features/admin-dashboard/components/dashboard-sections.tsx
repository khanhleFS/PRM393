import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts'
import { Users, ArrowRight, CreditCard, UserPlus, BookOpen, CheckCircle2, Clock } from 'lucide-react'
import type { DashboardChartSectionProps, DashboardUserPulseSectionProps, DashboardTransactionsSectionProps, DashboardPackagesSectionProps, PulseCardProps, PackageCardProps } from '../types/admin-dashboard.types'

function formatFullVND(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`
}

function formatShortVND(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

export function DashboardChartSection({ chartData, platformNet }: DashboardChartSectionProps) {
  // chartData is already in VND from the real API
  const formattedChartData = chartData.map((val, idx) => ({
    name: `Tháng ${idx + 1}`,
    value: val,
  }))

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
      <div className="rounded-lg border border-gray-300 bg-surface p-4 shadow-sm lg:col-span-9 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-zinc-800 pb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Doanh số nạp tiền của người dùng</div>
          </div>
        </div>

        <div className="mt-4 h-[180px] w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickFormatter={(v) => v.replace('Tháng ', '')}
                style={{ fontSize: 10, fontWeight: 500, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                tickLine={false}
                tickFormatter={formatShortVND}
                style={{ fontSize: 9, fontWeight: 500, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-container-lowest, #fff)',
                  border: '1px solid var(--outline-variant, #e5e7eb)',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [formatFullVND(value), 'Doanh thu nạp']}
              />
              <Bar dataKey="value" name="Doanh thu nạp" fill="var(--primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex min-h-[6rem] flex-col items-start justify-center rounded-xl border border-primary bg-primary p-5 text-white shadow-sm lg:col-span-3">
        <div className="w-full">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-on-primary">Doanh thu nạp</div>
          <div className="mt-3 text-4xl font-bold leading-tight sm:text-5xl text-on-primary">{formatShortVND(Math.round(platformNet))}</div>
          <div className="mt-1 text-xs text-on-primary/70 font-medium">{formatFullVND(Math.round(platformNet))}</div>
        </div>
      </div>
    </section >
  )
}

export function DashboardUserPulseSection({
  totalUsers,
  totalAuthors,
  totalNovels,
}: DashboardUserPulseSectionProps) {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-4 shadow-sm lg:col-span-5 sm:p-5">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tình hình người dùng</div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Thẻ chính: Chiếm 2 cột trên màn hình sm trở lên */}
          <div className="sm:col-span-2">
            <PulseCard
              label="Tổng user"
              value={totalUsers}
              icon={<Users className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/10"
            />
          </div>

          {/* Các thẻ thứ cấp */}
          <PulseCard
            label="Tác giả"
            value={totalAuthors}
            icon={<BookOpen className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-500/10"
          />
          <PulseCard
            label="Tổng truyện"
            value={totalNovels}
            icon={<UserPlus className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-500/10"
          />
        </div>
      </div>

    </section>
  )
}

export function DashboardTransactionsSection({
  recentOrders,
}: DashboardTransactionsSectionProps) {
  return (
    <aside className="flex h-full w-full flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-4 shadow-sm lg:col-span-7 sm:p-5">
      <div>
        {/* HEADER */}
        <div className="flex h-[40px] items-center justify-between gap-3 border-b border-outline-variant pb-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Giao dịch gần đây</div>

        </div>

        {/* DANH SÁCH */}
        <div className="mt-2 flex flex-col">
          {recentOrders.map((order) => {
            const isCompleted = order.status === 'COMPLETED'
            const timeLabel = order.createdAt
              ? new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
              : ''

            return (
              <div
                key={order.orderId}
                className="group flex w-full items-center gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-surface-container-lowest"
              >
                {/* ICON BÊN TRÁI */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                {/* THÔNG TIN CHÍNH */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{order.username}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono">{timeLabel}</span>
                  </p>
                </div>

                {/* SỐ TIỀN BÊN PHẢI */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-green-600">
                    +{formatFullVND(order.amountVnd)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                    {formatShortVND(order.amountVnd)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export function DashboardPackagesSection({ packageTiers }: DashboardPackagesSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--outline-variant)] bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--outline-variant)] pb-3">
        <div>
          <h2 className="mt-1 text-lg font-bold text-foreground">Danh sách gói nạp (Packages)</h2>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95">
          + Thêm gói mới
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {packageTiers.map((pkg) => (
          <PackageCard key={pkg.id} data={pkg} />
        ))}
      </div>
    </section>
  )
}

function PulseCard({
  label,
  value,
  icon,
  iconBg,
}: PulseCardProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-4 transition-all duration-200 hover:bg-surface-container">
      <div className="space-y-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="block text-2xl font-black text-foreground">{value || 0}</span>
      </div>
      <div className={`shrink-0 flex items-center justify-center rounded-xl ${iconBg} p-2.5`}>
        {icon}
      </div>
    </div>
  )
}

function PackageCard({ data }: PackageCardProps) {
  const { name, price, coin, bonus, isPopular } = data

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${isPopular
        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
        : 'border-outline-variant bg-surface-container-lowest'
        }`}
    >
      {isPopular && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-on-primary shadow-sm flex items-center gap-1">
          <CreditCard className="h-3 w-3" /> Nổi bật
        </div>
      )}

      <div className="flex flex-col items-center py-3 w-full text-center">
        <h3 className="truncate text-sm font-bold text-foreground/80">{name}</h3>

        <p className="mt-2 text-2xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-1">
          {coin.toLocaleString('vi-VN')}
          <span className="text-sm font-semibold text-muted-foreground">Coins</span>
        </p>

        <p className="mt-1 text-lg font-extrabold text-primary">
          {(price * 1000).toLocaleString('vi-VN')} đ
        </p>
      </div>

      <div className="mt-auto w-full pt-3 border-t border-outline-variant/40 text-center">
        {bonus > 0 ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            + Tặng {bonus} Coins ưu đãi
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Mệnh giá {price}K VNĐ
          </span>
        )}
      </div>
    </div>
  )
}