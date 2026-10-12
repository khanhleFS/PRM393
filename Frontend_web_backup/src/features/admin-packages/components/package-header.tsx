import { Plus } from 'lucide-react'
import type { PackageHeaderProps } from '../types/admin-packages.types'

export function PackageHeader({ onAddClick }: PackageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý gói nạp (Coin Packages)</h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình, điều chỉnh danh sách các gói nạp xu (Lumi Coins) và các ưu đãi đi kèm cho người dùng.
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95 sm:self-start cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Thêm gói mới
      </button>
    </div>
  )
}
