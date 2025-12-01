import { format } from 'date-fns'
import type { Session } from '@/models'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Eye, Edit, XCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const statusTone: Record<string, string> = {
  scheduled: 'bg-primary/10 text-primary border border-primary/30',
  completed: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-red-600 border border-red-500/30',
  no_show: 'bg-orange-500/10 text-orange-600 border border-orange-500/30',
  rescheduled: 'bg-purple-500/10 text-purple-600 border border-purple-500/30',
}

interface SessionsTodayPanelProps {
  sessions: Session[]
  heading?: string
  canSchedule?: boolean
}

export function SessionsTodayPanel({ sessions, heading = 'Sessions Today', canSchedule = true }: SessionsTodayPanelProps) {
  if (!sessions.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">{heading}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>No sessions scheduled for today.</p>
          {canSchedule && (
            <Button asChild variant="outline" size="sm">
              <Link to="/sessions/create">Schedule your first session</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{heading}</span>
          <Badge variant="secondary" className="text-xs font-medium">{sessions.length} today</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => {
          const start = new Date(session.scheduledAt)
          const end = new Date(session.endTime)
          const entrepreneurLabel = session.entrepreneur?.firstName
            ? `${session.entrepreneur.firstName} ${session.entrepreneur.lastName ?? ''}`.trim()
            : 'Entrepreneur'
          const coachLabel = typeof session.coachId === 'string'
            ? session.coachId
            : `${session.coachId.firstName} ${session.coachId.lastName ?? ''}`.trim()
          return (
            <div key={session._id} className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground truncate">{session.agendaItems?.[0]?.title || 'Coaching Session'}</p>
                  <p className="text-xs text-muted-foreground">
                    {entrepreneurLabel} → {coachLabel}
                  </p>
                </div>
                <Badge className={cn('text-[10px] uppercase tracking-wide', statusTone[session.status] ?? 'bg-muted text-muted-foreground')}>
                  {session.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(start, 'HH:mm')} — {format(end, 'HH:mm')} ({session.duration} min)
                </span>
                <span>{format(start, 'MMM d, yyyy')}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Button asChild size="sm" variant="outline" className="flex items-center gap-1">
                  <Link to="/sessions/$id" params={{ id: session._id }}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
                </Button>
                {canSchedule && (
                  <>
                    <Button asChild size="sm" variant="ghost" className="flex items-center gap-1">
                      <Link to="/sessions/$id/edit" params={{ id: session._id }}>
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="flex items-center gap-1 text-destructive hover:text-destructive" disabled>
                      <XCircle className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
