import type { Session } from '../../lib/queries'
import { Link } from '@tanstack/react-router'

type Props = {
	title?: string
	sessions: Session[]
	emptyText?: string
}

export default function UpcomingSessions({ title = 'Upcoming Sessions', sessions, emptyText = 'No upcoming sessions' }: Props) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-semibold mb-4">{title}</h2>
			<div className="rounded-xl border border-gray-200 bg-white divide-y">
				{sessions.length === 0 ? (
					<p className="p-4 text-gray-500">{emptyText}</p>
				) : (
					sessions.map((s) => (
						<div key={s.id} className="p-4 flex items-center justify-between">
							<div>
								<p className="font-medium">{s.title}</p>
								<p className="text-sm text-gray-500">
									{new Date(s.date).toLocaleString()} • {s.status}
								</p>
							</div>
							<Link to="/sessions/$id" params={{ id: s.id }} className="text-blue-600 hover:underline text-sm">
								View
							</Link>
						</div>
					))
				)}
			</div>
		</section>
	)
}


