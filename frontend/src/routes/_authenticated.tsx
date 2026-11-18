import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getStoredToken } from '@/services/api-client'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (!getStoredToken()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
