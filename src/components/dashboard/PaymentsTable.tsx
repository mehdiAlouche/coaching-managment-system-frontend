import type { Payment } from '../../lib/queries'

export default function PaymentsTable({ items }: { items: Payment[] }) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-semibold mb-4">Payments</h2>
			<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<Th>Id</Th>
							<Th>Amount</Th>
							<Th>Status</Th>
							<Th>Date</Th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{items.map((p) => (
							<tr key={p.id} className="bg-white">
								<Td>{p.id}</Td>
								<Td>${p.amount.toFixed(2)}</Td>
								<Td className="capitalize">{p.status}</Td>
								<Td>{new Date(p.date).toLocaleDateString()}</Td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<Td colSpan={4} className="text-center text-gray-500">
									No payments
								</Td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	)
}

function Th({ children }: { children: React.ReactNode }) {
	return <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{children}</th>
}
function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
	return (
		<td colSpan={colSpan} className="px-4 py-2 text-sm text-gray-700">
			{children}
		</td>
	)
}


