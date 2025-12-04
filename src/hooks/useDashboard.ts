import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'
import type { DashboardStats } from '../models'
import { UserRole } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useDashboardStats(
  params?: Record<string, string | number>,
  options?: QueryOpts<DashboardStats>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'stats', user?._id ?? 'anonymous', params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      const isAdmin = user?.role === UserRole.ADMIN

      if (!isAdmin) {
        if (user?.organizationId) {
          scopedParams.organizationId = user.organizationId
        }

        switch (user?.role) {
          case UserRole.COACH:
            scopedParams.coachId = user._id
            break
          case UserRole.ENTREPRENEUR:
            scopedParams.entrepreneurId = user._id
            break
          default:
            break
        }
      }

      const res = await apiClient.get(endpoints.dashboard.stats, { params: scopedParams })
      // Handle both wrapped { data: {...} } and direct object responses
      return (res.data?.data || res.data) as DashboardStats
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

