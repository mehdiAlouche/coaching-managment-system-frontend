import { createFileRoute } from '@tanstack/react-router'
import EditSessionPage from '../../../pages/EditSessionPage.tsx'

export const Route = createFileRoute('/_authenticated/sessions/$id/edit')({
  component: () => {
    const params = Route.useParams()
    return <EditSessionPage id={params.id} />
  },
})
