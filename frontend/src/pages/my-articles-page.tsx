import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertCircle, FileText, PenSquare, ShieldCheck } from 'lucide-react'
import { ArticleCard } from '@/components/articles/article-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'
import { articlesService } from '@/services/articles.service'
import type { Article } from '@/types/api'

export function MyArticlesPage() {
  const { user, isAdmin } = useAuth()
  const [filterScope, setFilterScope] = useState<'mine' | 'all'>(
    isAdmin ? 'all' : 'mine',
  )
  const [articles, setArticles] = useState<Array<Article>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = useCallback(async () => {
    if (!user) return
    try {
      setIsLoading(true)
      setError(null)
      const authorFilter =
        isAdmin && filterScope === 'all' ? undefined : user.id
      const data = await articlesService.getAll(authorFilter)
      setArticles(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat daftar artikel',
      )
    } finally {
      setIsLoading(false)
    }
  }, [user, isAdmin, filterScope])

  useEffect(() => {
    void fetchArticles()
  }, [fetchArticles])

  const handleDeleteArticle = async (id: string) => {
    await articlesService.remove(id)
    setArticles((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Badge variant="default">
              <ShieldCheck className="size-3" />
              Admin
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <div className="bg-card flex items-center rounded-none p-1">
              <Button
                variant={filterScope === 'all' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setFilterScope('all')}
              >
                Semua Artikel
              </Button>
              <Button
                variant={filterScope === 'mine' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setFilterScope('mine')}
              >
                Milik Saya
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Gagal Memuat Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card space-y-4 rounded-none p-8">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-none px-6 py-16 text-center">
          <FileText className="text-muted-foreground mb-3 size-10 stroke-[1.25]" />
          <h3 className="text-xl font-bold">Belum Ada Artikel</h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-md text-sm">
            Anda belum memiliki artikel. Buat artikel baru dengan editor WYSIWYG
            interaktif sekarang!
          </p>
          <Button asChild>
            <Link to="/articles/new">
              <PenSquare className="size-4" />
              Tulis Artikel Sekarang
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onDelete={handleDeleteArticle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
