import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { apiClient, endpoints } from "../services"
import { UserRole, type Session } from "../models"
import { useAuth } from "../context/AuthContext"
import { useErrorHandler } from "../hooks/useErrorHandler"

interface CalendarData {
  calendar: Record<string, Session[]>
  month: number
  year: number
  total: number
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500 hover:bg-blue-600",
  rescheduled: "bg-yellow-500 hover:bg-yellow-600",
  in_progress: "bg-indigo-500 hover:bg-indigo-600",
  completed: "bg-green-600 hover:bg-green-700",
  cancelled: "bg-red-500 hover:bg-red-600",
  no_show: "bg-orange-500 hover:bg-orange-600",
}

export default function CalendarPage() {
  const today = new Date()
  const [month, setMonth] = useState<number>(today.getMonth() + 1) // 1-12
  const [year, setYear] = useState<number>(today.getFullYear())
  const [status, setStatus] = useState<string>("")
  const [coachId, setCoachId] = useState<string>("")
  const [entrepreneurId, setEntrepreneurId] = useState<string>("")

  const { user } = useAuth()
  const orgId = user?.organizationId || ""
  const { handleError } = useErrorHandler()
  const canFilterByRole = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER
  const coachFilter = canFilterByRole ? coachId : ""
  const entrepreneurFilter = canFilterByRole ? entrepreneurId : ""

  useEffect(() => {
    if (!canFilterByRole) {
      setCoachId("")
      setEntrepreneurId("")
    }
  }, [canFilterByRole])

  // Fetch coaches
  const { data: coaches = [] } = useQuery({
    queryKey: ["users", "coaches", orgId],
    enabled: !!orgId && canFilterByRole,
    queryFn: async () => {
      const res = await apiClient.get(endpoints.users.list, { params: { role: "coach", organizationId: orgId } })
      console.log("Coaches:", res);
      return Array.isArray(res.data.data) ? res.data.data : []
    }
  })
   
  // Fetch entrepreneurs
  const { data: entrepreneurs = [] } = useQuery({
    queryKey: ["users", "entrepreneurs", orgId],
    enabled: !!orgId && canFilterByRole,
    queryFn: async () => {
      const res = await apiClient.get(endpoints.users.list, { params: { role: "entrepreneur", organizationId: orgId } })
      return Array.isArray(res.data.data) ? res.data.data : []
    }
  })

  // Calendar query
  const { data: calendarData, isLoading, error } = useQuery<CalendarData>({
    queryKey: ["calendar", month, year, coachFilter, entrepreneurFilter, status],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.sessions.calendar, {
        params: {
          month,
          year,
          coachId: coachFilter || undefined,
          entrepreneurId: entrepreneurFilter || undefined,
          status: status || undefined,
          view: "month",
        }
      })
      return res.data.data as CalendarData
    }
  })

  if (error) {
    handleError(error)
  }

  const calendar = calendarData?.calendar || {}

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay() // 0-6

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12); setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1); setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const getSessionsForDay = (day: number): Session[] => {
    const isoDate = new Date(year, month - 1, day).toISOString().split("T")[0]
    return calendar[isoDate] || []
  }

  const YEARS_RANGE = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-6">Calendar View</h1>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-8 grid gap-4 md:grid-cols-6">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">Month</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="px-2 py-2 rounded-md bg-background border border-input text-foreground text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(year, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">Year</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="px-2 py-2 rounded-md bg-background border border-input text-foreground text-sm"
            >
              {YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-2 py-2 rounded-md bg-background border border-input text-foreground text-sm"
            >
              <option value="">All</option>
              {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          {canFilterByRole && (
            <>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-muted-foreground mb-1">Coach</label>
                <select
                  value={coachId}
                  onChange={e => setCoachId(e.target.value)}
                  className="px-2 py-2 rounded-md bg-background border border-input text-foreground text-sm"
                >
                  <option value="">All</option>
                  {(coaches as any[]).map(c => (
                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-muted-foreground mb-1">Entrepreneur</label>
                <select
                  value={entrepreneurId}
                  onChange={e => setEntrepreneurId(e.target.value)}
                  className="px-2 py-2 rounded-md bg-background border border-input text-foreground text-sm"
                >
                  <option value="">All</option>
                  {(entrepreneurs as any[]).map(e => (
                    <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
            >Prev</button>
            <button
              type="button"
              onClick={nextMonth}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
            >Next</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">{monthName}</h2>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80">← Prev</button>
                  <button onClick={nextMonth} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80">Next →</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {isLoading && (
                <div className="grid grid-cols-7 gap-2 animate-pulse">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-md bg-muted/30" />
                  ))}
                </div>
              )}

              {!isLoading && (
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    if (day === null) return <div key={idx} className="aspect-square" />
                    const daySessions = getSessionsForDay(day)
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-md border border-border p-1 flex flex-col ${daySessions.length ? 'bg-accent/30' : 'bg-background hover:bg-accent/10'} transition`}
                      >
                        <span className="text-xs font-semibold text-foreground mb-1">{day}</span>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {daySessions.slice(0, 3).map(session => {
                            const color = STATUS_COLORS[session.status] || 'bg-primary hover:bg-primary/80'
                            const label = session.entrepreneur?.firstName ? `${session.entrepreneur.firstName}` : 'Session'
                            return (
                              <Link
                                key={session._id}
                                to="/sessions/$id"
                                params={{ id: session._id }}
                                className={`block text-[10px] leading-tight text-white px-1 py-0.5 rounded ${color} truncate`}
                                title={`${label} • ${session.status}`}
                              >
                                {label}
                              </Link>
                            )
                          })}
                          {daySessions.length > 3 && (
                            <div className="text-[10px] text-muted-foreground">+{daySessions.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Sessions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {Object.values(calendar)
                .flat()
                .filter(s => new Date(s.scheduledAt) > new Date())
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .slice(0, 12)
                .map(s => {
                  const color = STATUS_COLORS[s.status] || 'bg-primary'
                  return (
                    <Link
                      key={s._id}
                      to="/sessions/$id"
                      params={{ id: s._id }}
                      className="block rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition p-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground truncate">{s.entrepreneur?.firstName || 'Session'}</span>
                        <span className={`ml-2 text-[10px] text-white px-1 py-0.5 rounded ${color}`}>{s.status.replace('_',' ')}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(s.scheduledAt).toLocaleString()}
                      </div>
                    </Link>
                  )
                })}
              {Object.values(calendar).flat().filter(s => new Date(s.scheduledAt) > new Date()).length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No upcoming sessions</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
