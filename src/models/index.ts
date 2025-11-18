/**
 * Shared TypeScript Models and Interfaces
 * All application-wide type definitions
 */

// User models
export interface User {
  id: string
  email: string
  name: string
  role: "manager" | "coach" | "entrepreneur" | "admin"
  createdAt: string
}

export interface UserDetailed {
  _id: string
  email: string
  role: 'admin' | 'manager' | 'coach' | 'entrepreneur'
  firstName: string
  lastName: string
  organizationId: string
  hourlyRate?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UsersResponse = {
  users: UserDetailed[]
  count: number
}

// Session models
export interface Session {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location: string
  coachId: string
  entrepreneurId: string
  status: "scheduled" | "completed" | "cancelled" | "canceled"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AgendaItem {
  title: string
  description: string
  duration: number
}

export interface SessionDetailed {
  _id: string
  organizationId: string
  coachId: string
  entrepreneurId: string
  managerId: string
  scheduledAt: string
  endTime: string
  duration: number
  status: 'scheduled' | 'completed' | 'canceled'
  agendaItems: AgendaItem[]
  notes: Record<string, any>
  location: string
}

export type SessionsMeta = {
  total: number
  page: number
  limit: number
}

export type SessionsResponse = {
  data: SessionDetailed[]
  meta: SessionsMeta
}

// Dashboard models
export type DashboardStats = {
  users: {
    total: number
    coaches: number
    entrepreneurs: number
  }
  sessions: {
    total: number
    upcoming: number
    completed: number
  }
  revenue: {
    total: number
  }
}

// Payment models
export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  date: string
  userId?: string
  coachId?: string
}

// Goal models
export interface Goal {
  id: string
  title: string
  description: string
  entrepreneurId: string
  startDate: string
  targetDate: string
  status?: "active" | "completed" | "abandoned"
  progress?: number
  deadline?: string
  ownerId?: string
  coachId?: string
  metrics?: Record<string, unknown>
  createdAt: string
}

// API Response models
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// RBAC models
export type UserRole = 'manager' | 'coach' | 'entrepreneur' | 'admin'

export type Action =
  | 'view'
  | 'manage'
  | 'create'
  | 'edit'
  | 'delete'
  | 'invoice'
  | 'configure'

export type Subject =
  | 'sessions'
  | 'goals'
  | 'payments'
  | 'users'
  | 'orgSettings'
  | 'feedback'

export type RbacContext = {
  role: UserRole
  userId?: string
  coachId?: string
  orgId?: string
}

