import type { UserDetailed as User } from '../../models'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function UsersTable({ items }: { items: User[] }) {
	return (
		<section className="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="text-center text-muted-foreground">
										No users
									</TableCell>
								</TableRow>
							) : (
								items.map((u) => (
									<TableRow key={u._id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarFallback>
														{u.firstName[0]}{u.lastName[0]}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{`${u.firstName} ${u.lastName}`}</span>
											</div>
										</TableCell>
										<TableCell>{u.email}</TableCell>
										<TableCell>
											<Badge variant="secondary" className="capitalize">
												{u.role}
											</Badge>
										</TableCell>
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


