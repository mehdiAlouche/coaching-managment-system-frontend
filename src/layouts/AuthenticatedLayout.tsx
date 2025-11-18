import { Outlet, Link } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { getDashboardRoute } from '../lib/dashboard-routes'

interface AuthenticatedLayoutProps {
  onLogout: () => void
}

export function AuthenticatedLayout({ onLogout }: AuthenticatedLayoutProps) {
  const { user } = useAuth()
  const dashboardRoute = getDashboardRoute(user?.role)

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={dashboardRoute} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">Coaching Manager</span>
            </Link>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6">
                <Link to={dashboardRoute} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/sessions" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Sessions
                </Link>
                <Link to="/calendar" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Calendar
                </Link>
              </nav>

              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  )
}

