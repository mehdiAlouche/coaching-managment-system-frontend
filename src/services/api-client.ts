import axios, { type AxiosRequestConfig } from "axios"
import { toast } from "../hooks/use-toast"
import { parseError, shouldLogout } from "../lib/error-handler"
import endpoints from "./api-endpoints"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"

export interface AuthenticatedRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

const ACCESS_TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "auth_refresh_token"

const applyAuthHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common["Authorization"]
  }
}

export const persistAuthToken = (token: string | null, refreshToken?: string | null) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }

  applyAuthHeader(token)
}

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem("auth_role")
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  applyAuthHeader(null)
}

const rawClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Initialize default auth header if we already have a token
applyAuthHeader(localStorage.getItem(ACCESS_TOKEN_KEY))

let refreshPromise: Promise<string | null> | null = null

export const refreshAuthToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefreshToken) {
      return null
    }

    refreshPromise = rawClient
      .post(endpoints.auth.refresh, { refreshToken: storedRefreshToken })
      .then((response) => {
        const container = response.data?.data ? response.data.data : response.data
        const token =
          typeof container?.token === 'string' ? container.token :
          typeof container?.accessToken === 'string' ? container.accessToken :
          typeof container?.access_token === 'string' ? container.access_token : undefined
        const newRefreshToken =
          typeof container?.refreshToken === 'string' ? container.refreshToken :
          typeof container?.refresh_token === 'string' ? container.refresh_token :
          typeof container?.tokens?.refreshToken === 'string' ? container.tokens.refreshToken : undefined
        const refreshedUser = container?.user
        if (refreshedUser?.role) {
          try {
            localStorage.setItem('auth_role', refreshedUser.role)
          } catch (e) {
            // ignore storage issues
          }
        }
        if (token) {
          persistAuthToken(token, newRefreshToken ?? storedRefreshToken)
          return token
        }
        if (newRefreshToken) {
          persistAuthToken(null, newRefreshToken)
        }
        return null
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      config.headers = config.headers ?? {}
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
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as AuthenticatedRequestConfig | undefined
    const status = error?.response?.status
    const originalUrl: string | undefined = originalRequest?.url
    const isAuthLoginAttempt = originalUrl?.includes(endpoints.auth.login)
    const isAuthRefreshAttempt = originalUrl?.includes(endpoints.auth.refresh)
    const skipRefresh = originalRequest?.skipAuthRefresh

    if (
      status === 401 &&
      !isAuthLoginAttempt &&
      !isAuthRefreshAttempt &&
      !skipRefresh
    ) {
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        const newToken = await refreshAuthToken()
        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      }
    }

    const parsedError = parseError(error)
    const currentPath = window.location.pathname
    const isAlreadyOnLogin = currentPath.startsWith('/auth/login')

    // For invalid credentials (401 on login) let caller show toast; do not redirect or clear token
    if (isAuthLoginAttempt && parsedError.statusCode === 401) {
      return Promise.reject(error)
    }

    // Handle authenticated session expiration only when not currently on login
    if (shouldLogout(parsedError) && !isAuthLoginAttempt && !isAlreadyOnLogin) {
      clearAuthSession()

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

