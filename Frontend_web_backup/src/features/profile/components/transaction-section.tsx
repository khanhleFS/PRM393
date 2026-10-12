import { useState, useMemo } from 'react'
import { ReceiptText, Loader2, PackageOpen, ExternalLink, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionTitle } from './section-title'
import { surfaceCardClass } from './profile-styles'
import { useQuery } from '@tanstack/react-query'
import { getCoinTransactions } from '../services/profile.service'
import type { CoinTransactionResponseDTO } from '../types/profile.types'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  SUCCESS: { label: 'Thành công', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  COMPLETED: { label: 'Thành công', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  FAILED: { label: 'Thất bại', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-500/10 text-gray-500' },
}

const ITEMS_PER_PAGE = 5

export function TransactionSection() {
  const [selectedTx, setSelectedTx] = useState<CoinTransactionResponseDTO | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Gọi API lấy tối đa 100 bản ghi
  const { data: transactions, isLoading, error } = useQuery<CoinTransactionResponseDTO[]>({
    queryKey: ['coin-transactions'],
    queryFn: () => getCoinTransactions(0, 100),
  })

  // Sắp xếp giao dịch mới nhất lên đầu (Descending)
  const sortedTransactions = useMemo(() => {
    if (!transactions) return []
    return [...transactions].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [transactions])

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE) || 1

  // Phân trang phía client (5 items / trang)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedTransactions.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedTransactions, currentPage])

  const handleCloseModal = () => {
    setSelectedTx(null)
  }

  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4">
          <SectionTitle icon={ReceiptText}>Lịch sử giao dịch coin</SectionTitle>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải giao dịch...
          </div>
        )}

        {error && (
          <div className="px-5 py-8 text-center text-xs text-red-500">
            Không thể tải lịch sử giao dịch coin.
          </div>
        )}

        {!isLoading && !error && sortedTransactions.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <PackageOpen className="h-9 w-9 text-on-surface-variant/40" />
            <p className="text-sm font-semibold text-on-surface-variant">Chưa có giao dịch nào</p>
            <Link
              to="/payment/create"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              Nạp Coins ngay <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        {paginatedTransactions.map((tx) => {
          const dateStr = new Date(tx.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })

          const isSuccess = tx.status === 'SUCCESS' || tx.status === 'COMPLETED'
          const isFailed = tx.status === 'FAILED' || tx.status === 'CANCELLED'
          const isTopup = tx.transactionType === 'TOPUP' || tx.amount > 0

          return (
            <button
              key={tx.transactionId}
              onClick={() => setSelectedTx(tx)}
              className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
                ? isTopup
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : isFailed
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                {isSuccess ? (
                  isTopup ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )
                ) : isFailed ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-on-surface">{tx.packageName || tx.transactionType}</p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant/70">{dateStr}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-sm font-extrabold ${isTopup ? 'text-primary' : 'text-rose-500'}`}>
                  {isTopup ? `+${tx.amount.toLocaleString()}` : `-${Math.abs(tx.amount).toLocaleString()}`} Coins
                </p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">{tx.paymentMethod || 'Hệ thống'}</p>
              </div>
            </button>
          )
        })}

        {/* Thanh phân trang 5 items / trang */}
        {!isLoading && !error && sortedTransactions.length > 0 && (
          <div className="flex items-center justify-between border-t border-outline/5 px-5 py-3 text-xs text-on-surface-variant">
            <span>
              Trang {currentPage} / {totalPages} ({sortedTransactions.length} giao dịch)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-outline/10 bg-surface-container transition-colors hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-surface-container"
                title="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-outline/10 bg-surface-container transition-colors hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-surface-container"
                title="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal chi tiết giao dịch */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <button className="absolute inset-0 cursor-default" onClick={handleCloseModal} />
          <div className={`relative w-full max-w-sm rounded-xl p-5 shadow-2xl ${surfaceCardClass}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="mt-1 text-lg font-bold text-on-surface">{selectedTx.packageName || selectedTx.transactionType}</h3>
              <button
                onClick={handleCloseModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-surface-container p-4 text-center">
              <p className={`text-3xl font-extrabold ${selectedTx.transactionType === 'TOPUP' || selectedTx.amount > 0 ? 'text-primary' : 'text-rose-500'}`}>
                {selectedTx.transactionType === 'TOPUP' || selectedTx.amount > 0 ? `+${selectedTx.amount.toLocaleString()}` : `-${Math.abs(selectedTx.amount).toLocaleString()}`} Coins
              </p>
              <p className="mt-0.5 text-sm text-on-surface-variant">{selectedTx.paymentMethod}</p>
            </div>

            <div className="space-y-2.5 text-sm">
              {([
                ['Mã giao dịch', selectedTx.transactionId],
                ['Loại giao dịch', selectedTx.transactionType],
                ['Trạng thái', STATUS_LABEL[selectedTx.status]?.label ?? selectedTx.status],
                ['Phương thức', selectedTx.paymentMethod],
                ['Thời gian', new Date(selectedTx.createdAt).toLocaleString('vi-VN')],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-outline/5 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="max-w-[55%] break-all text-right font-semibold text-on-surface text-xs">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}