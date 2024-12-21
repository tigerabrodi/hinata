import { z } from 'zod'

const envSchema = z.object({
  UNSPLASH_ACCESS_KEY: z.string(),
})

export const env = envSchema.parse({
  UNSPLASH_ACCESS_KEY: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
})
