import { SearchParams } from '@/lib/schemas'
import { useCallback } from 'react'
import { useImageSearch } from './useImageSearch'
import { DEFAULT_QUERY_PARAM_VALUES, QUERY_PARAMS } from '@/lib/constants'

import { useSearchParams } from 'react-router'
import { ImageWithPageIndex } from '@/components/photos/ImageGrid'
import { SearchResults } from './SearchResults'

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentParams: SearchParams = {
    query: searchParams.get(QUERY_PARAMS.query) || '',
    page: Number(searchParams.get(QUERY_PARAMS.page)) || 1,
    color:
      (searchParams.get(QUERY_PARAMS.color) as SearchParams['color']) ||
      undefined,
    orderBy:
      (searchParams.get(QUERY_PARAMS.orderBy) as SearchParams['orderBy']) ||
      DEFAULT_QUERY_PARAM_VALUES.orderBy,
    perPage: DEFAULT_QUERY_PARAM_VALUES.perPage,
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useImageSearch({
    params: currentParams,
  })

  const handleLoadMore = useCallback(() => {
    fetchNextPage()
      .then(() => {
        setSearchParams(
          (prev) => {
            const newParams = new URLSearchParams(prev)
            newParams.set(QUERY_PARAMS.page, String(currentParams.page + 1))
            return newParams
          },
          { replace: true }
        )
      })
      .catch((error) => {
        console.error('Error fetching next page', error)
      })
  }, [fetchNextPage, setSearchParams, currentParams.page])

  const allImagesWithPages: Array<ImageWithPageIndex> =
    data?.pages.flatMap((page, pageIndex) =>
      page.results.map((image) => ({
        image,
        pageIndex,
      }))
    ) ?? []

  const hasResults = allImagesWithPages.length > 0
  const hasNoResults = currentParams.query !== '' && !hasResults && !isError

  const firstPage = data?.pages[0]
  const totalItems = firstPage?.total ?? 0
  const loadedItemsCount = allImagesWithPages.length

  const itemsCountMessage = firstPage
    ? `Showing ${loadedItemsCount} of ${totalItems} photos`
    : ''

  return (
    <main className="container mx-auto flex w-full flex-col gap-3 px-4">
      <h1 className="sr-only">Unsplash search</h1>
      <SearchResults
        isLoading={isLoading}
        hasResults={hasResults}
        hasNoResults={hasNoResults}
        isError={isError}
        itemsCountMessage={itemsCountMessage}
        allImagesWithPages={allImagesWithPages}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        handleLoadMore={handleLoadMore}
      />
    </main>
  )
}
