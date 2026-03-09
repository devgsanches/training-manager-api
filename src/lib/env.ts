import z from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  BETTER_AUTH_SECRET: z.string(),
  API_BASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
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
  OPENAI_API_KEY: z.string(),
  WEB_APP_BASE_URL: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>