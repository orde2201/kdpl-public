import { desc, eq } from 'drizzle-orm'
import type { Database } from '../../db'
import { articles, users } from '../../db/schema'
import type { AuthUser } from '../../types'
import { generateSlug } from '../../utils/slug'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface CreateArticleInput {
  title: string
  content: string
  published?: boolean
}

export interface UpdateArticleInput {
  title?: string
  content?: string
  published?: boolean
}

export async function listArticles(db: Database, authorId?: string) {
  const baseQuery = db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      published: articles.published,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      author: {
        id: users.id,
        username: users.username,
        role: users.role,
      },
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))

  if (authorId && UUID_REGEX.test(authorId)) {
    return baseQuery
      .where(eq(articles.authorId, authorId))
      .orderBy(desc(articles.createdAt))
  }

  return baseQuery.orderBy(desc(articles.createdAt))
}

export async function getArticleByIdOrSlug(db: Database, idOrSlug: string) {
  const isUuid = UUID_REGEX.test(idOrSlug)
  const condition = isUuid
    ? eq(articles.id, idOrSlug)
    : eq(articles.slug, idOrSlug)

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      published: articles.published,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      author: {
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
      },
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(condition)
    .limit(1)

  return article ?? null
}

export async function createArticle(
  db: Database,
  authorId: string,
  input: CreateArticleInput
) {
  const slug = generateSlug(input.title)

  const [created] = await db
    .insert(articles)
    .values({
      title: input.title.trim(),
      slug,
      content: input.content, // Menyimpan string WYSIWYG utuh
      published: input.published ?? true,
      authorId,
    })
    .returning()

  return created
}

export async function updateArticle(
  db: Database,
  articleId: string,
  currentUser: AuthUser,
  input: UpdateArticleInput
) {
  if (!UUID_REGEX.test(articleId)) {
    throw new Error('ARTICLE_NOT_FOUND')
  }

  const [existing] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1)

  if (!existing) {
    throw new Error('ARTICLE_NOT_FOUND')
  }

  // Pemilik artikel atau Admin dapat mengedit artikel
  const isOwner = existing.authorId === currentUser.sub
  const isAdmin = currentUser.role === 'admin'

  if (!isOwner && !isAdmin) {
    throw new Error('FORBIDDEN')
  }

  const [updated] = await db
    .update(articles)
    .set({
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
      updatedAt: new Date(),
    })
    .where(eq(articles.id, articleId))
    .returning()

  return updated
}

export async function deleteArticle(
  db: Database,
  articleId: string,
  currentUser: AuthUser
) {
  if (!UUID_REGEX.test(articleId)) {
    throw new Error('ARTICLE_NOT_FOUND')
  }

  const [existing] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1)

  if (!existing) {
    throw new Error('ARTICLE_NOT_FOUND')
  }

  // Pemilik artikel atau Admin dapat menghapus artikel
  const isOwner = existing.authorId === currentUser.sub
  const isAdmin = currentUser.role === 'admin'

  if (!isOwner && !isAdmin) {
    throw new Error('FORBIDDEN')
  }

  const [deleted] = await db
    .delete(articles)
    .where(eq(articles.id, articleId))
    .returning({ id: articles.id, title: articles.title })

  return deleted
}
