import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
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
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  WEB_APP_URL: z.string(),
})

export const env = envSchema.parse(process.env)