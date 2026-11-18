import { Hono } from 'hono'
import { requireAuth } from '../../middlewares/auth.middleware'
import type { AppEnv } from '../../types'
import { getUserById, loginUser, signupUser } from './auth.service'

const authRoutes = new Hono<AppEnv>()

authRoutes.post('/signup', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { username, email, password } = body as Record<string, unknown>

  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return c.json(
      {
        success: false,
        message: 'username, email, and password are required',
      },
      400
    )
  }

  if (username.trim().length < 3 || username.trim().length > 50) {
    return c.json(
      {
        success: false,
        message: 'Username must be between 3 and 50 characters',
      },
      400
    )
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return c.json({ success: false, message: 'Invalid email format' }, 400)
  }

  if (password.length < 6) {
    return c.json(
      {
        success: false,
        message: 'Password must be at least 6 characters',
      },
      400
    )
  }

  const secret =
    c.env.JWT_SECRET || 'super-secret-dev-jwt-key-change-in-production'

  try {
    const result = await signupUser(
      c.var.db,
      { username, email, password },
      secret
    )
    return c.json(
      {
        success: true,
        message: 'Signup successful',
        data: result,
      },
      201
    )
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'EMAIL_ALREADY_EXISTS') {
        return c.json(
          { success: false, message: 'Email is already registered' },
          409
        )
      }
      if (err.message === 'USERNAME_ALREADY_EXISTS') {
        return c.json(
          { success: false, message: 'Username is already taken' },
          409
        )
      }
    }
    throw err
  }
})

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { email, password } = body as Record<string, unknown>

  if (typeof email !== 'string' || typeof password !== 'string') {
    return c.json(
      { success: false, message: 'email and password are required' },
      400
    )
  }

  const secret =
    c.env.JWT_SECRET || 'super-secret-dev-jwt-key-change-in-production'

  try {
    const result = await loginUser(c.var.db, { email, password }, secret)
    return c.json({
      success: true,
      message: 'Login successful',
      data: result,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      return c.json(
        { success: false, message: 'Invalid email or password' },
        401
      )
    }
    throw err
  }
})

authRoutes.get('/me', requireAuth, async (c) => {
  const authUser = c.var.user
  const user = await getUserById(c.var.db, authUser.sub)

  if (!user) {
    return c.json({ success: false, message: 'User not found' }, 404)
  }

  return c.json({
    success: true,
    data: user,
  })
})

export default authRoutes
