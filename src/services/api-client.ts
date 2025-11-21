import axios from "axios"
import { toast } from "../hooks/use-toast"
import { parseError, shouldLogout } from "../lib/error-handler"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle responses and errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Transform backend success response if needed
    return response
  },
  (error) => {
    const parsedError = parseError(error)
    const originalUrl: string | undefined = error?.config?.url
    const isAuthLoginAttempt = originalUrl?.includes('/auth/login')
    const currentPath = window.location.pathname
    const isAlreadyOnLogin = currentPath.startsWith('/auth/login')

    // For invalid credentials (401 on login) let caller show toast; do not redirect or clear token
    if (isAuthLoginAttempt && parsedError.statusCode === 401) {
      return Promise.reject(error)
    }

    // Handle authenticated session expiration only when not currently on login
    if (shouldLogout(parsedError) && !isAuthLoginAttempt && !isAlreadyOnLogin) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        duration: 5000,
      })

      // Use router navigation instead of hard reload if possible (fallback to location)
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 750)
    }

    return Promise.reject(error)
  }
)

