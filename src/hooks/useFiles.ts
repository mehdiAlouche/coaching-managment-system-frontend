import { useMutation } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useToast } from './use-toast'

export interface UploadedFile {
  _id: string
  filename: string
  url: string
  mimetype: string
  size: number
  uploadedAt: string
}

export function useFileUpload() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (file: File): Promise<UploadedFile> => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post(endpoints.files.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data?.data || res.data
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to upload file',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteFile() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await apiClient.delete(endpoints.files.delete(fileId))
      return res.data
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete file',
        variant: 'destructive',
      })
    },
  })
}
