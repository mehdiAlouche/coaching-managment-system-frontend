import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { format, endOfWeek, isSameDay, isWithinInterval, startOfWeek } from "date-fns"
import { CalendarDays, List, Loader2, PlusCircle, RefreshCcw, SlidersHorizontal } from "lucide-react"
import { apiClient, endpoints } from "../../services"
import type { Session, PaginatedResponse, User } from "../../models"
import { UserRole } from "../../models"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"
import { CreateSessionModal } from "../../components/sessions/CreateSessionModal"
import { SessionCalendar } from "../../components/sessions/SessionCalendar"
import { SessionsTodayPanel } from "../../components/sessions/SessionsTodayPanel"

type FilterStatus = "all" | "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled"
type ViewMode = "calendar" | "list"
type QuickFilter = "all" | "today" | "week" | "mine"

function isUser(value: string | User): value is User {
  return typeof value === "object" && value !== null && "_id" in value
}

export default function SessionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sort, setSort] = useState("-scheduledAt")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const hasUserSetViewMode = useRef(false)
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [focusedSession, setFocusedSession] = useState<Session | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Session>>({
    queryKey: ["sessions", { page, limit, sort, filter, org: user?.organizationId ?? "", role: user?.role ?? "", userId: user?._id ?? "" }],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
        sort,
      }

      if (filter !== "all") {
        params.status = filter
      }

      if (user?.organizationId) {
        params.organizationId = user.organizationId
      }

      if (user?.role === UserRole.COACH) {
        params.coachId = user._id
      }

      if (user?.role === UserRole.ENTREPRENEUR) {
        params.entrepreneurId = user._id
      }

      const response = await apiClient.get(endpoints.sessions.list, {
        params,
      })
      return response.data
    },
    enabled: !!user,
  })

  const rawSessions = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1

  const canManageSessions = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN

  useEffect(() => {
    if (!hasUserSetViewMode.current) {
      const defaultMode: ViewMode = canManageSessions ? "calendar" : "list"
      setViewMode(defaultMode)
    }
  }, [canManageSessions])

  const scopedSessions = useMemo(() => {
    if (!user) return []
    if (canManageSessions) {
      if (!user.organizationId) return rawSessions
      return rawSessions.filter((session) => session.organizationId === user.organizationId)
    }

    if (user.role === UserRole.COACH) {
      return rawSessions.filter((session) => {
        const coachIdentifier = isUser(session.coachId) ? session.coachId._id : session.coachId
        return coachIdentifier === user._id
      })
    }

    if (user.role === UserRole.ENTREPRENEUR) {
      return rawSessions.filter((session) => {
        const entrepreneurId = typeof session.entrepreneur === "string" ? session.entrepreneur : session.entrepreneur?._id
        return entrepreneurId === user._id
      })
    }

    return []
  }, [rawSessions, user, canManageSessions])

  const listSessions = useMemo(() => {
    const today = new Date()
    const startWeek = startOfWeek(today, { weekStartsOn: 1 })
    const endWeek = endOfWeek(today, { weekStartsOn: 1 })

    return scopedSessions.filter((session) => {
      const start = new Date(session.scheduledAt)

      switch (quickFilter) {
        case "today":
          return isSameDay(start, today)
        case "week":
          return isWithinInterval(start, { start: startWeek, end: endWeek })
        case "mine":
          if (user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) {
            const managerId = typeof session.manager === "string" ? session.manager : session.manager?._id
            return managerId === user?._id
          }
          return true
        default:
          return true
      }
    })
  }, [scopedSessions, quickFilter, user])

  const sessionsToday = useMemo(() => {
    const today = new Date()
    return scopedSessions.filter((session) => isSameDay(new Date(session.scheduledAt), today))
  }, [scopedSessions])

  useEffect(() => {
    setSelectedSessionIds([])
  }, [quickFilter, filter, viewMode, page])

  const visibleSessions = listSessions
  const allVisibleSelected = visibleSessions.length > 0 && selectedSessionIds.length === visibleSessions.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessionIds(visibleSessions.map((session) => session._id))
    } else {
      setSelectedSessionIds([])
    }
  }

  const handleSelectSingle = (id: string, checked: boolean) => {
    setSelectedSessionIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, id]))
      }
      return prev.filter((sessionId) => sessionId !== id)
    })
  }

  const handleBulkAction = (action: "reschedule" | "cancel") => {
    const label = action === "reschedule" ? "Reschedule" : "Cancel"
    toast({
      title: `${label} queued`,
      description: `${selectedSessionIds.length} session${selectedSessionIds.length === 1 ? "" : "s"} ready for ${label.toLowerCase()}.` + (action === "cancel" ? " Confirmation happens on submit." : ""),
    })
    setSelectedSessionIds([])
  }

  const statusOptions: Array<{ value: FilterStatus; label: string }> = [
    { value: "all", label: "All status" },
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no_show", label: "No show" },
    { value: "rescheduled", label: "Rescheduled" },
  ]

  const quickFilterButtons: Array<{ value: QuickFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "mine", label: "My sessions" },
  ]

  const emptyState = !isLoading && !authLoading && !error && scopedSessions.length === 0

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Sessions</h1>
            <p className="text-muted-foreground text-sm">Plan, schedule, and adjust coaching time across the organization.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            {canManageSessions && (
              <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
                <PlusCircle className="h-4 w-4" /> Schedule session
              </Button>
            )}
          </div>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
              <select
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value as FilterStatus)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort by</label>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="-scheduledAt">Date (newest)</option>
                <option value="scheduledAt">Date (oldest)</option>
                <option value="-duration">Duration (longest)</option>
                <option value="duration">Duration (shortest)</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Per page</label>
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value))
                  setPage(1)
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">View mode</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    hasUserSetViewMode.current = true
                    setViewMode("calendar")
                  }}
                >
                  <CalendarDays className="h-4 w-4" /> Calendar
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    hasUserSetViewMode.current = true
                    setViewMode("list")
                  }}
                >
                  <List className="h-4 w-4" /> List
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {viewMode === "list" && (
              <div className="flex flex-wrap gap-2">
                {quickFilterButtons.map(({ value, label }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={quickFilter === value ? "default" : "outline"}
                    onClick={() => setQuickFilter(value)}
                    className="gap-2"
                  >
                    {value === "all" && <SlidersHorizontal className="h-3.5 w-3.5" />}
                    {value === "today" && <CalendarDays className="h-3.5 w-3.5" />}
                    {value === "week" && <CalendarDays className="h-3.5 w-3.5" />}
                    {value === "mine" && <Badge className="h-5 w-5 px-2" variant="secondary">Me</Badge>}
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground">{visibleSessions.length} session{visibleSessions.length === 1 ? "" : "s"} shown</div>
          </div>
        </section>

        {(isLoading || authLoading) && (
          <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">Loading sessions…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
            <p className="text-base font-semibold">Error loading sessions</p>
            <p className="text-sm text-destructive/80">We could not fetch your sessions. Please refresh or try again later.</p>
          </div>
        )}

        {emptyState && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <CalendarDays className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">No sessions yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create your first coaching session to get started.</p>
            {canManageSessions && (
              <Button className="mt-6" onClick={() => setShowCreateModal(true)}>
                Schedule session
              </Button>
            )}
          </div>
        )}

        {!isLoading && !authLoading && !error && scopedSessions.length > 0 && (
          <section className="space-y-6">
            {selectedSessionIds.length > 0 && (
              <div className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => handleSelectAll(checked === true)} />
                  <span className="font-medium">{selectedSessionIds.length} selected</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("reschedule")}>Reschedule</Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("cancel")} className="text-destructive">Cancel</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSessionIds([])}>Clear</Button>
                </div>
              </div>
            )}

            {viewMode === "calendar" ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <SessionCalendar
                    month={calendarMonth}
                    sessions={scopedSessions}
                    onMonthChange={setCalendarMonth}
                    onSessionSelect={setFocusedSession}
                  />
                </div>
                <div className="space-y-6">
                  <SessionsTodayPanel sessions={sessionsToday} canSchedule={canManageSessions} />
                  {focusedSession ? <FocusedSessionCard session={focusedSession} canManage={canManageSessions} onClose={() => setFocusedSession(null)} /> : null}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {canManageSessions && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => handleSelectAll(checked === true)} />
                    <span>Select all on page</span>
                  </div>
                )}
                {visibleSessions.map((session) => (
                  <SessionListRow
                    key={session._id}
                    session={session}
                    selectable={canManageSessions}
                    selected={selectedSessionIds.includes(session._id)}
                    onSelectChange={(checked) => handleSelectSingle(session._id, checked)}
                    canManage={canManageSessions}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {meta && totalPages > 1 && (
          <nav className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>Showing {((meta.page - 1) * meta.limit) + 1} – {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} sessions</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
                «
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="px-3">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                Next
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                »
              </Button>
            </div>
          </nav>
        )}
      </main>

      <CreateSessionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        existingSessions={scopedSessions}
        onCreated={() => refetch()}
      />
    </div>
  )
}

function SessionListRow({
  session,
  selectable,
  selected,
  onSelectChange,
  canManage,
}: {
  session: Session
  selectable: boolean
  selected: boolean
  onSelectChange: (checked: boolean) => void
  canManage: boolean
}) {
  const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
    no_show: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    rescheduled: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  }

  const start = new Date(session.scheduledAt)
  const end = new Date(session.endTime)
  const coachName = isUser(session.coachId)
    ? `${session.coachId.firstName} ${session.coachId.lastName ?? ""}`.trim()
    : session.coachId
  const entrepreneurName = `${session.entrepreneur.firstName} ${session.entrepreneur.lastName ?? ""}`.trim()

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/60 hover:shadow-md md:flex-row md:items-center">
      {selectable && (
        <Checkbox checked={selected} onCheckedChange={(checked) => onSelectChange(checked === true)} />
      )}
      <div className="flex-1 grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
        <div className="md:col-span-2 space-y-1">
          <p className="text-sm font-semibold text-foreground">{format(start, 'MMMM d, yyyy')}</p>
          <span className="text-xs text-muted-foreground">
            {format(start, 'HH:mm')} – {format(end, 'HH:mm')} ({session.duration} min)
          </span>
        </div>
        <div className="md:col-span-2 space-y-1 text-xs text-muted-foreground">
          <p><span className="font-medium text-foreground">Coach:</span> {coachName || '—'}</p>
          <p><span className="font-medium text-foreground">Entrepreneur:</span> {entrepreneurName || '—'}</p>
          {session.location && <p><span className="font-medium text-foreground">Location:</span> {session.location}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <Badge className={cn('border px-3 py-1 text-xs font-semibold capitalize', statusStyles[session.status] ?? 'bg-muted text-muted-foreground border-border')}>
            {session.status.replace('_', ' ')}
          </Badge>
          <div className="flex items-center gap-2 text-xs">
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link to="/sessions/$id" params={{ id: session._id }}>
                View
              </Link>
            </Button>
            {canManage && (
              <Button asChild size="sm" variant="ghost" className="gap-1">
                <Link to="/sessions/$id/edit" params={{ id: session._id }}>
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FocusedSessionCard({ session, onClose, canManage }: { session: Session; onClose: () => void; canManage: boolean }) {
  const start = new Date(session.scheduledAt)
  const end = new Date(session.endTime)
  const coachName = isUser(session.coachId)
    ? `${session.coachId.firstName} ${session.coachId.lastName ?? ""}`.trim()
    : session.coachId
  const entrepreneurName = `${session.entrepreneur.firstName} ${session.entrepreneur.lastName ?? ""}`.trim()

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{session.agendaItems?.[0]?.title || 'Coaching Session'}</h3>
          <p className="text-xs text-muted-foreground">Focus on the next meeting</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Schedule</dt>
          <dd className="font-medium text-foreground">{format(start, 'MMM d, yyyy · HH:mm')} – {format(end, 'HH:mm')}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Coach</dt>
          <dd className="font-medium text-foreground">{coachName || '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Entrepreneur</dt>
          <dd className="font-medium text-foreground">{entrepreneurName || '—'}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <Button asChild size="sm" variant="outline">
          <Link to="/sessions/$id" params={{ id: session._id }}>
            View details
          </Link>
        </Button>
        {canManage && (
          <Button asChild size="sm" variant="ghost">
            <Link to="/sessions/$id/edit" params={{ id: session._id }}>
              Edit session
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
