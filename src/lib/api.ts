import { z } from 'zod'
import { env } from './env'
import type { Photo, SearchParams, User } from './schemas'
import { photoSchema, userSchema } from './schemas'

const BASE_URL = 'https://api.unsplash.com'

export const searchPhotosResponseSchema = z.object({
  total: z.number(),
  total_pages: z.number(),
  results: z.array(photoSchema),
})

export type SearchPhotosResponse = z.infer<typeof searchPhotosResponseSchema>

export const api = {
  searchPhotos: async (params: SearchParams): Promise<SearchPhotosResponse> => {
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

    const parsedResult = searchPhotosResponseSchema.safeParse(results)

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

  getUser: async (username: string | undefined): Promise<User | null> => {
    if (!username) return null

    const response = await fetch(`${BASE_URL}/users/${username}`, {
      headers: {
        Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user detail')
    }

    const userResult = await response.json()

    const parsedResult = userSchema.safeParse(userResult)

    if (!parsedResult.success) {
      console.error('Validation error:', parsedResult.error)
      throw new Error('Invalid API response format')
    }

    return parsedResult.data
  },

  getUserPhotos: async ({
    username,
    queryParams: { page, perPage },
  }: {
    username: string | undefined
    queryParams: Pick<SearchParams, 'page' | 'perPage'>
  }): Promise<Array<Photo>> => {
    if (!username) return []

    const queryParams = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    })

    const response = await fetch(
      `${BASE_URL}/users/${username}/photos?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch user photos')
    }

    const photosResults = await response.json()

    console.log('photosResults', photosResults)

    const parsedResult = z.array(photoSchema).safeParse(photosResults)

    if (!parsedResult.success) {
      console.error('Validation error:', parsedResult.error)
      throw new Error('Invalid API response format')
    }

    return parsedResult.data
  },
} as const
