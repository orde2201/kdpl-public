import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'

interface LoginPageProps {
  redirectTo?: string
}

export function LoginPage({ redirectTo = '/' }: LoginPageProps) {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    try {
      setIsSubmitting(true)
      await login({ email: email.trim(), password })
      await navigate({ to: redirectTo })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal masuk. Periksa kembali email dan password Anda.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight normal-case">
            Login
          </CardTitle>
        </CardHeader>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Gagal Masuk</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>

            <p className="text-muted-foreground text-center text-xs tracking-wider uppercase">
              Belum punya akun?{' '}
              <Link
                to="/signup"
                className="text-foreground font-semibold underline underline-offset-4"
              >
                Daftar sekarang
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
