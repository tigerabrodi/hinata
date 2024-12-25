import { DEFAULT_QUERY_PARAM_VALUES } from '@/lib/constants'
import { ImageGridItem } from './ImageGridItem'
import { Photo } from '@/lib/schemas'
import { breakpoints, useMediaQuery } from '@/hooks/useMediaQuery'

export type ImageWithPageIndex = {
  image: Photo
  pageIndex: number
}

export function ImageGrid({
  images,
}: {
  images: Array<ImageWithPageIndex> | Array<Photo>
}) {
  const isDesktop = useMediaQuery(breakpoints.md)

  return (
    <div className="grid grid-cols-1 grid-rows-[0px] gap-4 md:grid-cols-2 lg:grid-cols-3">
      {images.map((data, index) => {
        // On mobile we show a single column layout
        const isImageAmongFirstResults = index < 3
        const shouldLazyLoadOnMobile = isImageAmongFirstResults && !isDesktop

        const isImageWithPageIndex = 'pageIndex' in data

        if (isImageWithPageIndex) {
          const { image, pageIndex } = data

          const isImageAmongPaginatedResults =
            pageIndex + 1 !== DEFAULT_QUERY_PARAM_VALUES.page

          // On home page we typically get away with showing a lot of images in the first page
          const shouldLazyLoadOnDesktop = isImageAmongPaginatedResults

          const shouldLazyLoad =
            shouldLazyLoadOnMobile || shouldLazyLoadOnDesktop

          return (
            <ImageGridItem
              key={`${image.id}-${pageIndex}`}
              image={image}
              // Optimization to lazy load images that are not the first page
              shouldLazyLoad={shouldLazyLoad}
            />
          )
        }

        // On profile page
        // All images aren't visible directly on desktop
        // First 6 images are usually visible
        const shouldLazyLoadOnDesktop = isDesktop && index > 5

        const shouldLazyLoad = shouldLazyLoadOnMobile || shouldLazyLoadOnDesktop

        return (
          <ImageGridItem
            key={data.id}
            image={data}
            shouldLazyLoad={shouldLazyLoad}
          />
        )
      })}
    </div>
  )
}
