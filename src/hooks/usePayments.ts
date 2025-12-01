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

      if (!user?._id) {
        return []
      }

      if (user.role === UserRole.COACH) {
        const { scope, ...coachParams } = scopedParams
        const res = await apiClient.get(endpoints.users.payments(user._id), { params: coachParams })
        const payload = res.data
        if (Array.isArray(payload)) return payload as Payment[]
        return (payload?.data ?? []) as Payment[]
      }

      if (user.organizationId) {
        scopedParams.organizationId = user.organizationId
      }

      const res = await apiClient.get(endpoints.payments.list, { params: scopedParams })
      const payload = res.data
      return (Array.isArray(payload) ? payload : payload?.data ?? []) as Payment[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

