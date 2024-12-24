import { api } from '@/lib/api'
import { photoKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function usePhotoDetail(id: string | undefined) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => api.getPhotoDetail(id),
    enabled: !!id,
  })
}
