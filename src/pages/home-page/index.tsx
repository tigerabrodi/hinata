import { SearchParams } from '@/lib/schemas'
import { useCallback, useEffect, useRef } from 'react'
import { useImageSearch } from './useImageSearch'
import { DEFAULT_QUERY_PARAM_VALUES, QUERY_PARAMS } from '@/lib/constants'
import { SearchForm } from './SearchForm'
import { ImageGridSkeleton } from './ImageGridSkeleton'
import { ImageGrid, type ImageWithPageIndex } from './ImageGrid'
import { useSearchParams } from 'react-router'

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
  } = useImageSearch(currentParams, currentParams.page)

  const updateParams = useCallback(
    (updates: Partial<SearchParams>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)

        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, String(value))
          } else {
            newParams.delete(key)
          }
        })

        if ('color' in updates || 'orderBy' in updates) {
          newParams.set(
            QUERY_PARAMS.page,
            DEFAULT_QUERY_PARAM_VALUES.page.toString()
          )
        }

        return newParams
      })
    },
    [setSearchParams]
  )

  const handleLoadMore = useCallback(() => {
    fetchNextPage().then(() => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev)
          newParams.set(QUERY_PARAMS.page, String(currentParams.page + 1))
          return newParams
        },
        { replace: true }
      )
    })
  }, [fetchNextPage, setSearchParams, currentParams.page])

  const handleSearch = useCallback(
    (query: string) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set(QUERY_PARAMS.query, query)
        newParams.set(
          QUERY_PARAMS.page,
          DEFAULT_QUERY_PARAM_VALUES.page.toString()
        )
        return newParams
      })
    },
    [setSearchParams]
  )

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
    <main className="container mx-auto flex w-full flex-col gap-6 p-10">
      <h1 className="text-2xl font-bold">Unsplash search</h1>
      <SearchForm
        isLoading={isLoading}
        defaultValue={currentParams.query}
        onSearch={handleSearch}
        orderBy={currentParams.orderBy}
        color={currentParams.color}
        onOrderByChange={(value) => updateParams({ orderBy: value })}
        onColorChange={(value) => updateParams({ color: value })}
      />
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

function SearchResults({
  isLoading,
  hasResults,
  hasNoResults,
  isError,
  itemsCountMessage,
  allImagesWithPages,
  hasNextPage,
  isFetchingNextPage,
  handleLoadMore,
}: {
  isLoading: boolean
  hasResults: boolean
  hasNoResults: boolean
  isError: boolean
  itemsCountMessage: string
  allImagesWithPages: Array<ImageWithPageIndex>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  handleLoadMore: () => void
}) {
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = observerRef.current
    if (!node || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, handleLoadMore])

  if (isLoading) {
    return <ImageGridSkeleton count={DEFAULT_QUERY_PARAM_VALUES.perPage} />
  }

  if (hasResults) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-lg font-bold">{itemsCountMessage}</p>
        <ImageGrid images={allImagesWithPages} />
        {hasNextPage && <div ref={observerRef} className="h-10 w-full" />}
      </div>
    )
  }

  if (hasNoResults) {
    return (
      <div className="flex w-full flex-1 items-center justify-center pt-10 text-center">
        <p className="text-lg font-bold">No results</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 pt-10 text-center">
        <p className="text-lg font-bold">
          An error occurred while fetching images.
        </p>
        <p className="text-sm text-gray-500">Please try again later.</p>
      </div>
    )
  }

  return null
}
