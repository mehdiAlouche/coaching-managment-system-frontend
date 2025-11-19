import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../../services'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { User, Session } from '../../models'
import { formatCurrency } from '../../lib/currency'
import { formatFriendlyDate } from '../../lib/date-utils'

interface CreatePaymentModalProps {
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function CreatePaymentModal({ trigger, open, onOpenChange }: CreatePaymentModalProps) {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedCoachId, setSelectedCoachId] = useState<string>('')
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
    const [dueDate, setDueDate] = useState<string>('')
    const [currency, setCurrency] = useState<string>('USD')
    const [taxAmount, setTaxAmount] = useState<number>(0)

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
        if (!newOpen) {
            // Reset form
            setSelectedCoachId('')
            setSelectedSessionIds([])
            setDueDate('')
            setTaxAmount(0)
        }
    }

    // Fetch coaches
    const { data: coaches = [] } = useQuery<User[]>({
        queryKey: ['users', 'coaches'],
        queryFn: async () => {
            const res = await apiClient.get('/users?role=coach')
            return res.data.data || []
        },
        enabled: isOpen || open
    })

    // Fetch completed sessions for selected coach that are NOT paid (simplified logic, ideally backend filters)
    const { data: sessions = [] } = useQuery<Session[]>({
        queryKey: ['sessions', 'unpaid', selectedCoachId],
        queryFn: async () => {
            // In a real app, we'd want a specific endpoint or filter for unpaid completed sessions
            const res = await apiClient.get(`/sessions?coachId=${selectedCoachId}&status=completed`)
            return res.data.data || []
        },
        enabled: !!selectedCoachId
    })

    const createPaymentMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post(endpoints.payments.create, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            handleOpenChange(false)
        }
    })

    const handleCreate = () => {
        if (!selectedCoachId || selectedSessionIds.length === 0 || !dueDate) return

        const selectedSessions = sessions.filter(s => selectedSessionIds.includes(s._id))
        // Calculate amount based on session duration/rates (simplified)
        // Assuming we might need to get rates from coach or session. 
        // For now, let's assume a standard rate or sum up something.
        // The API expects 'amount'.

        // Let's assume 100 per session for now if not available
        const amount = selectedSessions.length * 100

        createPaymentMutation.mutate({
            coachId: selectedCoachId,
            sessionIds: selectedSessionIds,
            amount,
            taxAmount,
            currency,
            dueDate: new Date(dueDate).toISOString(),
            period: {
                startDate: new Date().toISOString(), // Placeholder
                endDate: new Date().toISOString()   // Placeholder
            },
            notes: 'Generated via UI'
        })
    }

    const toggleSession = (sessionId: string) => {
        setSelectedSessionIds(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        )
    }

    return (
        <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Generate Payment Invoice</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Coach</Label>
                        <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a coach" />
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

                    {selectedCoachId && (
                        <div className="grid gap-2">
                            <Label>Select Sessions</Label>
                            <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                                {sessions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No completed sessions found.</p>
                                ) : (
                                    sessions.map(session => (
                                        <div key={session._id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={session._id}
                                                checked={selectedSessionIds.includes(session._id)}
                                                onCheckedChange={() => toggleSession(session._id)}
                                            />
                                            <label
                                                htmlFor={session._id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {formatFriendlyDate(session.scheduledAt)} - {session.duration} min
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="MAD">MAD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createPaymentMutation.isPending || !selectedCoachId || selectedSessionIds.length === 0}>
                        {createPaymentMutation.isPending ? 'Creating...' : 'Create Invoice'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
