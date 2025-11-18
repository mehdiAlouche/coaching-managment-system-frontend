import { createFileRoute } from '@tanstack/react-router'
import SessionDetailsPage from '../../../pages/SessionDetailsPage.tsx'

export const Route = createFileRoute('/_authenticated/sessions/$id')({
  component: () => {
    const params = Route.useParams()
    return <SessionDetailsPage id={params.id} />
  },
})
