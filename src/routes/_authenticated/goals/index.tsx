import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/goals/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/goals/"!</div>
}
