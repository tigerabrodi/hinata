import { z } from 'zod'

export const colorSchema = z.enum([
  'black_and_white',
  'black',
  'white',
  'yellow',
  'orange',
  'red',
  'purple',
  'magenta',
  'green',
  'teal',
  'blue',
])

export const orderBySchema = z.enum(['latest', 'relevant'])

export const photoSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  blur_hash: z.string().nullable(),
  urls: z.object({
    small: z.string().url(),
    regular: z.string().url(),
  }),
  width: z.number(),
  height: z.number(),
  user: z.object({
    name: z.string(),
    username: z.string(),
    profile_image: z.object({
      small: z.string().url(),
      medium: z.string().url(),
      large: z.string().url(),
    }),
  }),
})

export const searchParamsSchema = z.object({
  query: z.string().min(1),
  page: z.coerce.number().positive(),
  orderBy: orderBySchema.default('relevant'),
  perPage: z.coerce.number(),
  color: colorSchema.optional(),
})

export const searchResponseSchema = z.object({
  total: z.number(),
  total_pages: z.number(),
  results: z.array(photoSchema),
})

export type Photo = z.infer<typeof photoSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type ColorOption = z.infer<typeof colorSchema>
export type OrderByOption = z.infer<typeof orderBySchema>
