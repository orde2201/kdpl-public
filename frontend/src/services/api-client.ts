import type { ApiResponse } from '@/types/api'

const AUTH_TOKEN_KEY = 'kdpl_auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  return envUrl ? envUrl.replace(/\/$/, '') : ''
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  })

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null

  if (!response.ok || !payload || !payload.success) {
    const errorMessage =
      payload && 'message' in payload && payload.message
        ? payload.message
        : `Request failed with status ${response.status}`
    throw new ApiError(errorMessage, response.status)
  }

  return payload.data
}
