import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { createServer } from 'node:http'
import { env } from './lib/env'
import { prisma } from './lib/prisma'
import { setupSocket } from './lib/socket'
import authRoutes from './routes/auth'
import meRoutes from './routes/me'
import vehiclesRoutes from './routes/vehicles'
import tripsRoutes from './routes/trips'
import analyticsRoutes from './routes/analytics'
import usersRoutes from './routes/users'

const app = express()
const httpServer = createServer(app)
const io = setupSocket(httpServer)

// Store io in app for access in routes if needed
app.set('socketio', io)

// Logging
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
app.use(limiter)

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
app.use('/api/vehicles', vehiclesRoutes)
app.use('/api/trips', tripsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/users', usersRoutes)

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`)
})

