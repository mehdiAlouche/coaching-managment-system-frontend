import { useMutation } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useToast } from './use-toast'

export function useExportDashboard() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (params?: Record<string, string | number>) => {
      const res = await apiClient.get(endpoints.export.dashboard, {
        params,
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = res.headers['content-disposition']
      let filename = 'dashboard-export.csv'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) filename = filenameMatch[1]
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return res.data
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Dashboard data exported successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to export data',
        variant: 'destructive',
      })
    },
  })
}
