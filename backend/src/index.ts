import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { dbMiddleware } from './middlewares/db.middleware'
import articlesRoutes from './modules/articles/articles.routes'
import authRoutes from './modules/auth/auth.routes'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// Global Middlewares
app.use('*', logger())
app.use('*', cors())
app.use('/api/*', dbMiddleware)

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'KDPL Article API is running',
  })
})

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/articles', articlesRoutes)

// Global Error & 404 Handlers
app.notFound((c) => {
  return c.json({ success: false, message: 'Route not found' }, 404)
})

app.onError((err, c) => {
  console.error('[Unhandled Error]:', err)
  return c.json(
    {
      success: false,
      message: 'Internal server error',
    },
    500
  )
})

export default app
