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
  phone: z.string().min(6).optional(),
  studentId: z.string().optional(),
  department: z.string().optional(),
  year: z.number().optional(),
  licenseNo: z.string().optional()
})

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
})

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function setRefreshCookie(res: any, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE === 'true',
    path: '/api/auth/refresh'
  })
}

router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body)

    const passwordHash = await hashPassword(body.password)
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        name: body.name,
        role: body.role,
        passwordHash,
        ...(body.role === 'student' ? {
          studentProfile: {
            create: {
              studentNo: body.studentId || undefined,
              department: body.department || undefined
            }
          }
        } : body.role === 'driver' ? {
          driverProfile: {
            create: {
              licenseNo: body.licenseNo || undefined
            }
          }
        } : {})
      },
      select: { id: true, email: true, name: true, role: true }
    }).catch((err: any) => {
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field'
        throw new Error(`${field} already in use`)
      }
      throw err
    })

    const accessToken = signAccessToken({ sub: user.id, role: user.role as any })
    const refreshToken = signRefreshToken({ sub: user.id })
    const refreshTokenHash = sha256(refreshToken)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    setRefreshCookie(res, refreshToken)
    return res.status(201).json({
      user,
      accessToken
    })
  } catch (error: any) {
    // Sanitize error messages to avoid leaking internal details
    if (error.message?.includes('already in use')) {
      // Extract the conflicting field from error message to provide accurate feedback
      if (error.message.includes('phone')) {
        return res.status(409).json({ error: 'Phone already registered' })
      }
      if (error.message.includes('email')) {
        return res.status(409).json({ error: 'Email already registered' })
      }
      // Default fallback for other fields
      return res.status(409).json({ error: 'This value is already registered' })
    }
    if (error.name === 'ZodError' || error.errors) {
      return res.status(400).json({ error: 'Invalid registration input' })
    }
    // Log full error server-side but return generic message to client
    console.error('Register error:', error)
    return res.status(400).json({ error: 'Registration failed' })
  }
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

  const user = await prisma.user.findFirst({ 
    where: { 
      OR: [
        { email: body.identifier },
        { phone: body.identifier }
      ]
    } 
  })
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

