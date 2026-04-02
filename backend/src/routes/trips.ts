import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const query: any = {}
  
  if (req.auth?.role === 'student') {
    query.studentId = req.auth.userId
  } else if (req.auth?.role === 'driver') {
    query.driverId = req.auth.userId
  }

  const trips = await prisma.trip.findMany({
    where: query,
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
      driver: { select: { id: true, name: true, email: true, phone: true } },
      vehicle: { select: { id: true, vehicleNumber: true } }
    },
    orderBy: { requestedAt: 'desc' }
  })

  return res.json(trips)
})

const createTripSchema = z.object({
  startLat: z.number(),
  startLng: z.number(),
  startAddress: z.string().optional(),
  endLat: z.number(),
  endLng: z.number(),
  endAddress: z.string().optional(),
  vehicleId: z.string().uuid().optional()
})

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const body = createTripSchema.parse(req.body)
  
  // Create trip request
  const trip = await prisma.trip.create({
    data: {
      ...body,
      studentId: req.auth!.userId,
      status: 'requested'
    }
  })

  // In a real app, you would notify nearby drivers here via Socket.io
  return res.status(201).json(trip)
})

const updateTripStatusSchema = z.object({
  status: z.enum(['requested', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_show']),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional()
})

router.put('/:id/status', requireAuth, async (req: AuthedRequest, res) => {
  const body = updateTripStatusSchema.parse(req.body)
  const id = req.params.id as string
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) return res.status(404).json({ error: 'Trip not found' })

  const userId = req.auth!.userId
  const role = req.auth!.role

  // Simple RBAC for status changes
  if (role === 'student' && userId !== trip.studentId) return res.status(403).json({ error: 'Forbidden' })
  // In a real app, you'd restrict which status transitions students/drivers can make

  const data: any = { status: body.status }
  if (body.status === 'accepted') {
    data.acceptedAt = new Date()
    data.driverId = userId
  } else if (body.status === 'in_progress') {
    data.startedAt = new Date()
  } else if (body.status === 'completed') {
    data.completedAt = new Date()
  } else if (body.status === 'cancelled') {
    data.cancelledAt = new Date()
  }

  if (body.driverId) data.driverId = body.driverId
  if (body.vehicleId) data.vehicleId = body.vehicleId

  const updated = await prisma.trip.update({
    where: { id },
    data
  })

  // Emit socket event for trip status change
  // req.app.get('socketio').emit('trip_update', updated)

  return res.json(updated)
})

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
})

router.post('/:id/feedback', requireAuth, requireRole(['student']), async (req: AuthedRequest, res) => {
  const body = feedbackSchema.parse(req.body)
  const id = req.params.id as string
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) return res.status(404).json({ error: 'Trip not found' })
  if (trip.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' })

  const feedback = await prisma.feedback.create({
    data: {
      tripId: id,
      rating: body.rating,
      comment: body.comment
    }
  })

  return res.status(201).json(feedback)
})

export default router
