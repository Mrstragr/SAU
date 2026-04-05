import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'

const router = Router()

// GET /api/drivers?gate=GATE1&status=ON_DUTY - list drivers/vehicles by gate/duty
router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const gate = Array.isArray(req.query.gate) ? req.query.gate[0] : req.query.gate
  const status = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status

  const where: any = { 
    assignedDriver: { role: 'driver' },
    status: 'waiting' // Only available vehicles
  }

  if (gate) where.gate = gate as any
  if (status) where.driverDutyStatus = status as any

  const drivers = await prisma.vehicle.findMany({
    where,
    select: {
      id: true,
      vehicleNumber: true,
      gate: true,
      driverDutyStatus: true,
      batteryLevel: true,
      assignedDriver: {
        select: { 
          id: true, 
          name: true, 
          phone: true,
          email: true 
        }
      }
    }
  })

  res.json(drivers)
})

// PUT /api/drivers/:id/duty - update driver duty status (driver or admin)
const updateDutySchema = z.object({
  driverDutyStatus: z.enum(['ON_DUTY', 'OFF_DUTY', 'LUNCH'])
})

router.put('/:id/duty', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = updateDutySchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors })
    }
    const body = result.data
    const id = req.params.id

    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })

    // Only assigned driver or admin can update
    if (req.auth!.role !== 'admin' && vehicle.assignedDriverId !== req.auth!.userId) {
      return res.status(403).json({ error: 'Forbidden - not assigned driver or admin' })
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { driverDutyStatus: body.driverDutyStatus }
    })

    res.json(updated)
  } catch (error) {
    console.error('Error updating duty status:', error)
    res.status(500).json({ error: 'Failed to update duty status' })
  }
})

export default router

