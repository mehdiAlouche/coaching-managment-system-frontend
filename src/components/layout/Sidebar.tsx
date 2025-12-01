import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Target,
  DollarSign,
  Users2
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getDashboardRoute } from '@/lib/dashboard-routes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  onLogout: () => Promise<void> | void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const dashboardRoute = getDashboardRoute(user?.role)

  const getNavigation = () => {
    const baseNav = [
      {
        name: 'Dashboard',
        href: dashboardRoute,
        icon: LayoutDashboard,
      },
      {
        name: user?.role === 'entrepreneur' ? 'My Sessions' : 'Sessions',
        href: '/sessions',
        icon: Users,
      },
    ]

    // Add Goals for all roles
    baseNav.push({
      name: user?.role === 'entrepreneur' ? 'My Goals' : 'Goals',
      href: '/goals',
      icon: Target,
    })

    // Add Payments for managers and coaches
    if (user?.role === 'manager' || user?.role === 'coach') {
      baseNav.push({
        name: user?.role === 'coach' ? 'My Payments' : 'Payments',
        href: '/payments',
        icon: DollarSign,
      })
    }

    // Add Users for managers only
    if (user?.role === 'manager' || user?.role === 'admin') {
      baseNav.push({
        name: 'Users',
        href: '/users',
        icon: Users2,
      })
    }

    return baseNav
  }

  const navigation = getNavigation()

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide in/out */}
      <aside
        className={cn(
          // Base styles
          "w-64 bg-background border-r border-border flex-shrink-0 h-screen flex flex-col",
          // Mobile: fixed overlay, slide in/out
          "fixed top-0 left-0 z-40 transition-transform",
          // Desktop: static positioning, always visible
          "lg:static lg:z-auto lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-lg text-foreground">Coaching Manager</h1>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="px-4 py-6 border-t border-border space-y-4">
            <div className="px-4 py-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={async () => {
                setIsMobileOpen(false)
                await onLogout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
