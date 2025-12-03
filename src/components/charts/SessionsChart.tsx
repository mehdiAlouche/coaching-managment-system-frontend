import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SessionsChartData } from '@/hooks/useAnalytics'
import { Calendar } from 'lucide-react'

interface Props {
  data: SessionsChartData[]
  title?: string
}

export function SessionsChart({ data, title = 'Sessions Overview' }: Props) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="scheduled" fill="hsl(var(--primary))" name="Scheduled" />
          <Bar dataKey="completed" fill="#22c55e" name="Completed" />
          <Bar dataKey="cancelled" fill="hsl(var(--destructive))" name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
