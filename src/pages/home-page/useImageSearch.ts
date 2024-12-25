import { useInfiniteQuery } from '@tanstack/react-query'
import { type SearchParams } from '@/lib/schemas'
import { photoKeys } from '@/lib/queryKeys'
import { api } from '@/lib/api'
import { useEffect } from 'react'

export function useImageSearch({ params }: { params: SearchParams }) {
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
    initialPageParam: params.page,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const hasNoMorePages = lastPageParam >= lastPage.total_pages
      if (hasNoMorePages) {
        return undefined
      }
      return lastPageParam + 1
    },
    enabled: !!params.query,
  })

  useEffect(() => {
    if (!query.data || !params.query) return

    const loadUpToInitialPage = async () => {
      const loadedPages = query.data.pages.length

      if (loadedPages < params.page) {
        try {
          await query.fetchNextPage()
        } catch (error) {
          // TODO: handle error
          console.error('Error loading pages:', error)
        }
      }
    }

    loadUpToInitialPage().catch(console.error)
  }, [params.page, params.query, query])

  return query
}
