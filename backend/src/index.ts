import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './lib/env'
import { prisma } from './lib/prisma'
import authRoutes from './routes/auth'
import meRoutes from './routes/me'

const app = express()

const corsOrigins =
  env.CORS_ORIGIN?.split(',')
    .map(s => s.trim())
    .filter(Boolean) ?? []

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true })
  } catch (err) {
    res.status(503).json({ ok: false })
  }
})

app.get('/', (_req, res) => {
  res.json({ message: 'Rectangle API (v2) is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api', meRoutes)

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`)
})

