import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (userData, token) => {
        set({
          user: userData,
          isAuthenticated: true,
          token: token,
        })
      },

      logout: () => {
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
)

export { useAuthStore }
