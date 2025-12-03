import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { GoalsCategoryData } from '@/hooks/useAnalytics'
import { Target } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  data: GoalsCategoryData
  title?: string
}

const STATUS_COLORS = {
  not_started: 'hsl(var(--muted))',
  in_progress: 'hsl(var(--primary))',
  completed: '#22c55e',
  blocked: 'hsl(var(--destructive))',
}

const PRIORITY_COLORS = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: 'hsl(var(--destructive))',
}

export function GoalsPieChart({ data, title = 'Goals by Category' }: Props) {
  const statusData = Object.entries(data.byStatus).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
  }))

  const priorityData = Object.entries(data.byPriority).map(([key, value]) => ({
    name: key.toUpperCase(),
    value,
    color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS],
  }))

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="priority" className="mt-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
