import { useState } from 'react'
import { Goal, UserRole } from '../models'
import { useAuth } from '../context/AuthContext'
import { useGoals, useUpdateGoalProgress } from '../hooks/useGoals'
import GoalKanbanBoard from '../components/goals/GoalKanbanBoard'
import GoalDetailsModal from '../components/goals/GoalDetailsModal'
import CreateGoalModal from '../components/goals/CreateGoalModal'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'
import { Card, CardContent } from '../components/ui/card'
import { Target, Search, Plus, LayoutGrid, List } from 'lucide-react'
import GoalCard from '../components/goals/GoalCard'
import { useToast } from '../hooks/use-toast'

type ViewMode = 'kanban' | 'list'
type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'completed' | 'blocked'
type FilterPriority = 'all' | 'low' | 'medium' | 'high'

export default function GoalsPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [viewMode, setViewMode] = useState<ViewMode>('kanban')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Build query params for API
    const queryParams: Record<string, string> = {}
    if (filterStatus !== 'all') queryParams.status = filterStatus
    if (filterPriority !== 'all') queryParams.priority = filterPriority
    if (user?.organizationId) queryParams.organizationId = user.organizationId
    if (user?.role === UserRole.COACH) queryParams.coachId = user._id
    if (user?.role === UserRole.ENTREPRENEUR) queryParams.entrepreneurId = user._id

    const { data: goals = [], isLoading, refetch } = useGoals(queryParams)
    const updateProgressMutation = useUpdateGoalProgress()

    // Filter goals
    const getEntityId = (entity: any) => typeof entity === 'string' ? entity : entity?._id ?? ''

    const filteredGoals = goals.filter(goal => {
        const description = typeof goal.description === 'string' ? goal.description : ''
        const matchesSearch = (goal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || goal.status === filterStatus
        const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority
        return matchesSearch && matchesStatus && matchesPriority
    })

    // Role-specific filtering
    const roleFilteredGoals = filteredGoals.filter(goal => {
        if (user?.role === UserRole.ENTREPRENEUR) {
            return getEntityId(goal.entrepreneurId) === user._id
        }
        if (user?.role === UserRole.COACH) {
            return getEntityId(goal.coachId) === user._id
        }
        return true // Manager sees all
    })

    const handleGoalClick = (goal: Goal) => {
        setSelectedGoal(goal)
        setIsDetailsOpen(true)
    }

    const handleUpdateProgress = async (goalId: string, progress: number) => {
        const targetGoal = goals.find(g => g._id === goalId)
        if (!targetGoal) return

        if (user?.role === UserRole.ENTREPRENEUR && getEntityId(targetGoal.entrepreneurId) !== user._id) {
            toast({
                title: 'Action not permitted',
                description: 'You can only update progress on your own goals.',
                variant: 'destructive',
            })
            return
        }

        if (user?.role === UserRole.COACH && getEntityId(targetGoal.coachId) !== user._id) {
            toast({
                title: 'Action not permitted',
                description: 'You can only update progress for goals assigned to you.',
                variant: 'destructive',
            })
            return
        }

        try {
            await updateProgressMutation.mutateAsync({ goalId, progress })
            toast({
                title: 'Success',
                description: 'Goal progress updated successfully',
            })
            setIsDetailsOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update progress',
                variant: 'destructive',
            })
        }
    }

    const handleCreateSuccess = () => {
        refetch()
        toast({
            title: 'Success',
            description: 'Goal created successfully',
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading goals...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">
                                {user?.role === 'entrepreneur' ? 'My Goals' : 'Goals & Milestones'}
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                {user?.role === 'entrepreneur'
                                    ? 'Track your progress and achieve your objectives'
                                    : user?.role === 'coach'
                                        ? "Monitor your entrepreneurs' progress"
                                        : 'Manage and track all organizational goals'}
                            </p>
                        </div>
                        {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Goal
                            </Button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">Total Goals</p>
                                <p className="text-2xl font-bold">{roleFilteredGoals.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {roleFilteredGoals.filter(g => g.status === 'in_progress').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {roleFilteredGoals.filter(g => g.status === 'completed').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1">Avg Progress</p>
                                <p className="text-2xl font-bold text-primary">
                                    {roleFilteredGoals.length > 0
                                        ? Math.round(
                                            roleFilteredGoals.reduce((sum, g) => sum + (g.progress ?? 0), 0) /
                                            roleFilteredGoals.length
                                        )
                                        : 0}
                                    %
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and View Toggle */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search goals..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="not_started">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Filter */}
                            <Select value={filterPriority} onValueChange={(value: FilterPriority) => setFilterPriority(value)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('kanban')}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Kanban
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4 mr-2" />
                                List
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {roleFilteredGoals.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No goals found</h3>
                            <p className="text-muted-foreground mb-6">
                                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first goal'}
                            </p>
                            {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Goal
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : viewMode === 'kanban' ? (
                    <GoalKanbanBoard goals={roleFilteredGoals} onGoalClick={handleGoalClick} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roleFilteredGoals.map(goal => (
                            <GoalCard key={goal._id} goal={goal} onClick={() => handleGoalClick(goal)} />
                        ))}
                    </div>
                )}

                {/* Create Goal Modal */}
                <CreateGoalModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />

                {/* Goal Details Modal */}
                <GoalDetailsModal
                    goal={selectedGoal}
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    onUpdateProgress={handleUpdateProgress}
                    userRole={user?.role}
                    currentUserId={user?._id}
                />
            </div>
        </div>
    )
}
