import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login-page'
import { getStoredToken } from '@/services/api-client'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (getStoredToken()) {
      throw redirect({ to: search.redirect || '/' })
    }
  },
  component: LoginRouteComponent,
})

function LoginRouteComponent() {
  const { redirect: redirectTo } = Route.useSearch()
  return <LoginPage redirectTo={redirectTo} />
}
