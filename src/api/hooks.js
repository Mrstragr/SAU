import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, put, post } from './client'

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => get('/vehicles')
  })
}

export const useVehicle = (id) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => get(`/vehicles/${id}`),
    enabled: !!id
  })
}

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => get('/students')
  })
}

export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => get('/trips')
  })
}

export const useFeedback = (vehicleId) => {
  return useQuery({
    queryKey: ['feedback', vehicleId],
    queryFn: () => get(`/feedback?vehicleId=${vehicleId}`),
    enabled: !!vehicleId
  })
}

export const useUpdateVehicleStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => put(`/vehicles/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    }
  })
}

// Additional hooks for other endpoints
export const useAddTrip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => post('/trips', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
    }
  })
}

export const useUpdateTripStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, endTime }) => put(`/trips/${id}`, { status, endTime }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
    }
  })
}

export const useAddFeedback = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rating, feedback }) => post(`/feedback`, { tripId: id, rating, feedback }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['feedback'] })
    }
  })
}