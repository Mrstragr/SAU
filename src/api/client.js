import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const get = (url, config) => apiClient.get(url, config).then(r => r.data)
export const post = (url, data, config) => apiClient.post(url, data, config).then(r => r.data)
export const put = (url, data, config) => apiClient.put(url, data, config).then(r => r.data)
export const patch = (url, data, config) => apiClient.patch(url, data, config).then(r => r.data)
export const del = (url, config) => apiClient.delete(url, config).then(r => r.data)