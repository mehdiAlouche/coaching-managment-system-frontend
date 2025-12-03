import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User } from '../../models'
import { apiClient, endpoints } from '../../services'
import { useAuth } from '../../context/AuthContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface Milestone {
    title: string
    status: string
    targetDate: string
    notes: string
}

interface CreateGoalModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateGoalModal({ isOpen, onClose, onSuccess }: CreateGoalModalProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const userRole = user?.role?.toLowerCase() || ''
    const isCoach = userRole === 'coach'

    const [formData, setFormData] = useState({
        entrepreneurId: '',
        coachId: isCoach ? (user?._id || '') : '',
        title: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        targetDate: '',
        milestones: [] as Milestone[],
    })

    const orgId = user?.organizationId || ''

    // Fetch coaches (only for managers/admins)
    const { data: coaches = [] } = useQuery<User[]>({
        queryKey: ['users', 'coaches', orgId],
        queryFn: async () => {
            const res = await apiClient.get(endpoints.users.list, {
                params: { role: 'coach', organizationId: orgId }
            })
            return Array.isArray(res.data.data) ? res.data.data : []
        },
        enabled: !!orgId && isOpen && !isCoach,
    })

    // Fetch entrepreneurs
    const { data: entrepreneurs = [] } = useQuery<User[]>({
        queryKey: ['users', 'entrepreneurs', orgId],
        queryFn: async () => {
            const res = await apiClient.get(endpoints.users.list, {
                params: { role: 'entrepreneur', organizationId: orgId }
            })
            return Array.isArray(res.data.data) ? res.data.data : []
        },
        enabled: !!orgId && isOpen,
    })

    const handleAddMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [
                ...prev.milestones,
                { title: '', status: 'not_started', targetDate: '', notes: '' }
            ]
        }))
    }

    const handleRemoveMilestone = (index: number) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }))
    }

    const handleMilestoneChange = (index: number, field: keyof Milestone, value: string) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.map((m, i) =>
                i === index ? { ...m, [field]: value } : m
            )
        }))
    }

    const toIsoDate = (value: string) => {
        if (!value) return undefined
        const iso = new Date(`${value}T00:00:00Z`)
        return Number.isNaN(iso.getTime()) ? undefined : iso.toISOString()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
            const coachId = isCoach ? user?._id : formData.coachId
        
        if (!formData.entrepreneurId || !coachId || !formData.title) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                entrepreneurId: formData.entrepreneurId,
                coachId: coachId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                status: formData.status,
                priority: formData.priority,
            } as Record<string, any>

            const targetDateIso = toIsoDate(formData.targetDate)
            if (targetDateIso) {
                payload.targetDate = targetDateIso
            }

            payload.milestones = formData.milestones
                .filter(m => m.title.trim() !== '')
                .map(milestone => {
                    const milestoneData: Record<string, any> = {
                        title: milestone.title.trim(),
                        status: milestone.status,
                    }

                    const milestoneIso = toIsoDate(milestone.targetDate)
                    if (milestoneIso) {
                        milestoneData.targetDate = milestoneIso
                    }
                    if (milestone.notes.trim()) {
                        milestoneData.notes = milestone.notes.trim()
                    }
                    return milestoneData
                })

            await apiClient.post(endpoints.goals.create, payload)
            
            toast({
                title: 'Success',
                description: 'Goal created successfully',
            })
            
            // Reset form
            setFormData({
                entrepreneurId: '',
                coachId: isCoach ? (user?._id || '') : '',
                title: '',
                description: '',
                status: 'not_started',
                priority: 'medium',
                targetDate: '',
                milestones: [],
            })
            
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create goal',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter goal title"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the goal..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="entrepreneurId">Entrepreneur *</Label>
                                <Select
                                    value={formData.entrepreneurId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, entrepreneurId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select entrepreneur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {entrepreneurs.map(entrepreneur => (
                                            <SelectItem key={entrepreneur._id} value={entrepreneur._id}>
                                                {entrepreneur.firstName} {entrepreneur.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {!isCoach && (
                                <div>
                                    <Label htmlFor="coachId">Coach *</Label>
                                    <Select
                                        value={formData.coachId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, coachId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select coach" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {coaches.map(coach => (
                                                <SelectItem key={coach._id} value={coach._id}>
                                                    {coach.firstName} {coach.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
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
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="targetDate">Target Date</Label>
                                <Input
                                    id="targetDate"
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label>Milestones</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddMilestone}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Milestone
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.milestones.map((milestone, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-muted/50">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-sm font-medium">Milestone {index + 1}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMilestone(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Milestone title"
                                            value={milestone.title}
                                            onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                                        />
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <Select
                                                value={milestone.status}
                                                onValueChange={(value) => handleMilestoneChange(index, 'status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="not_started">Not Started</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="blocked">Blocked</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            
                                            <Input
                                                type="date"
                                                value={milestone.targetDate}
                                                onChange={(e) => handleMilestoneChange(index, 'targetDate', e.target.value)}
                                            />
                                        </div>
                                        
                                        <Textarea
                                            placeholder="Notes (optional)"
                                            value={milestone.notes}
                                            onChange={(e) => handleMilestoneChange(index, 'notes', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
