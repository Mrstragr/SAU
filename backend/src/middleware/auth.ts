import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../lib/jwt'

export type AuthedRequest = Request & {
  auth?: {
    userId: string
    role: 'admin' | 'driver' | 'student'
  }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    return res.status(401).json({ error: 'Missing access token' })
  }

  try {
    const payload = verifyAccessToken(token)
    req.auth = { userId: payload.sub, role: payload.role }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid access token' })
  }
}

export function requireRole(roles: Array<'admin' | 'driver' | 'student'>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: 'Not authenticated' })
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: 'Forbidden' })
    return next()
  }
}

