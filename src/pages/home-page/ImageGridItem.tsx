import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { Photo } from '@/lib/schemas'
import { handleDownload } from '@/lib/utils'
import { DownloadIcon } from 'lucide-react'
import { Blurhash } from 'react-blurhash'
import { generatePath, Link, useLocation } from 'react-router'

// This is a number you can play around with
// you might even want different ones for desktop vs mobile depending on the images you're serving
// 22 seems to work well on both mobile and desktop
const MULTIPLIER_TO_TURN_ASPECT_RATIO_INTO_ROWS_TO_SPAN = 22

const FALLBACK_IMAGE_DESCRIPTION = 'Unsplash photo'

export function ImageGridItem({
  image,
  shouldLazyLoad,
}: {
  image: Photo
  shouldLazyLoad: boolean
}) {
  const location = useLocation()

  const rowsToSpanBasedOnAspectRatio = Math.ceil(
    (image.height / image.width) *
      MULTIPLIER_TO_TURN_ASPECT_RATIO_INTO_ROWS_TO_SPAN
  )

  const paddingBottom = `${(image.height / image.width) * 100}%`

  const desktopHoverOverlay = (
    <div className="pointer-events-none absolute inset-0 hidden bg-primary/50 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
      <div className="mt-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            className="size-8 rounded-full"
            srcSet={`
              ${image.user.profile_image.small} 1x,
              ${image.user.profile_image.medium} 2x,
              ${image.user.profile_image.large} 3x
            `}
            src={image.user.profile_image.small}
            alt=""
          />
          <div className="flex flex-col">
            <Link
              to={generatePath(ROUTES.user, { username: image.user.username })}
              className="pointer-events-auto text-sm font-bold text-primary-foreground hover:underline"
            >
              {image.user.name}
            </Link>
            <p className="text-xs text-primary-foreground/50">
              {image.user.username}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            handleDownload({
              url: image.urls.regular,
              imageDescription: image.description || FALLBACK_IMAGE_DESCRIPTION,
            })
          }
          className="pointer-events-auto"
        >
          <DownloadIcon size={20} />
          <span className="font-bold">Download</span>
        </Button>
      </div>
    </div>
  )

  const mobileHeader = (
    <div className="flex items-center gap-2 md:hidden">
      <img
        className="size-8 rounded-full"
        srcSet={`
              ${image.user.profile_image.small} 1x,
              ${image.user.profile_image.medium} 2x,
              ${image.user.profile_image.large} 3x
            `}
        src={image.user.profile_image.small}
        alt=""
      />
      <div className="flex flex-col">
        <Link
          to={generatePath(ROUTES.user, { username: image.user.username })}
          className="pointer-events-auto text-sm font-bold text-primary hover:underline"
        >
          {image.user.name}
        </Link>
        <p className="text-xs text-primary/50">{image.user.username}</p>
      </div>
    </div>
  )

  const mobileFooter = (
    <Button
      variant="outline"
      onClick={() =>
        handleDownload({
          url: image.urls.regular,
          imageDescription: image.description || FALLBACK_IMAGE_DESCRIPTION,
        })
      }
      className="pointer-events-auto ml-auto md:hidden"
    >
      <DownloadIcon size={20} />
      <span className="font-bold">Download</span>
    </Button>
  )

  return (
    <figure
      className="group relative flex h-fit flex-col gap-3 overflow-hidden rounded-lg"
      style={{
        gridRow: `span ${rowsToSpanBasedOnAspectRatio}`,
      }}
    >
      {mobileHeader}

      {/* Link by default are inline elements that won't span the full width of the parent */}
      {/* Block span full width of parent and start on new lines */}
      <Link
        to={generatePath(ROUTES.photoDetail, { id: image.id })}
        state={{ background: location }}
        className="relative block w-full"
        style={{ paddingBottom }}
      >
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
      </Link>

      {desktopHoverOverlay}
      <figcaption className="sr-only">Photo by {image.user.name}</figcaption>

      {mobileFooter}
    </figure>
  )
}
