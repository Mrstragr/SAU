import { useQuery, useMutation, useQueryClient } from 'react-query'
import { get, put, post } from './client'

export const useVehicles = () => {
  return useQuery(['vehicles'], () => get('/vehicles'))
}

export const useVehicle = (id) => {
  return useQuery(['vehicle', id], () => get(`/vehicles/${id}`), { enabled: !!id })
}

export const useStudents = () => {
  return useQuery(['students'], () => get('/students'))
}

export const useTrips = () => {
  return useQuery(['trips'], () => get('/trips'))
}

export const useFeedback = (vehicleId) => {
  return useQuery(['feedback', vehicleId], () => get(`/feedback?vehicleId=${vehicleId}`), { enabled: !!vehicleId })
}

export const useUpdateVehicleStatus = () => {
  const qc = useQueryClient()
  return useMutation(({ id, data }) => put(`/vehicles/${id}`, data), {
    onSuccess: () => {
      qc.invalidateQueries(['vehicles'])
    }
  })
}
