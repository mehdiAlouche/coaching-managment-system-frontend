import { Goal } from '../../models'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Calendar, AlertCircle, CheckCircle2, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatRelativeTime, isOverdue } from '../../lib/date-utils'

interface GoalCardProps {
    goal: Goal
    onClick?: () => void
}

export default function GoalCard({ goal, onClick }: GoalCardProps) {
    const progress = Math.min(Math.max(goal.progress ?? 0, 0), 100)
    const isComplete = progress === 100 || goal.status === 'completed'
    const deadline = goal.targetDate
    const isLate = deadline && isOverdue(deadline) && !isComplete

    // Handle populated entrepreneur (could be string ID or object)
    const entrepreneurName = typeof goal.entrepreneurId === 'string' 
        ? goal.entrepreneurId 
        : `${(goal.entrepreneurId as any)?.firstName || ''} ${(goal.entrepreneurId as any)?.lastName || ''}`.trim() || (goal.entrepreneurId as any)?._id || 'N/A'

    const priorityColors: Record<string, string> = {
        low: 'bg-blue-100 text-blue-800 border-blue-300',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        high: 'bg-orange-100 text-orange-800 border-orange-300',
        critical: 'bg-red-100 text-red-800 border-red-300',
    }

    const statusColors: Record<string, string> = {
        not_started: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        abandoned: 'bg-red-100 text-red-800',
    }

    return (
        <Card
            className={cn(
                'group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer',
                isLate && 'border-red-500 border-2'
            )}
            onClick={onClick}
        >
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground pr-2 line-clamp-2 flex-1">
                        {goal.title}
                    </h3>
                    {isComplete && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {isLate && !isComplete && (
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Progress</span>
                        <span className="text-xs font-bold text-foreground">{progress}%</span>
                    </div>
                    <Progress
                        value={progress}
                        className={cn(
                            'h-2',
                            isComplete && '[&>div]:bg-green-500',
                            isLate && '[&>div]:bg-red-500'
                        )}
                    />
                </div>

                {/* Entrepreneur Info */}
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{entrepreneurName}</span>
                </div>

                {/* Deadline */}
                {deadline && (
                    <div className={cn(
                        'flex items-center gap-2 text-xs mb-3',
                        isLate ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                    )}>
                        <Calendar className="h-3 w-3" />
                        <span>
                            {isLate ? '🔴 ' : ''}
                            {formatRelativeTime(deadline)}
                        </span>
                    </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    {goal.priority && (
                        <Badge
                            variant="outline"
                            className={cn('text-xs', priorityColors[goal.priority])}
                        >
                            {goal.priority}
                        </Badge>
                    )}
                    {goal.status && (
                        <Badge
                            variant="outline"
                            className={cn('text-xs', statusColors[goal.status])}
                        >
                            {goal.status.replace('_', ' ')}
                        </Badge>
                    )}
                    {goal.milestones && goal.milestones.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {goal.milestones.filter(m => m.completedAt).length}/{goal.milestones.length} milestones
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
