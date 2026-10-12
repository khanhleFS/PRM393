import { X } from 'lucide-react'
import type { AuthorPaymentTicketDTO } from '@/types'

interface TicketDetailModalProps {
  ticket: AuthorPaymentTicketDTO
  onClose: () => void
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  UNPAID: { label: 'Chưa thanh toán', color: 'text-amber-500 bg-amber-500/10' },
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-500 bg-emerald-500/10' },
  CANCELLED: { label: 'Đã hủy', color: 'text-rose-500 bg-rose-500/10' },
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  const statusInfo = STATUS_LABEL[ticket.status] || { label: ticket.status, color: 'text-muted-foreground bg-muted/10' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      {/* Click outside backdrop */}
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close ticket detail"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-outline/10 bg-surface p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="mt-1 text-lg font-bold text-on-surface">Phiếu quyết toán {ticket.monthYear}</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 rounded-lg bg-surface-container p-4 text-center">
          <p className="text-3xl font-black text-primary">
            {ticket.amountVnd.toLocaleString('vi-VN')} đ
          </p>
          <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <DetailRow label="Mã phiếu" value={ticket.id} />
          <DetailRow label="Tác giả" value={ticket.penName} />
          <DetailRow label="Tổng số xu tích lũy" value={`${ticket.totalCoins.toLocaleString('vi-VN')} xu`} />
          <DetailRow label="Tỷ giá xu (1 xu)" value={`${ticket.coinRate.toLocaleString('vi-VN')} đ`} />
          <DetailRow label="Ngân hàng" value={ticket.bankName || '-'} />
          <DetailRow label="Số tài khoản" value={ticket.bankAccountNumber || '-'} />
          <DetailRow label="Chủ tài khoản" value={ticket.bankAccountHolder ? ticket.bankAccountHolder.toUpperCase() : '-'} />
          {ticket.transactionRef && (
            <DetailRow label="Mã giao dịch VietQR" value={ticket.transactionRef} />
          )}
          {ticket.paidAt && (
            <DetailRow label="Thời gian thanh toán" value={new Date(ticket.paidAt).toLocaleString('vi-VN')} />
          )}
          <DetailRow label="Ngày tạo" value={new Date(ticket.createdAt).toLocaleDateString('vi-VN')} />
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-outline/5 pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-semibold text-on-surface break-words text-xs">{value}</span>
    </div>
  )
}
