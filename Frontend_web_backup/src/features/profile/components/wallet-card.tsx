import { Plus, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { surfaceCardClass } from './profile-styles'
import { useProfile } from '../context/profile.context'
import type { WalletCardProps } from '../types/profile.types'

export function WalletCard({ showActions = true }: WalletCardProps) {
  const { data } = useProfile()
  const wallet = data?.wallet

  const balance = wallet ? wallet.balance.toLocaleString('vi-VN') : '—'

  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="flex flex-col gap-1">
          {/* Số dư - style giống trang payment */}
          <div className="rounded-xl bg-surface-container/30 p-4">
            <div className="rounded-lg bg-surface border border-outline/10 p-5 shadow-sm">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Số dư ví Lumi
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {balance}
                  </span>
                  <Coins className="h-7 w-7" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
          {/* Actions */}
          {showActions && (
            <div className="grid grid-cols-1 gap-2 px-4 pb-5">
              <Link
                to="/payment/create"
                className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" /> Nạp thêm Coins
              </Link>
            </div>
          )}


        </div>
      </div>
    </section>
  )
}