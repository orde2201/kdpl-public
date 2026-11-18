import { createFileRoute } from '@tanstack/react-router'
import { ArticleDetailPage } from '@/pages/article-detail-page'

export const Route = createFileRoute('/articles/$idOrSlug')({
  component: ArticleDetailRouteComponent,
})

function ArticleDetailRouteComponent() {
  const { idOrSlug } = Route.useParams()
  return <ArticleDetailPage idOrSlug={idOrSlug} />
}
