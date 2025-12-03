import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import type { Session } from '@/models'
import { apiClient, endpoints } from '@/services'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'

const statusPalette: Record<string, string> = {
  scheduled: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
  rescheduled: 'bg-purple-500',
}

export interface SessionCalendarProps {
  month: Date
  sessions?: Session[]
  onMonthChange?: (next: Date) => void
  onSessionSelect?: (session: Session) => void
  coachId?: string
  entrepreneurId?: string
  status?: string
}

interface CalendarCellSession {
  _id: string
  title: string
  status: string
  scheduledAt: Date
  accentClass: string
  session: Session
}

export function SessionCalendar({ month, sessions = [], onMonthChange, onSessionSelect, coachId, entrepreneurId, status }: SessionCalendarProps) {
  const monthStart = startOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthEnd = endOfMonth(month)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const [fetchedSessions, setFetchedSessions] = useState<Session[]>([])
  const effectiveSessions = sessions.length ? sessions : fetchedSessions

  // Fetch calendar sessions for visible month
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const params: Record<string, any> = {
          month: monthStart.getMonth() + 1, // 1-12
          year: monthStart.getFullYear(),
          view: 'month',
        }
        if (coachId) params.coachId = coachId
        if (entrepreneurId) params.entrepreneurId = entrepreneurId
        if (status) params.status = status
        const res = await apiClient.get(endpoints.sessions.calendar, { params })
        const cal = res.data?.data?.calendar
        // API returns object keyed by date -> array of sessions
        const aggregated: Session[] = []
        if (cal && typeof cal === 'object') {
          Object.values(cal).forEach((arr: any) => {
            if (Array.isArray(arr)) {
              aggregated.push(...arr as Session[])
            }
          })
        } else if (Array.isArray(res.data?.data)) {
          aggregated.push(...(res.data.data as Session[]))
        }
        setFetchedSessions(aggregated)
      } catch (_err) {
        setFetchedSessions([])
      }
    }
    // Only fetch when not provided via props
    if (!sessions.length) fetchCalendar()
  }, [monthStart, coachId, entrepreneurId, status, sessions.length])

  const cells = useMemo(() => {
    const normalized: CalendarCellSession[] = effectiveSessions.map((session) => {
      const scheduledAt = new Date(session.scheduledAt)
      const primaryLabel = session.entrepreneur?.firstName
        ? `${session.entrepreneur.firstName} ${session.entrepreneur.lastName ?? ''}`.trim()
        : 'Coaching Session'
      const accentClass = statusPalette[session.status] ?? 'bg-muted-foreground'
      return {
        _id: session._id,
        title: primaryLabel,
        status: session.status,
        scheduledAt,
        accentClass,
        session,
      }
    })

    const dayCells: Array<{ date: Date; items: CalendarCellSession[] }> = []
    let current = calendarStart

    while (current <= calendarEnd) {
      const daySessions = normalized.filter((item) => isSameDay(item.scheduledAt, current))
      dayCells.push({ date: current, items: daySessions })
      current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
    }

    return dayCells
  }, [calendarEnd, calendarStart, effectiveSessions])

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (!onMonthChange) return
    const nextMonth = direction === 'prev' ? subMonths(month, 1) : addMonths(month, 1)
    onMonthChange(nextMonth)
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2 text-left">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Schedule Overview</p>
            <h2 className="text-lg font-semibold text-foreground">{format(monthStart, 'MMMM yyyy')}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px bg-border">
        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const label = format(new Date(2024, 0, offset + 1), 'EEE')
          return (
            <div key={label} className="bg-muted py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {cells.map(({ date, items }) => {
          const inMonth = isSameMonth(date, monthStart)
          const isToday = isSameDay(date, new Date())
          const dayLabel = format(date, 'd')

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[104px] bg-card px-2 py-2 transition-colors',
                inMonth ? 'bg-card' : 'bg-muted/40 text-muted-foreground',
                isToday && 'border border-primary shadow-sm'
              )}
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span className={cn('rounded px-1', isToday && 'bg-primary text-primary-foreground')}>{dayLabel}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {items.length ? `${items.length} ${items.length === 1 ? 'session' : 'sessions'}` : ''}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {items.slice(0, 3).map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className="group w-full rounded-md border border-border bg-muted/40 px-2 py-1 text-left text-xs hover:border-primary hover:bg-primary/5"
                    onClick={() => onSessionSelect?.(item.session)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', item.accentClass)} aria-hidden />
                      <span className="font-medium text-foreground truncate">{item.title}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(item.scheduledAt, 'HH:mm')} · {item.status.replace('_', ' ')}
                    </p>
                  </button>
                ))}

                {items.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">
                    +{items.length - 3} more…
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <footer className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-border text-xs text-muted-foreground">
        {Object.entries(statusPalette).map(([status, color]) => (
          <Fragment key={status}>
            <span className={cn('inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 capitalize')}> 
              <span className={cn('h-2 w-2 rounded-full', color)} aria-hidden />
              {status.replace('_', ' ')}
            </span>
          </Fragment>
        ))}
      </footer>
    </div>
  )
}
