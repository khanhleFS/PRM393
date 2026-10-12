import type { CoinCreateResponseDTO, CoinPackageRequestDTO } from '@/types'

export interface PackageCardProps {
  pkg: CoinCreateResponseDTO
  onToggle: (id: string) => void
  onEdit: (pkg: CoinCreateResponseDTO) => void
  onDelete: (id: string) => void
}

export interface PackageHeaderProps {
  onAddClick: () => void
}

export interface PackageModalProps {
  isOpen: boolean
  editingPackage: CoinCreateResponseDTO | null
  onClose: () => void
  onSave: (payload: CoinPackageRequestDTO) => void
  isPending: boolean
}
