import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token })
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { token, ...user } = response.data
          // Set token in localStorage immediately
          if (token) {
            localStorage.setItem('token', token)
          }
          set({ user, token, isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', {
            name,
            email,
            password,
          })
          const { token, ...user } = response.data
          // Set token in localStorage immediately
          if (token) {
            localStorage.setItem('token', token)
          }
          set({ user, token, isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
        localStorage.removeItem('token')
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token')
        if (!token) {
          set({ user: null, token: null })
          return false
        }

        try {
          const response = await api.get('/auth/me')
          set({ user: response.data, token })
          return true
        } catch (error) {
          set({ user: null, token: null })
          localStorage.removeItem('token')
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)

