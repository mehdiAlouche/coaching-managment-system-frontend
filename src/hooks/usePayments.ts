import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'
import type { Payment } from '../models'
import { UserRole } from '../models'
import { useToast } from './use-toast'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function usePayments(
  params?: Record<string, string | number>,
  options?: QueryOpts<Payment[]>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['payments', 'list', user?._id ?? 'anonymous', params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = { ...(params ?? {}) }

      if (!user?._id) return []

      const isAdmin = user.role === UserRole.ADMIN

      if (!isAdmin) {
        if (user.organizationId) {
          scopedParams.organizationId = user.organizationId
        }

        if (user.role === UserRole.COACH) {
          scopedParams.coachId = user._id
        } else if (user.role === UserRole.ENTREPRENEUR) {
          scopedParams.entrepreneurId = user._id
        }
      }

      const res = await apiClient.get(endpoints.payments.list, { params: scopedParams })
      const payload = res.data
      return (Array.isArray(payload) ? payload : payload?.data ?? []) as Payment[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

export function useDownloadInvoice() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await apiClient.get(endpoints.payments.invoice(paymentId), {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${paymentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return res.data
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invoice downloaded successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to download invoice',
        variant: 'destructive',
      })
    },
  })
}

export function useSendInvoiceEmail() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await apiClient.post(endpoints.payments.sendInvoice(paymentId))
      return res.data
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invoice sent via email successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to send invoice',
        variant: 'destructive',
      })
    },
  })
}

