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

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (username.trim().length < 3) {
      setError('Username minimal harus 3 karakter.')
      return
    }

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.')
      return
    }

    try {
      setIsSubmitting(true)
      await signup({
        username: username.trim(),
        email: email.trim(),
        password,
      })
      await navigate({ to: '/' })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mendaftarkan akun. Silakan coba lagi.',
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
            Signup
          </CardTitle>
        </CardHeader>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Pendaftaran Gagal</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                minLength={3}
                maxLength={50}
                required
              />
            </div>

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
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </Button>

            <p className="text-muted-foreground text-center text-xs tracking-wider uppercase">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="text-foreground font-semibold underline underline-offset-4"
              >
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
