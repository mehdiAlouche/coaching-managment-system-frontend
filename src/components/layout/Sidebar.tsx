import { Link, useLocation } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users as UsersIcon,
  Menu,
  X,
  Target,
  DollarSign,
  Users2,
  Building2,
  Calendar,
  Settings,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getDashboardRoute } from '@/lib/dashboard-routes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/models'

interface SidebarProps {
  onLogout: () => Promise<void> | void
}

type NavigationItem = {
  name: string
  href: string
  icon: LucideIcon
  subItems?: Array<{ name: string; href: string }>
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const dashboardRoute = getDashboardRoute(user?.role)

  const adminNavigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Organizations',
      href: '/admin/organizations',
      icon: Building2,
      subItems: [
        { name: 'All Organizations', href: '/admin/organizations' },
        { name: 'Create New', href: '/admin/organizations/new' },
      ],
    },
    {
      name: 'All Sessions',
      href: '/admin/sessions',
      icon: Calendar,
    },
    {
      name: 'All Goals',
      href: '/admin/goals',
      icon: Target,
    },
    {
      name: 'All Payments',
      href: '/admin/payments',
      icon: DollarSign,
    },
    {
      name: 'All Users',
      href: '/admin/users',
      icon: Users2,
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
    },
  ] as const

  const getNavigation = (): NavigationItem[] => {
    if (user?.role === UserRole.ADMIN) {
      return adminNavigation
    }

    const baseNav: NavigationItem[] = [
      {
        name: 'Dashboard',
        href: dashboardRoute,
        icon: LayoutDashboard,
      },
      {
        name: user?.role === UserRole.ENTREPRENEUR ? 'My Sessions' : 'Sessions',
        href: '/sessions',
        icon: UsersIcon,
      },
    ]

    // Add Goals for all roles
    baseNav.push({
      name: user?.role === UserRole.ENTREPRENEUR ? 'My Goals' : 'Goals',
      href: '/goals',
      icon: Target,
    })

    // Add Payments for managers and coaches
    if (user?.role === UserRole.MANAGER || user?.role === UserRole.COACH) {
      baseNav.push({
        name: user?.role === UserRole.COACH ? 'My Payments' : 'Payments',
        href: '/payments',
        icon: DollarSign,
      })
    }

    // Add Users for managers only
    if (user?.role === UserRole.MANAGER) {
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
                <div key={item.name} className="space-y-1">
                  <Link
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

                  {(item.subItems ?? []).map((subItem) => {
                    const subActive = isActive(subItem.href)
                    return (
                      <Link
                        key={`${item.name}-${subItem.name}`}
                        to={subItem.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'ml-6 flex items-center gap-3 rounded-lg px-4 py-2 text-xs font-medium transition-colors',
                          subActive
                            ? 'bg-primary/80 text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {subItem.name}
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </nav>

          <div className="border-t border-border px-4 py-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await onLogout?.()
                setIsMobileOpen(false)
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
