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

export const userSchema = z.object({
  name: z.string(),
  username: z.string(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  total_photos: z.number(),
  profile_image: z.object({
    small: z.string().url(),
    medium: z.string().url(),
    large: z.string().url(),
  }),
})

export type User = z.infer<typeof userSchema>

export const photoSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  blur_hash: z.string().nullable(),
  urls: z.object({
    small: z.string().url(),
    regular: z.string().url(),
    full: z.string().url(),
    raw: z.string().url(),
  }),
  location: z
    .object({
      city: z.string().nullable(),
      country: z.string().nullable(),
    })
    .optional(),
  tags: z.array(z.object({ title: z.string() })).optional(),
  width: z.number(),
  height: z.number(),
  user: userSchema,
})

export const searchParamsSchema = z.object({
  query: z.string().min(1),
  page: z.coerce.number().positive(),
  orderBy: orderBySchema.default('relevant'),
  perPage: z.coerce.number(),
  color: colorSchema.optional(),
})

export type Photo = z.infer<typeof photoSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type ColorOption = z.infer<typeof colorSchema>
export type OrderByOption = z.infer<typeof orderBySchema>
