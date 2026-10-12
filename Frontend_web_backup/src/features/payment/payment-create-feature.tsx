import { useState, useEffect } from 'react'
import { Coins, CheckCircle2, Plus, Minus, X, Loader2 } from 'lucide-react'
import Container from '@/components/shared/site/container'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getActiveCoinPackages } from '@/services/coin-package-service'
import { fetchProfileData } from '@/features/profile/services/profile.service'
import { createOrder } from '@/services/payment-service'
import type { MomoRequestType } from './types/payment.types'

export default function PaymentCreateFeature() {

  // Fetch active coin packages
  const {
    data: packages,
    isLoading: isPkgsLoading,
    error: pkgsError,
  } = useQuery({
    queryKey: ['coin-packages-active'],
    queryFn: getActiveCoinPackages,
  })

  // Fetch current user's profile wallet balance
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfileData,
  })

  const currentBalance = profileData?.wallet?.balance || 0

  // States
  const [selectedPkgId, setSelectedPkgId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMomoMethod, setSelectedMomoMethod] = useState<MomoRequestType>('payWithATM')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Sync selected package once loaded
  useEffect(() => {
    if (packages && packages.length > 0) {
      setSelectedPkgId(packages[0].id)
    }
  }, [packages])

  const selectedPkg = packages?.find(p => p.id === selectedPkgId)

  const totalPrice = selectedPkg ? selectedPkg.priceVnd * quantity : 0
  const totalCoins = selectedPkg ? selectedPkg.baseCoins * quantity : 0

  // Format currency
  const formatVND = (amount: number) => amount.toLocaleString('vi-VN') + ' VND'

  const handlePackageChange = (id: string) => {
    setSelectedPkgId(id)
    setQuantity(1)
  }

  // Mutation — 1 bước duy nhất: tạo Order + Payment + nhận payUrl
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
  })

  const handleProceedPayment = async () => {
    if (!selectedPkg) return
    setErrorMsg(null)

    try {
      // Gọi 1 API duy nhất — backend tự tạo Payment PENDING và gọi MoMo
      const order = await createOrderMutation.mutateAsync({
        coinPackageId: selectedPkg.id,
        orderInfo: `Nap ${selectedPkg.baseCoins * quantity} Coins cho tai khoan`,
        requestType: selectedMomoMethod,
        quantity: quantity,
      })

      // Redirect tới trang thanh toán MoMo
      if (order.payUrl) {
        window.location.replace(order.payUrl)
      } else {
        throw new Error('Không nhận được link thanh toán từ cổng MoMo')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Thanh toán thất bại, vui lòng thử lại sau.')
    }
  }

  if (isPkgsLoading || isProfileLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Đang tải cấu hình thanh toán...</span>
      </div>
    )
  }

  if (pkgsError || profileError || !packages || packages.length === 0) {
    return (
      <Container className="py-16 text-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-600 max-w-md mx-auto">
          Không thể tải dữ liệu thanh toán. Vui lòng kiểm tra lại kết nối hoặc đăng nhập lại.
        </div>
      </Container>
    )
  }

  return (
    <>
      <Container className="pb-16 pt-10 text-foreground max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* CỘT TRÁI (8/12) - Các gói nạp */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-on-surface">Chọn mệnh giá</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {packages.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id
                  const displayQty = isSelected ? quantity : 1
                  const displayPrice = pkg.priceVnd * displayQty

                  return (
                    <label key={pkg.id} className="group relative cursor-pointer h-full flex flex-col">
                      <input
                        checked={isSelected}
                        onChange={() => handlePackageChange(pkg.id)}
                        className="peer sr-only"
                        name="recharge"
                        type="radio"
                      />
                      <div className="relative flex flex-1 flex-col items-center justify-between rounded-xl border border-outline/20 bg-surface-container-low p-4 sm:p-5 transition-all hover:bg-surface-container hover:shadow-md peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-sm peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2 peer-checked:ring-offset-background">

                        {/* Dấu check - Định vị tuyệt đối ở góc phải trên */}
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-5 w-5 text-primary opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                        </div>

                        {/* PHẦN TRÊN: Icon -> Coin -> Giá */}
                        <div className="flex flex-col items-center pt-6 pb-4 w-full">
                          <div className="flex flex-col items-center gap-1 w-full text-center">
                            <p className="text-2xl font-extrabold text-on-surface tracking-tight flex items-center justify-center gap-1">
                              {pkg.baseCoins.toLocaleString()}
                              <span className="text-sm font-semibold text-on-surface-variant">Coins</span>
                            </p>

                            <p className="text-lg font-bold text-primary mt-1">
                              {formatVND(displayPrice)}
                            </p>
                          </div>
                        </div>

                        {/* PHẦN DƯỚI: Nút số lượng */}
                        <div className="mt-auto w-full pt-4 border-t border-outline/10 flex justify-center">
                          <div className={`flex items-center gap-4 rounded-full border bg-surface p-1 transition-colors ${isSelected ? 'border-primary/40 shadow-sm' : 'border-outline/20'}`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                if (!isSelected) {
                                  handlePackageChange(pkg.id)
                                } else {
                                  setQuantity(Math.max(1, quantity - 1))
                                }
                              }}
                              disabled={isSelected && quantity <= 1}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high disabled:opacity-50 transition-colors text-on-surface"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="w-8 text-center font-bold text-on-surface">{displayQty}</span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                if (!isSelected) {
                                  setSelectedPkgId(pkg.id)
                                  setQuantity(2)
                                } else {
                                  setQuantity(quantity + 1)
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </label>
                  )
                })}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (4/12) - Sidebar */}
          {selectedPkg && (
            <div className="lg:col-span-4 sticky top-24 self-start h-fit space-y-6">

              <section className="rounded-2xl border border-outline/10 bg-surface-container-low shadow-sm overflow-hidden">

                {/* Phần 1: Ví tạm tính */}
                <div className="p-4 sm:p-5 border-b border-outline/10 bg-surface-container/30">
                  <div className="rounded-xl bg-surface border border-outline/10 p-5 shadow-sm">

                    {/* LINE 1: TRÁI (Ví tạm tính) - PHẢI (a + b) */}
                    <div className="mb-2 flex items-center justify-between text-sm font-bold text-on-surface-variant">
                      <span className="uppercase tracking-wider text-xs">Ví tạm tính</span>
                      <div className="flex items-center gap-1.5">
                        <span>{currentBalance.toLocaleString()}</span>
                        <span>+</span>
                        <span className="text-primary">{totalCoins.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* C (TỔNG SAU NẠP LỚN KÈM ICON) - Căn phải */}
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {(currentBalance + totalCoins).toLocaleString()}
                      </span>
                      <Coins className="h-7 w-7" strokeWidth={2.5} />
                    </div>

                  </div>
                </div>

                {/* Phần 2: Chi tiết thanh toán */}
                <div className="p-5 sm:p-6">
                  <h2 className="font-serif text-xl font-bold text-on-surface mb-4">Chi tiết giao dịch</h2>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Gói nạp:</span>
                      <span className="font-bold text-on-surface text-base">{selectedPkg.baseCoins.toLocaleString()} Coins</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Đơn giá:</span>
                      <span className="font-semibold text-on-surface">{formatVND(selectedPkg.priceVnd)}</span>
                    </div>


                    <div className="flex justify-between items-center mt-4">
                      <span className="text-on-surface-variant">Số lượng:</span>
                      <div className="flex items-center gap-3 rounded-lg border border-outline/20 bg-surface p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-semibold text-on-surface">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-container hover:bg-surface-container-high transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GỘP TỔNG VÀO NÚT THANH TOÁN */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setSelectedMomoMethod('payWithATM')
                        setIsModalOpen(true)
                      }}
                      className="btn-primary flex w-full items-center justify-between px-5 py-4 text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <span className="font-semibold text-base flex items-center gap-2">
                        Thanh toán
                      </span>
                      <span className="font-extrabold">{formatVND(totalPrice)}</span>
                    </button>
                    <p className="mt-4 text-center text-xs font-medium text-on-surface-variant">
                      Bằng việc bấm Thanh toán, bạn đồng ý với <a className="text-primary hover:underline font-semibold" href="#">Điều khoản dịch vụ</a> của chúng tôi.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          )}

        </div>
      </Container>

      {/* MODAL CHỌN PHƯƠNG THỨC THANH TOÁN */}
      {isModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-outline/10 relative">

            {/* Nút đóng */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-on-surface mb-2">Xác nhận thanh toán</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Bạn đang thanh toán <span className="font-bold text-primary">{formatVND(totalPrice)}</span> cho <span className="font-bold text-tertiary">{totalCoins.toLocaleString()} Coins</span>.
            </p>



            <div className="mb-6 flex items-center gap-4 rounded-xl border border-outline/20 bg-surface-container-low p-4">
              <div className="flex min-w-0 flex-col">
                <span className="text-base font-bold text-on-surface">Thẻ ATM / Internet Banking</span>
                <span className="text-xs font-medium text-on-surface-variant">
                  Thanh toán bằng thẻ ATM / Internet Banking
                </span>
              </div>
            </div>

            {errorMsg && (
              <p className="mb-4 text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                ⚠ {errorMsg}
              </p>
            )}

            <button
              onClick={handleProceedPayment}
              disabled={createOrderMutation.isPending}
              className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-lg rounded-xl shadow-md disabled:opacity-50"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-on-primary" /> Đang tạo giao dịch...
                </>
              ) : (
                'Tiến hành thanh toán'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}