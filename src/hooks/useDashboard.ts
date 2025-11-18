import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import type { DashboardStats } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useDashboardStats(
  params?: Record<string, string | number>,
  options?: QueryOpts<DashboardStats>
) {
  return useQuery({
    queryKey: ['dashboard', 'stats', params],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.dashboard.stats, { params })
      // Handle both wrapped { data: {...} } and direct object responses
      return (res.data?.data || res.data) as DashboardStats
    },
    ...(options as object),
  })
}

