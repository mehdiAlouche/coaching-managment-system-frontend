import { Payment, UserRole } from '../../models'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Calendar, DollarSign, FileText, Mail, Download, Check } from 'lucide-react'
import { formatCurrency } from '../../lib/currency'
import { formatFriendlyDate, formatRelativeTime, isOverdue } from '../../lib/date-utils'
import { cn } from '../../lib/utils'

interface PaymentCardProps {
    payment: Payment
    onMarkPaid?: (paymentId: string) => void
    onDownload?: (paymentId: string) => void
    onEmail?: (paymentId: string) => void
    userRole?: UserRole
}

export default function PaymentCard({
    payment,
    onMarkPaid,
    onDownload,
    onEmail,
    userRole = UserRole.MANAGER
}: PaymentCardProps) {
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        paid: 'bg-green-100 text-green-800 border-green-300',
        overdue: 'bg-red-100 text-red-800 border-red-300',
        failed: 'bg-red-100 text-red-800 border-red-300',
        refunded: 'bg-gray-100 text-gray-800 border-gray-300',
        void: 'bg-gray-100 text-gray-800 border-gray-300',
    }

    const isLate = payment.status === 'pending' && payment.dueDate && isOverdue(payment.dueDate)
    const actualStatus = isLate ? 'overdue' : payment.status

    return (
        <Card className={cn(
            'hover:shadow-md transition-all',
            isLate && 'border-red-500 border-2'
        )}>
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'p-3 rounded-lg',
                            actualStatus === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                        )}>
                            <DollarSign className={cn(
                                'h-6 w-6',
                                actualStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                            )} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm font-medium">
                                    {payment.invoiceNumber || `INV-${payment._id.slice(0, 8)}`}
                                </span>
                            </div>
                            {/* Coach name would require fetching or being included in the payment object */}
                            {/* <p className="text-sm text-muted-foreground">{payment.coachId}</p> */}
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn('text-xs font-semibold', statusColors[actualStatus])}
                    >
                        {actualStatus.toUpperCase()}
                    </Badge>
                </div>

                {/* Amount */}
                <div className="mb-4">
                    <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(payment.amount, payment.currency || 'MAD')}
                    </p>
                    {payment.sessionIds && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {payment.sessionIds.length} session{payment.sessionIds.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Generated:</span>
                        <span className="font-medium">{formatFriendlyDate(payment.createdAt)}</span>
                    </div>
                    {payment.dueDate && (
                        <div className={cn(
                            'flex items-center gap-2 text-sm',
                            isLate && 'text-red-600 font-semibold'
                        )}>
                            <Calendar className="h-4 w-4" />
                            <span>Due:</span>
                            <span>
                                {formatFriendlyDate(payment.dueDate)}
                                {payment.status === 'pending' && (
                                    <span className="ml-2">
                                        ({formatRelativeTime(payment.dueDate)})
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                    {payment.status === 'paid' && payment.paidAt && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check className="h-4 w-4" />
                            <span>Paid on {formatFriendlyDate(payment.paidAt)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {userRole === UserRole.MANAGER && payment.status === 'pending' && onMarkPaid && (
                        <Button
                            size="sm"
                            onClick={() => onMarkPaid(payment._id)}
                            className="flex-1"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Paid
                        </Button>
                    )}
                    {onDownload && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDownload(payment._id)}
                            className={payment.status === 'pending' && userRole === UserRole.MANAGER ? '' : 'flex-1'}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    )}
                    {userRole === UserRole.MANAGER && onEmail && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEmail(payment._id)}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
