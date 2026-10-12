import { api } from '@/lib/api'

/**
 * Uploads an image file to the Backend Cloudinary endpoint.
 * @param file The image file to upload.
 * @returns Promise resolving to the Cloudinary image URL.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // Backend response standard is ApiResponse<String> where result is the URL
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  
  throw new Error(response.data?.message || 'Upload ảnh thất bại')
}
