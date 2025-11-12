import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')
    throw redirect({
      to: token ? '/dashboard' : '/login',
      replace: true,
    })
  },
})
