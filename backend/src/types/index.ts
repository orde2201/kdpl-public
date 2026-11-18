import type { Database } from '../db'
import type { UserRole } from '../db/schema'

export type AuthUser = {
  sub: string
  username: string
  email: string
  role: UserRole
  exp: number
}

export type AppBindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

export type AppVariables = {
  db: Database
  user: AuthUser
}

export type AppEnv = {
  Bindings: AppBindings
  Variables: AppVariables
}
