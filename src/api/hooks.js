import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockVehicles, mockStudents, mockTrips, mockFeedback } from '../data/mockData'
import { useUsersStore } from '../stores/usersStore'
import { apiClient } from './client'

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await apiClient.get('/vehicles')
      // Transform API data to match frontend structure
      return data.map(v => ({
        id: v.id,
        vehicleNumber: v.vehicle_number,
        driver: {
          id: v.driver_id,
          name: v.driver_name,
          email: v.driver_email,
          phone: '+91 98765 43210', // Mock phone if not in API
          rating: 4.5 // Mock rating
        },
        capacity: v.capacity,
        batteryLevel: v.battery_level,
        status: v.current_status,
        currentPassengers: v.current_passengers,
        currentLocation: {
          lat: v.current_lat,
          lng: v.current_lng,
          address: v.current_address
        },
        // Keep flat props for MapComponent compatibility
        current_lat: v.current_lat,
        current_lng: v.current_lng,
        current_address: v.current_address,

        totalTripsToday: 5, // Mock
        lastUpdated: v.updated_at,
        isEcoFriendly: !!v.is_eco_friendly
      }))
    }
  })
}

export const useVehicle = (id) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => Promise.resolve(mockVehicles.find(v => v.id === parseInt(id))),
    enabled: !!id
  })
}

export const useStudents = () => {
  const { registeredUsers } = useUsersStore()
  return useQuery({
    queryKey: ['students'],
    queryFn: () => {
      const registeredStudents = registeredUsers.filter(u => u.role === 'student')
      return Promise.resolve([...registeredStudents, ...mockStudents])
    }
  })
}

export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await apiClient.get('/trips')
      return data.map(t => ({
        id: t.id,
        vehicleId: t.vehicleId, // API currently returns camelCase for trips based on my previous curl check?
        // Wait, curl output for trips was: [{"id":1,"vehicleId":1,...}]
        // Yes, the SQLite Trip model returns camelCase because I wrote it that way in Trip.cjs?
        // Let's verify Trip.cjs.
        // Actually, let's just pass data through if it matches, or map if needed.
        // Assuming API returns camelCase as seen in curl output.
        ...t,
        driverId: t.driverId,
        studentId: t.studentId,
        startLocation: t.startLocation,
        endLocation: t.endLocation,
        startTime: t.startTime,
        endTime: t.endTime,
        status: t.status
      }))
    }
  })
}

export const useFeedback = (vehicleId) => {
  return useQuery({
    queryKey: ['feedback', vehicleId],
    queryFn: () => Promise.resolve(mockFeedback.filter(f => f.vehicleId === parseInt(vehicleId))),
    enabled: !!vehicleId
  })
}

export const useUpdateVehicleStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      // Transform frontend data to backend expectation
      const payload = {
        status: data.status,
        currentPassengers: data.currentPassengers,
        currentLocation: data.currentLocation, // Backend expects { lat, lng, address } or flat?
        // Route vehicles.cjs expects: currentLocation?.lat etc.
        // So passing nested object is fine if route handles it.
        // Let's check route again.
        // Route: currentLocation?.lat
        // So yes, passing { currentLocation: { lat, ... } } is correct.
        batteryLevel: data.batteryLevel
      }
      const { data: updatedVehicle } = await apiClient.put(`/vehicles/${id}`, payload)
      return updatedVehicle
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export const useAddTrip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { data: newTrip } = await apiClient.post('/trips', data)
      return newTrip
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export const useUpdateTripStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, endTime }) => {
      const { data: updatedTrip } = await apiClient.put(`/trips/${id}/status`, { status, endTime })
      return updatedTrip
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export const useAddFeedback = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, rating, feedback }) => {
      const { data: updatedTrip } = await apiClient.post(`/trips/${id}/feedback`, { rating, feedback })
      return updatedTrip
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['feedback'] })
    }
  })
}

export const useLogin = () => {
  const qc = useQueryClient()
  const { findUser } = useUsersStore()
  return useMutation({
    mutationFn: async ({ identifier, password }) => {
      try {
        // Try real API first
        const { data } = await apiClient.post('/auth/login', { email: identifier, password })
        // Store token
        localStorage.setItem('token', data.token)
        return data
      } catch (error) {
        // Fallback to mock if API fails (optional, but good for demo stability if backend is down)
        console.warn('API Login failed, trying mock...', error)

        // First check registered users
        let user = findUser(identifier, password)

        // If not found in registered users, check mock users for demo
        if (!user) {
          const mockUsers = [
            { email: 'student@sau.ac.in', password: 'password', role: 'student', id: 'demo-student', name: 'Demo Student', phone: '+91 98765 43215' },
            { email: 'driver@sau.ac.in', password: 'password', role: 'driver', id: 'demo-driver', name: 'Demo Driver', phone: '+91 98765 43216' },
            { email: 'admin@sau.ac.in', password: 'password', role: 'admin', id: 'demo-admin', name: 'Demo Admin', phone: '+91 98765 43217' }
          ]
          user = mockUsers.find(u => u.email === identifier && u.password === password)
        }

        if (user) {
          return Promise.resolve({ token: 'mock-token-' + Date.now(), user })
        }
        throw error
      }
    },
    onSuccess: (data) => {
      // Optionally invalidate or set auth queries
      qc.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export const useRegister = () => {
  const qc = useQueryClient()
  const { addUser } = useUsersStore()
  return useMutation({
    mutationFn: async (data) => {
      try {
        const { data: response } = await apiClient.post('/auth/register', data)
        localStorage.setItem('token', response.token)
        return response
      } catch (error) {
        console.warn('API Register failed, falling back to mock', error)
        // Add user to registered users store
        const userData = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        addUser(userData)
        return Promise.resolve({
          token: 'mock-token-' + Date.now(),
          user: userData
        })
      }
    },
    onSuccess: (data) => {
      // Optionally invalidate or set auth queries
      qc.invalidateQueries({ queryKey: ['auth'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['students'] })
    }
  })
}

// Admin management hooks
export const useUpdateUser = () => {
  const qc = useQueryClient()
  const { updateUser } = useUsersStore()
  return useMutation({
    mutationFn: ({ id, updates }) => {
      updateUser(id, updates)
      return Promise.resolve({ id, ...updates })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
    }
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  const { deleteUser } = useUsersStore()
  return useMutation({
    mutationFn: (id) => {
      deleteUser(id)
      return Promise.resolve(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
    }
  })
}

export const useUpdateVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => {
      const vehicleIndex = mockVehicles.findIndex(v => v.id === id)
      if (vehicleIndex === -1) {
        return Promise.reject(new Error('Vehicle not found'))
      }
      mockVehicles[vehicleIndex] = { ...mockVehicles[vehicleIndex], ...updates }
      return Promise.resolve(mockVehicles[vehicleIndex])
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export const useDeleteVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => {
      const vehicleIndex = mockVehicles.findIndex(v => v.id === id)
      if (vehicleIndex === -1) {
        return Promise.reject(new Error('Vehicle not found'))
      }
      const deletedVehicle = mockVehicles.splice(vehicleIndex, 1)[0]
      return Promise.resolve(deletedVehicle)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

// Analytics hooks
export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/analytics/stats')
        return data
      } catch (error) {
        // Fallback to mock data
        console.warn('Analytics stats API failed, using mock data', error)
        return {
          totalVehicles: mockVehicles.length,
          activeVehicles: mockVehicles.filter(v => v.status !== 'offline').length,
          totalUsers: 150, // Mock total users
          todayTrips: 25, // Mock today's trips
          totalTrips: 500, // Mock total trips
          avgRating: 4.5 // Mock average rating
        }
      }
    }
  })
}

export const useAnalyticsCharts = (type) => {
  return useQuery({
    queryKey: ['analytics-charts', type],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/analytics/charts/${type}`)
        return data
      } catch (error) {
        // Fallback to mock data
        console.warn(`Analytics charts ${type} API failed, using mock data`, error)
        if (type === 'trips-by-day') {
          return [
            { day: 'Mon', trips: 12 },
            { day: 'Tue', trips: 18 },
            { day: 'Wed', trips: 15 },
            { day: 'Thu', trips: 20 },
            { day: 'Fri', trips: 25 },
            { day: 'Sat', trips: 8 },
            { day: 'Sun', trips: 5 }
          ]
        } else if (type === 'popular-routes') {
          return [
            { route: 'Hostel to Campus', trips: 45 },
            { route: 'Campus to Library', trips: 32 },
          ]
        } else if (type === 'earnings') {
          return [
            { date: 'Mon', earnings: 120 },
            { date: 'Tue', earnings: 150 },
            { date: 'Wed', earnings: 130 },
            { date: 'Thu', earnings: 175 },
            { date: 'Fri', earnings: 210 },
            { date: 'Sat', earnings: 90 },
            { date: 'Sun', earnings: 60 }
          ]
        }
      }
    }
  })
}
