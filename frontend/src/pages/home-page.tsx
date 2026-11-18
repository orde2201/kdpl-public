import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertCircle, BookOpen, PenSquare, Search } from 'lucide-react'
import { ArticleCard } from '@/components/articles/article-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'
import { articlesService } from '@/services/articles.service'
import type { Article } from '@/types/api'

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const [articles, setArticles] = useState<Array<Article>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await articlesService.getAll()
      setArticles(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat daftar artikel',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchArticles()
  }, [fetchArticles])

  const handleDeleteArticle = async (id: string) => {
    await articlesService.remove(id)
    setArticles((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return articles
    return articles.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author?.username.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q),
    )
  }, [articles, searchQuery])

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      {/* Search & Toolbar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, isi, atau nama penulis..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Gagal Memuat Artikel</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-card flex flex-col justify-between space-y-4 rounded-none p-8"
            >
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-7 w-4/5" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-none px-6 py-16 text-center">
          <BookOpen className="text-muted-foreground mb-3 size-10 stroke-[1.25]" />
          <h3 className="text-xl font-bold">Belum Ada Artikel</h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-md text-sm">
            {searchQuery
              ? `Tidak ditemukan artikel yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada artikel yang dipublikasikan. Jadilah yang pertama menulis artikel!'}
          </p>
          {isAuthenticated && !searchQuery && (
            <Button asChild>
              <Link to="/articles/new">
                <PenSquare className="size-4" />
                Buat Artikel Pertama
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {filteredArticles.map((article) => (
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
