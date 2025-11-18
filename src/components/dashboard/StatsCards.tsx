import type { DashboardStats } from '../../models'
import { Card, CardContent } from '../ui/card'
import { BarChart3, Users, Rocket, DollarSign } from 'lucide-react'
import { cn } from '../../lib/utils'

type Props = {
	title?: string
	stats: DashboardStats
	extra?: React.ReactNode
}

export default function StatsCards({ title = 'Overview', stats, extra }: Props) {
	return (
		<section className="mb-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900">{title}</h2>
				{extra}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard 
					label="Total Sessions" 
					value={stats.sessions.total} 
					icon={BarChart3}
					gradient="from-blue-500 to-blue-600"
					bgColor="bg-blue-50"
				/>
				<StatCard 
					label="Active Coaches" 
					value={stats.users.coaches} 
					icon={Users}
					gradient="from-purple-500 to-purple-600"
					bgColor="bg-purple-50"
				/>
				<StatCard 
					label="Active Entrepreneurs" 
					value={stats.users.entrepreneurs} 
					icon={Rocket}
					gradient="from-green-500 to-green-600"
					bgColor="bg-green-50"
				/>
				<StatCard 
					label="Pending Payments" 
					value={stats.revenue.total} 
					icon={DollarSign}
					gradient="from-orange-500 to-orange-600"
					bgColor="bg-orange-50"
				/>
			</div>
		</section>
	)
}

function StatCard({ 
	label, 
	value, 
	icon: Icon, 
	gradient, 
	bgColor 
}: { 
	label: string
	value: number | string
	icon: React.ComponentType<{ className?: string }>
	gradient?: string
	bgColor?: string
}) {
	return (
		<Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
						<p className="text-3xl font-bold text-foreground">{value}</p>
					</div>
					{Icon && (
						<div className={cn(
							"w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 text-white",
							gradient || 'from-gray-500 to-gray-600'
						)}>
							<Icon className="h-6 w-6" />
						</div>
					)}
				</div>
				<div className={cn(
					"absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10",
					bgColor || 'bg-gray-50'
				)} />
			</CardContent>
		</Card>
	)
}


