import { useQuery, useMutation, useQueryClient } from 'react-query'
import { get, put, post } from './client'

export const useVehicles = () => {
  return useQuery(['vehicles'], () => get('/api/vehicles'))
}

export const useVehicle = (id) => {
  return useQuery(['vehicle', id], () => get(`/api/vehicles/${id}`), { enabled: !!id })
}

export const useStudents = () => {
  return useQuery(['students'], () => get('/api/students'))
}

export const useTrips = () => {
  return useQuery(['trips'], () => get('/api/trips'))
}

export const useFeedback = (vehicleId) => {
  return useQuery(['feedback', vehicleId], () => get(`/api/feedback?vehicleId=${vehicleId}`), { enabled: !!vehicleId })
}

export const useUpdateVehicleStatus = () => {
  const qc = useQueryClient()
  return useMutation(({ id, data }) => put(`/api/vehicles/${id}`, data), {
    onSuccess: () => {
      qc.invalidateQueries(['vehicles'])
    }
  })
}

// Additional hooks for other endpoints
export const useAddTrip = () => {
  const qc = useQueryClient()
  return useMutation((data) => post('/api/trips', data), {
    onSuccess: () => {
      qc.invalidateQueries(['trips'])
    }
  })
}

export const useUpdateTripStatus = () => {
  const qc = useQueryClient()
  return useMutation(({ id, status, endTime }) => put(`/api/trips/${id}/status`, { status, endTime }), {
    onSuccess: () => {
      qc.invalidateQueries(['trips'])
    }
  })
}

export const useAddFeedback = () => {
  const qc = useQueryClient()
  return useMutation(({ id, rating, feedback }) => post(`/api/trips/${id}/feedback`, { rating, feedback }), {
    onSuccess: () => {
      qc.invalidateQueries(['trips'])
      qc.invalidateQueries(['feedback'])
    }
  })
}