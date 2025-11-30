import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'
import type { Payment } from '../models'
import { UserRole } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function usePayments(
  params?: Record<string, string | number>,
  options?: QueryOpts<Payment[]>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['payments', 'list', user?._id ?? 'anonymous', params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      if (user?.organizationId) {
        scopedParams.organizationId = user.organizationId
      }

      if (user?.role === UserRole.COACH) {
        scopedParams.coachId = user._id
      }

      const res = await apiClient.get(endpoints.payments.list, { params: scopedParams })
      // Handle both wrapped { data: [...] } and direct array responses
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Payment[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

