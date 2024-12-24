import { z } from 'zod'
import { env } from './env'
import type { Photo, SearchParams } from './schemas'
import { photoSchema } from './schemas'

const BASE_URL = 'https://api.unsplash.com'

export const searchResponseSchema = z.object({
  total: z.number(),
  total_pages: z.number(),
  results: z.array(photoSchema),
})

export type SearchResponse = z.infer<typeof searchResponseSchema>

export const api = {
  searchPhotos: async (params: SearchParams): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams({
      query: params.query,
      page: String(params.page),
      per_page: String(params.perPage),
      order_by: params.orderBy,
      ...(params.color && { color: params.color }),
    })

    const response = await fetch(
      `${BASE_URL}/search/photos?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch photos')
    }

    const results = await response.json()

    const parsedResult = searchResponseSchema.safeParse(results)

    if (!parsedResult.success) {
      console.error('Validation error:', parsedResult.error)
      throw new Error('Invalid API response format')
    }

    return parsedResult.data
  },

  getPhotoDetail: async (id: string | undefined): Promise<Photo | null> => {
    if (!id) return null

    const response = await fetch(`${BASE_URL}/photos/${id}`, {
      headers: {
        Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch photo detail')
    }

    const photoResult = await response.json()

    const parsedResult = photoSchema.safeParse(photoResult)

    if (!parsedResult.success) {
      console.error('Validation error:', parsedResult.error)
      throw new Error('Invalid API response format')
    }

    return parsedResult.data
  },
} as const
