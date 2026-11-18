import { eq, or } from 'drizzle-orm'
import { sign } from 'hono/jwt'
import type { Database } from '../../db'
import { users } from '../../db/schema'
import type { AuthUser } from '../../types'
import { hashPassword, verifyPassword } from '../../utils/password'

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export interface SignupInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

async function generateToken(
  user: { id: string; username: string; email: string; role: 'user' | 'admin' },
  jwtSecret: string
): Promise<string> {
  const payload: AuthUser = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }
  return sign(payload, jwtSecret, 'HS256')
}

export async function signupUser(
  db: Database,
  input: SignupInput,
  jwtSecret: string
) {
  const normalizedEmail = input.email.trim().toLowerCase()
  const normalizedUsername = input.username.trim()

  const existing = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
    })
    .from(users)
    .where(
      or(
        eq(users.email, normalizedEmail),
        eq(users.username, normalizedUsername)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    if (existing[0].email === normalizedEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }
    throw new Error('USERNAME_ALREADY_EXISTS')
  }

  const passwordHash = await hashPassword(input.password)

  const [createdUser] = await db
    .insert(users)
    .values({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: 'user',
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })

  const token = await generateToken(createdUser, jwtSecret)

  return {
    user: createdUser,
    token,
  }
}

export async function loginUser(
  db: Database,
  input: LoginInput,
  jwtSecret: string
) {
  const normalizedEmail = input.email.trim().toLowerCase()

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (!user) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const isPasswordValid = await verifyPassword(
    input.password,
    user.passwordHash
  )
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const token = await generateToken(user, jwtSecret)

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  }
}

export async function getUserById(db: Database, userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user ?? null
}
