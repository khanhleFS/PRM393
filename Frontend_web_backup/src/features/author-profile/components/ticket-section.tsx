import { useState, useMemo } from 'react'
import { ReceiptText, Loader2, PackageOpen, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAuthorTickets } from '@/services/author-service'
import type { AuthorPaymentTicketDTO } from '@/types'
import { TicketDetailModal } from './ticket-detail-modal'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  UNPAID: { label: 'Chờ quyết toán', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Clock },
  PAID: { label: 'Đã chi trả', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', icon: AlertCircle },
}

const ITEMS_PER_PAGE = 5

export function TicketSection() {
  const [selectedTicket, setSelectedTicket] = useState<AuthorPaymentTicketDTO | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: tickets, isLoading, error } = useQuery<AuthorPaymentTicketDTO[]>({
    queryKey: ['author-tickets'],
    queryFn: getAuthorTickets,
  })

  const sortedTickets = useMemo(() => {
    if (!tickets) return []
    return [...tickets].sort((a, b) => {
      // Sorting by monthYear descending
      return b.monthYear.localeCompare(a.monthYear) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [tickets])

  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE) || 1

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedTickets.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedTickets, currentPage])

  const handleCloseModal = () => {
    setSelectedTicket(null)
  }

  return (
    <section>
      <div className="overflow-hidden rounded-xl border border-outline/10 bg-surface shadow-sm">
        <div className="border-b border-outline/10 px-5 py-4 flex items-center gap-2">
          <ReceiptText className="h-5 w-5 text-primary" />
          <h3 className="font-serif text-lg font-bold text-on-surface">Lịch sử quyết toán doanh thu</h3>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Đang tải lịch sử quyết toán...
          </div>
        )}

        {error && (
          <div className="px-5 py-8 text-center text-xs text-rose-500 font-semibold">
            Không thể tải lịch sử quyết toán.
          </div>
        )}

        {!isLoading && !error && sortedTickets.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <PackageOpen className="h-9 w-9 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">Chưa có phiếu quyết toán nào</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Phiếu quyết toán của bạn sẽ được chốt tự động vào ngày cuối cùng của tháng.
            </p>
          </div>
        )}

        {paginatedTickets.map((ticket) => {
          const dateStr = new Date(ticket.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          })

          const statusCfg = STATUS_CONFIG[ticket.status] || {
            label: ticket.status,
            color: 'bg-muted/10 text-muted-foreground',
            icon: Clock
          }
          const StatusIcon = statusCfg.icon

          return (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-container/40 border-b border-outline/5 last:border-0"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusCfg.color}`}>
                <StatusIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-on-surface">Quyết toán tháng {ticket.monthYear}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Ngày lập: {dateStr}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-extrabold text-primary">
                  {ticket.amountVnd.toLocaleString('vi-VN')} đ
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{ticket.totalCoins.toLocaleString('vi-VN')} xu</p>
              </div>
            </button>
          )
        })}

        {/* Pagination Controls */}
        {!isLoading && !error && sortedTickets.length > 0 && (
          <div className="flex items-center justify-between border-t border-outline/5 px-5 py-3 text-xs text-muted-foreground bg-surface-container/10">
            <span>
              Trang {currentPage} / {totalPages} ({sortedTickets.length} bản ghi)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-outline/10 bg-surface transition-colors hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-surface cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-outline/10 bg-surface transition-colors hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-surface cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal overlay */}
      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={handleCloseModal} />
      )}
    </section>
  )
}
