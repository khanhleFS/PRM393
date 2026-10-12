import type { Smartphone } from 'lucide-react'

export interface PaymentMomoCallbackDTO {
  orderId: string
  requestId: string
  resultCode: string
  transId?: string
  message?: string
}

export type MomoRequestType = 'captureWallet' | 'payWithATM' | 'payWithCC'

export interface PaymentMomoCreateResponseDTO {
  payUrl: string
  orderId: string
}

export interface OrderRequestDTO {
  coinPackageId: string
  orderInfo?: string
  requestType?: MomoRequestType
  quantity?: number
}

export interface OrderResponseDTO {
  id: string
  userId: string
  username: string
  coinPackageId: string
  coinPackageName: string
  amountVnd: number
  coins: number
  status: string
  createdAt: string
  /** Link thanh toán MoMo — chỉ có khi vừa tạo order, null khi query lại */
  payUrl?: string | null
}

export interface MomoPaymentMethod {
  value: MomoRequestType
  title: string
  description: string
  icon: typeof Smartphone
}
