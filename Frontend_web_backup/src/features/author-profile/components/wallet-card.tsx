import { Coins } from 'lucide-react'
import { useAuthorProfile } from '../hooks/use-author-profile'

export function WalletCard() {
  const { data: profile } = useAuthorProfile()
  const balance = profile ? profile.authorCoinBalance.toLocaleString('vi-VN') : '—'

  return (
    <section>
      <div className="overflow-hidden rounded-xl border border-outline/10 bg-surface shadow-sm">
        <div className="flex flex-col gap-1 p-4 bg-surface-container/30">
          <div className="rounded-lg bg-surface border border-outline/5 p-5 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Doanh thu tích lũy
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-4xl font-extrabold tracking-tight">
                  {balance}
                </span>
                <Coins className="h-7 w-7 text-amber-500" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
