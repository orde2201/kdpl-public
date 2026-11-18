export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return base ? `${base}-${randomSuffix}` : `article-${randomSuffix}`
}
