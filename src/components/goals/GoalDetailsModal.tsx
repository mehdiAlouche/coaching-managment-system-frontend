import { useState } from 'react'
import { Goal, UserRole } from '../../models'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Calendar, User, Target, CheckCircle2, Circle } from 'lucide-react'
import { formatFriendlyDate, formatRelativeTime } from '../../lib/date-utils'
import { cn } from '../../lib/utils'

interface GoalDetailsModalProps {
    goal: Goal | null
    isOpen: boolean
    onClose: () => void
    onUpdateProgress?: (goalId: string, progress: number, notes: string) => void
    userRole?: UserRole
}

export default function GoalDetailsModal({
    goal,
    isOpen,
    onClose,
    onUpdateProgress,
    userRole = UserRole.ENTREPRENEUR
}: GoalDetailsModalProps) {
    const [showUpdateProgress, setShowUpdateProgress] = useState(false)
    const [newProgress, setNewProgress] = useState(goal?.progress ?? 0)
    const [updateNotes, setUpdateNotes] = useState('')

    if (!goal) return null

    const progress = goal.progress ?? 0
    const canEdit = userRole === 'manager' || userRole === 'coach'

    const handleUpdateProgress = () => {
        if (onUpdateProgress) {
            onUpdateProgress(goal._id, newProgress, updateNotes)
            setShowUpdateProgress(false)
            setUpdateNotes('')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{goal.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Progress Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg">Progress</h3>
                            <span className="text-2xl font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3 mb-2" />
                        {canEdit && !showUpdateProgress && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowUpdateProgress(true)}
                                className="mt-2"
                            >
                                Update Progress
                            </Button>
                        )}

                        {showUpdateProgress && (
                            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                                <Label>New Progress: {newProgress}%</Label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={newProgress}
                                    onChange={(e) => setNewProgress(parseInt(e.target.value))}
                                    className="w-full mt-2 mb-4"
                                />
                                <Label>Update Notes</Label>
                                <Textarea
                                    value={updateNotes}
                                    onChange={(e) => setUpdateNotes(e.target.value)}
                                    placeholder="What progress have you made?"
                                    className="mt-2 mb-3"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdateProgress}>Save Update</Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowUpdateProgress(false)
                                            setNewProgress(progress)
                                            setUpdateNotes('')
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground">{goal.description}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <User className="h-4 w-4" />
                                <span className="font-medium">Entrepreneur ID</span>
                            </div>
                            <p className="text-sm font-mono text-xs">{goal.entrepreneurId || 'Not assigned'}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <User className="h-4 w-4" />
                                <span className="font-medium">Coach ID</span>
                            </div>
                            <p className="text-sm font-mono text-xs">{goal.coachId || 'Not assigned'}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Created</span>
                            </div>
                            <p className="text-sm">{formatFriendlyDate(goal.createdAt)}</p>
                        </div>
                        {goal.targetDate && (
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Target className="h-4 w-4" />
                                    <span className="font-medium">Target Date</span>
                                </div>
                                <p className="text-sm">
                                    {formatFriendlyDate(goal.targetDate)}
                                    <span className="text-xs ml-2 text-muted-foreground">
                                        ({formatRelativeTime(goal.targetDate)})
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {goal.priority && (
                            <Badge variant="outline">Priority: {goal.priority}</Badge>
                        )}
                        {goal.status && (
                            <Badge variant="outline">Status: {goal.status.replace('_', ' ')}</Badge>
                        )}
                        {goal.isArchived && (
                            <Badge variant="outline" className="bg-gray-100">Archived</Badge>
                        )}
                    </div>

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-3">Milestones</h3>
                            <div className="space-y-2">
                                {goal.milestones.map((milestone, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex items-start gap-3 p-3 rounded-lg border',
                                            milestone.completedAt ? 'bg-green-50 border-green-200' : 'bg-background'
                                        )}
                                    >
                                        {milestone.completedAt ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className={cn(
                                                'font-medium',
                                                milestone.completedAt && 'line-through text-muted-foreground'
                                            )}>
                                                {milestone.title}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1">
                                                {milestone.targetDate && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Target: {formatFriendlyDate(milestone.targetDate)}
                                                    </p>
                                                )}
                                                {milestone.completedAt && (
                                                    <p className="text-xs text-green-600">
                                                        Completed: {formatFriendlyDate(milestone.completedAt)}
                                                    </p>
                                                )}
                                            </div>
                                            {milestone.notes && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {milestone.notes}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">Status: {milestone.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Linked Sessions */}
                    {goal.linkedSessions && goal.linkedSessions.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-3">Linked Sessions</h3>
                            <div className="space-y-2">
                                {goal.linkedSessions.map((sessionId, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                        <p className="text-sm font-mono">{sessionId}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
