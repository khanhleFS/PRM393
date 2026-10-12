import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllCoinPackagesAdmin,
  createCoinPackage,
  updateCoinPackage,
  deleteCoinPackage,
  toggleCoinPackageStatus
} from '@/services/coin-package-service'
import type { CoinCreateResponseDTO, CoinPackageRequestDTO } from '@/types'

import { PackageHeader } from './components/package-header'
import { PackageCard } from './components/package-card'
import { PackageModal } from './components/package-modal'

export default function PackagesFeature() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CoinCreateResponseDTO | null>(null)

  // Queries
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: getAllCoinPackagesAdmin,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (request: CoinPackageRequestDTO) => createCoinPackage(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-packages'] })
      setShowModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CoinPackageRequestDTO }) =>
      updateCoinPackage(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-packages'] })
      setShowModal(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoinPackage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-packages'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleCoinPackageStatus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-packages'] })
    },
  })

  const openAddModal = () => {
    setEditingPackage(null)
    setShowModal(true)
  }

  const openEditModal = (pkg: CoinCreateResponseDTO) => {
    setEditingPackage(pkg)
    setShowModal(true)
  }

  const handleSave = (payload: CoinPackageRequestDTO) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, request: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói nạp này không?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PackageHeader onAddClick={openAddModal} />

      {/* Packages Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onToggle={handleToggle}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal Add / Edit */}
      <PackageModal
        isOpen={showModal}
        editingPackage={editingPackage}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}