import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModeToggle } from '@/components/theme/mode-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'

export const Route = createFileRoute('/_authenticated')({
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
  const { logout, user } = useAuth()
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
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <Avatar>
                  <AvatarFallback>{(user?.firstName?.[0] ?? 'U')}{(user?.lastName?.[0] ?? '')}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Theme
                  <div className="ml-auto">
                    <ModeToggle />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
