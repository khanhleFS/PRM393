import { Link } from 'react-router-dom'
import { ArrowUpDown, ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight, Lock, Bookmark, Eye, Coins, X, Loader2 } from 'lucide-react'
import SpotlightCard from '@/components/custom/spot-light-card/SpotlightCard'
import { useStoryDetailContext } from '../context/story-detail-context'
import { useMemo, useState, useEffect } from 'react'
import type { ChapterItem, StoryChaptersProps } from '../types/story-detail.types'
import { unlockChapter } from '@/services/chapter-service'
import { useAuthStore } from '@/store/auth.store'
import { getBookmark, type BookmarkResponse } from '@/services/bookmark-service'
import { extractId } from '@/features/reader/services/reader.service'

export function StoryChapters({
  storySlug,
  isSortedAsc,
  onSortToggle,
}: StoryChaptersProps) {
  const { storyInfo, chapters } = useStoryDetailContext()

  const ITEMS_PER_PAGE = 5;
  const [localPage, setLocalPage] = useState(1);

  // Danh sách các chapter id đã được mua (mở khóa) trong phiên này
  const [purchasedChapterIds, setPurchasedChapterIds] = useState<Set<number>>(new Set())

  // Chapter đang được chọn để xác nhận mua (mở modal)
  const [chapterToBuy, setChapterToBuy] = useState<ChapterItem | null>(null)
  const [isBuying, setIsBuying] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [purchaseResult, setPurchaseResult] = useState<{ coinsSpent: number; remainingCoins: number } | null>(null)

  // Real bookmark state from API
  const [realBookmark, setRealBookmark] = useState<BookmarkResponse | null>(null)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // Reset trang về 1 khi danh sách gốc thay đổi (ví dụ: đổi chiều sort)
  useEffect(() => {
    setLocalPage(1);
  }, [chapters]);

  // Tính tổng số trang dựa trên độ dài của toàn bộ danh sách chương (chapters)
  const localTotalPages = useMemo(() => Math.ceil(chapters.length / ITEMS_PER_PAGE), [chapters.length]);

  // Cắt dữ liệu hiển thị từ "chapters" (Full list) thay vì "paginatedChapters" (Partial list)
  const displayChapters = useMemo(() => {
    const start = (localPage - 1) * ITEMS_PER_PAGE;
    return chapters.slice(start, start + ITEMS_PER_PAGE);
  }, [chapters, localPage]);

  const handleCloseModal = () => {
    setChapterToBuy(null)
    setIsBuying(false)
    setBuyError(null)
    setPurchaseResult(null)
  }

  const handleConfirmBuy = async () => {
    if (!chapterToBuy) return
    setIsBuying(true)
    setBuyError(null)

    try {
      const novelId = storyInfo!.id
      const result = await unlockChapter(novelId, Number(chapterToBuy.id))

      // Refresh auth store to update remaining coin balance
      await useAuthStore.getState().refreshProfile()

      // Mở khóa chapter sau khi mua thành công
      setPurchasedChapterIds((prev) => {
        const next = new Set(prev)
        next.add(Number(chapterToBuy.id))
        return next
      })

      // Lưu kết quả để hiện trạng thái thành công trong modal
      setPurchaseResult({
        coinsSpent: result.coinsSpent,
        remainingCoins: result.remainingCoins,
      })
      setIsBuying(false)
    } catch (err: any) {
      setBuyError(err.message || 'Mua chương thất bại, vui lòng thử lại.')
      setIsBuying(false)
    }
  }

  // Fetch real bookmark when authenticated
  useEffect(() => {
    if (!isAuthenticated || !storyInfo) return
    const novelId = extractId(String(storyInfo.id)) || String(storyInfo.id)
    getBookmark(novelId).then(bm => setRealBookmark(bm)).catch(() => setRealBookmark(null))
  }, [isAuthenticated, storyInfo])

  if (!storyInfo) return null

  const isBookmarked = isAuthenticated && !!realBookmark
  const bookmarkedChapterId = realBookmark?.lastChapterId ?? null
  const bookmarkedChapterNum = realBookmark?.lastChapterNumber ?? null
  const bookmarkedChapterTitle = realBookmark?.lastChapterTitle ?? null

  const bookmarkedChapter = bookmarkedChapterId
    ? chapters.find((c) => String(c.id) === String(bookmarkedChapterId))
    : null
  const readProgress = realBookmark?.readingProgressPercent ?? 0

  return (
    <>
      {/* ========================================= */}
      {/*             DESKTOP VIEWPORT              */}
      {/* ========================================= */}
      {isBookmarked && (
        <SpotlightCard spotlightColor="rgba(79, 55, 138, 0.15)" className="hidden md:block bg-surface-container-low rounded-lg border border-outline/5 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-grow max-w-xl">
              <div className="flex items-center gap-2">
                <Bookmark className="size-5 text-primary fill-primary animate-pulse" />
                <h3 className="text-lg font-serif font-bold text-foreground">Bạn đang đọc dở</h3>
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">
                Chương đang đọc: <span className="text-primary">{bookmarkedChapter?.title || bookmarkedChapterTitle || (bookmarkedChapterNum ? `Chương ${bookmarkedChapterNum}` : 'Không rõ')}</span>
              </p>
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Tiến độ truyện</span>
                  <span className="text-xs text-primary font-bold">{readProgress}%</span>
                </div>
                <div className="h-2 w-full bg-outline/15 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${readProgress}%` }} />
                </div>
              </div>
            </div>
            <Link to={bookmarkedChapter?.slug ? `/${storySlug}/${bookmarkedChapter.slug}` : `/${storySlug}`} className="px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer shrink-0 ml-8 text-sm text-center">
              <Bookmark className="h-4 w-4 fill-on-primary" />
              Tiếp tục đọc
            </Link>
          </div>
        </SpotlightCard>
      )}

      <SpotlightCard id="chapters-section-desktop" spotlightColor="rgba(79, 55, 138, 0.15)" className="hidden md:block bg-surface-container-low rounded-lg border border-outline/5 scroll-mt-24">
        <div className="px-6 py-5 flex justify-between items-center border-b border-outline/10">
          <h2 className="text-2xl font-serif font-bold text-foreground">Danh sách chương</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-on-surface-variant font-medium">{chapters.length} Chương</span>
            <button onClick={onSortToggle} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs font-bold cursor-pointer">
              <ArrowUpDown className="h-4 w-4" />
              {isSortedAsc ? 'Cũ nhất' : 'Mới nhất'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-outline/5">
          {displayChapters.map((chap) => {
            const isCurrentBookmark = bookmarkedChapterId !== null && String(chap.id) === String(bookmarkedChapterId)
            const isLocked = chap.isLocked && !purchasedChapterIds.has(Number(chap.id))

            const rowClassName = `px-6 py-4 transition-colors flex items-center justify-between group ${isCurrentBookmark ? 'bg-primary/5 hover:bg-primary/10' : ''
              } ${isLocked ? 'cursor-default' : 'hover:bg-surface-container cursor-pointer'}`

            const chapterInfo = (
              <>
                <div className="flex flex-col gap-1">
                  <span className={`font-semibold text-sm transition-colors flex items-center gap-2 ${isCurrentBookmark ? 'text-primary' : isLocked ? 'text-on-surface-variant' : 'text-foreground group-hover:text-primary'
                    }`}>
                    {isCurrentBookmark ? (
                      <Bookmark className="size-3.5 text-primary fill-primary shrink-0 animate-pulse" />
                    ) : isLocked ? (
                      <Lock className="size-3.5 text-amber-500 shrink-0" />
                    ) : null}
                    {chap.title}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-on-surface-variant/80 font-medium whitespace-nowrap shrink-0 select-none">
                  {isLocked ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setChapterToBuy(chap)
                        setBuyError(null)
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <Lock className="size-3.5" />
                      Mua chương
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-4 text-on-surface-variant/60" />
                      {chap.views} lượt xem
                    </span>
                  )}
                </div>
              </>
            )

            if (isLocked) {
              return (
                <div key={chap.id} className={rowClassName}>
                  {chapterInfo}
                </div>
              )
            }

            return (
              <Link to={`/${storySlug}/${chap.slug}`} key={chap.id} className={rowClassName}>
                {chapterInfo}
              </Link>
            )
          })}
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-6 flex flex-col items-center justify-center border-t border-outline/10 bg-surface-container-low/50 gap-4">
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setLocalPage(1)} disabled={localPage === 1} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"><ChevronsLeft className="size-5" /></button>
            <button onClick={() => setLocalPage(p => Math.max(1, p - 1))} disabled={localPage === 1} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"><ChevronLeft className="size-5" /></button>

            <div className="relative inline-flex items-center">
              <select
                value={localPage}
                onChange={(e) => setLocalPage(Number(e.target.value))}
                className="appearance-none bg-surface-container-high border border-outline/20 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-primary cursor-pointer"
              >
                {Array.from({ length: localTotalPages }, (_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    Trang {idx + 1} / {localTotalPages}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <button onClick={() => setLocalPage(p => Math.min(localTotalPages, p + 1))} disabled={localPage === localTotalPages} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"><ChevronRight className="size-5" /></button>
            <button onClick={() => setLocalPage(localTotalPages)} disabled={localPage === localTotalPages} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"><ChevronsRight className="size-5" /></button>
          </div>
        </div>
      </SpotlightCard>

      {/* ========================================= */}
      {/*              MOBILE VIEWPORT              */}
      {/* ========================================= */}

      {/* Mobile Bookmark */}
      {isBookmarked && (
        <div className="block md:hidden bg-surface-container-low rounded-lg border border-outline/5 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="size-4 text-primary fill-primary animate-pulse" />
            <h3 className="text-base font-serif font-bold text-foreground">Bạn đang đọc dở</h3>
          </div>
          <p className="text-sm font-semibold text-on-surface-variant mb-3">
            <span className="text-primary">{bookmarkedChapter?.title || bookmarkedChapterTitle || (bookmarkedChapterNum ? `Chương ${bookmarkedChapterNum}` : 'Không rõ')}</span>
          </p>
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Tiến độ truyện</span>
              <span className="text-xs text-primary font-bold">{readProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-outline/15 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${readProgress}%` }} />
            </div>
          </div>
          <Link to={bookmarkedChapter?.slug ? `/${storySlug}/${bookmarkedChapter.slug}` : `/${storySlug}`} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm cursor-pointer">
            <Bookmark className="h-4 w-4 fill-on-primary" />
            Tiếp tục đọc
          </Link>
        </div>
      )}

      {/* Mobile Chapters List */}
      <div id="chapters-section-mobile" className="block md:hidden bg-surface-container-low rounded-lg border border-outline/5 scroll-mt-24 mb-6">
        <div className="px-4 py-4 flex flex-col gap-3 border-b border-outline/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-foreground">Danh sách chương</h2>
            <span className="text-xs text-on-surface-variant font-medium">{chapters.length} Chương</span>
          </div>
          <button onClick={onSortToggle} className="w-full py-2 px-4 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-bold cursor-pointer">
            <ArrowUpDown className="h-4 w-4" />
            {isSortedAsc ? 'Sắp xếp: Cũ nhất' : 'Sắp xếp: Mới nhất'}
          </button>
        </div>

        <div className="divide-y divide-outline/5">
          {displayChapters.map((chap) => {
            const isCurrentBookmark = bookmarkedChapterId !== null && String(chap.id) === String(bookmarkedChapterId)
            const isLocked = chap.isLocked && !purchasedChapterIds.has(Number(chap.id))

            const rowClassName = `px-4 py-3.5 transition-colors flex items-center justify-between group ${isCurrentBookmark ? 'bg-primary/5 hover:bg-primary/10' : ''
              } ${isLocked ? 'cursor-default' : 'hover:bg-surface-container cursor-pointer'}`

            const chapterInfo = (
              <>
                <div className="flex flex-col gap-1 pr-2 max-w-[65%]">
                  <span className={`font-semibold text-sm transition-colors flex items-start gap-1.5 ${isCurrentBookmark ? 'text-primary' : isLocked ? 'text-on-surface-variant' : 'text-foreground'
                    }`}>
                    {isCurrentBookmark ? (
                      <Bookmark className="size-3.5 mt-0.5 text-primary fill-primary shrink-0 animate-pulse" />
                    ) : isLocked ? (
                      <Lock className="size-3.5 mt-0.5 text-amber-500 shrink-0" />
                    ) : null}
                    <span className="line-clamp-2 leading-snug">{chap.title}</span>
                  </span>
                </div>

                <div className="flex items-center text-xs text-on-surface-variant/80 font-medium whitespace-nowrap shrink-0 select-none">
                  {isLocked ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setChapterToBuy(chap)
                        setBuyError(null)
                      }}
                      className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <Lock className="size-3" />
                      Mua
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Eye className="size-3.5 text-on-surface-variant/60" />
                      {chap.views}
                    </span>
                  )}
                </div>
              </>
            )

            if (isLocked) {
              return (
                <div key={chap.id} className={rowClassName}>
                  {chapterInfo}
                </div>
              )
            }

            return (
              <Link to={`/${storySlug}/${chap.slug}`} key={chap.id} className={rowClassName}>
                {chapterInfo}
              </Link>
            )
          })}
        </div>

        {/* Mobile Pagination Controls */}
        <div className="px-4 py-5 flex flex-col items-center justify-center border-t border-outline/10 bg-surface-container-low/50 gap-3">
          <div className="flex items-center justify-center w-full max-w-[280px] justify-between">
            <button onClick={() => setLocalPage(p => Math.max(1, p - 1))} disabled={localPage === 1} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"><ChevronLeft className="size-5" /></button>

            <div className="relative inline-flex items-center flex-1 mx-2">
              <select
                value={localPage}
                onChange={(e) => setLocalPage(Number(e.target.value))}
                className="appearance-none w-full text-center bg-surface-container-high border border-outline/20 rounded-lg py-2 text-sm font-semibold text-primary cursor-pointer focus:outline-none"
              >
                {Array.from({ length: localTotalPages }, (_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    Trang {idx + 1} / {localTotalPages}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={() => setLocalPage(p => Math.min(localTotalPages, p + 1))} disabled={localPage === localTotalPages} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"><ChevronRight className="size-5" /></button>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/*               MODAL MUA CHƯƠNG              */}
      {/* ========================================= */}
      {chapterToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <button className="absolute inset-0 cursor-default" onClick={handleCloseModal} />
          <div className="relative w-full max-w-sm rounded-xl p-5 shadow-2xl bg-surface-container-low border border-outline/10">

            {purchaseResult ? (
              // --- Trạng thái THÀNH CÔNG ---
              <>
                <div className="mb-4 flex flex-col items-center text-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <Coins className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-green-500">Mua thành công</p>
                  <h3 className="text-lg font-bold text-on-surface">{chapterToBuy.title}</h3>
                </div>

                <div className="mb-4 space-y-2 rounded-lg bg-surface-container p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">Đã trừ</span>
                    <span className="font-bold text-on-surface">{purchaseResult.coinsSpent.toLocaleString()} Coins</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">Số dư còn lại</span>
                    <span className="font-extrabold text-primary flex items-center gap-1">
                      <Coins className="h-4 w-4" strokeWidth={2.5} />
                      {purchaseResult.remainingCoins.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 text-sm rounded-lg font-bold border border-outline/20 text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    Đóng
                  </button>
                  <Link
                    to={`/${storySlug}/${chapterToBuy.slug}`}
                    onClick={handleCloseModal}
                    className="btn-primary flex-1 flex items-center justify-center py-2.5 text-sm rounded-lg font-bold shadow-md bg-primary text-on-primary hover:brightness-110 transition-all"
                  >
                    Đọc ngay
                  </Link>
                </div>
              </>
            ) : (
              // --- Trạng thái XÁC NHẬN MUA ---
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary/80">Mở khóa chương</p>
                    <h3 className="mt-1 text-lg font-bold text-on-surface">{chapterToBuy.title}</h3>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-surface-container p-4 text-primary">
                  <Coins className="h-6 w-6" strokeWidth={2.5} />
                  <span className="text-2xl font-extrabold">
                    {(chapterToBuy.price ?? 0).toLocaleString()} Coins
                  </span>
                </div>

                <p className="mb-4 text-center text-xs text-on-surface-variant">
                  Số coin sẽ được trừ trực tiếp từ ví của bạn để mở khóa chương này.
                </p>

                {buyError && (
                  <p className="mb-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center">
                    {buyError}
                  </p>
                )}

                <button
                  onClick={handleConfirmBuy}
                  disabled={isBuying}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg font-bold shadow-md disabled:opacity-50 bg-primary text-on-primary hover:brightness-110 transition-all"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận mua'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}