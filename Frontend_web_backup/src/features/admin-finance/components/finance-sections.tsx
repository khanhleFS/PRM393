import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Search, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts'
import type {
  CashFlowChartProps,
  FinanceTransactionTableProps,
  FinanceKpiSectionProps,
  FinanceChartsAndDepositsSectionProps,
} from '../types/admin-finance.types'

function formatVND(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`
}

function CashFlowChart({ cashFlow, cashFlowMonth }: CashFlowChartProps) {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week')

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)

  const currentData = activeTab === 'week' ? cashFlow : cashFlowMonth

  return (
    <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
        <div>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {activeTab === 'week' ? 'Biểu đồ nạp ví theo tuần' : 'Biểu đồ nạp ví theo tháng'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-surface-container-lowest p-0.5 border border-outline-variant">
            <button
              onClick={() => setActiveTab('week')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${activeTab === 'week'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-muted-foreground hover:bg-surface-container'
                }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${activeTab === 'month'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-muted-foreground hover:bg-surface-container'
                }`}
            >
              Tháng
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 h-[280px] w-full min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={8}
              style={{ fontSize: 11, fontWeight: 500, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toLocaleString('vi-VN')}K`}
              style={{ fontSize: 10, fontWeight: 500, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-container-lowest)',
                border: '1px solid var(--outline-variant)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--foreground)',
              }}
              formatter={(value: any) => [formatMoney(value), 'Doanh thu']}
            />
            <Bar dataKey="value" name="Nạp ví" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function FinanceTransactionTable({ transactions = [] }: FinanceTransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
      const matchesMethod = methodFilter === 'all' || txn.method === methodFilter

      return matchesSearch && matchesStatus && matchesMethod
    })
  }, [transactions, searchTerm, statusFilter, methodFilter])

  // Pagination calculation
  const totalItems = filteredTransactions.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleExport = () => {
    const headers = ['ID Giao dich', 'Nguoi dung', 'Ten nguoi dung', 'Phuong thuc', 'So tien (VND)', 'Coin nhan', 'Trang thai', 'Thoi gian']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t =>
        [t.id, t.user, `"${t.fullName}"`, `"${t.method}"`, t.amount, t.coins, t.status, `"${t.time}"`].join(',')
      )
    ].join('\n')

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `bao-cao-giao-dich-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm space-y-4">
      {/* Table Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Lịch sử giao dịch chi tiết</h2>
          <p className="text-xs text-muted-foreground">Theo dõi và xuất báo cáo các khoản nạp ví từ độc giả.</p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-surface-container-low"
        >
          <Download className="h-4 w-4" />
          Xuất file CSV
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo ID, username, tên..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Method Filter */}
          <div className="relative flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest pl-2 pr-7 py-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Phương thức:</span>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none bg-transparent text-xs text-foreground focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="Bank transfer">Chuyển khoản</option>
              <option value="MoMo">Ví MoMo</option>
              <option value="ZaloPay">ZaloPay</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-muted-foreground" />
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest pl-2 pr-7 py-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none bg-transparent text-xs text-foreground focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-outline-variant/60 bg-surface-container-lowest">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-outline-variant/80 bg-surface-container-low font-bold text-muted-foreground">
              <th className="p-3.5">Mã GD</th>
              <th className="p-3.5">Độc giả</th>
              <th className="p-3.5">Thời gian</th>
              <th className="p-3.5">Phương thức</th>
              <th className="p-3.5 text-right">Số tiền</th>
              <th className="p-3.5 text-right">Xu nhận</th>
              <th className="p-3.5 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((txn) => {
                let statusClass = ''
                let StatusIcon = Clock

                if (txn.status === 'success') {
                  statusClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  StatusIcon = CheckCircle2
                } else if (txn.status === 'failed') {
                  statusClass = 'bg-red-500/10 text-red-600 dark:text-red-400'
                  StatusIcon = XCircle
                } else {
                  statusClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  StatusIcon = Clock
                }

                return (
                  <tr key={txn.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">{txn.id}</td>
                    <td className="p-3.5">
                      <div>
                        <div className="font-semibold text-foreground">{txn.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{txn.user}</div>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{txn.time}</td>
                    <td className="p-3.5 text-foreground font-medium">{txn.method}</td>
                    <td className="p-3.5 text-right font-bold text-foreground">
                      {formatVND(txn.amount)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">
                      +{txn.coins} xu
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>
                        <StatusIcon className="h-3 w-3" />
                        {txn.status === 'success' ? 'Thành công' : txn.status === 'failed' ? 'Thất bại' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Không tìm thấy giao dịch nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong tổng số <span className="font-semibold text-foreground">{totalItems}</span> giao dịch.
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-outline-variant bg-surface-container-lowest p-1.5 hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex items-center px-3 text-xs font-bold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-outline-variant bg-surface-container-lowest p-1.5 hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function KpiGrid({ kpiData }: { kpiData: { id: number; title: string; subtitle: string; amount: string; growth: string; actionText: string; isPrimary: boolean; icon: any }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {kpiData.map((d) => (
        <KpiCard key={d.id} data={d} />
      ))}
    </div>
  )
}

function KpiCard({ data }: { data: any }) {
  const { title, amount, isPrimary, icon: Icon } = data
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${isPrimary ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        </div>
        <div className={`rounded-lg p-2 ${isPrimary ? 'bg-primary text-on-primary' : 'bg-surface-container'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-black text-foreground">{amount}</div>
      </div>

    </div>
  )
}

export function FinanceKpiSection({ kpiData }: FinanceKpiSectionProps) {
  return <KpiGrid kpiData={kpiData} />
}

export function FinanceChartsAndDepositsSection({
  cashFlow,
  cashFlowMonth,
  recentDeposits,
}: FinanceChartsAndDepositsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CashFlowChart cashFlow={cashFlow} cashFlowMonth={cashFlowMonth} />
      </div>

      <aside className="lg:col-span-1">
        <div className="flex flex-col gap-3">
          {recentDeposits.map((deposit) => {
            const isSuccess = deposit.status === 'success'

            return (
              <div
                key={`${deposit.user}-${deposit.time}`}
                className="group flex w-full items-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3.5 transition-colors hover:bg-surface-container"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                  {isSuccess ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{deposit.user}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{deposit.method} • {deposit.time}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-emerald-600">+{formatVND(deposit.amount)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{deposit.amount.toLocaleString()} đ</p>
                </div>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}