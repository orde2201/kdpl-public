import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'
import { formatDate } from '@/lib/utils'
import { articlesService } from '@/services/articles.service'
import type { Article } from '@/types/api'

interface ArticleDetailPageProps {
  idOrSlug: string
}

export function ArticleDetailPage({ idOrSlug }: ArticleDetailPageProps) {
  const { user, canEditOrDelete } = useAuth()
  const navigate = useNavigate()

  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchArticle = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await articlesService.getByIdOrSlug(idOrSlug)
      setArticle(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Artikel tidak ditemukan')
    } finally {
      setIsLoading(false)
    }
  }, [idOrSlug])

  useEffect(() => {
    void fetchArticle()
  }, [fetchArticle])

  const handleDelete = async () => {
    if (!article) return
    try {
      setIsDeleting(true)
      await articlesService.remove(article.id)
      setDialogOpen(false)
      await navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus artikel')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-11/12" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Artikel Tidak Ditemukan</AlertTitle>
          <AlertDescription>
            {error ?? 'Artikel yang Anda cari tidak tersedia.'}
          </AlertDescription>
        </Alert>
        <Button variant="secondary" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
    )
  }

  const hasPermission = canEditOrDelete(article)
  const isOwner =
    user && (article.author?.id === user.id || article.authorId === user.id)

  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      {/* Top Bar: Back Button & Owner/Admin Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" className="-ml-3" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Artikel
          </Link>
        </Button>

        {hasPermission && (
          <div className="flex items-center gap-3">
            {!isOwner && user?.role === 'admin' && (
              <Badge variant="secondary">
                <ShieldCheck className="size-3" />
                Kontrol Admin
              </Badge>
            )}
            <Button variant="secondary" size="sm" asChild>
              <Link to="/articles/$id/edit" params={{ id: article.id }}>
                <Edit3 className="size-3.5" />
                Edit Artikel
              </Link>
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="size-3.5" />
                  Hapus
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Konfirmasi Hapus Artikel</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin menghapus artikel{' '}
                    <span className="text-foreground font-medium">
                      &ldquo;{article.title}&rdquo;
                    </span>
                    ? Tindakan ini tidak dapat dibatalkan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {!article.published && <Badge variant="secondary">Draft</Badge>}
          {isOwner && <Badge variant="outline">Artikel Milik Anda</Badge>}
        </div>

        <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {article.title}
        </h1>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-xs tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <UserIcon className="size-3.5" />
            <span className="text-foreground font-semibold">
              {article.author?.username ?? 'Anonim'}
            </span>
            {article.author?.role === 'admin' && (
              <Badge variant="secondary">
                <ShieldCheck className="size-2.5" />
                admin
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>Dibuat {formatDate(article.createdAt)}</span>
          </div>

          {article.updatedAt !== article.createdAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Diperbarui {formatDate(article.updatedAt)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Rendered Interactive WYSIWYG Content */}
      <div
        className="wysiwyg-content bg-card rounded-none p-6 sm:p-10"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  )
}
