import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserRole } from '../../../models'
import PaymentsPage from '../../../pages/PaymentsPage'

export const Route = createFileRoute('/_authenticated/payments/')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.ADMIN && role !== UserRole.MANAGER && role !== UserRole.COACH) {
      throw redirect({ to: '/' })
    }
  },
  component: PaymentsPage,
})
