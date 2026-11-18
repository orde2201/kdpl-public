import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { Pool } from 'pg'
import * as schema from './schema'

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>

function isLocalDatabase(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1' ||
      parsed.hostname === 'kdpl_postgres'
    )
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1')
  }
}

/**
 * Creates a Drizzle ORM instance.
 * - Uses `node-postgres` (`pg`) when connecting to local Docker PostgreSQL.
 * - Uses `@neondatabase/serverless` (`neon-http`) when connecting to Neon Postgres in production/edge.
 */
export function createDb(databaseUrl: string): Database {
  if (isLocalDatabase(databaseUrl)) {
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      idleTimeoutMillis: 1000,
    })
    return drizzlePg({ client: pool, schema })
  }

  const sql = neon(databaseUrl)
  return drizzleNeon({ client: sql, schema })
}

export { schema }
