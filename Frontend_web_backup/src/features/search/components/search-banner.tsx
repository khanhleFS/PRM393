import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, BookmarkPlus } from 'lucide-react'

// Feature reminder slides
const BANNER_SLIDES = [
  {
    id: 1,
    title: "Tìm Kiếm Thông Minh",
    subtitle: "Khám phá tác phẩm",
    description: "Nhập tên truyện, tác giả hoặc từ khóa vào thanh tìm kiếm. Hệ thống sẽ ngay lập tức trả về kết quả chính xác và nhanh chóng nhất.",
    icon: Search,
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80",
    color: "from-blue-900/80"
  },
  {
    id: 2,
    title: "Bộ Lọc Đa Dạng",
    subtitle: "Tối ưu hiển thị",
    description: "Sử dụng công cụ lọc nâng cao để khoanh vùng kết quả theo thể loại yêu thích, số lượng chương hoặc trạng thái Kết thúc.",
    icon: SlidersHorizontal,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    color: "from-indigo-900/80"
  },
  {
    id: 3,
    title: "Theo Dõi Dễ Dàng",
    subtitle: "Không bỏ lỡ",
    description: "Nhấn lưu (Bookmark) những bộ truyện bạn đang đọc. Chúng tôi sẽ thông báo cho bạn ngay khi tác giả cập nhật chương mới.",
    icon: BookmarkPlus,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80",
    color: "from-violet-900/80"
  }
]

export function SearchBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const minSwipeDistance = 50

  // Auto-switch interval (5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const onPointerDown = (e: React.PointerEvent) => {
    setIsPaused(true)
    setTouchEndX(null)
    setTouchStartX(e.clientX)
    // Capture pointer to track movement outside bounds
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (touchStartX !== null) {
      setTouchEndX(e.clientX)
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    setIsPaused(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (touchStartX === null || touchEndX === null) {
      setTouchStartX(null)
      return
    }

    const distance = touchStartX - touchEndX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)
    }

    setTouchStartX(null)
    setTouchEndX(null)
  }

  return (
    <div
      className="relative w-full h-[240px] sm:h-[300px] rounded-2xl sm:rounded-[32px] overflow-hidden mb-8 group bg-surface-container-highest border border-outline/10 isolate cursor-grab active:cursor-grabbing touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        setTouchStartX(null)
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >

      {/* Slides mapping for smooth cross-fade */}
      {BANNER_SLIDES.map((slide, index) => {
        const Icon = slide.icon;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-105 opacity-80"
            />

            {/* Dynamic Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-surface-container-lowest/90 to-transparent mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent sm:hidden" />

            {/* Text Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-14 max-w-xl">
              <div
                className={`transition-all duration-700 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
              >

                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-primary leading-[1.2] mb-2 sm:mb-3 flex items-center gap-3 drop-shadow-lg">
                  <Icon className="hidden sm:block size-8 text-primary" />
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-base text-on-surface-variant font-medium max-w-sm line-clamp-3 sm:line-clamp-none drop-shadow-md">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {BANNER_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
              ? 'w-6 bg-primary shadow-[0_0_8px_rgba(79,55,138,0.8)]'
              : 'w-1.5 bg-on-surface-variant/40 hover:bg-on-surface-variant/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  )
}


