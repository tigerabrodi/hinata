# Hinata 🔍

Built with Unsplash API. A site where you can search and download images.

Had a lot of fun geeking out on performance.

https://github.com/user-attachments/assets/d489615c-454b-4352-af7a-f43c5ea487ee

# PS...

If it isn't working, the rate limiting has been hit.

# Get it up and running

First, clone the repo and install the dependencies:

```bash
pnpm install
```

Create a `.env.local` file and add the following:

```bash
VITE_UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>
```

Run the development server:

```bash
pnpm dev
```

# Explanations

<details>
  <summary>🍿 Image performance</summary>

---

# Quick snippet

```jsx
<img
  srcSet={`
            ${image.urls.small} 400w,
            ${image.urls.regular} 1080w
          `}
  sizes="(min-width: 1024px) 33vw,
         (min-width: 768px) 50vw,
         100vw"
  src={image.urls.small}
  alt={image.description || `Photo by ${image.user.name}`}
  className="absolute inset-0 h-full w-full object-cover"
  loading={shouldLazyLoad ? 'lazy' : 'eager'}
  decoding="async"
  fetchPriority={!shouldLazyLoad ? 'high' : 'auto'}
/>
```

You may look at this and go wow, I don't understand what's happening here besides the src and alt tag.

Let's dig into the details.

# srcSet and sizes

With `srcSet`, we tell the browser which image to use based on the screen width. If you look at the example above, `small` will be used if the screen width is less than 400px. Otherwise, `regular` will be used. Small and regular in this case are different sizes of the same image.

On bigger screens, to keep it crisp, you want to use a bigger image.

`sizes` is used to tell the browser roughly the width of the image depending on the screen width.

This however, isn't the entire story. There is something called Device Pixel Ratio. To explain this in simple words, the higher the DPR, the more physical pixels there are on the screen. If DPR is 2, it means for every pixel, there are 2 physical pixels.

That's why modern screens are so crisp.

Summary: sizes and srcSet help us use the right image for the right screen size.

# Lazy loading

When you load an image, you need to request, download and decode it. This is work for the browser. There is no need to do this work and interfere with more important work if the image isn't needed.

If the user must scroll or interact (e.g. carousel) for the image to become visible, it should be lazy loaded.

When the image becomes visible, the browser will load the image.

Under the hood, it uses intersection observer to detect when the image is visible.

# Fetch priority

`fetchPriority` is used to tell the browser the priority of the image.

If the image is immediately visible (think hero section), it should be high priority. Other images should not just be lazy loaded, but also low priority.

Low priority images is like telling the browser "load this image when you have time, otherwise leave it for later".

What you don't want to happen is high priority images taking longer because low priority images are also being fetched and decoded.

# Decoding

`decoding="async"` is used to tell the browser to decode the image asynchronously. This means the image will be decoded in the background while the main thread is doing other things.

You might wonder, what's decoding?

When the browser loads an image, it gets the image as a compressed file. Decoding is the process of decompressing the image and turning it into a bitmap. A bitmap is a map of pixels where each pixel has a color and a position. This is necessary so the browser can display the image.

# Preloading images

Have you ever wondered why despite having fetched the data, the image still takes a while to load?

When the browser sees the image tag, it needs to:

1. Fetch the image
2. Download the image
3. Decode the image

We can do this work ahead of time by using `new Image()` and setting the `src` to the image URL.

```js
const image = new Image()
image.src = {image url}
```

`new Image()` is a way to create a new image object. It doesn't do anything else.

When you do `image.src = {image url}`, the browser will fetch, download and decode the image.

When the browser then sees the image tag, it can get it directly from the cache instead!

You can listen to `image.onload` to know when the image is ready to be used. In react, this would be `onLoad`.

</details>

<details>
  <summary>🍿 Blur hash</summary>

---

If you dig into the code, you'll see that I'm using blur hash if the image hasn't loaded yet.

```jsx
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
    alt={image.description || `Photo by ${image.user.name}`}
    className={cn(
      'absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-in-out',
      {
        'opacity-100': isImageLoaded,
      }
    )}
    loading={shouldLazyLoad ? 'lazy' : 'eager'}
    decoding="async"
    fetchPriority={!shouldLazyLoad ? 'high' : 'auto'}
    onLoad={() => setIsImageLoaded(true)}
  />
</Link>
```

Blur hash is a hash of the image that is used to display a blurred version of the image while the image is loading. This is given to use from the server.

The server generates the blur hash by using an encoding algorithm. This encoder turns the image into a grid, analyzes the colors and then encodes them into a string using a base83 encoding.

This takes 20-30 bytes to send compared to the image which is 100s of KBs. This provides a nice UX before the real image is loaded.

</details>

<details>
  <summary>🍿 Prefetching data</summary>

---

I'm using React Query to fetch and manage server state.

One of the cool things you can do to improve the perceived performance of your site is to prefetch data. When a user hovers over a link, you can prefetch the data for the link they are hovering over.

This way, when they navigate to the next page, the data is already ready to be used.

With React Query, we prefetch the data and store it in the cache.

An example:

```js
function prefetchData() {
  void queryClient.prefetchQuery({
    queryKey: photoKeys.detail(image.id),
    queryFn: () => api.getPhotoDetail(image.id),
  })

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
```

</details>

<details>
  <summary>🍿 Infinite loading</summary>

---

How we manage infinite loading is by using `useInfiniteQuery` hook from React Query.

It's honestly the first time I use it.

It's really cool how simple things are:

```ts
export function useImageSearch({ params }: { params: SearchParams }) {
  const query = useInfiniteQuery({
    queryKey: photoKeys.searchResults({
      query: params.query,
      orderBy: params.orderBy,
      color: params.color,
      perPage: params.perPage,
    }),
    queryFn: ({ pageParam }) =>
      api.searchPhotos({
        ...params,
        page: pageParam,
      }),
    initialPageParam: params.page,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const hasNoMorePages = lastPageParam >= lastPage.total_pages
      if (hasNoMorePages) {
        return undefined
      }
      return lastPageParam + 1
    },
    enabled: !!params.query,
  })

  useEffect(() => {
    if (!query.data || !params.query) return

    const loadUpToInitialPage = async () => {
      const loadedPages = query.data.pages.length

      if (loadedPages < params.page) {
        try {
          await query.fetchNextPage()
        } catch (error) {
          // TODO: handle error
          console.error('Error loading pages:', error)
        }
      }
    }

    loadUpToInitialPage().catch(console.error)
  }, [params.page, params.query, query])

  return query
}
```

One thing I had to wrap my head around is that page param is managed by the hook itself.

To get the initial data if page isn't 1, we need to keep fetching the next page until we get to the initial page.

To be honest, I couldn't find a better way to do this. I'm still not sure if it's the best way to go about it. But this works.

Error handling is still missing for that specific case as you can see. Because it's a side project I just let it be. I guess in the real world this would be a product discussion to have about how we manage this specific edge case.

</details>

<details>
  <summary>🍿 Geeking out on performance</summary>

---

I know this has all been about performance. I love it. It's like never ending detective work on how to make things faster and improve the user experience.

If you look at the image grid, you'll see that really analyzing when and which image to lazy load.

It's also really fun when you see the network tab and when the images are actually loaded:

```jsx
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
    <div className="grid grid-cols-1 grid-rows-[0px] gap-[18px] md:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
```

</details>

<details>
  <summary>🍿 Masonry layout wtf?!</summary>

---

To be fair, it isn't real masonry layout.

What I'm doing is letting each grid item span a number of rows based on the aspect ratio of the image.

Starting off, on the image grid itself, the one that wraps all the items, I set the grid rows to 0px. This means that the default height of the grid items is 0px.

It's useful when you want the grid item height to grow depending on the content. Which is exactly what we want here.

```jsx
<div className="grid grid-cols-1 grid-rows-[0px] gap-4 md:grid-cols-2 lg:grid-cols-3" />
```

Let's dive into the grid item itself.

The way we decide to span number of rows (height of grid item) is by doing this:

```js
// We do height / width to maintain the right proportions for height specifically
// e.g height 800px and width 1200px
// 800 / 1200 = 0.66
// 0.66 means for every 1px of width, there are 0.66px of height
// 0.66 * 22 = 14.66
// Math.ceil(14.66) = 15
// So the image will span 15 rows
const rowsToSpanBasedOnAspectRatio = Math.ceil(
  (image.height / image.width) *
    MULTIPLIER_TO_TURN_ASPECT_RATIO_INTO_ROWS_TO_SPAN
)
```

`MULTIPLIER_TO_TURN_ASPECT_RATIO_INTO_ROWS_TO_SPAN` is a number you can play around with. 22 seems to work well on both mobile and desktop.

Now, this gives us the number of rows to span for the grid item itself.

One problem we have here is that this isn't totally accurate still. It's a rough calculation. It's off by 2-5px in height a lot when comparing it to the actual aspect ratio.

Now, the grid item itself already has a specified width since it's a grid item.

The other thing we have to do is to set the height of the actual link which wraps the image. This will be the accurate height. We do this by using padding bottom with percentage. When you use padding bottom with percentage, it's calculated based on the width.

```js
const paddingBottom = `${(image.height / image.width) * 100}%`
```

By doing this, we can get the accurate height of the grid item.

One issue here is that the grid item itself is a bit too big. This looks weird with the gap. A trick here is to use `fit-content` on the grid item. This will make the grid item take height necessary, but behave like `min-content`.

These are the full elements:

```jsx
<figure
  className="group relative flex h-fit flex-col gap-3 overflow-hidden rounded-lg"
  onMouseOver={prefetchData}
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
      alt={image.description || `Photo by ${image.user.name}`}
      className={cn(
        'absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-in-out',
        {
          'opacity-100': isImageLoaded,
        }
      )}
      loading={shouldLazyLoad ? 'lazy' : 'eager'}
      decoding="async"
      fetchPriority={!shouldLazyLoad ? 'high' : 'auto'}
      onLoad={() => setIsImageLoaded(true)}
    />
  </Link>

  {desktopHoverOverlay}
  <figcaption className="sr-only">Photo by {image.user.name}</figcaption>

  {mobileFooter}
</figure>
```

</details>

# Improvements that could be made

- Of course, we could add testing.
- Let you edit the photo before downloading it.
- Prefetching data on mobile using intersection observer.
- Delay before prefetching in case user hovers multiple images very fast, if the cursor is on an image more than 100ms, let's then prefetch, this would be more optimized tbf.
- Better error handling

# Tech

Built with:

- React
- React Query
- React Router 7
- Shadcn UI
- Tailwind CSS
- TypeScript
- Vite
- Unsplash API
