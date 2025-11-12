import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useAuth } from "../context/AuthContext"
import { apiClient } from "../lib/api-client"
import endpoints from "../lib/api-endpoints"

interface DashboardStats {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  totalEntrepreneurs: number
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.dashboard.stats)
      return response.data.data
    },
  })

  const { data: recentSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: async () => {
      const response = await apiClient.get(`${endpoints.sessions.list}?limit=5`)
      return response.data.data
    },
  })

  const isLoading = statsLoading || sessionsLoading

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your coaching management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            label="Total Sessions"
            value={stats?.totalSessions || 0}
            icon="📊"
            color="blue"
            loading={isLoading}
          />
          <StatCard
            label="Completed"
            value={stats?.completedSessions || 0}
            icon="✓"
            color="green"
            loading={isLoading}
          />
          <StatCard
            label="Upcoming"
            value={stats?.upcomingSessions || 0}
            icon="📅"
            color="orange"
            loading={isLoading}
          />
          <StatCard label="entrepreneurs" value={stats?.totalEntrepreneurs || 0} icon="👥" color="purple" loading={isLoading} />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/sessions/create"
              className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500"
            >
              <div className="text-3xl">📝</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Session</h3>
                <p className="text-sm text-gray-600">Schedule a new coaching session</p>
              </div>
            </Link>

            <Link
              to="/sessions"
              className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 border-green-500"
            >
              <div className="text-3xl">📋</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Sessions</h3>
                <p className="text-sm text-gray-600">Manage all coaching sessions</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow cursor-default border-l-4 border-gray-300 opacity-50">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
            <Link to="/sessions" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-4">No sessions yet</p>
              <Link
                to="/sessions/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
              >
                Create your first session
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session: any) => (
                <Link
                  key={session.id}
                  to="/sessions/$id"
                  params={{ id: session.id }}
                  className="flex items-center justify-between bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{new Date(session.startTime).toLocaleString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : session.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {session.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: string
  color: "blue" | "green" | "orange" | "purple"
  loading?: boolean
}

function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    orange: "bg-orange-50 border-orange-200",
    purple: "bg-purple-50 border-purple-200",
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]} transition hover:shadow-md`}>
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : value}</p>
    </div>
  )
}
