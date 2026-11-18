import { createFileRoute } from '@tanstack/react-router'
import { MyArticlesPage } from '@/pages/my-articles-page'

export const Route = createFileRoute('/_authenticated/my-articles')({
  component: MyArticlesPage,
})
