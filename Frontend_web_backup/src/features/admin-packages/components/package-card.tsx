import { Eye, EyeOff, Edit2, Trash2 } from 'lucide-react'
import type { PackageCardProps } from '../types/admin-packages.types'

export function PackageCard({ pkg, onToggle, onEdit, onDelete }: PackageCardProps) {
  return (
    <div
      className={`relative flex flex-1 flex-col items-center justify-between rounded-xl border p-4 sm:p-5 transition-all hover:bg-surface-container hover:shadow-md ${pkg.isActive
        ? 'border-outline/20 bg-surface-container-low'
        : 'border-outline/10 bg-surface-container-low/50 opacity-75'
        }`}
    >

      {/* Main card content: Title -> Coins -> Price */}
      <div className="flex flex-col items-center pt-2 pb-4 w-full text-center">
        <h3 className="truncate text-sm font-bold text-on-surface/80">{pkg.name}</h3>

        <p className="mt-2 text-2xl font-extrabold text-on-surface tracking-tight flex items-center justify-center gap-1">
          {pkg.baseCoins.toLocaleString('vi-VN')}
          <span className="text-sm font-semibold text-on-surface-variant">Coins</span>
        </p>

        <p className="text-lg font-bold text-primary mt-1">
          {pkg.priceVnd.toLocaleString('vi-VN')} đ
        </p>
      </div>

      {/* Bottom section: Capsule bar with Icon Buttons (matches Payment Card quantity control layout) */}
      <div className="mt-auto w-full pt-4 border-t border-outline/10 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-outline/20 bg-surface p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onToggle(pkg.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer"
            title={pkg.isActive ? 'Ẩn gói' : 'Hiện gói'}
          >
            {pkg.isActive ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground " />}
          </button>

          <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer"
            title="Chỉnh sửa gói"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(pkg.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors cursor-pointer"
            title="Xóa gói"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
