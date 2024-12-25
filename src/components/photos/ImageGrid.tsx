import { DEFAULT_QUERY_PARAM_VALUES } from '@/lib/constants'
import { ImageGridItem } from './ImageGridItem'
import { Photo } from '@/lib/schemas'

export type ImageWithPageIndex = {
  image: Photo
  pageIndex: number
}

export function ImageGrid({
  images,
}: {
  images: Array<ImageWithPageIndex> | Array<Photo>
}) {
  return (
    <div className="grid grid-cols-1 grid-rows-[0px] gap-[18px] md:grid-cols-2 md:gap-4 lg:grid-cols-3">
      {images.map((data) => {
        const isImageWithPageIndex = 'pageIndex' in data

        if (isImageWithPageIndex) {
          const { image, pageIndex } = data

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
        }

        return (
          <ImageGridItem key={data.id} image={data} shouldLazyLoad={false} />
        )
      })}
    </div>
  )
}
