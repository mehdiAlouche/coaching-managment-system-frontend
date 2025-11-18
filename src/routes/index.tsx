import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDashboardRouteFromStorage } from '../lib/dashboard-routes'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')
    throw redirect({
      to: token ? getDashboardRouteFromStorage() : '/auth/login',
      replace: true,
    })
  },
})
