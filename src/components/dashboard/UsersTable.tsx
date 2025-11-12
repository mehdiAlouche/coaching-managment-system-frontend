import type { User } from '../../lib/queries'

export default function UsersTable({ items }: { items: User[] }) {
	return (
		<section className="mb-6">
			<h2 className="text-lg font-semibold mb-4">Users</h2>
			<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<Th>Name</Th>
							<Th>Email</Th>
							<Th>Role</Th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{items.map((u) => (
							<tr key={u.id} className="bg-white">
								<Td>{u.name}</Td>
								<Td>{u.email}</Td>
								<Td className="capitalize">{u.role}</Td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<Td colSpan={3} className="text-center text-gray-500">
									No users
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


