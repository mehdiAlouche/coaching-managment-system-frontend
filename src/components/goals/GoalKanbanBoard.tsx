import { Goal } from '../../models'
import GoalCard from './GoalCard'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface GoalKanbanBoardProps {
    goals: Goal[]
    onGoalClick?: (goal: Goal) => void
}

export default function GoalKanbanBoard({ goals, onGoalClick }: GoalKanbanBoardProps) {
    const notStarted = goals.filter(g => g.status === 'not_started' || !g.status)
    const inProgress = goals.filter(g => g.status === 'in_progress')
    const completed = goals.filter(g => g.status === 'completed')

    const Column = ({ title, goals, emoji }: { title: string; goals: Goal[]; emoji: string }) => (
        <div className="flex-1 min-w-[300px]">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>{title}</span>
                        <span className="text-2xl">{emoji}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{goals.length} goals</p>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                    {goals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No goals in this stage
                        </div>
                    ) : (
                        goals.map(goal => (
                            <GoalCard
                                key={goal._id}
                                goal={goal}
                                onClick={() => onGoalClick?.(goal)}
                            />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="flex gap-6 overflow-x-auto pb-4">
            <Column title="Not Started" goals={notStarted} emoji="📋" />
            <Column title="In Progress" goals={inProgress} emoji="🔥" />
            <Column title="Completed" goals={completed} emoji="✅" />
        </div>
    )
}
