import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  beforeLoad: () => {
    const role = localStorage.getItem('auth_role')
    if (role === 'manager') {
      throw redirect({ to: '/dashboard/manager', replace: true })
    }
    if (role === 'coach') {
      throw redirect({ to: '/dashboard/coach', replace: true })
    }
    if (role === 'entrepreneur') {
      throw redirect({ to: '/dashboard/entrepreneur', replace: true })
    }
    if (role === 'admin') {
      throw redirect({ to: '/dashboard/admin', replace: true })
    }
  },
  component: () => null,
})
