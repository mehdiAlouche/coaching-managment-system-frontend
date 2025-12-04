import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'
import type { SessionDetailed } from '../models'
import { UserRole } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useSessions(
  params?: Record<string, string | number>,
  options?: QueryOpts<SessionDetailed[]>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['sessions', 'list', user?._id ?? 'anonymous', params],
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

      const res = await apiClient.get(endpoints.sessions.list, { params: scopedParams })
      // Handle both wrapped { data: [...] } and direct array responses
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as SessionDetailed[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

