import { Card } from '@/components/ui/card'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { RevenueChartData } from '@/hooks/useAnalytics'
import { DollarSign } from 'lucide-react'

interface Props {
  data: RevenueChartData[]
  title?: string
  currency?: string
}

export function RevenueChart({ data, title = 'Revenue Overview', currency = 'USD' }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
