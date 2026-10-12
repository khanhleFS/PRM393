import { X, CheckCircle, Ban } from 'lucide-react'
import type { BanModalProps } from '../types/admin-user.types'

export function BanModal({ user, onConfirm, onClose, isLoading }: BanModalProps) {
  const isBanned = user.status === 'banned'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isBanned ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {isBanned ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <Ban className="h-5 w-5 text-red-600" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{isBanned ? 'Gỡ lệnh cấm' : 'Cấm người dùng'}</h3>
              <p className="text-xs text-muted-foreground">Thay đổi trạng thái tài khoản</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-container hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container p-3.5">
          <img src={user.avatarUrl} alt={user.username} className="h-11 w-11 rounded-full object-cover border border-outline-variant" />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {isBanned
            ? 'Người dùng sẽ được khôi phục quyền truy cập vào nền tảng.'
            : 'Người dùng sẽ không thể đăng nhập và mọi hoạt động sẽ bị đình chỉ.'}
        </p>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-surface-container transition-colors">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-ban-btn"
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : isBanned ? (
              <><CheckCircle className="h-4 w-4" />Gỡ lệnh cấm</>
            ) : (
              <><Ban className="h-4 w-4" />Cấm tài khoản</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
