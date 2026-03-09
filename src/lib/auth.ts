import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { admin } from 'better-auth/plugins/admin'

import { PrismaClient } from '../../generated/prisma/client'
import { env } from './env'

const databaseUrl = env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in environment variables.')
}

const adminUserIds = env.ADMIN_USER_IDS
  ? env.ADMIN_USER_IDS
  : []

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

export const auth = betterAuth({
  baseURL: env.API_BASE_URL,
  trustedOrigins: [env.WEB_APP_BASE_URL],
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    openAPI({ disableDefaultReference: true }),
    admin({
      adminUserIds,
    }),
  ],
})
