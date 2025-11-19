import { useState } from 'react'
import { User, PaginatedResponse } from '../models'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import UsersTable from '../components/users/UsersTable'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'
import { Plus, Search, Users, UserCog, Briefcase, UserCheck } from 'lucide-react'

type FilterRole = 'all' | 'coach' | 'entrepreneur' | 'manager' | 'admin'

export default function UsersPage() {
    const { user } = useAuth()
    const [page, setPage] = useState(1)
    const [limit] = useState(20)
    const [sort, setSort] = useState('-createdAt')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState<FilterRole>('all')

    const { data, isLoading, error } = useQuery<PaginatedResponse<User>>({
        queryKey: ['users', { page, limit, sort }],
        queryFn: async () => {
            const response = await apiClient.get(endpoints.users.list, {
                params: {
                    page,
                    limit,
                    sort,
                },
            })
            return response.data
        },
    })

    const users = data?.data || []
    const meta = data?.meta

    // Client-side filtering for search and role
    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || u.role === filterRole
        return matchesSearch && matchesRole
    })

    // Calculate stats from all users (not just filtered)
    const stats = {
        total: users.length,
        coaches: users.filter(u => u.role === 'coach').length,
        entrepreneurs: users.filter(u => u.role === 'entrepreneur').length,
        active: users.filter(u => u.isActive).length,
    }

    const handleEdit = (user: User) => {
        // TODO: Open edit modal
        console.log('Edit user:', user)
    }

    const handleViewProfile = (user: User) => {
        // TODO: Navigate to user profile
        console.log('View profile:', user)
    }

    const handleToggleStatus = async (userId: string, isActive: boolean) => {
        // TODO: Implement API call to toggle user status
        console.log('Toggle status:', userId, isActive)
    }

    const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading users...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-600 font-semibold mb-2">Error loading users</p>
                        <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
                    </CardContent>
                </Card>
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
                            <h1 className="text-4xl font-bold text-foreground mb-2">Team Members</h1>
                            <p className="text-muted-foreground text-lg">
                                Manage your organization's users and permissions
                            </p>
                        </div>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                                        <p className="text-3xl font-bold">{meta?.total || stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Users className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Coaches</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.coaches}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <UserCog className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Entrepreneurs</p>
                                        <p className="text-3xl font-bold text-orange-600">{stats.entrepreneurs}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <Briefcase className="h-8 w-8 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <UserCheck className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Role Filter */}
                        <Select value={filterRole} onValueChange={(value: FilterRole) => setFilterRole(value)}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="coach">Coaches</SelectItem>
                                <SelectItem value="entrepreneur">Entrepreneurs</SelectItem>
                                <SelectItem value="manager">Managers</SelectItem>
                                <SelectItem value="admin">Admins</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select value={sort} onValueChange={(value) => {
                            setSort(value)
                            setPage(1)
                        }}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="-createdAt">Newest First</SelectItem>
                                <SelectItem value="createdAt">Oldest First</SelectItem>
                                <SelectItem value="firstName">First Name (A-Z)</SelectItem>
                                <SelectItem value="-firstName">First Name (Z-A)</SelectItem>
                                <SelectItem value="email">Email (A-Z)</SelectItem>
                                <SelectItem value="-email">Email (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                {filteredUsers.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No users found</h3>
                            <p className="text-muted-foreground mb-6">
                                {searchTerm || filterRole !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Add your first team member to get started'}
                            </p>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <UsersTable
                            users={filteredUsers}
                            onEdit={handleEdit}
                            onViewProfile={handleViewProfile}
                            onToggleStatus={handleToggleStatus}
                        />

                        {/* Pagination */}
                        {meta && totalPages > 1 && (
                            <Card className="mt-6">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setPage(page - 1)}
                                                disabled={page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum: number
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1
                                                    } else if (page <= 3) {
                                                        pageNum = i + 1
                                                    } else if (page >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i
                                                    } else {
                                                        pageNum = page - 2 + i
                                                    }
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={page === pageNum ? "default" : "outline"}
                                                            onClick={() => setPage(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setPage(page + 1)}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
