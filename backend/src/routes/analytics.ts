import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

router.get('/stats', requireAuth, requireRole(['admin']), async (req, res) => {
  const [totalVehicles, activeVehicles, totalUsers, todayTrips, totalTrips] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: { not: 'offline' } } }),
    prisma.user.count(),
    prisma.trip.count({
      where: {
        requestedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.trip.count()
  ])

  return res.json({
    totalVehicles,
    activeVehicles,
    totalUsers,
    todayTrips,
    totalTrips,
    avgRating: 4.5 // Mock for now
  })
})

router.get('/charts/:type', requireAuth, requireRole(['admin']), async (req, res) => {
  const { type } = req.params

  if (type === 'trips-by-day') {
    // Simple mock for now, could be grouped by prisma
    return res.json([
      { day: 'Mon', trips: 12 },
      { day: 'Tue', trips: 18 },
      { day: 'Wed', trips: 15 },
      { day: 'Thu', trips: 20 },
      { day: 'Fri', trips: 25 },
      { day: 'Sat', trips: 8 },
      { day: 'Sun', trips: 5 }
    ])
  }

  if (type === 'popular-routes') {
    return res.json([
      { route: 'Hostel to Campus', trips: 45 },
      { route: 'Campus to Library', trips: 32 },
    ])
  }

  return res.status(400).json({ error: 'Invalid chart type' })
})

export default router
