import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  /** Comma-separated user IDs allowed to access admin routes (list users, get user by id). Required for admin routes. */
  ADMIN_USER_IDS: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
        : [],
    ),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
})

export type Env = z.infer<typeof envSchema>
