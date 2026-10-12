import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import type {
  UserItem,
  FilterRole,
  FilterStatus,
  StatType,
  UserManagementSectionsProps,
} from '../types/admin-user.types'
import { UserStatsSection } from './user-stats'
import { UserTableSection } from './user-table'
import { CreateAuthorModal } from './create-author-modal'
import { BanModal } from './ban-modal'

export function UserManagementSections({
  data,
  onCreateAuthor,
  onToggleBan,
  onApprove,
  isMutating,
}: UserManagementSectionsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<UserItem | null>(null)

  // Đưa state bộ lọc lên cha
  const [roleFilter, setRoleFilter] = useState<FilterRole>('ALL')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')

  async function handleConfirmCreateAuthor(payload: any) {
    await onCreateAuthor(payload)
    setIsCreateOpen(false)
  }

  async function handleConfirmBan() {
    if (!banTarget) return
    await onToggleBan(banTarget.id)
    setBanTarget(null)
  }

  async function handleApprove(user: UserItem) {
    await onApprove(user.id)
  }

  // Xử lý khi click vào thẻ stat
  function handleStatClick(type: StatType) {
    if (type === 'total') {
      setRoleFilter('ALL')
      setStatusFilter('ALL')
    } else if (type === 'author') {
      setRoleFilter('AUTHOR')
      setStatusFilter('ALL')
    } else if (type === 'pending') {
      setRoleFilter('ALL')
      setStatusFilter('pending')
    }
  }

  // Xác định thẻ stat nào đang active dựa vào bộ lọc hiện tại
  let activeStat: StatType = 'total'
  if (roleFilter === 'AUTHOR' && statusFilter === 'ALL') activeStat = 'author'
  else if (roleFilter === 'ALL' && statusFilter === 'pending') activeStat = 'pending'

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-foreground">Quản lý người dùng</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Xem, lọc và quản lý tài khoản người dùng
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-95"
          >
            <UserPlus className="h-4 w-4" /> Tạo tác giả
          </button>
        </div>

        <UserStatsSection
          stats={data.stats}
          activeStat={activeStat}
          onStatClick={handleStatClick}
        />

        <UserTableSection
          users={data.users}
          onToggleBan={setBanTarget}
          onApprove={handleApprove}
          isMutating={isMutating}
          // Truyền state và setter xuống cho Table
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* Modals */}
      <CreateAuthorModal
        isOpen={isCreateOpen}
        onConfirm={handleConfirmCreateAuthor}
        onClose={() => setIsCreateOpen(false)}
        isLoading={isMutating}
      />
      {banTarget && (
        <BanModal
          user={banTarget}
          onConfirm={handleConfirmBan}
          onClose={() => setBanTarget(null)}
          isLoading={isMutating}
        />
      )}
    </>
  )
}