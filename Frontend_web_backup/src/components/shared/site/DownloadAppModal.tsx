import { X, Smartphone, Download, QrCode, CheckCircle2 } from 'lucide-react'

interface DownloadAppModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-card text-card-foreground rounded-2xl p-6 shadow-2xl border border-border animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Tải Ứng Dụng Đọc Truyện</h3>
            <p className="text-xs text-muted-foreground">Trải nghiệm đọc truyện đỉnh cao trên di động</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center justify-center mb-5 border border-border/50">
          <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-sm border flex flex-col items-center justify-center">
            {/* QR Code placeholder SVG */}
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800">
              <QrCode className="w-32 h-32 stroke-[1.5]" />
              <span className="text-[10px] font-mono text-zinc-500 mt-1">Quét bằng camera điện thoại</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Quét mã QR bằng điện thoại Android / iOS để tải trực tiếp file cài đặt APK.
          </p>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Đọc mượt mà, hỗ trợ tải chương đọc ngoại tuyến (Offline)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Trình phát audio TTS thông minh, nghe ngoài màn hình khóa</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Nạp coin siêu tốc với Deeplink MoMo 1 chạm</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="/downloads/novel-app.apk"
            download
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Download className="w-4 h-4" />
            Tải File APK
          </a>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-input text-foreground text-sm font-medium hover:bg-accent transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
