import { createFileRoute } from '@tanstack/react-router'
import { ArticleEditorPage } from '@/pages/article-editor-page'

export const Route = createFileRoute('/_authenticated/articles/new')({
  component: CreateArticleRouteComponent,
})

function CreateArticleRouteComponent() {
  return <ArticleEditorPage mode="create" />
}
