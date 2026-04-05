import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'

let isRefreshing = false
let refreshSubscribers = []

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle token refresh (optional but recommended)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      if (isRefreshing) {
        // Queue the request to retry after refresh completes
        return new Promise((resolve, reject) => {
          refreshSubscribers.push(() => {
            return apiClient(originalRequest)
              .then(resolve)
              .catch(reject)
          })
        })
      }
      
      isRefreshing = true
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
        
        // Validate refresh response
        if (!data || typeof data.accessToken !== 'string' || data.accessToken.length === 0) {
          localStorage.removeItem('accessToken')
          return Promise.reject(new Error('Invalid refresh token response'))
        }
        
        localStorage.setItem('accessToken', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        
        // Retry all queued requests
        refreshSubscribers.forEach(subscriber => subscriber())
        refreshSubscribers = []
        
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Redirect to login or logout user
        localStorage.removeItem('accessToken')
        refreshSubscribers = []
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export const get = (url, config) => apiClient.get(url, config).then(r => r.data)
export const post = (url, data, config) => apiClient.post(url, data, config).then(r => r.data)
export const put = (url, data, config) => apiClient.put(url, data, config).then(r => r.data)
export const patch = (url, data, config) => apiClient.patch(url, data, config).then(r => r.data)
export const del = (url, config) => apiClient.delete(url, config).then(r => r.data)