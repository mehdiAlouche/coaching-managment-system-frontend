import type { Session } from '../../models'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, Clock, ChevronRight, MoreVertical, Check, XCircle, CheckCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/services'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/models'

type Props = {
	title?: string
	sessions: Session[]
	emptyText?: string
}

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
	scheduled: 'default',
	completed: 'secondary',
	canceled: 'destructive',
	cancelled: 'destructive',
}

export default function UpcomingSessions({ title = 'Upcoming Sessions', sessions, emptyText = 'No upcoming sessions' }: Props) {
	const queryClient = useQueryClient()
	const { handleError, showSuccess } = useErrorHandler()
	const { user } = useAuth()
	const canManage = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN || user?.role === UserRole.COACH

	const updateStatusMutation = useMutation({
		mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
			const response = await apiClient.patch(endpoints.sessions.statusUpdate(sessionId), { status })
			return response.data
		},
		onSuccess: (response) => {
			const updatedSession = response.data || response
			queryClient.invalidateQueries({ queryKey: ['sessions'] })
			queryClient.invalidateQueries({ queryKey: ['dashboard'] })
			const statusText = updatedSession.status.charAt(0).toUpperCase() + updatedSession.status.slice(1).replace('_', ' ')
			showSuccess(`Session status updated to ${statusText}`)
		},
		onError: (error) => {
			handleError(error)
		},
	})

	const handleStatusChange = (sessionId: string, status: string, e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		updateStatusMutation.mutate({ sessionId, status })
	}

	return (
		<section className="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{sessions.length === 0 ? (
						<div className="p-12 text-center">
							<Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground font-medium">{emptyText}</p>
						</div>
					) : (
						<div className="divide-y">
							{sessions.map((s) => {
								const sessionTitle = s.agendaItems && s.agendaItems.length > 0 
									? s.agendaItems[0].title 
									: 'Coaching Session'
								const sessionDate = new Date(s.scheduledAt)
								return (
									<Link
										key={s._id}
										to="/sessions/$id"
										params={{ id: s._id }}
										className="block p-5 hover:bg-muted/50 transition-colors duration-200 group"
									>
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<p className="font-semibold text-foreground group-hover:text-primary transition-colors">
														{sessionTitle}
													</p>
													<Badge 
														variant={statusVariantMap[s.status] || 'default'}
														className="capitalize"
													>
														{s.status}
													</Badge>
												</div>
												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													<span className="flex items-center gap-1.5">
														<Calendar className="h-4 w-4" />
														{sessionDate.toLocaleDateString('en-US', { 
															month: 'short', 
															day: 'numeric', 
															year: 'numeric' 
														})}
													</span>
													<span className="flex items-center gap-1.5">
														<Clock className="h-4 w-4" />
														{sessionDate.toLocaleTimeString('en-US', { 
															hour: 'numeric', 
															minute: '2-digit' 
														})}
													</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												{canManage && (s.status === 'scheduled' || s.status === 'confirmed') && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															{s.status === 'scheduled' && (
																<DropdownMenuItem onClick={(e) => handleStatusChange(s._id, 'confirmed', e)}>
																	<Check className="h-4 w-4 mr-2" />
																	Confirm
																</DropdownMenuItem>
															)}
															<DropdownMenuItem onClick={(e) => handleStatusChange(s._id, 'completed', e)}>
																<CheckCircle className="h-4 w-4 mr-2" />
																Complete
															</DropdownMenuItem>
															<DropdownMenuItem onClick={(e) => handleStatusChange(s._id, 'cancelled', e)}>
																<XCircle className="h-4 w-4 mr-2" />
																Cancel
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												)}
												<ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
											</div>
										</div>
									</Link>
								)
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	)
}


