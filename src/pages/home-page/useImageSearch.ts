import { useInfiniteQuery } from '@tanstack/react-query'
import { type SearchParams } from '@/lib/schemas'
import { photoKeys } from '@/lib/queryKeys'
import { api } from '@/lib/api'
import { STALE_TIME } from '@/lib/constants'
import { useEffect } from 'react'

export function useImageSearch(
  params: Omit<SearchParams, 'page'>,
  initialPage = 1
) {
  const query = useInfiniteQuery({
    queryKey: photoKeys.searchResults({
      query: params.query,
      orderBy: params.orderBy,
      color: params.color,
      perPage: params.perPage,
    }),
    queryFn: ({ pageParam }) =>
      api.searchPhotos({
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const hasNoMorePages = lastPageParam >= lastPage.total_pages
      if (hasNoMorePages) {
        return undefined
      }
      return lastPageParam + 1
    },
    staleTime: STALE_TIME.SEARCH_RESULTS,
    enabled: !!params.query,
  })

  useEffect(() => {
    if (!query.data || !params.query) return

    const loadUpToInitialPage = async () => {
      const loadedPages = query.data.pages.length

      if (loadedPages < initialPage) {
        try {
          await query.fetchNextPage()
        } catch (error) {
          // TODO: handle error
          console.error('Error loading pages:', error)
        }
      }
    }

    loadUpToInitialPage()
  }, [query.data?.pages.length, initialPage, params.query, query.fetchNextPage])

  return query
}
