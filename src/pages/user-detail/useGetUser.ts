import { useQuery } from '@tanstack/react-query'
import { userKeys } from '../../lib/queryKeys'
import { api } from '@/lib/api'

export function useGetUser(username: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(username),
    queryFn: () => api.getUser(username),
    enabled: !!username,
  })
}
