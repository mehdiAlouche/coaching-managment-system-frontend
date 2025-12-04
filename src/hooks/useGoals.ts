import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import { useAuth } from '../context/AuthContext'
import type { Goal } from '../models'
import { UserRole } from '../models'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export function useGoals(
  params?: Record<string, string | number>,
  options?: QueryOpts<Goal[]>
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['goals', 'list', user?._id ?? 'anonymous', params],
    queryFn: async () => {
      const scopedParams: Record<string, string | number> = {
        ...(params ?? {}),
      }

      const isAdmin = user?.role === UserRole.ADMIN

      if (!isAdmin) {
        if (user?.organizationId) {
          scopedParams.organizationId = user.organizationId
        }

        switch (user?.role) {
          case UserRole.COACH:
            scopedParams.coachId = user._id
            break
          case UserRole.ENTREPRENEUR:
            scopedParams.entrepreneurId = user._id
            break
          default:
            break
        }
      }

      const res = await apiClient.get(endpoints.goals.list, { params: scopedParams })
      // Handle both wrapped { data: [...] } and direct array responses
      return (Array.isArray(res.data) ? res.data : res.data?.data || []) as Goal[]
    },
    ...(options as object),
    enabled: (options?.enabled ?? true) && !!user,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (goalData: Partial<Goal>) => {
      const res = await apiClient.post(endpoints.goals.create, goalData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      const res = await apiClient.patch(endpoints.goals.progressUpdate(goalId), { progress })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateMilestoneStatus() {
  const queryClient = useQueryClient()
  type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'
  
  return useMutation({
    mutationFn: async ({ 
      goalId, 
      milestoneId, 
      status, 
      notes 
    }: { 
      goalId: string
      milestoneId: string
      status: MilestoneStatus
      notes?: string 
    }) => {
      const payload: { status: MilestoneStatus; notes?: string } = { status }
      const cleanNotes = (notes ?? '').trim()
      if (cleanNotes) payload.notes = cleanNotes
      const res = await apiClient.patch(
        endpoints.goals.milestoneStatus(goalId, milestoneId), 
        payload
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useAddGoalComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, text }: { goalId: string; text: string }) => {
      const res = await apiClient.post(endpoints.goals.addComment(goalId), { text })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useAddGoalCollaborator() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, userId, role }: { goalId: string; userId: string; role?: string }) => {
      const res = await apiClient.post(endpoints.goals.addCollaborator(goalId), { userId, role })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useLinkSessionToGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, sessionId }: { goalId: string; sessionId: string }) => {
      const res = await apiClient.post(endpoints.goals.linkSession(goalId, sessionId))
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, data }: { goalId: string; data: Partial<Goal> }) => {
      const res = await apiClient.patch(endpoints.goals.partialUpdate(goalId), data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await apiClient.delete(endpoints.goals.delete(goalId))
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useArchiveGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await apiClient.patch(endpoints.goals.partialUpdate(goalId), { isArchived: true })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useChangeGoalStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, status }: { goalId: string; status: string }) => {
      const res = await apiClient.patch(endpoints.goals.partialUpdate(goalId), { status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

