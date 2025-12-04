import { User } from '../../models'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { MoreVertical, Edit, Eye, UserX, Trash2 } from 'lucide-react'

interface UsersTableProps {
    users: User[]
    onEdit?: (user: User) => void
    onDelete?: (user: User) => void
    onViewProfile?: (user: User) => void
    onToggleStatus?: (userId: string, isActive: boolean) => void
}

export default function UsersTable({
    users,
    onEdit,
    onDelete,
    onViewProfile,
    onToggleStatus
}: UsersTableProps) {
    const roleColors: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-800 border-purple-300',
        manager: 'bg-blue-100 text-blue-800 border-blue-300',
        coach: 'bg-green-100 text-green-800 border-green-300',
        entrepreneur: 'bg-orange-100 text-orange-800 border-orange-300'
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Hourly Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {getInitials(user.firstName, user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Joined {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={roleColors[user.role]}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    {user.hourlyRate ? (
                                        <span className="font-medium">{user.hourlyRate} MAD/hr</span>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={user.isActive}
                                            onCheckedChange={(checked) => onToggleStatus?.(user._id, checked)}
                                        />
                                        <span className="text-sm">
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewProfile?.(user)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit?.(user)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onToggleStatus?.(user._id, !user.isActive)}
                                            >
                                                <UserX className="h-4 w-4 mr-2" />
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete?.(user)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
