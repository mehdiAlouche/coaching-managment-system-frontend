import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../../services'
import { User } from '../../models'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog'
import { Loader2 } from 'lucide-react'

interface DeleteUserDialogProps {
    open: boolean
    onClose: () => void
    user: User | null
}

export default function DeleteUserDialog({ open, onClose, user }: DeleteUserDialogProps) {
    const queryClient = useQueryClient()
    const { handleError, showSuccess } = useErrorHandler()

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await apiClient.delete(endpoints.users.delete(userId))
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            showSuccess('User deleted successfully')
            onClose()
        },
        onError: (error: any) => {
            handleError(error, { customMessage: 'Failed to delete user' })
        },
    })

    const handleDelete = () => {
        if (user) {
            deleteMutation.mutate(user._id)
        }
    }

    if (!user) return null

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold">
                            {user.firstName} {user.lastName}
                        </span>
                        ? This action cannot be undone and will permanently remove the user and all
                        associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteMutation.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Delete User
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
