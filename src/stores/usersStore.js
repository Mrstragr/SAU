import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUsersStore = create(
  persist(
    (set, get) => ({
      registeredUsers: [
        {
          id: 'demo-driver',
          email: 'driver@sau.ac.in',
          password: 'password',
          role: 'driver',
          name: 'Demo Driver',
          phone: '+91 98765 43216',
          vehicleId: 'demo-v1',
          department: null,
          year: null,
        },
        {
          id: 'demo-admin',
          email: 'admin@sau.ac.in',
          password: 'password',
          role: 'admin',
          name: 'Demo Admin',
          phone: '+91 98765 43217',
          vehicleId: null,
          department: null,
          year: null,
        },
        {
          id: 'demo-student',
          email: 'student@sau.ac.in',
          password: 'password',
          role: 'student',
          name: 'Demo Student',
          phone: '+91 98765 43218',
          vehicleId: null,
          department: 'Computer Science',
          year: 2,
          studentId: 'S001',
        },
      ],

      addUser: (userData) => {
        set((state) => ({
          registeredUsers: [...state.registeredUsers, { ...userData, id: Date.now().toString() }]
        }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          registeredUsers: state.registeredUsers.map(user =>
            user.id === id ? { ...user, ...updates } : user
          )
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          registeredUsers: state.registeredUsers.filter(user => user.id !== id)
        }))
      },

      findUser: (identifier, password) => {
        return get().registeredUsers.find(user =>
          (user.email === identifier || user.phone === identifier) && user.password === password
        )
      },

      findUserByEmailOrPhone: (identifier) => {
        return get().registeredUsers.find(user =>
          user.email === identifier || user.phone === identifier
        )
      }
    }),
    {
      name: 'users-storage',
      partialize: (state) => ({
        registeredUsers: state.registeredUsers
      })
    }
  )
)

export { useUsersStore }
