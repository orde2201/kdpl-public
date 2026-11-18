import { apiRequest } from '@/services/api-client'
import type { Article } from '@/types/api'

export interface CreateArticlePayload {
  title: string
  content: string
  published?: boolean
}

export interface UpdateArticlePayload {
  title?: string
  content?: string
  published?: boolean
}

export const articlesService = {
  getAll(authorId?: string) {
    const query = authorId ? `?authorId=${encodeURIComponent(authorId)}` : ''
    return apiRequest<Array<Article>>(`/api/articles${query}`)
  },

  getByIdOrSlug(idOrSlug: string) {
    return apiRequest<Article>(`/api/articles/${encodeURIComponent(idOrSlug)}`)
  },

  create(payload: CreateArticlePayload) {
    return apiRequest<Article>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(id: string, payload: UpdateArticlePayload) {
    return apiRequest<Article>(`/api/articles/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  remove(id: string) {
    return apiRequest<{ id: string; title: string }>(
      `/api/articles/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    )
  },
}
