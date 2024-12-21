import { Photo } from '@/lib/schemas'
import { Blurhash } from 'react-blurhash'

export function ImageGridItem({
  image,
  shouldLazyLoad,
}: {
  image: Photo
  shouldLazyLoad: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-100">
      <div className="relative aspect-[3/2] w-full">
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
