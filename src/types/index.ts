export interface User {
  id: string
  email: string
  name: string
  role: "manager" | "coach" | "entrepreneur"
  createdAt: string
}

export interface Session {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location: string
  coachId: string
  entrepreneurId: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  description: string
  entrepreneurId: string
  startDate: string
  targetDate: string
  status: "active" | "completed" | "abandoned"
  metrics?: Record<string, unknown>
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
