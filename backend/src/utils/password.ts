import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

/**
 * Hashes a plain-text password using bcrypt.
 * Format: `$2b$<rounds>$<salt+hash>`
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verifies a plain-text password against a stored bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(password, storedHash)
}
