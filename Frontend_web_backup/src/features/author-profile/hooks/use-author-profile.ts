import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthorProfile, updateAuthorProfile } from '@/services/author-service'
import type { AuthorProfileResponseDTO, AuthorProfileRequestDTO } from '@/types'

// Fallback mock profile data in case API fails
const inMemoryProfile: AuthorProfileResponseDTO = {
  id: "mock-author-1",
  userId: "mock-user-1",
  userEmail: "author@storya.vn",
  penName: "Mộc Thanh Ngư",
  bio: "Nhà văn chuyên sáng tác truyện kỳ ảo, tiên hiệp và khoa học viễn tưởng. Thích ngắm mưa và uống cà phê sữa đá.",
  authorCoinBalance: 12500,
  totalNovels: 3,
  totalChapters: 84,
  totalViews: 34500,
  bankName: "Vietcombank",
  bankAccountNumber: "1023456789",
  bankAccountHolder: "NGUYEN VAN A",
  status: "ACTIVE",
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
}

export const authorProfileKeys = {
  all: ['author-profile'] as const,
}

export function useAuthorProfile() {
  return useQuery({
    queryKey: authorProfileKeys.all,
    queryFn: async () => {
      try {
        return await getAuthorProfile()
      } catch (err) {
        console.warn('API getAuthorProfile failed, falling back to mock data:', err)
        return inMemoryProfile
      }
    },
  })
}

export function useUpdateAuthorProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: AuthorProfileRequestDTO) => updateAuthorProfile(request),
    onSuccess: (data) => {
      // Update local query cache with returned value
      queryClient.setQueryData(authorProfileKeys.all, data)
      void queryClient.invalidateQueries({ queryKey: authorProfileKeys.all })
    },
  })
}
