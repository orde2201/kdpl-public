import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Save, ShieldCheck } from 'lucide-react'
import { WysiwygEditor } from '@/components/editor/wysiwyg-editor'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/auth-context'
import { stripHtml } from '@/lib/utils'
import { articlesService } from '@/services/articles.service'

interface ArticleEditorPageProps {
  mode: 'create' | 'edit'
  articleId?: string
}

export function ArticleEditorPage({ mode, articleId }: ArticleEditorPageProps) {
  const { user, isAdmin, canEditOrDelete } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('<p></p>')
  const [published, setPublished] = useState(true)
  const [authorUsername, setAuthorUsername] = useState<string | null>(null)

  const [isLoadingArticle, setIsLoadingArticle] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadExistingArticle = useCallback(async () => {
    if (mode !== 'edit' || !articleId) return

    try {
      setIsLoadingArticle(true)
      setError(null)
      const data = await articlesService.getByIdOrSlug(articleId)

      if (user && !canEditOrDelete(data)) {
        setError(
          'Anda tidak memiliki izin untuk mengedit artikel milik pengguna lain.',
        )
        return
      }

      setTitle(data.title)
      setContent(data.content)
      setPublished(data.published)
      setAuthorUsername(data.author?.username ?? null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat artikel untuk diedit',
      )
    } finally {
      setIsLoadingArticle(false)
    }
  }, [mode, articleId, user, canEditOrDelete])

  useEffect(() => {
    void loadExistingArticle()
  }, [loadExistingArticle])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Judul artikel wajib diisi.')
      return
    }

    if (!stripHtml(content)) {
      setError('Isi konten artikel tidak boleh kosong.')
      return
    }

    try {
      setIsSaving(true)
      if (mode === 'create') {
        const created = await articlesService.create({
          title: title.trim(),
          content,
          published,
        })
        await navigate({
          to: '/articles/$idOrSlug',
          params: { idOrSlug: created.slug || created.id },
        })
      } else if (articleId) {
        const updated = await articlesService.update(articleId, {
          title: title.trim(),
          content,
          published,
        })
        await navigate({
          to: '/articles/$idOrSlug',
          params: { idOrSlug: updated.slug || updated.id },
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan artikel.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingArticle) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="-ml-3 mb-1" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {mode === 'create' ? 'Tulis Artikel Baru' : 'Edit Artikel'}
            </h1>
            {mode === 'edit' &&
              isAdmin &&
              authorUsername &&
              authorUsername !== user?.username && (
                <Badge variant="default">
                  <ShieldCheck className="size-3" />
                  Mengedit artikel @{authorUsername} (Admin)
                </Badge>
              )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Tidak Dapat Menyimpan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        <div className="bg-card space-y-2 rounded-none p-6 sm:p-8">
          <Label htmlFor="article-title">Judul Artikel</Label>
          <Input
            id="article-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul artikel..."
            className="h-12 text-lg font-semibold"
            required
          />
        </div>

        <div className="bg-card flex items-center justify-between rounded-none p-6 sm:p-8">
          <div className="space-y-1">
            <Label htmlFor="published-switch" className="cursor-pointer">
              Publikasikan Artikel
            </Label>
            <p className="text-muted-foreground text-xs">
              Jika diaktifkan, artikel langsung tampil di halaman utama.
            </p>
          </div>
          <Switch
            id="published-switch"
            checked={published}
            onCheckedChange={setPublished}
          />
        </div>

        <div className="space-y-3">
          <Label>Konten Artikel (Editor WYSIWYG Interaktif)</Label>
          <WysiwygEditor value={content} onChange={setContent} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" asChild>
            <Link to="/">Batal</Link>
          </Button>
          <Button type="submit" size="lg" disabled={isSaving}>
            <Save className="size-4" />
            {isSaving
              ? 'Menyimpan...'
              : mode === 'create'
                ? 'Simpan & Publikasikan'
                : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
