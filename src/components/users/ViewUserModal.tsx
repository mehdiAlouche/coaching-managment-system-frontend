import { User } from '../../models'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface ViewUserModalProps {
  open: boolean
  onClose: () => void
  user: User | null
}

export default function ViewUserModal({ open, onClose, user }: ViewUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View profile information for this team member.</DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoItem label="First name" value={user.firstName} />
              <InfoItem label="Last name" value={user.lastName} />
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Role" value={user.role} badge />
              <InfoItem label="Status" value={user.isActive ? 'Active' : 'Inactive'} badge status={user.isActive ? 'active' : 'inactive'} />
              {typeof user.hourlyRate === 'number' && (
                <InfoItem label="Hourly rate" value={`${user.hourlyRate.toLocaleString()} MAD / hr`} />
              )}
              {user.phone && <InfoItem label="Phone" value={user.phone} />}
              {user.timezone && <InfoItem label="Timezone" value={user.timezone} />}
              {user.organizationId && <InfoItem label="Organization" value={user.organizationId} />}
              {user.startupName && <InfoItem label="Startup" value={user.startupName} />}
            </section>

            <div className="h-px bg-border" />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoItem label="Created" value={new Date(user.createdAt).toLocaleString()} />
              <InfoItem label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
            </section>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No user selected.</p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({
  label,
  value,
  badge,
  status,
}: {
  label: string
  value: string
  badge?: boolean
  status?: 'active' | 'inactive'
}) {
  if (!value) {
    return null
  }

  const statusStyle =
    status === 'active'
      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
      : 'bg-red-500/10 text-red-600 border border-red-500/30'

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {badge ? (
        <Badge className={status ? statusStyle : 'capitalize'} variant={status ? 'outline' : 'secondary'}>
          {value}
        </Badge>
      ) : (
        <p className="text-sm font-medium text-foreground break-all">{value}</p>
      )}
    </div>
  )
}
