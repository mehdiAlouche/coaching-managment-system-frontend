import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import type { UserDetailed } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useUsers(
  params?: Record<string, string | number>,
  options?: QueryOpts<UserDetailed[]>
) {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.users.list, { params })
      // Handle multiple response formats: direct array, wrapped in data, or wrapped in users
      if (Array.isArray(res.data)) {
        return res.data as UserDetailed[]
      }
      if (Array.isArray(res.data?.data)) {
        return res.data.data as UserDetailed[]
      }
      if (Array.isArray(res.data?.users)) {
        return res.data.users as UserDetailed[]
      }
      return [] as UserDetailed[]
    },
    ...(options as object),
  })
}

