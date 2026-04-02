import { Server } from 'socket.io'
import type { Server as HttpServer } from 'node:http'
import { verifyAccessToken } from './jwt'
import { prisma } from './prisma'

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
        // Record location in DB (sampling if needed to avoid DB bloat)
        // For now, update vehicle's current location would be good but schema has VehicleLocation as a separate table
        if (data.vehicleId) {
          await prisma.vehicleLocation.create({
            data: {
              vehicleId: data.vehicleId,
              lat: data.lat,
              lng: data.lng
            }
          })
          
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
        }
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
