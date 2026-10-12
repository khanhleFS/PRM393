export interface CoinCreateResponseDTO {
  id: string
  name: string
  priceVnd: number
  baseCoins: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CoinCreateRequestDTO {
  name: string
  priceVnd: number
  baseCoins: number
  isActive: boolean
}
