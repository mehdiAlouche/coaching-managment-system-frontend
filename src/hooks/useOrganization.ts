import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'
import { Organization } from '../models'
import { useToast } from './use-toast'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useOrganization(options?: QueryOpts<Organization>) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.organization.get)
      return (res.data?.data || res.data) as Organization
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user?.organizationId,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      const res = await apiClient.patch(endpoints.organization.update, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      toast({
        title: 'Success',
        description: 'Organization settings updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update organization settings',
        variant: 'destructive',
      })
    },
  })
}

export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await apiClient.post(endpoints.organization.uploadLogo, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] })
      toast({
        title: 'Success',
        description: 'Organization logo uploaded successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to upload logo',
        variant: 'destructive',
      })
    },
  })
}
