import { Card } from '@/components/ui/card'
import { PaymentStats } from '@/hooks/useAnalytics'
import { DollarSign, FileText, Clock, TrendingUp } from 'lucide-react'

interface Props {
  stats: PaymentStats
  currency?: string
}

export function PaymentStatsCard({ stats, currency = 'USD' }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value)
  }

  const statItems = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      label: 'Paid Amount',
      value: formatCurrency(stats.paidAmount),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Overdue Amount',
      value: formatCurrency(stats.overdueAmount),
      icon: FileText,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, idx) => (
        <Card key={idx} className="p-5 flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
          </div>
          <div className={`ml-4 h-10 w-10 rounded-lg flex items-center justify-center ${item.bg}`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
        </Card>
      ))}
    </div>
  )
}
