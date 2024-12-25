import { ROUTES } from '@/lib/constants'
import { generatePath, Link, Navigate, useParams } from 'react-router'
import { usePhotoDetail } from './usePhotoDetail'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'
import { SEARCH_FORM_HEIGHT } from '@/layouts/root/SearchForm'
import { Badge } from '@/components/ui/badge'
import { cn, handleDownload } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { breakpoints } from '@/hooks/useMediaQuery'
import { useCallback, useEffect, useState } from 'react'
import { ZoomOutIcon } from '@/icons/ZoomOut'
import { ZoomInIcon } from '@/icons/ZoomIn'
import { Blurhash } from 'react-blurhash'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { userKeys } from '@/lib/queryKeys'
import {
  USER_DETAIL_PHOTOS_PAGE_INDEX,
  USER_DETAIL_PHOTOS_PER_PAGE,
} from '../user-detail'
import { ProfileImage } from '@/components/core/ProfileImage'

const getOptimizedFullscreenUrl = (rawUrl: string) => {
  // Typical 4K monitor width is 3840px, but 2560px is often sufficient
  // dpr=2 for retina displays
  // fm=jpg for broad compatibility
  // q=85 for good quality/size balance
  // fit=max to maintain aspect ratio
  // auto=format for browser-appropriate format
  return `${rawUrl}&w=2560&dpr=2&fm=jpg&q=85&fit=max&auto=format`
}

function PhotoDetailSkeleton() {
  return (
    <main className="container relative mx-auto flex w-full flex-col gap-4 pb-16">
      {/* Header shimmer */}
      <div className="flex items-center gap-2 p-4">
        <div className="size-10 animate-pulse rounded-full bg-muted" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Image shimmer */}
      <div className="mx-auto aspect-square w-full max-w-[900px] animate-pulse rounded-lg bg-muted md:aspect-[2/3]" />
    </main>
  )
}

export function PhotoDetailPage() {
  const { id } = useParams()

  const isDesktop = useMediaQuery(breakpoints.md)
  const { data: image, isLoading, isError } = usePhotoDetail(id)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [optimizedFullscreenUrl, setOptimizedFullscreenUrl] = useState<
    string | null
  >(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isFullscreen])

  useEffect(() => {
    // This fetch is to work around the unsplash request headers no cache
    // In the real world, you only need `new Image()` to fetch, download and then store image in the browser cache
    if (isDesktop && image && !optimizedFullscreenUrl) {
      fetch(getOptimizedFullscreenUrl(image.urls.raw), {
        headers: {
          'Cache-Control': 'max-age=31536000',
          Pragma: 'cache',
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob)
          setOptimizedFullscreenUrl(objectUrl)
        })
        .catch((error) => {
          console.error('Error fetching optimized fullscreen image', error)
        })
    }

    return () => {
      if (optimizedFullscreenUrl) {
        URL.revokeObjectURL(optimizedFullscreenUrl)
      }
    }
  }, [image, isDesktop, optimizedFullscreenUrl])

  const handleFullscreenToggle = useCallback(() => {
    if (isDesktop) {
      setIsFullscreen((prev) => {
        return !prev
      })
    }
  }, [isDesktop])

  if (!id) {
    return <Navigate to={ROUTES.home} />
  }

  if (isLoading || !image) {
    return <PhotoDetailSkeleton />
  }

  if (isError) {
    return <div>Error</div>
  }

  function prefetchUserDetail() {
    if (!image) return

    void queryClient.prefetchQuery({
      queryKey: userKeys.detail(image.user.username),
      queryFn: () => api.getUser(image.user.username),
    })

    void queryClient.prefetchQuery({
      queryKey: userKeys.photos(image.user.username),
      queryFn: () =>
        api.getUserPhotos({
          username: image.user.username,
          queryParams: {
            page: USER_DETAIL_PHOTOS_PAGE_INDEX,
            perPage: USER_DETAIL_PHOTOS_PER_PAGE,
          },
        }),
    })
  }

  return (
    <main className="container relative mx-auto flex w-full flex-col pb-16">
      <div
        className="sticky z-20 flex items-center justify-between bg-background p-4 md:static md:px-0"
        onMouseOver={prefetchUserDetail}
        style={{
          top: !isDesktop ? SEARCH_FORM_HEIGHT : undefined,
        }}
      >
        <Link
          to={generatePath(ROUTES.user, { username: image.user.username })}
          className="flex items-center gap-2"
          aria-label={`Go to ${image.user.name}'s profile`}
        >
          <ProfileImage
            profileImage={image.user.profile_image}
            className="size-10"
            sizes="40px"
            alt=""
          />

          <div className="flex flex-col">
            <span className="font-bold text-primary">{image.user.name}</span>
            <span className="text-sm text-muted-foreground">
              {image.user.username}
            </span>
          </div>
        </Link>

        <Button
          variant="outline"
          className="hidden md:inline-flex"
          onClick={() =>
            handleDownload({
              imageDescription: image.description || 'Unsplash photo',
              url: image.urls.regular,
            })
          }
          aria-label={`Download ${image.description || 'unsplash photo'}`}
        >
          <DownloadIcon />
          <span className="hidden font-bold md:block">Download</span>
        </Button>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
          <button
            className="group relative max-h-screen w-screen cursor-zoom-out"
            aria-label="Zoom out of full image"
            onClick={handleFullscreenToggle}
            style={{
              aspectRatio: `${image.width} / ${image.height}`,
              // width / height = aspect ratio
              // Let's say we have an image that's 4000x3000.
              // 4000 / 3000 = 1.33
              // This number tells us "for every 1 unit of height, we need 1.33 units of width"
              // Then 100vh represents the full viewport height:
              // If viewport is 800px high, 100vh = 800px
              // Finally, calc(100vh * 1.33):
              // 800px * 1.33 = 1064px
              // This tells us "to maintain this image's proportions at full viewport height, we need 1064px of width"
              maxWidth: `min(100vw, calc(100vh * ${image.width} / ${image.height}))`,
            }}
          >
            {image.blur_hash ? (
              <div className="absolute inset-0">
                <Blurhash hash={image.blur_hash} width="100%" height="100%" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}

            <img
              src={
                optimizedFullscreenUrl ||
                getOptimizedFullscreenUrl(image.urls.raw)
              }
              alt={image.description || 'Unsplash photo'}
              className="max-w-screen relative z-10 max-h-screen object-contain"
            />

            <ZoomOutIcon className="absolute right-4 top-4 z-10 size-7 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        </div>
      )}

      <div
        className={cn('mx-auto w-full max-w-[900px]', {
          'group relative': isDesktop,
        })}
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
        }}
      >
        <button
          className="group relative h-full w-full cursor-zoom-in"
          aria-label="Zoom into full image"
          onClick={handleFullscreenToggle}
        >
          <ZoomInIcon className="absolute right-4 top-4 size-7 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <img
            srcSet={`
            ${image.urls.small} 400w,
            ${image.urls.regular} 1080w
          `}
            // From 768px and up, 900px or less if 100vw is less than 900px
            sizes="(min-width: 768px) min(900px, 100vw), 100vw"
            src={image.urls.regular}
            alt={image.description || 'Unsplash photo'}
            className="h-full w-full object-cover"
          />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4 md:px-0">
        {/* city and country can still be null */}
        {image.location && image.location.city && image.location.country && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">Location: </span>
            <span className="text-primary">
              {image.location.city}, {image.location.country}
            </span>
          </div>
        )}

        {image.tags && (
          <div className="flex max-w-[800px] flex-wrap items-center gap-2">
            {image.tags.map((tag) => (
              <Badge
                key={tag.title}
                variant="outline"
                className="rounded-sm bg-muted text-sm text-muted-foreground"
              >
                {tag.title}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-5 right-5 md:hidden"
        onClick={() =>
          handleDownload({
            imageDescription: image.description || 'Unsplash photo',
            url: image.urls.regular,
          })
        }
        aria-label={`Download ${image.description || 'unsplash photo'}`}
      >
        <DownloadIcon />
      </Button>
    </main>
  )
}
