import { useState } from 'react'
import { Payment, UserRole } from '../models'
import { useAuth } from '../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../services'
import PaymentCard from '../components/payments/PaymentCard'
import CreatePaymentModal from '../components/payments/CreatePaymentModal'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'
import { DollarSign, Plus, TrendingUp } from 'lucide-react'
import { formatCompactCurrency } from '../lib/currency'
import { useToast } from '../hooks/use-toast'

type FilterStatus = 'all' | 'pending' | 'paid' | 'overdue'

export default function PaymentsPage() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const { data: payments = [], isLoading } = useQuery<Payment[]>({
        queryKey: ['payments'],
        queryFn: async () => {
            const response = await apiClient.get(endpoints.payments.list)
            return response.data.data || response.data || []
        },
    })

    const markPaidMutation = useMutation({
        mutationFn: async (paymentId: string) => {
            return apiClient.patch(endpoints.payments.update(paymentId), {
                status: 'paid',
                paidAt: new Date().toISOString()
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] })
        }
    })

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        if (filterStatus === 'all') return true
        return payment.status === filterStatus
    })

    // Role-specific filtering (Client-side fallback, though API should handle it)
    const roleFilteredPayments = filteredPayments.filter(payment => {
        if (user?.role === UserRole.COACH) {
            return payment.coachId === user._id
        }
        return true // Manager sees all
    })

    // Calculate stats
    const totalAmount = roleFilteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = roleFilteredPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0)
    const paidAmount = roleFilteredPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)

    const handleMarkPaid = async (paymentId: string) => {
        markPaidMutation.mutate(paymentId)
    }

    const handleDownload = async (paymentId: string) => {
        try {
            const response = await apiClient.get(endpoints.payments.invoice(paymentId), {
                responseType: 'blob'
            })
            
            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice-${paymentId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            toast({
                title: 'Success',
                description: 'Invoice downloaded successfully',
            })
        } catch (error) {
            console.error('Download invoice error:', error)
            toast({
                title: 'Error',
                description: 'Failed to download invoice',
                variant: 'destructive',
            })
        }
    }

    const handleEmail = async (paymentId: string) => {
        try {
            const response = await apiClient.post(endpoints.payments.sendInvoice(paymentId))
            toast({
                title: 'Success',
                description: response.data.message || 'Invoice sent successfully',
            })
        } catch (error) {
            console.error('Email invoice error:', error)
            toast({
                title: 'Error',
                description: 'Failed to send invoice',
                variant: 'destructive',
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading payments...</p>
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
                                {user?.role === UserRole.COACH ? 'My Payments' : 'Payments & Invoices'}
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                {user?.role === UserRole.COACH
                                    ? 'Track your earnings and payment history'
                                    : 'Manage invoices and track payments'}
                            </p>
                        </div>
                        {user?.role === UserRole.MANAGER && (
                            <CreatePaymentModal
                                open={isCreateModalOpen}
                                onOpenChange={setIsCreateModalOpen}
                                trigger={
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Generate Payment
                                    </Button>
                                }
                            />
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {user?.role === UserRole.COACH ? 'Total Earnings' : 'Total Revenue'}
                                        </p>
                                        <p className="text-3xl font-bold">
                                            {formatCompactCurrency(totalAmount)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Pending</p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {formatCompactCurrency(pendingAmount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {roleFilteredPayments.filter(p => p.status === 'pending').length} invoices
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <DollarSign className="h-8 w-8 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Paid</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {formatCompactCurrency(paidAmount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {roleFilteredPayments.filter(p => p.status === 'paid').length} invoices
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <DollarSign className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <Select
                            value={filterStatus}
                            onValueChange={(value: FilterStatus) => setFilterStatus(value)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                {roleFilteredPayments.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                            <p className="text-muted-foreground mb-6">
                                {filterStatus !== 'all'
                                    ? 'Try adjusting your filters'
                                    : user?.role === UserRole.MANAGER
                                        ? 'Generate your first payment invoice'
                                        : 'No payment history available yet'}
                            </p>
                            {user?.role === UserRole.MANAGER && (
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Generate Payment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Pending Payments */}
                        {roleFilteredPayments.filter(p => p.status === 'pending').length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold mb-4">
                                    Pending Payments ({roleFilteredPayments.filter(p => p.status === 'pending').length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {roleFilteredPayments
                                        .filter(p => p.status === 'pending')
                                        .map(payment => (
                                            <PaymentCard
                                                key={payment._id}
                                                payment={payment}
                                                onMarkPaid={handleMarkPaid}
                                                onDownload={handleDownload}
                                                onEmail={handleEmail}
                                                userRole={user?.role}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Paid Payments */}
                        {roleFilteredPayments.filter(p => p.status === 'paid').length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">
                                    Recent Payments ({roleFilteredPayments.filter(p => p.status === 'paid').length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {roleFilteredPayments
                                        .filter(p => p.status === 'paid')
                                        .slice(0, 6)
                                        .map(payment => (
                                            <PaymentCard
                                                key={payment._id}
                                                payment={payment}
                                                onDownload={handleDownload}
                                                userRole={user?.role}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
