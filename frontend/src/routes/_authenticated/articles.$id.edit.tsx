import { createFileRoute } from '@tanstack/react-router'
import { ArticleEditorPage } from '@/pages/article-editor-page'

export const Route = createFileRoute('/_authenticated/articles/$id/edit')({
  component: EditArticleRouteComponent,
})

function EditArticleRouteComponent() {
  const { id } = Route.useParams()
  return <ArticleEditorPage mode="edit" articleId={id} />
}
