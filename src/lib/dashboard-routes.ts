import type { UserRole } from './rbac'

/**
 * Get the dashboard route for a given user role
 */
export function getDashboardRoute(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'manager':
      return '/dashboard/manager'
    case 'coach':
      return '/dashboard/coach'
    case 'entrepreneur':
      return '/dashboard/entrepreneur'
    case 'admin':
      return '/dashboard/admin'
    default:
      return '/dashboard/manager' // fallback
  }
}

/**
 * Get the dashboard route from localStorage (for use in beforeLoad guards)
 */
export function getDashboardRouteFromStorage(): string {
  const role = localStorage.getItem('auth_role')
  return getDashboardRoute(role)
}

