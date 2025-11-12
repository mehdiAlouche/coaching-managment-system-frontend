import type { Goal } from '../../lib/queries'

export default function GoalOverview({ goals }: { goals: Goal[] }) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-semibold mb-4">Goal Overview</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{goals.map((g) => (
					<div key={g.id} className="rounded-xl border border-gray-200 bg-white p-4">
						<p className="font-medium">{g.title}</p>
						<div className="mt-2 h-2 bg-gray-100 rounded">
							<div className="h-2 rounded bg-blue-600" style={{ width: `${Math.min(Math.max(g.progress, 0), 100)}%` }} />
						</div>
						{g.deadline && <p className="text-xs text-gray-500 mt-2">Due {new Date(g.deadline).toLocaleDateString()}</p>}
					</div>
				))}
				{goals.length === 0 && <p className="text-gray-500">No goals found</p>}
			</div>
		</section>
	)
}


