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
import { Calendar, User, Target, CheckCircle2, Circle, MessageSquare } from 'lucide-react'
import { formatFriendlyDate, formatRelativeTime } from '../../lib/date-utils'
import { cn } from '../../lib/utils'
import { useUpdateMilestoneStatus, useAddGoalComment } from '../../hooks/useGoals'
import { useToast } from '../../hooks/use-toast'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'

interface GoalDetailsModalProps {
    goal: Goal | null
    isOpen: boolean
    onClose: () => void
    onUpdateProgress?: (goalId: string, progress: number) => void
    userRole?: string
    currentUserId?: string
}

export default function GoalDetailsModal({
    goal,
    isOpen,
    onClose,
    onUpdateProgress,
    userRole,
    currentUserId,
}: GoalDetailsModalProps) {
    const { toast } = useToast()
    const [showUpdateProgress, setShowUpdateProgress] = useState(false)
    const [newProgress, setNewProgress] = useState(goal?.progress ?? 0)
    const [showAddComment, setShowAddComment] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [editingMilestone, setEditingMilestone] = useState<string | null>(null)
    const [milestoneStatus, setMilestoneStatus] = useState('')
    const [milestoneNotes, setMilestoneNotes] = useState('')

    const updateMilestoneStatusMutation = useUpdateMilestoneStatus()
    const addCommentMutation = useAddGoalComment()

    if (!goal) return null

    const progress = goal.progress ?? 0
    const entrepreneurId = typeof goal.entrepreneurId === 'string'
        ? goal.entrepreneurId
        : (goal.entrepreneurId as any)?._id ?? ''
    const coachId = typeof goal.coachId === 'string'
        ? goal.coachId
        : (goal.coachId as any)?._id ?? ''

    const normalizedRole = typeof userRole === 'string' ? (userRole.toLowerCase() as UserRole) : ''
    const isManager = normalizedRole === UserRole.MANAGER || normalizedRole === UserRole.ADMIN
    const isCoach = normalizedRole === UserRole.COACH && coachId === currentUserId
    const isEntrepreneurOwner = normalizedRole === UserRole.ENTREPRENEUR && entrepreneurId === currentUserId

    const canUpdateProgress = isManager || isCoach || isEntrepreneurOwner
    const canManageMilestones = isManager || isCoach

    // Handle populated fields (could be string ID or object)
    const entrepreneurDisplay = typeof goal.entrepreneurId === 'string' 
        ? goal.entrepreneurId 
        : `${(goal.entrepreneurId as any)?.firstName || ''} ${(goal.entrepreneurId as any)?.lastName || ''}`.trim() || (goal.entrepreneurId as any)?._id || 'Not assigned'
    
    const coachDisplay = typeof goal.coachId === 'string' 
        ? goal.coachId 
        : `${(goal.coachId as any)?.firstName || ''} ${(goal.coachId as any)?.lastName || ''}`.trim() || (goal.coachId as any)?._id || 'Not assigned'

    const handleUpdateProgress = () => {
        if (onUpdateProgress && canUpdateProgress) {
            onUpdateProgress(goal._id, newProgress)
            setShowUpdateProgress(false)
        }
    }

    const handleUpdateMilestoneStatus = async (milestoneId: string) => {
        if (!canManageMilestones) return
        try {
            await updateMilestoneStatusMutation.mutateAsync({
                goalId: goal._id,
                milestoneId,
                status: milestoneStatus,
                notes: milestoneNotes
            })
            toast({
                title: 'Success',
                description: 'Milestone status updated successfully',
            })
            setEditingMilestone(null)
            setMilestoneNotes('')
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update milestone',
                variant: 'destructive',
            })
        }
    }

    const handleAddComment = async () => {
        if (!commentText.trim()) return

        try {
            await addCommentMutation.mutateAsync({
                goalId: goal._id,
                text: commentText
            })
            toast({
                title: 'Success',
                description: 'Comment added successfully',
            })
            setShowAddComment(false)
            setCommentText('')
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to add comment',
                variant: 'destructive',
            })
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
                        {canUpdateProgress && !showUpdateProgress && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowUpdateProgress(true)}
                                className="mt-2"
                            >
                                Update Progress
                            </Button>
                        )}

                        {showUpdateProgress && canUpdateProgress && (
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
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdateProgress}>Save Update</Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowUpdateProgress(false)
                                            setNewProgress(progress)
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
                                <span className="font-medium">Entrepreneur</span>
                            </div>
                            <p className="text-sm">{entrepreneurDisplay}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <User className="h-4 w-4" />
                                <span className="font-medium">Coach</span>
                            </div>
                            <p className="text-sm">{coachDisplay}</p>
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
                                {goal.milestones.map((milestone, index) => {
                                    const milestoneId = (milestone as any)._id || `milestone-${index}`
                                    const isEditing = editingMilestone === milestoneId
                                    
                                    return (
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
                                                
                                                {canManageMilestones && !isEditing && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => {
                                                            setEditingMilestone(milestoneId)
                                                            setMilestoneStatus(milestone.status)
                                                        }}
                                                    >
                                                        Update Status
                                                    </Button>
                                                )}

                                                {isEditing && (
                                                    <div className="mt-3 p-3 border rounded bg-muted/50 space-y-3">
                                                        <div>
                                                            <Label className="text-xs">New Status</Label>
                                                            <Select
                                                                value={milestoneStatus}
                                                                onValueChange={setMilestoneStatus}
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="not_started">Not Started</SelectItem>
                                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                                    <SelectItem value="completed">Completed</SelectItem>
                                                                    <SelectItem value="blocked">Blocked</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Notes (optional)</Label>
                                                            <Textarea
                                                                value={milestoneNotes}
                                                                onChange={(e) => setMilestoneNotes(e.target.value)}
                                                                placeholder="Add notes about this update..."
                                                                rows={2}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateMilestoneStatus(milestoneId)}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingMilestone(null)
                                                                    setMilestoneNotes('')
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add Comment Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Comments
                            </h3>
                            {!showAddComment && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAddComment(true)}
                                >
                                    Add Comment
                                </Button>
                            )}
                        </div>

                        {showAddComment && (
                            <div className="p-4 border rounded-lg bg-muted/50 mb-4">
                                <Label>Comment</Label>
                                <Textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write your comment here..."
                                    rows={3}
                                    className="mt-2 mb-3"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                                        Add Comment
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddComment(false)
                                            setCommentText('')
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

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
