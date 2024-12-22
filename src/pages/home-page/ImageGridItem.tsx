import { Photo } from '@/lib/schemas'
import { Blurhash } from 'react-blurhash'

// This is a number you can play around with
// you might even want different ones for desktop vs mobile depending on the images you're serving
const MULTIPLIER_TO_TURN_ASPECT_RATIO_INTO_ROWS_TO_SPAN = 22

export function ImageGridItem({
  image,
  shouldLazyLoad,
}: {
  image: Photo
  shouldLazyLoad: boolean
}) {
  const rowsToSpanBasedOnAspectRatio = Math.ceil(
    (image.height / image.width) *
      MULTIPLIER_TO_TURN_ASPECT_RATIO_INTO_ROWS_TO_SPAN
  )

  const paddingBottom = `${(image.height / image.width) * 100}%`

  return (
    <div
      className="relative h-fit overflow-hidden rounded-lg bg-gray-100"
      style={{
        gridRow: `span ${rowsToSpanBasedOnAspectRatio}`,
      }}
    >
      <div className="relative w-full" style={{ paddingBottom }}>
        {image.blur_hash ? (
          <div className="absolute inset-0">
            <Blurhash hash={image.blur_hash} width="100%" height="100%" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}

        <img
          srcSet={`
            ${image.urls.small} 400w,
            ${image.urls.regular} 1080w
          `}
          sizes="(min-width: 1024px) 33vw,
                 (min-width: 768px) 50vw,
                 100vw"
          src={image.urls.small}
          alt={image.description || 'Unsplash photo'}
          className="absolute inset-0 h-full w-full object-cover"
          loading={shouldLazyLoad ? 'lazy' : 'eager'}
        />
      </div>
    </div>
  )
}
