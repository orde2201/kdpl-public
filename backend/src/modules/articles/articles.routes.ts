import { type Context, Hono } from 'hono'
import { requireAuth } from '../../middlewares/auth.middleware'
import type { AppEnv } from '../../types'
import {
  createArticle,
  deleteArticle,
  getArticleByIdOrSlug,
  listArticles,
  updateArticle,
} from './articles.service'

const articlesRoutes = new Hono<AppEnv>()

// GET /api/articles - Ambil daftar semua artikel (publik)
articlesRoutes.get('/', async (c) => {
  const authorId = c.req.query('authorId')
  const data = await listArticles(c.var.db, authorId)
  return c.json({
    success: true,
    data,
  })
})

// GET /api/articles/:idOrSlug - Ambil detail artikel berdasarkan ID atau slug (publik)
articlesRoutes.get('/:idOrSlug', async (c) => {
  const idOrSlug = c.req.param('idOrSlug')
  const article = await getArticleByIdOrSlug(c.var.db, idOrSlug)

  if (!article) {
    return c.json({ success: false, message: 'Article not found' }, 404)
  }

  return c.json({
    success: true,
    data: article,
  })
})

// POST /api/articles - Buat artikel baru (user login & admin)
articlesRoutes.post('/', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { title, content, published } = body as Record<string, unknown>

  if (typeof title !== 'string' || !title.trim()) {
    return c.json({ success: false, message: 'title is required' }, 400)
  }

  if (typeof content !== 'string') {
    return c.json(
      { success: false, message: 'content (WYSIWYG text) is required' },
      400
    )
  }

  const article = await createArticle(c.var.db, c.var.user.sub, {
    title,
    content,
    published: typeof published === 'boolean' ? published : true,
  })

  return c.json(
    {
      success: true,
      message: 'Article created successfully',
      data: article,
    },
    201
  )
})

// PUT & PATCH /api/articles/:id - Edit artikel (pemilik artikel untuk simpan WYSIWYG atau Admin untuk semua artikel)
const handleUpdateArticle = async (c: Context<AppEnv>) => {
  const articleId = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { title, content, published } = body as Record<string, unknown>

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return c.json(
      { success: false, message: 'title must be a non-empty string' },
      400
    )
  }

  if (content !== undefined && typeof content !== 'string') {
    return c.json({ success: false, message: 'content must be a string' }, 400)
  }

  if (published !== undefined && typeof published !== 'boolean') {
    return c.json(
      { success: false, message: 'published must be a boolean' },
      400
    )
  }

  try {
    const updated = await updateArticle(c.var.db, articleId, c.var.user, {
      title: title as string | undefined,
      content: content as string | undefined,
      published: published as boolean | undefined,
    })

    return c.json({
      success: true,
      message: 'Article updated successfully',
      data: updated,
    })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'ARTICLE_NOT_FOUND') {
        return c.json({ success: false, message: 'Article not found' }, 404)
      }
      if (err.message === 'FORBIDDEN') {
        return c.json(
          {
            success: false,
            message:
              'Forbidden: You do not have permission to edit this article',
          },
          403
        )
      }
    }
    throw err
  }
}

articlesRoutes.put('/:id', requireAuth, handleUpdateArticle)
articlesRoutes.patch('/:id', requireAuth, handleUpdateArticle)

// DELETE /api/articles/:id - Hapus artikel (pemilik artikel atau Admin untuk semua artikel)
articlesRoutes.delete('/:id', requireAuth, async (c) => {
  const articleId = c.req.param('id')

  try {
    const deleted = await deleteArticle(c.var.db, articleId, c.var.user)
    return c.json({
      success: true,
      message: 'Article deleted successfully',
      data: deleted,
    })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'ARTICLE_NOT_FOUND') {
        return c.json({ success: false, message: 'Article not found' }, 404)
      }
      if (err.message === 'FORBIDDEN') {
        return c.json(
          {
            success: false,
            message:
              'Forbidden: You do not have permission to delete this article',
          },
          403
        )
      }
    }
    throw err
  }
})

export default articlesRoutes
