import { useState, useEffect } from 'react'
import { fetchAuthorNovelsSummary, fetchNovelStats } from '../services/author-stat.service'
import type { NovelStatSummary, AuthorNovelOption, StatTab } from '../types/author-stat.types'
import {
  BookOpen,
  Eye,
  Coins,
  Percent,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

export function StatDashboard() {
  const [novels, setNovels] = useState<AuthorNovelOption[]>([])
  const [selectedNovelId, setSelectedNovelId] = useState<string>('')
  const [stats, setStats] = useState<NovelStatSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<StatTab>('views')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchAuthorNovelsSummary().then((data) => {
      setNovels(data)
      if (data.length > 0) {
        setSelectedNovelId(data[0].id)
      }
    })
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (!selectedNovelId) return
    setLoading(true)
    fetchNovelStats(selectedNovelId).then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [selectedNovelId])

  // Reset page to 1 if selected novel or chapters length changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedNovelId, stats?.chapters?.length])

  const totalItems = stats?.chapters?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const paginatedChapters = stats?.chapters ? stats.chapters.slice(startIndex, startIndex + itemsPerPage) : []

  const selectedNovel = novels.find(n => n.id === selectedNovelId)

  if (loading && !stats) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans text-foreground">
      {/* Header & Selector */}
      <div className="flex flex-col gap-4 border-b border-outline-variant/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Thống Kê Hiệu Số Chương</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Theo dõi lượt đọc, doanh thu và tỉ lệ chuyển đổi của tác phẩm</p>
        </div>

        {/* Custom Novel Selector */}
        <div className="relative inline-block w-full sm:w-64">
          <button
            onClick={() => setIsOpen(!isOpen)}
            // Thay px-3 thành pl-4 pr-3 để đẩy content vào trong 1 chút
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-outline-variant/60 bg-white dark:bg-zinc-900 pl-4 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 truncate">
              {/* Khung chứa cố định w-5 giúp chữ luôn thẳng hàng */}
              <div className="flex w-5 shrink-0 items-center justify-center">
                {selectedNovel?.coverImageUrl ? (
                  <img
                    src={selectedNovel.coverImageUrl}
                    alt={selectedNovel.title}
                    className="h-7 w-5 rounded object-cover shadow-sm border border-outline/10"
                  />
                ) : (
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="truncate text-foreground">{selectedNovel?.title}</span>
            </div>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {isOpen && (
            <>
              {/* Overlay background to close dropdown when clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

              {/* Dropdown list container */}
              <div className="absolute right-0 left-0 mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-outline-variant/60 bg-white dark:bg-zinc-900 py-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                {novels.map((novel) => {
                  const isSelected = novel.id === selectedNovelId
                  return (
                    <button
                      key={novel.id}
                      onClick={() => {
                        setSelectedNovelId(novel.id)
                        setIsOpen(false)
                      }}
                      // Thay px-3 thành pl-4 pr-3 đồng bộ với trigger
                      className={`flex w-full items-center gap-3 pl-4 pr-3 py-2 text-left text-xs transition-colors hover:bg-surface-container ${isSelected ? 'bg-primary/10 font-bold text-primary' : 'text-foreground'
                        }`}
                    >
                      {/* Khung chứa cố định w-5 giúp chữ luôn thẳng hàng */}
                      <div className="flex w-5 shrink-0 items-center justify-center">
                        {novel.coverImageUrl ? (
                          <img
                            src={novel.coverImageUrl}
                            alt={novel.title}
                            className="h-7 w-5 rounded object-cover shadow-sm border border-outline/10"
                          />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="truncate">{novel.title}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {stats && (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Views Card */}
            <button
              onClick={() => setActiveTab('views')}
              className={`group flex cursor-pointer items-center justify-between rounded-lg border p-4 text-left transition-all ${activeTab === 'views'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-outline-variant/60 bg-surface hover:border-primary/40'
                }`}
            >
              <div className="space-y-1">
                <span className={`text-xs font-semibold transition-colors ${activeTab === 'views' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  Tổng lượt đọc
                </span>
                <p className="text-2xl font-black tracking-tight text-on-surface">
                  {stats.totalViews.toLocaleString('vi-VN')}
                </p>
              </div>
              <div className={`rounded-lg p-2 transition-colors ${activeTab === 'views'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-container-high text-muted-foreground group-hover:text-primary'
                }`}>
                <Eye className="h-5 w-5" />
              </div>
            </button>

            {/* Revenue Card */}
            <button
              onClick={() => setActiveTab('revenue')}
              className={`group flex cursor-pointer items-center justify-between rounded-lg border p-4 text-left transition-all ${activeTab === 'revenue'
                  ? 'border-amber-500 bg-amber-500/5 shadow-sm'
                  : 'border-outline-variant/60 bg-surface hover:border-amber-500/40'
                }`}
            >
              <div className="space-y-1">
                <span className={`text-xs font-semibold transition-colors ${activeTab === 'revenue' ? 'text-amber-600' : 'text-muted-foreground'
                  }`}>
                  Doanh thu xu
                </span>
                <p className="text-2xl font-black tracking-tight text-on-surface">
                  {stats.totalRevenue.toLocaleString('vi-VN')}
                </p>
              </div>
              <div className={`rounded-lg p-2 transition-colors ${activeTab === 'revenue'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-surface-container-high text-muted-foreground group-hover:text-amber-500'
                }`}>
                <Coins className="h-5 w-5" />
              </div>
            </button>

            {/* Conversion Rate Card */}
            <button
              onClick={() => setActiveTab('conversion')}
              className={`group flex cursor-pointer items-center justify-between rounded-lg border p-4 text-left transition-all ${activeTab === 'conversion'
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-sm'
                  : 'border-outline-variant/60 bg-surface hover:border-emerald-500/40'
                }`}
            >
              <div className="space-y-1">
                <span className={`text-xs font-semibold transition-colors ${activeTab === 'conversion' ? 'text-emerald-600' : 'text-muted-foreground'
                  }`}>
                  Tỉ lệ mua VIP trung bình
                </span>
                <p className="text-2xl font-black tracking-tight text-on-surface">
                  {stats.avgConversionRate}%
                </p>
              </div>
              <div className={`rounded-lg p-2 transition-colors ${activeTab === 'conversion'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-surface-container-high text-muted-foreground group-hover:text-emerald-500'
                }`}>
                <Percent className="h-5 w-5" />
              </div>
            </button>
          </div>

          {/* Visual Graph Section */}
          <div className="rounded-lg border border-outline-variant/60 bg-surface p-4 shadow-sm stats-glow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  {activeTab === 'views' && 'Biểu đồ lượt đọc theo chương'}
                  {activeTab === 'revenue' && 'Biểu đồ doanh thu xu theo chương'}
                  {activeTab === 'conversion' && 'Biểu đồ tỉ lệ chuyển đổi chương VIP (%)'}
                </h3>
                <p className="text-[10px] text-muted-foreground">Trục hoành biểu diễn thứ tự số chương</p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'views' ? (
                  <BarChart data={stats.chapters} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="chapterNumber" tickLine={false} tickMargin={8} style={{ fontSize: 10, fontWeight: 500 }} />
                    <YAxis tickLine={false} style={{ fontSize: 10, fontWeight: 500 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '11px' }}
                      labelFormatter={(label) => `Chương ${label}`}
                    />
                    <Bar dataKey="viewCount" name="Lượt đọc" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : activeTab === 'revenue' ? (
                  <BarChart data={stats.chapters} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="chapterNumber" tickLine={false} tickMargin={8} style={{ fontSize: 10, fontWeight: 500 }} />
                    <YAxis tickLine={false} style={{ fontSize: 10, fontWeight: 500 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '11px' }}
                      labelFormatter={(label) => `Chương ${label}`}
                    />
                    <Bar dataKey="revenue" name="Xu kiếm được" fill="var(--amber-500, #f59e0b)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={stats.chapters.map((ch) => ch.status === 'FREE' ? { ...ch, conversionRate: 0 } : ch)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="chapterNumber" tickLine={false} tickMargin={8} style={{ fontSize: 10, fontWeight: 500 }} />
                    <YAxis domain={[0, 100]} tickLine={false} style={{ fontSize: 10, fontWeight: 500 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '11px' }}
                      labelFormatter={(label) => `Chương ${label}`}
                    />
                    <Bar dataKey="conversionRate" name="Tỉ lệ mua VIP (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chapters List Table */}
          <div className="rounded-lg border border-outline-variant/60 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-outline-variant/60 bg-surface-container px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chi tiết số liệu từng chương</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/40 bg-surface-container-low/40 font-semibold text-muted-foreground">
                    <th className="p-3 text-center">STT</th>
                    <th className="p-3">Tên chương</th>
                    <th className="p-3">Loại</th>
                    <th className="p-3 text-right">Lượt đọc</th>
                    <th className="p-3 text-right">Mở khóa xu</th>
                    <th className="p-3 text-right">Tỉ lệ chuyển đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {paginatedChapters.map((ch) => (
                    <tr key={ch.chapterNumber} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-3 text-center font-mono font-medium text-muted-foreground">{ch.chapterNumber}</td>
                      <td className="p-3 font-semibold text-on-surface">{ch.title}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase border ${ch.status === 'FREE'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                          : ch.status === 'LOCKED'
                            ? 'border-red-500/20 bg-red-500/10 text-red-600'
                            : 'border-blue-500/20 bg-blue-500/10 text-blue-600'
                          }`}>
                          {ch.status === 'FREE' ? 'Miễn phí' : ch.status === 'LOCKED' ? 'Khóa' : 'Mở khóa'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-medium">{ch.viewCount.toLocaleString('vi-VN')}</td>
                      <td className="p-3 text-right font-mono font-medium text-amber-600">
                        {ch.revenue > 0 ? `${ch.revenue.toLocaleString('vi-VN')} xu` : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-emerald-600">
                        {ch.status === 'FREE' ? '-' : `${ch.conversionRate.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-outline-variant/60 p-4 bg-transparent mt-1">
                <p className="text-xs text-muted-foreground">
                  Hiển thị <span className="font-semibold text-foreground">{startIndex + 1}</span> - <span className="font-semibold text-foreground">{Math.min(startIndex + itemsPerPage, totalItems)}</span> trong tổng số <span className="font-semibold text-foreground">{totalItems}</span> chương.
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-outline-variant bg-surface-container-lowest p-1 hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 text-on-surface" />
                  </button>
                  <span className="flex items-center px-3 text-xs font-bold text-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-outline-variant bg-surface-container-lowest p-1 hover:bg-surface-container disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4 text-on-surface" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
