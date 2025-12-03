import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

// Dashboard Sessions Chart Data
export interface SessionsChartData {
  date: string
  scheduled: number
  completed: number
  cancelled: number
  total: number
}

export function useSessionsChart(
  params?: Record<string, string | number>,
  options?: QueryOpts<SessionsChartData[]>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'sessions-chart', user?._id, params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      if (user?.organizationId) {
        scopedParams.organizationId = user.organizationId
      }

      const res = await apiClient.get(endpoints.dashboard.sessions, { params: scopedParams })
      return (res.data?.data || res.data) as SessionsChartData[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

// Goals by Category Data
export interface GoalsCategoryData {
  byStatus: {
    not_started: number
    in_progress: number
    completed: number
    blocked: number
  }
  byPriority: {
    low: number
    medium: number
    high: number
  }
}

export function useGoalsCategoryChart(
  params?: Record<string, string | number>,
  options?: QueryOpts<GoalsCategoryData>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'goals-category', user?._id, params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      if (user?.organizationId) {
        scopedParams.organizationId = user.organizationId
      }

      const res = await apiClient.get(endpoints.dashboard.goalsByCategory, { params: scopedParams })
      return (res.data?.data || res.data) as GoalsCategoryData
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

// Revenue Chart Data
export interface RevenueChartData {
  date: string
  revenue: number
  sessions: number
}

export function useRevenueChart(
  params?: Record<string, string | number>,
  options?: QueryOpts<RevenueChartData[]>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'revenue-chart', user?._id, params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      if (user?.organizationId) {
        scopedParams.organizationId = user.organizationId
      }

      const res = await apiClient.get(endpoints.dashboard.revenue, { params: scopedParams })
      return (res.data?.data || res.data) as RevenueChartData[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

// Payment Statistics
export interface PaymentStats {
  totalRevenue: number
  pendingAmount: number
  paidAmount: number
  overdueAmount: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  averagePaymentTime: number // in days
  revenueByMonth: Array<{ month: string; revenue: number }>
  revenueByCoach: Array<{ coachId: string; coachName: string; revenue: number }>
}

export function usePaymentStats(
  params?: Record<string, string | number>,
  options?: QueryOpts<PaymentStats>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['payments', 'stats', user?._id, params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      if (user?.organizationId) {
        scopedParams.organizationId = user.organizationId
      }

      const res = await apiClient.get(endpoints.payments.stats, { params: scopedParams })
      return (res.data?.data || res.data) as PaymentStats
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}
