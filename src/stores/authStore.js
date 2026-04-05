import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from '../api/client'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      init: async () => {
        const { token } = get()
        if (token) {
          try {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
            const { data } = await apiClient.get('/auth/me')
            set({
              user: data.user,
              isAuthenticated: true,
            })
          } catch (error) {
            set({ user: null, isAuthenticated: false, token: null })
            localStorage.removeItem('auth-storage')
          }
        }
      },

      login: async (userData, token) => {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({
          user: userData,
          isAuthenticated: true,
          token,
        })
      },

      logout: () => {
        delete apiClient.defaults.headers.common['Authorization']
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export { useAuthStore }

