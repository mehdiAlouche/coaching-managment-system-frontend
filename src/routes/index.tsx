import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDashboardRouteFromStorage } from '../lib/dashboard-routes'
import  LandingPage  from '../pages/LandingPage'

export const Route = createFileRoute('/')({
  component: LandingPage,
  beforeLoad: async ({ location }) => {
    const token = localStorage.getItem('auth_token')
    // Only redirect to dashboard if user is already authenticated
    if (token && location.pathname === '/') {
      throw redirect({
        to: getDashboardRouteFromStorage(),
        replace: true,
      })
    }
  },
})
