import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, phone: true, status: true }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json({ user })
})

export default router

