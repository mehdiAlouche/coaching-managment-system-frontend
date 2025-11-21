import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { apiClient, endpoints } from "../services"
import type { Session, PaginatedResponse, User } from "../models"

type FilterStatus = "all" | "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled"

// Helper function to check if a value is a User object
function isUser(value: string | User): value is User {
  return typeof value === "object" && value !== null && "_id" in value
}

export default function SessionsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [sort, setSort] = useState("-scheduledAt")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [upcomingOnly, setUpcomingOnly] = useState(false)

  const {
    data,
    isLoading,
    error,
  } = useQuery<PaginatedResponse<Session>>({
    queryKey: ["sessions", { page, limit, sort, filter, upcomingOnly }],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.sessions.list, {
        params: {
          page,
          limit,
          sort,
          status: filter !== "all" ? filter : undefined,
          upcoming: upcomingOnly || undefined,
        },
      })
      return response.data
    },
  })

  const sessions = data?.data || []
  const meta = data?.meta

  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Sessions</h1>
          <Link
            to="/sessions/create"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-lg transition"
          >
            + Create Session
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as FilterStatus)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort by</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="-scheduledAt">Date (Newest)</option>
                <option value="scheduledAt">Date (Oldest)</option>
                <option value="-duration">Duration (Longest)</option>
                <option value="duration">Duration (Shortest)</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Quick Filter</label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="upcoming"
                  checked={upcomingOnly}
                  onChange={(e) => {
                    setUpcomingOnly(e.target.checked)
                    setPage(1)
                  }}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                <label htmlFor="upcoming" className="ml-2 text-sm text-muted-foreground">
                  Upcoming sessions only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-card p-12 rounded-lg shadow-md text-center border border-border">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 p-6 rounded-lg shadow-md text-destructive border border-destructive/20">
            <p className="font-semibold">Error loading sessions</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sessions.length === 0 && (
          <div className="bg-card p-12 rounded-lg shadow-md text-center border border-border">
            <p className="text-muted-foreground mb-6">No sessions found</p>
            <Link
              to="/sessions/create"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-lg"
            >
              Create your first session
            </Link>
          </div>
        )}

        {/* Sessions Grid */}
        {!isLoading && !error && sessions.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {sessions.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>

            {/* Pagination */}
            {meta && totalPages > 1 && (
              <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} sessions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${page === pageNum
                              ? "bg-primary text-primary-foreground"
                              : "border border-input hover:bg-accent hover:text-accent-foreground"
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function SessionCard({ session }: { session: Session }) {
  const statusColors = {
    scheduled: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    no_show: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    rescheduled: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  }

  const scheduledDate = new Date(session.scheduledAt)
  const endDate = new Date(session.endTime)
  const isUpcoming = scheduledDate.getTime() > Date.now()

  return (
    <Link
      to="/sessions/$id"
      params={{ id: session._id }}
      className="bg-card rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-primary"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            Coaching Session
          </h3>
          <p className="text-sm text-muted-foreground">ID: {session._id.slice(-8)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[session.status as keyof typeof statusColors] || "bg-muted text-muted-foreground border-border"}`}>
            {session.status.replace("_", " ").toUpperCase()}
          </span>
          {isUpcoming && (
            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded border border-yellow-500/20">
              Upcoming
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <span className="mr-3">📅</span>
          {scheduledDate.toLocaleDateString()} at{" "}
          {scheduledDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" - "}
          {endDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center text-muted-foreground">
          <span className="mr-3">⏱️</span>
          {session.duration} minutes
        </div>
        {session.location && (
          <div className="flex items-center text-muted-foreground">
            <span className="mr-3">📍</span>
            {session.location}
          </div>
        )}
        {session.agendaItems && session.agendaItems.length > 0 && (
          <div className="flex items-center text-muted-foreground">
            <span className="mr-3">📋</span>
            {session.agendaItems.length} agenda {session.agendaItems.length === 1 ? "item" : "items"}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Coach:</span>{" "}
            {isUser(session.coachId)
              ? `${session.coachId.firstName} ${session.coachId.lastName}`
              : session.coachId}
          </div>
          <div>
            <span className="font-medium">Entrepreneur:</span>{" "}
            {isUser(session.entrepreneurId)
              ? `${session.entrepreneurId.firstName} ${session.entrepreneurId.lastName}`
              : session.entrepreneurId}
          </div>
        </div>
      </div>
    </Link>
  )
}
