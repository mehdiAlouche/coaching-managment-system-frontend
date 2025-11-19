import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { apiClient, endpoints } from "../services"
import type { Session, PaginatedResponse } from "../models"

type FilterStatus = "all" | "scheduled" | "completed" | "cancelled" | "no_show" | "rescheduled"

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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Sessions</h1>
          <Link
            to="/sessions/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition"
          >
            + Create Session
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as FilterStatus)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="-scheduledAt">Date (Newest)</option>
                <option value="scheduledAt">Date (Oldest)</option>
                <option value="-duration">Duration (Longest)</option>
                <option value="duration">Duration (Shortest)</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filter</label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="upcoming"
                  checked={upcomingOnly}
                  onChange={(e) => {
                    setUpcomingOnly(e.target.checked)
                    setPage(1)
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="upcoming" className="ml-2 text-sm text-gray-700">
                  Upcoming sessions only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 p-6 rounded-lg shadow-md text-red-700 border border-red-200">
            <p className="font-semibold">Error loading sessions</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sessions.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-6">No sessions found</p>
            <Link
              to="/sessions/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg"
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} sessions
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
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
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    scheduled: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    no_show: "bg-orange-100 text-orange-800 border-orange-300",
    rescheduled: "bg-purple-100 text-purple-800 border-purple-300",
  }

  const scheduledDate = new Date(session.scheduledAt)
  const endDate = new Date(session.endTime)
  const isUpcoming = scheduledDate.getTime() > Date.now()

  return (
    <Link
      to="/sessions/$id"
      params={{ id: session._id }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            Coaching Session
          </h3>
          <p className="text-sm text-gray-500">ID: {session._id.slice(-8)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[session.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
            {session.status.replace("_", " ").toUpperCase()}
          </span>
          {isUpcoming && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
              Upcoming
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
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
        <div className="flex items-center text-gray-600">
          <span className="mr-3">⏱️</span>
          {session.duration} minutes
        </div>
        {session.location && (
          <div className="flex items-center text-gray-600">
            <span className="mr-3">📍</span>
            {session.location}
          </div>
        )}
        {session.agendaItems && session.agendaItems.length > 0 && (
          <div className="flex items-center text-gray-600">
            <span className="mr-3">📋</span>
            {session.agendaItems.length} agenda {session.agendaItems.length === 1 ? "item" : "items"}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            <span className="font-medium">Coach:</span> {session.coachId}
          </div>
          <div>
            <span className="font-medium">Entrepreneur:</span> {session.entrepreneurId}
          </div>
        </div>
      </div>
    </Link>
  )
}
