import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from '../services'
import type { Goal } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useGoals(
  params?: Record<string, string | number>,
  options?: QueryOpts<Goal[]>
) {
  return useQuery({
    queryKey: ['goals', 'list', params],
    queryFn: async () => {
      const res = await apiClient.get('/goals', { params })
      // Handle both wrapped { data: [...] } and direct array responses
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Goal[]
    },
    ...(options as object),
  })
}

