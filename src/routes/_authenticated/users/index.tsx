import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserRole } from '../../../models'

export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.ADMIN && role !== UserRole.MANAGER) {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/users/"!</div>
}
