import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { apiClient, endpoints } from "../services"
import type { SessionDetailed as Session } from "../models"

type SortOption = "date" | "title" | "status"
type FilterStatus = "all" | "scheduled" | "completed" | "cancelled"

export default function SessionsPage() {
  const [sort, setSort] = useState<SortOption>("date")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: sessions = [],
    isLoading,
    error,
  } = useQuery<Session[]>({
    queryKey: ["sessions", { sort, filter, search: searchTerm }],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.sessions.list, {
        params: {
          status: filter !== "all" ? filter : undefined,
          search: searchTerm || undefined,
        },
      })
      return response.data.data
    },
  })

  const sortedSessions = [...sessions].sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title)
      case "status":
        return a.status.localeCompare(b.status)
      case "date":
      default:
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    }
  })

  const filteredSessions = sortedSessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false
    return matchesSearch
  })

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sessions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date (Newest)</option>
                <option value="title">Title (A-Z)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-6 rounded-lg shadow-md text-red-700 border border-red-200">
            <p className="font-semibold">Error loading sessions</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        )}

        {!isLoading && !error && filteredSessions.length === 0 && (
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

        {!isLoading && !error && filteredSessions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
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
  }

  const startDate = new Date(session.startTime)
  const endDate = new Date(session.endTime)
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))

  return (
    <Link
      to="/sessions/$id"
      params={{ id: session.id }}
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 flex-1">{session.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[session.status]}`}>
          {session.status}
        </span>
      </div>

      {session.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>}

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <span className="mr-3">📅</span>
          {startDate.toLocaleDateString()} at{" "}
          {startDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center text-gray-600">
          <span className="mr-3">⏱️</span>
          {duration} minutes
        </div>
        <div className="flex items-center text-gray-600">
          <span className="mr-3">📍</span>
          {session.location}
        </div>
      </div>
    </Link>
  )
}
