import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import type { CreateAuthorPayload } from '../types/admin-user.types'

export interface CreateAuthorModalProps {
  isOpen: boolean
  onConfirm: (payload: CreateAuthorPayload) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export function CreateAuthorModal({ isOpen, onConfirm, onClose, isLoading }: CreateAuthorModalProps) {
  const [formData, setFormData] = useState<CreateAuthorPayload>({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    penName: '',
    bio: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onConfirm(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-outline-variant bg-surface-container shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Tạo tài khoản tác giả</h2>
              <p className="text-sm text-muted-foreground">Điền thông tin để tạo tác giả mới</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-container-highest hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="create-author-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Tên đăng nhập <span className="text-rose-500">*</span></label>
                <input required name="username" value={formData.username} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email <span className="text-rose-500">*</span></label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Mật khẩu <span className="text-rose-500">*</span></label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Bút danh <span className="text-rose-500">*</span></label>
                <input required name="penName" value={formData.penName} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Số điện thoại</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Địa chỉ</label>
                <input name="address" value={formData.address} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Tiểu sử</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 custom-scrollbar" />
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-foreground mb-3">Thông tin thanh toán (Tùy chọn)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Tên ngân hàng</label>
                  <input name="bankName" value={formData.bankName} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Số tài khoản</label>
                  <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-foreground">Tên chủ tài khoản</label>
                  <input name="bankAccountHolder" value={formData.bankAccountHolder} onChange={handleChange} className="w-full rounded-lg border border-outline bg-transparent px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant px-6 py-4 shrink-0 bg-surface-container-low/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-surface-container-highest hover:text-foreground disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="create-author-form"
            disabled={isLoading}
            className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo tài khoản'}
          </button>
        </div>

      </div>
    </div>
  )
}
