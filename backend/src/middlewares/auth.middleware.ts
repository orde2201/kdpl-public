import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import type { AppEnv, AuthUser } from '../types'

/**
 * Middleware untuk memverifikasi Bearer JWT token.
 * Menyimpan payload user ke `c.var.user`.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { success: false, message: 'Unauthorized: Missing or invalid token' },
      401
    )
  }

  const token = authHeader.slice(7).trim()
  const secret =
    c.env.JWT_SECRET || 'super-secret-dev-jwt-key-change-in-production'

  try {
    const payload = (await verify(
      token,
      secret,
      'HS256'
    )) as unknown as AuthUser
    c.set('user', payload)
    await next()
  } catch {
    return c.json(
      { success: false, message: 'Unauthorized: Invalid or expired token' },
      401
    )
  }
})

/**
 * Middleware tambahan untuk memastikan user memiliki role `admin`.
 * Harus dipasang setelah `requireAuth`.
 */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json(
      { success: false, message: 'Forbidden: Admin access required' },
      403
    )
  }
  await next()
})
