import { useEffect, useRef } from 'react'
import { ImageGridSkeleton } from '../../components/photos/ImageGridSkeleton'
import { DEFAULT_QUERY_PARAM_VALUES } from '@/lib/constants'
import {
  ImageGrid,
  ImageWithPageIndex,
} from '../../components/photos/ImageGrid'

type SearchResultsProps = {
  isLoading: boolean
  hasResults: boolean
  hasNoResults: boolean
  hasNoResultsMessage?: string
  isError: boolean
  itemsCountMessage: string
  allImagesWithPages: Array<ImageWithPageIndex>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  handleLoadMore: () => void
}

export function SearchResults({
  isLoading,
  hasResults,
  hasNoResults,
  isError,
  itemsCountMessage,
  allImagesWithPages,
  hasNextPage,
  isFetchingNextPage,
  handleLoadMore,
  hasNoResultsMessage = 'No results',
}: SearchResultsProps) {
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
  }, [handleLoadMore, hasNextPage, isFetchingNextPage])

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
        <p className="text-lg font-bold">{hasNoResultsMessage}</p>
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
