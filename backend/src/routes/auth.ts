import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma'
import { hashPassword, verifyPassword } from '../lib/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { env } from '../lib/env'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['student', 'driver']).default('student'),
  phone: z.string().min(6).optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function setRefreshCookie(res: any, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    path: '/api/auth/refresh'
  })
}

router.post('/register', async (req, res) => {
  const body = registerSchema.parse(req.body)

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) return res.status(409).json({ error: 'Email already in use' })

  const passwordHash = await hashPassword(body.password)
  const user = await prisma.user.create({
    data: {
      email: body.email,
      phone: body.phone,
      name: body.name,
      role: body.role,
      passwordHash
    },
    select: { id: true, email: true, name: true, role: true }
  })

  const accessToken = signAccessToken({ sub: user.id, role: user.role })
  const refreshToken = signRefreshToken({ sub: user.id })
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  setRefreshCookie(res, refreshToken)
  return res.status(201).json({ user, accessToken })
})

router.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  if (user.status !== 'active') return res.status(403).json({ error: 'User is not active' })

  const ok = await verifyPassword(user.passwordHash, body.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const accessToken = signAccessToken({ sub: user.id, role: user.role })
  const refreshToken = signRefreshToken({ sub: user.id })
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  setRefreshCookie(res, refreshToken)
  return res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken
  })
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ error: 'Missing refresh token' })

  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }

  const tokenHash = sha256(token)
  const record = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revokedAt: null, expiresAt: { gt: new Date() } }
  })
  if (!record) return res.status(401).json({ error: 'Refresh token revoked/expired' })

  // Rotate refresh token
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } })
  const newRefreshToken = signRefreshToken({ sub: payload.sub })
  await prisma.refreshToken.create({
    data: {
      userId: payload.sub,
      tokenHash: sha256(newRefreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) return res.status(401).json({ error: 'User not found' })

  const accessToken = signAccessToken({ sub: user.id, role: user.role })
  setRefreshCookie(res, newRefreshToken)
  return res.json({ accessToken })
})

router.post('/logout', async (req, res) => {
  const token = req.cookies?.refresh_token
  if (token) {
    const tokenHash = sha256(token)
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }

  res.clearCookie('refresh_token', { path: '/api/auth/refresh' })
  return res.json({ ok: true })
})

export default router

