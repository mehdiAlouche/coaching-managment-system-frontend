import type { DashboardStats } from '../../lib/queries'

type Props = {
	title?: string
	stats: DashboardStats
	extra?: React.ReactNode
}

export default function StatsCards({ title = 'Overview', stats, extra }: Props) {
	return (
		<section className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">{title}</h2>
				{extra}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card label="Total Sessions" value={stats.totalSessions} />
				<Card label="Active Coaches" value={stats.activeCoaches} />
				<Card label="Active Entrepreneurs" value={stats.activeEntrepreneurs} />
				<Card label="Pending Payments" value={stats.pendingPayments} />
			</div>
		</section>
	)
}

function Card({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4">
			<p className="text-sm text-gray-500">{label}</p>
			<p className="mt-2 text-2xl font-semibold">{value}</p>
		</div>
	)
}


