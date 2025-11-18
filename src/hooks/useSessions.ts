import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import type { SessionDetailed } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useSessions(
  params?: Record<string, string | number>,
  options?: QueryOpts<SessionDetailed[]>
) {
  return useQuery({
    queryKey: ['sessions', 'list', params],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.sessions.list, { params })
      // Handle both wrapped { data: [...] } and direct array responses
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as SessionDetailed[]
    },
    ...(options as object),
  })
}

