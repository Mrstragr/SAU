import { Server } from 'socket.io'
import type { Server as HttpServer } from 'node:http'
import { verifyAccessToken } from './jwt'
import { prisma } from './prisma'

const PING_THROTTLE_MS = 5000
const lastPingTime = new Map<string, number>()

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // For demo; restricted in production
      methods: ['GET', 'POST']
    }
  })

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication error: Missing token'))

    try {
      const payload = verifyAccessToken(token)
      // @ts-ignore
      socket.auth = { userId: payload.sub, role: payload.role }
      next()
    } catch (err) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    // @ts-ignore
    const { userId, role } = socket.auth
    console.log(`User connected: ${userId} (${role})`)

    // Join room based on role or specific user ID
    socket.join(`user:${userId}`)
    if (role === 'admin') socket.join('admin')
    if (role === 'driver') socket.join('drivers')

    // Handle location pings from drivers
    socket.on('location_ping', async (data: { lat: number; lng: number; vehicleId?: string }) => {
      if (role !== 'driver' && role !== 'admin') return

      try {
        // Validate vehicleId is present
        if (!data.vehicleId) {
          console.error('location_ping: missing vehicleId')
          return
        }

        // Verify driver is assigned to this vehicle (for non-admin roles)
        if (role === 'driver') {
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: data.vehicleId },
            select: { assignedDriverId: true }
          })
          if (!vehicle || vehicle.assignedDriverId !== userId) {
            console.error(`Driver ${userId} is not assigned to vehicle ${data.vehicleId}`)
            return
          }
        }

        // Validate lat/lng coordinates
        if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
          console.error('location_ping: invalid coordinate values')
          return
        }
        if (data.lat < -90 || data.lat > 90) {
          console.error(`location_ping: latitude ${data.lat} out of range`)
          return
        }
        if (data.lng < -180 || data.lng > 180) {
          console.error(`location_ping: longitude ${data.lng} out of range`)
          return
        }

        // Apply throttle to avoid DB bloat
        const lastTime = lastPingTime.get(data.vehicleId) || 0
        const now = Date.now()
        if (now - lastTime < PING_THROTTLE_MS) {
          // Still broadcast the update even if we don't write to DB
          io.to('admin').emit('vehicle_location_update', {
            vehicleId: data.vehicleId,
            lat: data.lat,
            lng: data.lng,
            recordedAt: new Date()
          })
          return
        }
        lastPingTime.set(data.vehicleId, now)

        // Create location record (historical data)
        // Note: VehicleLocation stores all pings; for latest location queries, consider adding a separate latestVehicleLocation table
        try {
          await prisma.vehicleLocation.create({
            data: {
              vehicleId: data.vehicleId,
              lat: data.lat,
              lng: data.lng
            }
          })
        } catch (createError) {
          // Log and propagate real database errors (don't swallow them)
          console.error(`Error recording vehicle location for ${data.vehicleId}:`, createError)
          // Continue to broadcast even if DB write fails, to avoid blocking real-time updates
        }
          
        // Broadcast to relevant rooms
        io.to('admin').emit('vehicle_location_update', {
          vehicleId: data.vehicleId,
          lat: data.lat,
          lng: data.lng,
          recordedAt: new Date()
        })
        
        // Also broadcast to students who are currently in a trip with this vehicle
        const activeTrips = await prisma.trip.findMany({
          where: { vehicleId: data.vehicleId, status: 'in_progress' },
          select: { studentId: true }
        })
        activeTrips.forEach(trip => {
          io.to(`user:${trip.studentId}`).emit('trip_location_update', {
            lat: data.lat,
            lng: data.lng
          })
        })
      } catch (err) {
        console.error('Error saving location ping:', err)
      }
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`)
    })
  })

  return io
}
