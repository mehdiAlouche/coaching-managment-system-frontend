import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuth } from '../../context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModeToggle } from '@/components/theme/mode-toggle'

export const Route = createFileRoute('/_authenticated/_layout')({
  beforeLoad: async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw redirect({
        to: '/auth/login',
        replace: true,
      })
    }
    return { auth: { isAuthenticated: !!token } }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { logout } = useAuth()
  const navigate = Route.useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/auth/login' })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
