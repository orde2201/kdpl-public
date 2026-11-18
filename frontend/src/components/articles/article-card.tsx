import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Calendar,
  Edit3,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/auth-context'
import { formatDate, stripHtml } from '@/lib/utils'
import type { Article } from '@/types/api'

interface ArticleCardProps {
  article: Article
  onDelete?: (id: string) => Promise<void>
}

export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const { user, canEditOrDelete } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const hasPermission = canEditOrDelete(article)
  const isOwner =
    user && (article.author?.id === user.id || article.authorId === user.id)
  const excerpt = stripHtml(article.content)

  const handleConfirmDelete = async () => {
    if (!onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(article.id)
      setDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="group hover:bg-muted/40 flex h-full flex-col justify-between rounded-none border-0 transition-colors">
      <div>
        <CardHeader className="gap-2.5 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wider uppercase">
              <UserIcon className="size-3" />
              <span className="text-foreground font-semibold">
                {article.author?.username ?? 'Anonim'}
              </span>
              {article.author?.role === 'admin' && (
                <Badge variant="secondary">
                  <ShieldCheck className="size-2.5" />
                  admin
                </Badge>
              )}
              {isOwner && <Badge variant="outline">Milik Anda</Badge>}
            </div>

            {!article.published && <Badge variant="secondary">Draft</Badge>}
          </div>

          <CardTitle className="line-clamp-2 text-xl leading-snug font-bold tracking-tight normal-case">
            <Link
              to="/articles/$idOrSlug"
              params={{ idOrSlug: article.slug || article.id }}
              className="hover:underline hover:underline-offset-4"
            >
              {article.title}
            </Link>
          </CardTitle>

          <CardDescription className="flex items-center gap-1.5 text-xs tracking-wide uppercase">
            <Calendar className="size-3" />
            <span>{formatDate(article.createdAt)}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {excerpt || 'Tidak ada ringkasan teks.'}
          </p>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between pt-2">
        <Button variant="link" size="sm" className="px-0" asChild>
          <Link
            to="/articles/$idOrSlug"
            params={{ idOrSlug: article.slug || article.id }}
          >
            Baca Artikel
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>

        {hasPermission && (
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon-sm"
              title={
                isOwner ? 'Edit artikel Anda' : 'Edit artikel (Akses Admin)'
              }
              asChild
            >
              <Link to="/articles/$id/edit" params={{ id: article.id }}>
                <Edit3 className="size-3.5" />
              </Link>
            </Button>

            {onDelete && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    title={
                      isOwner
                        ? 'Hapus artikel Anda'
                        : 'Hapus artikel (Akses Admin)'
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hapus Artikel?</DialogTitle>
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
                      onClick={() => void handleConfirmDelete()}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
