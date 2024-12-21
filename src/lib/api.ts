import { env } from './env'
import type { SearchParams, SearchResponse } from './schemas'
import { searchResponseSchema } from './schemas'

const BASE_URL = 'https://api.unsplash.com'

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

    return searchResponseSchema.parse(results)
  },
} as const
