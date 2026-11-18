import { Link, useNavigate } from '@tanstack/react-router'
import { FileText, LogOut, PenSquare, User as UserIcon } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    void navigate({ to: '/' })
  }

  return (
    <header className="bg-card/85 supports-[backdrop-filter]:bg-card/75 sticky top-0 z-40 w-full backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="text-lg font-bold tracking-tight">
              KDPL Articles
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <Button size="sm" asChild>
                <Link to="/articles/new">
                  <PenSquare className="size-3.5" />
                  <span className="hidden sm:inline">Tulis Artikel</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2 px-3">
                    <UserIcon className="size-3.5" />
                    <span className="max-w-[110px] truncate">
                      {user?.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="font-normal normal-case tracking-normal">
                    <div className="flex flex-col space-y-1 text-center">
                      <p className="text-sm leading-none font-semibold">
                        {user?.username}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-articles">
                      <FileText className="size-3.5" />
                      {isAdmin ? 'Kelola Semua Artikel' : 'Artikel Saya'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-3.5" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Masuk</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Daftar</Link>
              </Button>
            </div>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
