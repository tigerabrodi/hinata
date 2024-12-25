import { useQuery } from '@tanstack/react-query'
import { type SearchParams } from '@/lib/schemas'
import { userKeys } from '@/lib/queryKeys'
import { api } from '@/lib/api'

type UseGetUserPhotosParams = {
  username: string | undefined
  queryParams: Pick<SearchParams, 'page' | 'perPage'>
}

export function useGetUserPhotos({
  username,
  queryParams,
}: UseGetUserPhotosParams) {
  return useQuery({
    queryKey: userKeys.photos(username),
    queryFn: () => api.getUserPhotos({ username, queryParams }),
    enabled: !!username,
  })
}
