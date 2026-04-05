import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'

const router = Router()

// Admin: CRUD vehicles
router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const { gate } = req.query
  
  const where: any = {}
  if (gate) {
    where.gate = gate as any
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      assignedDriver: {
        select: { id: true, name: true, email: true, phone: true }
      },
      _count: {
        select: {
          trips: {
            where: {
              requestedAt: { gte: today }
            }
          }
        }
      }
    }
  })


  const mapped = vehicles.map(v => {
    const { assignedDriver, ...rest } = v
    return {
      ...rest,
      driver: assignedDriver ? {
        id: assignedDriver.id,
        name: assignedDriver.name,
        email: assignedDriver.email,
        phone: assignedDriver.phone,
        rating: 4.5, // Mock
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedDriver.name)}&background=random`,
        totalTrips: 0 // To be implemented with aggregation if needed
      } : {
        id: null,
        name: 'Unassigned',
        email: '',
        phone: '',
        rating: 0,
        photo: 'https://ui-avatars.com/api/?name=Unassigned&background=cccccc',
        totalTrips: 0
      },
      currentLocation: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Main Gate, SAU Campus'
      }
    }
  })

  return res.json(mapped)
})

const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(1),
  capacity: z.number().int().positive(),
  assignedDriverId: z.string().uuid().optional()
})

router.post('/', requireAuth, requireRole(['admin']), async (req: AuthedRequest, res) => {
  try {
    const result = createVehicleSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors })
    }
    const body = result.data
    const vehicle = await prisma.vehicle.create({
      data: body
    })
    return res.status(201).json(vehicle)
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return res.status(500).json({ error: 'Failed to create vehicle' })
  }
})

router.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const id = req.params.id as string
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      assignedDriver: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  })
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
  
  const { assignedDriver, ...rest } = vehicle
  const mapped = {
    ...rest,
    driver: assignedDriver ? {
      ...assignedDriver,
      rating: 4.5,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedDriver.name)}&background=random`,
      totalTrips: 0
    } : null,
    currentLocation: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Main Gate, SAU Campus'
    }
  }
  return res.json(mapped)
})

const updateVehicleSchema = z.object({
  vehicleNumber: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  assignedDriverId: z.string().uuid().optional().nullable(),
  status: z.enum(['offline', 'waiting', 'in_trip', 'maintenance']).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  driverDutyStatus: z.enum(['ON_DUTY', 'OFF_DUTY', 'LUNCH']).optional()
})

router.put('/:id', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = updateVehicleSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors })
    }
    const body = result.data
    const id = req.params.id as string
    
    // Basic RBAC: only admin can change vehicle specs, drivers can change status if assigned
    // For now let's keep it simple and allow admin or the assigned driver
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })

    if (req.auth?.role !== 'admin' && vehicle.assignedDriverId !== req.auth?.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: body
    })
    return res.json(updated)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return res.status(500).json({ error: 'Failed to update vehicle' })
  }
})

router.delete('/:id', requireAuth, requireRole(['admin']), async (req: AuthedRequest, res) => {
  try {
    const id = req.params.id as string
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
    
    await prisma.vehicle.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return res.status(500).json({ error: 'Failed to delete vehicle' })
  }
})

export default router
