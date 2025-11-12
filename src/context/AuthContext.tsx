import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "../lib/api-client"
import endpoints from "../lib/api-endpoints"
import type { UserRole } from "../lib/rbac"
import { hasRole as rbacHasRole } from "../lib/rbac"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      if (token) {
        try {
          const response = await apiClient.get(endpoints.auth.me, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setUser(response.data.user)
          if (response.data?.user?.role) {
            localStorage.setItem("auth_role", response.data.user.role)
          }
        } catch (error) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_role")
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.post(endpoints.auth.login, { email, password })
    const { token, user } = response.data
    localStorage.setItem("auth_token", token)
    if (user?.role) {
      localStorage.setItem("auth_role", user.role)
    }
    setUser(user)
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    const response = await apiClient.post(endpoints.auth.register, { name, email, password, role })
    const { token, user } = response.data
    localStorage.setItem("auth_token", token)
    if (user?.role) {
      localStorage.setItem("auth_role", user.role)
    }
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_role")
    setUser(null)
  }

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false
    return rbacHasRole({ role: user.role }, ...roles)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout, hasRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
