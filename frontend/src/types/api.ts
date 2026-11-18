export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt?: string
}

export interface ArticleAuthor {
  id: string
  username: string
  email?: string
  role: UserRole
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
  authorId?: string
  createdAt: string
  updatedAt: string
  author?: ArticleAuthor
}

export interface AuthData {
  user: User
  token: string
}

export interface ApiSuccessResponse<T> {
  success: true
  message?: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
