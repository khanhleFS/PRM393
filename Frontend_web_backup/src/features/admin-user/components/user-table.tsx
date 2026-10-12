import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Ban,
} from 'lucide-react'
import type {
  UserRole,
  UserStatus,
  FilterRole,
  FilterStatus,
  SortKey,
  SortDir,
  UserTableSectionProps,
} from '../types/admin-user.types'

const ROLE_CONFIG: Record<UserRole, { label: string; classes: string }> = {
  ADMIN: { label: 'Admin', classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  AUTHOR: { label: 'Tác giả', classes: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  USER: { label: 'Người dùng', classes: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
}

const STATUS_CONFIG: Record<UserStatus, { label: string; classes: string; dot: string }> = {
  active: { label: 'Hoạt động', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
  banned: { label: 'Bị cấm', classes: 'bg-red-500/10 text-red-600 border-red-500/20', dot: 'bg-red-500' },
  pending: { label: 'Chờ duyệt', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
}

export function UserTableSection({
  users,
  onToggleBan,
  onApprove,
  isMutating,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter
}: UserTableSectionProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('joinedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Reset page về 1 mỗi khi bộ lọc bên ngoài hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [roleFilter, statusFilter, search])

  const filteredAndSorted = useMemo(() => {
    let result = [...users]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }
    if (roleFilter !== 'ALL') result = result.filter((u) => u.role === roleFilter)
    if (statusFilter !== 'ALL') result = result.filter((u) => u.status === statusFilter)

    result.sort((a, b) => {
      let diff = 0
      if (sortKey === 'joinedAt') diff = a.joinedAt.localeCompare(b.joinedAt)
      else if (sortKey === 'fullName') diff = a.fullName.localeCompare(b.fullName)
      else diff = (a[sortKey] as number) - (b[sortKey] as number)
      return sortDir === 'asc' ? diff : -diff
    })

    return result
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir])

  // Pagination calculation
  const totalItems = filteredAndSorted.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredAndSorted.slice(startIndex, startIndex + itemsPerPage)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setCurrentPage(1)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="h-3.5 w-3.5 opacity-20" />
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />
  }

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-low shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant bg-surface-container px-5 py-3.5">
        {/* Search */}
        <div className="relative flex min-w-[200px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            id="user-search-input"
            type="text"
            placeholder="Tìm kiếm tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Role filter */}
        <div className="relative flex items-center">
          <select
            id="role-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as FilterRole)}
            className="h-9 appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest pl-3 pr-8 text-xs text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="USER">Người dùng</option>
            <option value="AUTHOR">Tác giả</option>
            <option value="ADMIN">Admin</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Status filter */}
        <div className="relative flex items-center">
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="h-9 appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest pl-3 pr-8 text-xs text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="pending">Chờ duyệt</option>
            <option value="banned">Bị cấm</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <span className="ml-auto text-xs font-medium text-muted-foreground shrink-0">
          {totalItems} người dùng
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-outline-variant/60 bg-surface-container/60">
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('fullName')}>
                  Người dùng <SortIcon col="fullName" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Vai trò</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort('joinedAt')}>
                  Ngày tham gia <SortIcon col="joinedAt" />
                </button>
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
            {paginatedUsers.map((user) => {
              const roleConf = ROLE_CONFIG[user.role]
              const statusConf = STATUS_CONFIG[user.status]
              const isPending = user.status === 'pending'

              return (
                <tr
                  key={user.id}
                  className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container/50 last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="h-9 w-9 shrink-0 rounded-full object-cover border border-outline-variant"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{user.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${roleConf.classes}`}>
                      {roleConf.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusConf.classes}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConf.dot}`} />
                      {statusConf.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">
                    {new Date(user.joinedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && (
                        <button
                          id={`approve-btn-${user.id}`}
                          onClick={() => onApprove(user)}
                          disabled={isMutating}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Duyệt
                        </button>
                      )}
                      {user.role !== 'ADMIN' && (
                        <button
                          id={`ban-btn-${user.id}`}
                          onClick={() => onToggleBan(user)}
                          disabled={isMutating}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50 ${user.status === 'banned'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            : 'border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20'
                            }`}
                        >
                          {user.status === 'banned' ? (
                            <><CheckCircle className="h-3.5 w-3.5" /> Gỡ cấm</>
                          ) : (
                            <><Ban className="h-3.5 w-3.5" /> Cấm</>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-outline-variant px-5 py-3 bg-surface-container/30">
          <p className="text-xs text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong tổng số <span className="font-semibold text-foreground">{totalItems}</span> người dùng.
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-outline-variant bg-surface-container-lowest p-1 hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex items-center px-3 text-xs font-bold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-outline-variant bg-surface-container-lowest p-1 hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}