import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
})

export type Env = z.infer<typeof envSchema>
