import type { Goal } from '../../models'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Target, Calendar, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function GoalOverview({ goals }: { goals: Goal[] }) {
	return (
		<section className="mb-8">
			<h2 className="text-xl font-bold text-gray-900 mb-6">Goal Overview</h2>
			{goals.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center">
						<Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground font-medium">No goals found</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{goals.map((g) => {
						const progress = Math.min(Math.max(g.progress ?? 0, 0), 100)
						const isComplete = progress === 100
						return (
							<Card 
								key={g.id} 
								className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1"
							>
								<CardContent className="p-6">
									<div className="flex items-start justify-between mb-4">
										<h3 className="font-semibold text-foreground pr-2">{g.title}</h3>
										{isComplete && (
											<Badge variant="default" className="bg-green-500 hover:bg-green-600">
												<Check className="h-3 w-3 mr-1" />
												Complete
											</Badge>
										)}
									</div>
									<div className="mb-3">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium text-muted-foreground">Progress</span>
											<span className="text-sm font-bold text-foreground">{progress}%</span>
										</div>
										<div className="h-3 bg-muted rounded-full overflow-hidden">
											<div 
												className={cn(
													"h-full rounded-full transition-all duration-500",
													isComplete 
														? 'bg-gradient-to-r from-green-500 to-green-600' 
														: 'bg-gradient-to-r from-primary to-primary/80'
												)}
												style={{ width: `${progress}%` }}
											/>
										</div>
									</div>
									{g.deadline && (
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Calendar className="h-4 w-4" />
											<span>Due {new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}
		</section>
	)
}


