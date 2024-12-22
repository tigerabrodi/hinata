import { Photo } from '@/lib/schemas'
import { DEFAULT_QUERY_PARAM_VALUES } from '@/lib/constants'
import { ImageGridItem } from './ImageGridItem'

export type ImageWithPageIndex = {
  image: Photo
  pageIndex: number
}

export function ImageGrid({ images }: { images: Array<ImageWithPageIndex> }) {
  return (
    <div className="grid grid-cols-1 grid-rows-[0px] gap-4 md:grid-cols-2 lg:grid-cols-3">
      {images.map(({ image, pageIndex }) => {
        const isImageAmongPaginatedResults =
          pageIndex + 1 !== DEFAULT_QUERY_PARAM_VALUES.page

        return (
          <ImageGridItem
            key={`${image.id}-${pageIndex}`}
            image={image}
            // Optimization to lazy load images that are not the first page
            shouldLazyLoad={isImageAmongPaginatedResults}
          />
        )
      })}
    </div>
  )
}
