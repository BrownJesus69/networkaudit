// ── FILE: backend/src/db/index.ts ──

import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
  ssl: true,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function testConnection(): Promise<void> {
  const client = await pool.connect()
  try {
    const result = await client.query<{ now: Date }>('SELECT NOW()')
    const row = result.rows[0]
    console.log('DB connected at:', row?.now)
  } finally {
    client.release()
  }
}
