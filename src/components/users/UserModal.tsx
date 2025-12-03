import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../../services'
import { User, UserRole } from '../../models'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { Loader2 } from 'lucide-react'

interface UserModalProps {
    open: boolean
    onClose: () => void
    user?: User | null
    mode: 'create' | 'edit'
    currentUser?: User | null
}

interface UserFormData {
    firstName: string
    lastName: string
    email: string
    role: string
    hourlyRate?: number
    phone?: string
    timezone?: string
    startupName?: string
    password?: string
}

export default function UserModal({ open, onClose, user, mode, currentUser }: UserModalProps) {
    const queryClient = useQueryClient()
    const { handleError, showSuccess } = useErrorHandler()

    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'entrepreneur',
        hourlyRate: undefined,
        phone: '',
        timezone: 'Africa/Casablanca',
        startupName: '',
        password: '',
    })

    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})

    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.role || 'entrepreneur',
                hourlyRate: user.hourlyRate,
                phone: user.phone || '',
                timezone: user.timezone || 'Africa/Casablanca',
                startupName: user.startupName || '',
                password: '', // Never prefill password
            })
        } else if (mode === 'create') {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                role: 'entrepreneur',
                hourlyRate: undefined,
                phone: '',
                timezone: 'Africa/Casablanca',
                startupName: '',
                password: '',
            })
        }
        setErrors({})
    }, [user, mode, open])

    const createMutation = useMutation({
        mutationFn: async (data: UserFormData) => {
            const res = await apiClient.post(endpoints.users.create, data)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            showSuccess('User created successfully')
            onClose()
        },
        onError: (error: any) => {
            handleError(error, { customMessage: 'Failed to create user' })
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<UserFormData>) => {
            if (!user) throw new Error('No user to update')
            const res = await apiClient.patch(endpoints.users.partialUpdate(user._id), data)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            showSuccess('User updated successfully')
            onClose()
        },
        onError: (error: any) => {
            handleError(error, { customMessage: 'Failed to update user' })
        },
    })

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        if (!formData.role) {
            newErrors.role = 'Role is required'
        }

        if (mode === 'create' && !formData.password) {
            newErrors.password = 'Password is required'
        }

        if (mode === 'create' && formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (formData.hourlyRate !== undefined && formData.hourlyRate < 0) {
            newErrors.hourlyRate = 'Hourly rate must be positive'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        const submitData: any = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            role: formData.role,
        }

        if (formData.hourlyRate !== undefined && formData.hourlyRate > 0) {
            submitData.hourlyRate = formData.hourlyRate
        }

        if (formData.phone?.trim()) {
            submitData.phone = formData.phone.trim()
        }

        if (formData.timezone?.trim()) {
            submitData.timezone = formData.timezone.trim()
        }

        if (formData.startupName?.trim()) {
            submitData.startupName = formData.startupName.trim()
        }

        if (mode === 'create' && formData.password) {
            submitData.password = formData.password
        }

        if (mode === 'create') {
            createMutation.mutate(submitData)
        } else {
            // For edit, only send changed fields
            const changedData: any = {}
            if (submitData.firstName !== user?.firstName) changedData.firstName = submitData.firstName
            if (submitData.lastName !== user?.lastName) changedData.lastName = submitData.lastName
            if (submitData.email !== user?.email) changedData.email = submitData.email
            if (submitData.role !== user?.role) changedData.role = submitData.role
            if (submitData.hourlyRate !== user?.hourlyRate) changedData.hourlyRate = submitData.hourlyRate
            if (submitData.phone !== user?.phone) changedData.phone = submitData.phone
            if (submitData.timezone !== user?.timezone) changedData.timezone = submitData.timezone
            if (submitData.startupName !== user?.startupName) changedData.startupName = submitData.startupName
            if (formData.password?.trim()) {
                changedData.password = formData.password
            }

            if (Object.keys(changedData).length > 0) {
                updateMutation.mutate(changedData)
            } else {
                showSuccess('No changes to save')
                onClose()
            }
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create New User' : 'Edit User'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new team member to your organization'
                            : 'Update user information and permissions'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                                    <SelectItem value="coach">Coach</SelectItem>
                                    {currentUser?.role === 'admin' && (
                                        <>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password {mode === 'create' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+212 6 12 34 56 78"
                            />
                        </div>

                        {/* Hourly Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Hourly Rate (MAD)</Label>
                            <Input
                                id="hourlyRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.hourlyRate || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                                placeholder="500.00"
                            />
                            {errors.hourlyRate && (
                                <p className="text-sm text-red-600">{errors.hourlyRate}</p>
                            )}
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                value={formData.timezone}
                                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                            >
                                <SelectTrigger id="timezone">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem>
                                    <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Startup Name (for entrepreneurs) */}
                        {(formData.role === 'entrepreneur' || formData.role === UserRole.ENTREPRENEUR) && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="startupName">Startup Name</Label>
                                <Input
                                    id="startupName"
                                    value={formData.startupName}
                                    onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                                    placeholder="My Startup"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {mode === 'create' ? 'Create User' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
