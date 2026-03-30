import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5002),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_REFRESH_SECRET: z.string().min(20),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  COOKIE_SECURE: z
    .string()
    .optional()
    .transform(v => (v ?? 'false').toLowerCase() === 'true')
})

export const env = envSchema.parse(process.env)

