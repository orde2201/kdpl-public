import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignupPage } from '@/pages/signup-page'
import { getStoredToken } from '@/services/api-client'

export const Route = createFileRoute('/signup')({
  beforeLoad: () => {
    if (getStoredToken()) {
      throw redirect({ to: '/' })
    }
  },
  component: SignupPage,
})
