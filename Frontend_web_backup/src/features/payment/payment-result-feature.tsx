import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Coins, ArrowLeft, Loader2 } from 'lucide-react'
import Container from '@/components/shared/site/container'
import { useQuery } from '@tanstack/react-query'
import { fetchProfileData } from '@/features/profile/services/profile.service'

export default function PaymentResultFeature() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Lấy dữ liệu từ MoMo redirect query parameters
  const resultCode = searchParams.get('resultCode')
  const amountStr = searchParams.get('amount')
  const orderId = searchParams.get('orderId')
  const transId = searchParams.get('transId')
  const message = searchParams.get('message') || 'Giao dịch không thành công hoặc bị hủy.'

  // Kiểm tra trạng thái thanh toán từ MoMo (resultCode === '0' là thành công)
  const isSuccess = resultCode === '0'

  // Load lại profile để cập nhật số dư ví mới nhất nếu thành công
  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfileData,
    enabled: isSuccess,
  })

  useEffect(() => {
    if (isSuccess) {
      refetch() // Cập nhật lại số dư ví mới
    }
  }, [isSuccess, refetch])

  // Tự động chuyển hướng về profile sau 8 giây nếu thành công
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/profile')
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  const amount = amountStr ? parseInt(amountStr, 10) : 0
  const formatVND = (value: number) => value.toLocaleString('vi-VN') + ' VND'

  return (
    <Container className="flex flex-col items-center justify-center pb-16 pt-8 text-foreground relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(55,38,94,0.08)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="flex w-full max-w-[680px] animate-fade-slide-up flex-col items-center space-y-8 relative z-10 text-center">
        
        {/* ICON */}
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-outline/20 bg-surface-container-high shadow-[0_0_20px_rgba(233,221,255,0.3)] md:h-32 md:w-32">
            {isSuccess ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-500 md:h-20 md:w-20" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 md:h-20 md:w-20" />
            )}
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div className="space-y-2">
          <h1 className={`font-serif text-3xl font-bold tracking-tight md:text-4xl ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="mx-auto max-w-md text-base text-on-surface-variant">
            {isSuccess 
              ? 'Giao dịch của bạn đã được xử lý an toàn. Đang chuẩn bị chuyển hướng bạn về trang cá nhân...' 
              : `Rất tiếc, giao dịch không thể hoàn thành. Chi tiết: ${message}`
            }
          </p>
        </div>

        {/* THÔNG TIN CHI TIẾT */}
        {(amount > 0 || orderId || transId) && (
          <div className="w-full space-y-6 rounded-lg border border-outline/10 bg-surface-container p-6 shadow-xl md:p-8">
            <div className="flex flex-col space-y-4">
              {amount > 0 && (
                <div className="flex items-center justify-between border-b border-outline/5 pb-4">
                  <span className="text-sm font-semibold text-on-surface-variant">Số tiền thanh toán</span>
                  <span className="font-serif text-2xl font-bold text-on-surface">{formatVND(amount)}</span>
                </div>
              )}
              {orderId && (
                <div className="flex items-center justify-between border-b border-outline/5 pb-4">
                  <span className="text-sm font-semibold text-on-surface-variant">Mã đơn hàng</span>
                  <span className="font-mono text-sm font-semibold text-on-surface">{orderId}</span>
                </div>
              )}
              {transId && (
                <div className="flex items-center justify-between border-b border-outline/5 pb-4">
                  <span className="text-sm font-semibold text-on-surface-variant">Mã giao dịch MoMo</span>
                  <span className="font-mono text-sm font-semibold text-on-surface">{transId}</span>
                </div>
              )}
              {isSuccess && profileData && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-on-surface-variant">Số dư ví mới</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-500">
                      {profileData.wallet?.balance?.toLocaleString()} Coins
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NÚT ĐIỀU HƯỚNG */}
        <div className="flex w-full max-w-md flex-col gap-4 pt-6 md:flex-row mx-auto justify-center">
          {isSuccess ? (
            <>
              <button 
                onClick={() => navigate('/')}
                className="btn-primary flex-1 py-3 font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                Tiếp tục đọc truyện
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="flex h-[48px] flex-1 items-center justify-center rounded-xl border border-outline/20 bg-surface-container-high font-bold text-on-surface shadow-sm transition-all hover:bg-surface-bright active:scale-95"
              >
                Về Trang cá nhân
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/payment/create')}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base rounded-xl shadow-md"
            >
              <ArrowLeft className="h-4 w-4" /> Thử lại / Chọn gói khác
            </button>
          )}
        </div>

        {isSuccess && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 justify-center">
            <Loader2 className="h-3 w-3 animate-spin" />
            Tự động chuyển hướng sau vài giây...
          </div>
        )}
      </div>
    </Container>
  )
}
