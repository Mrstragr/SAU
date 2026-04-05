import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockVehicles, mockStudents, mockTrips, mockFeedback } from '../data/mockData'
import { useUsersStore } from '../stores/usersStore'
import { apiClient } from './client'

export const useVehicles = (gate) => {
  return useQuery({
    queryKey: ['vehicles', gate],
    queryFn: async () => {
      const url = gate ? `/vehicles?gate=${gate}` : '/vehicles'
      const { data } = await apiClient.get(url)
      return data.map(v => ({
        ...v,
        // Ensure consistent structure for MapComponent
        current_lat: v.currentLocation?.lat,
        current_lng: v.currentLocation?.lng,
        current_address: v.currentLocation?.address,
      }))
    }
  })
}

export const useVehicle = (id) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/vehicles/${id}`)
      // Transform to match useVehicles structure
      return {
        ...data,
        current_lat: data.currentLocation?.lat,
        current_lng: data.currentLocation?.lng,
        current_address: data.currentLocation?.address,
      }
    },
    enabled: !!id
  })
}

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users?role=student')
      return data
    }
  })
}

export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await apiClient.get('/trips')
      return data
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
      const payload = {
        status: data.status,
        currentPassengers: data.currentPassengers,
        batteryLevel: data.batteryLevel,
        driverDutyStatus: data.driverDutyStatus,
        ...(data.currentLocation && { currentLocation: data.currentLocation })
      }
      const { data: updatedVehicle } = await apiClient.put(`/vehicles/${id}`, payload)
      return updatedVehicle
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

export const useUpdateDriverDuty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, driverDutyStatus }) => {
      const { data } = await apiClient.put(`/drivers/${id}/duty`, { driverDutyStatus })
      return data
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
  return useMutation({
    mutationFn: async ({ identifier, password }) => {
      const { data } = await apiClient.post('/auth/login', { identifier, password })
      // Validate accessToken before storing
      if (!data || typeof data.accessToken !== 'string' || data.accessToken.length === 0) {
        throw new Error('Invalid token received from server')
      }
      localStorage.setItem('accessToken', data.accessToken)
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export const useRegister = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { data: response } = await apiClient.post('/auth/register', data)
      // Validate accessToken before storing
      if (!response || typeof response.accessToken !== 'string' || response.accessToken.length === 0) {
        throw new Error('Invalid token received from server')
      }
      localStorage.setItem('accessToken', response.accessToken)
      return response
    },
    onSuccess: (data) => {
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


