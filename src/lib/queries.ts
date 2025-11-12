import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from './api-client'
import endpoints from './api-endpoints'

type QueryOpts<T> = Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryKey' | 'queryFn'>

export type DashboardStats = {
	totalSessions: number
	activeCoaches: number
	activeEntrepreneurs: number
	pendingPayments: number
	earningsThisMonth?: number
}

export function useDashboardStats(params?: Record<string, string | number>, options?: QueryOpts<DashboardStats>) {
	return useQuery({
		queryKey: ['dashboard', 'stats', params],
		queryFn: async () => {
			const res = await apiClient.get(endpoints.dashboard.stats, { params })
			return res.data as DashboardStats
		},
		...(options as object),
	})
}

export type Session = {
	id: string
	title: string
	status: 'scheduled' | 'completed' | 'canceled'
	date: string
	coachId?: string
	userId?: string
	participants?: Array<{ id: string; name: string; role: 'coach' | 'entrepreneur' }>
}

export function useSessions(params?: Record<string, string | number>, options?: QueryOpts<Session[]>) {
	return useQuery({
		queryKey: ['sessions', 'list', params],
		queryFn: async () => {
			const res = await apiClient.get(endpoints.sessions.list, { params })
			return res.data as Session[]
		},
		...(options as object),
	})
}

export type Payment = {
	id: string
	amount: number
	status: 'pending' | 'paid' | 'overdue'
	date: string
	userId?: string
	coachId?: string
}

export function usePayments(params?: Record<string, string | number>, options?: QueryOpts<Payment[]>) {
	return useQuery({
		queryKey: ['payments', 'list', params],
		queryFn: async () => {
			// Assuming /payments; allow override via env by extending endpoints in future
			const res = await apiClient.get('/payments', { params })
			return res.data as Payment[]
		},
		...(options as object),
	})
}

export type User = {
	id: string
	name: string
	email: string
	role: 'manager' | 'coach' | 'entrepreneur' | 'admin'
}

export function useUsers(params?: Record<string, string | number>, options?: QueryOpts<User[]>) {
	return useQuery({
		queryKey: ['users', 'list', params],
		queryFn: async () => {
			const res = await apiClient.get('/users', { params })
			return res.data as User[]
		},
		...(options as object),
	})
}

export type Goal = {
	id: string
	title: string
	progress: number
	deadline?: string
	ownerId?: string
	coachId?: string
}

export function useGoals(params?: Record<string, string | number>, options?: QueryOpts<Goal[]>) {
	return useQuery({
		queryKey: ['goals', 'list', params],
		queryFn: async () => {
			const res = await apiClient.get('/goals', { params })
			return res.data as Goal[]
		},
		...(options as object),
	})
}


