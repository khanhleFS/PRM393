import { useState, useEffect } from 'react'
import { X, CreditCard, Loader2 } from 'lucide-react'
import type { PackageModalProps } from '../types/admin-packages.types'

export function PackageModal({
  isOpen,
  editingPackage,
  onClose,
  onSave,
  isPending,
}: PackageModalProps) {
  const [name, setName] = useState('')
  const [priceVnd, setPriceVnd] = useState(20000)
  const [baseCoins, setBaseCoins] = useState(200)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (editingPackage) {
      setName(editingPackage.name)
      setPriceVnd(editingPackage.priceVnd)
      setBaseCoins(editingPackage.baseCoins)
      setIsActive(editingPackage.isActive)
    } else {
      setName('')
      setPriceVnd(20000)
      setBaseCoins(200)
      setIsActive(true)
    }
  }, [editingPackage, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name,
      priceVnd: Number(priceVnd),
      baseCoins: Number(baseCoins),
      isActive,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingPackage ? 'Cập nhật gói nạp xu' : 'Thêm gói nạp xu mới'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Cấu hình thông tin quy đổi xu cho người dùng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Tên gói nạp
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Ví dụ: Gói Tân Thủ, Gói Siêu Cấp..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Giá tiền (VNĐ)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={priceVnd}
                onChange={(e) => setPriceVnd(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="mt-1 text-[11px] font-medium text-primary">
                Tương đương {Math.round(priceVnd / 1000)}K đ
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Số xu gốc (Coins)
              </label>
              <input
                type="number"
                min="1"
                required
                value={baseCoins}
                onChange={(e) => setBaseCoins(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-primary focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <label
              htmlFor="isActive"
              className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
            >
              Cho phép hoạt động (Công khai)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
