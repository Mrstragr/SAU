import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const query: any = {}
    
    if (req.auth?.role === 'student') {
      query.studentId = req.auth.userId
    } else if (req.auth?.role === 'driver') {
      query.driverId = req.auth.userId
    } else if (req.auth?.role === 'admin') {
      // Admin can see all trips
      query = {}
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
  } catch (error) {
    console.error('Error fetching trips:', error)
    return res.status(500).json({ error: 'Failed to fetch trips' })
  }
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
  try {
    // Enforce student role
    if (req.auth?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can create trips' })
    }

    const body = createTripSchema.parse(req.body)
    
    // Create trip request with studentId from authenticated user
    const trip = await prisma.trip.create({
      data: {
        ...body,
        studentId: req.auth!.userId,
        status: 'requested'
      }
    })

    // In a real app, you would notify nearby drivers here via Socket.io
    return res.status(201).json(trip)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating trip:', error)
    return res.status(500).json({ error: 'Failed to create trip' })
  }
})

const updateTripStatusSchema = z.object({
  status: z.enum(['requested', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_show']),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional()
})

router.put('/:id/status', requireAuth, async (req: AuthedRequest, res) => {
  try {
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
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error updating trip status:', error)
    return res.status(500).json({ error: 'Failed to update trip status' })
  }
})

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
})

router.post('/:id/feedback', requireAuth, requireRole(['student']), async (req: AuthedRequest, res) => {
  try {
    const body = feedbackSchema.parse(req.body)
    const id = req.params.id as string
    const trip = await prisma.trip.findUnique({ where: { id } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    
    // Ensure trip is completed
    if (trip.status !== 'completed') {
      return res.status(400).json({ error: 'Feedback can only be submitted for completed trips' })
    }
    
    if (trip.studentId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' })

    // Check if feedback already exists
    const existing = await prisma.feedback.findFirst({ where: { tripId: id } })
    if (existing) {
      return res.status(409).json({ error: 'Feedback already submitted for this trip' })
    }

    const feedback = await prisma.feedback.create({
      data: {
        tripId: id,
        rating: body.rating,
        comment: body.comment
      }
    })

    return res.status(201).json(feedback)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating feedback:', error)
    return res.status(500).json({ error: 'Failed to create feedback' })
  }
})

export default router
