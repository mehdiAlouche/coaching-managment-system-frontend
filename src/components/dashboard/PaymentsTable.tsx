import type { Payment } from '../../models'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const statusVariantMap = {
	pending: 'secondary',
	paid: 'default',
	overdue: 'destructive',
} as const

export default function PaymentsTable({ items }: { items: Payment[] }) {
	return (
		<section className="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Payments</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Id</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										No payments
									</TableCell>
								</TableRow>
							) : (
								items.map((p) => (
									<TableRow key={p.id}>
										<TableCell className="font-mono text-xs">{p.id}</TableCell>
										<TableCell className="font-semibold">${p.amount.toFixed(2)}</TableCell>
										<TableCell>
											<Badge 
												variant={statusVariantMap[p.status] || 'secondary'}
												className="capitalize"
											>
												{p.status}
											</Badge>
										</TableCell>
										<TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</section>
	)
}


