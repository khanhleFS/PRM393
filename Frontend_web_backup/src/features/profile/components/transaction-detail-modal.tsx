import { X } from 'lucide-react'
import { surfaceCardClass } from './profile-styles'
import type { TransactionDetailModalProps, DetailRowProps } from '../types/profile.types'

export function TransactionDetailModal({
  transaction,
  onClose
}: TransactionDetailModalProps) {
  const isTopup = transaction.type === 'topup'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close transaction detail"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-sm rounded-lg p-5 ${surfaceCardClass}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="mt-1 text-xl font-bold text-on-surface">{transaction.title}</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 rounded-md bg-surface-container p-4 text-center">
          <p className={`text-3xl font-bold ${isTopup ? 'text-primary' : 'text-on-surface'}`}>
            {transaction.amount}
          </p>
          <p className="mt-1 text-xs font-semibold text-on-surface-variant">
            {transaction.status}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <DetailRow label="Mã giao dịch" value={transaction.id} />
          <DetailRow label="Mô tả" value={transaction.description} />
          <DetailRow label="Thời gian" value={transaction.date} />
          <DetailRow label="Phương thức" value={transaction.method} />
          <DetailRow label="Tham chiếu" value={transaction.reference} />
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-outline/5 pb-3 last:border-b-0 last:pb-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className="max-w-[60%] text-right font-semibold text-on-surface">{value}</span>
    </div>
  )
}