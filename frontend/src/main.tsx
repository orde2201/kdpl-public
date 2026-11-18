import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider, useAuth } from '@/context/auth-context'
import { router } from './router'

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="kdpl-ui-theme">
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>,
  )
}
