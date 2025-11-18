import type { SessionDetailed as Session } from '../../models'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Calendar, Clock, ChevronRight } from 'lucide-react'

type Props = {
	title?: string
	sessions: Session[]
	emptyText?: string
}

const statusVariantMap = {
	scheduled: 'default',
	completed: 'secondary',
	canceled: 'destructive',
} as const

export default function UpcomingSessions({ title = 'Upcoming Sessions', sessions, emptyText = 'No upcoming sessions' }: Props) {
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
											<ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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


