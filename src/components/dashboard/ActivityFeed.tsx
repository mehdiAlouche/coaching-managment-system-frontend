type Activity = {
	id: string
	text: string
	time: string
}

export default function ActivityFeed({ items }: { items: Activity[] }) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
			<div className="rounded-xl border border-gray-200 bg-white divide-y">
				{items.length === 0 ? (
					<p className="p-4 text-gray-500">No recent activity</p>
				) : (
					items.map((a) => (
						<div key={a.id} className="p-4">
							<p className="text-sm">{a.text}</p>
							<p className="text-xs text-gray-500 mt-1">{a.time}</p>
						</div>
					))
				)}
			</div>
		</section>
	)
}


