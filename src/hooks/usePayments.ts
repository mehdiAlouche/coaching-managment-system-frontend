import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from '../services'
import type { Payment } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function usePayments(
  params?: Record<string, string | number>,
  options?: QueryOpts<Payment[]>
) {
  return useQuery({
    queryKey: ['payments', 'list', params],
    queryFn: async () => {
      // Assuming /payments; allow override via env by extending endpoints in future
      const res = await apiClient.get('/payments', { params })
      // Handle both wrapped { data: [...] } and direct array responses
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Payment[]
    },
    ...(options as object),
  })
}

