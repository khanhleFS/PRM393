import { useState, useEffect } from 'react'
import { Smartphone, X, Download } from 'lucide-react'

export default function SmartAppBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('dismiss_app_banner')
    if (isDismissed) return

    // Show banner on mobile screen width or touch device
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('dismiss_app_banner', 'true')
  }

  const handleOpenApp = () => {
    // Try opening app via custom URI scheme, fallback to download page if not installed
    const appUrl = 'novelapp://home'
    const fallbackUrl = '/download-app'
    
    const start = Date.now()
    window.location.href = appUrl

    setTimeout(() => {
      // If user is still here after 1.5s, app probably not installed
      if (Date.now() - start < 2000) {
        window.location.href = fallbackUrl
      }
    }, 1500)
  }

  if (!isVisible) return null

  return (
    <aside aria-label="Khuyến nghị cài đặt ứng dụng" className="relative z-50 w-full bg-gradient-to-r from-primary/95 via-primary to-primary/90 text-primary-foreground px-4 py-2.5 shadow-md backdrop-blur-sm transition-all animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-background/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight truncate text-white">
              Ứng dụng Đọc Truyện Novel
            </p>
            <p className="text-[11px] opacity-90 leading-tight truncate text-white/80">
              Đọc mượt hơn, hỗ trợ offline & nghe audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenApp}
            className="px-3 py-1.5 rounded-full bg-white text-primary text-xs font-bold shadow-sm hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Mở App
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
