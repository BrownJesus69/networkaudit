// ── FILE: backend/src/db/migrate.ts ──
// Standalone script — not imported by the app. Run with: npm run migrate

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { pool } from './index'

const MIGRATIONS_DIR = join(__dirname, 'migrations')

async function runMigrations(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    try {
      await pool.query(sql)
      console.log(`[OK] ${file}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[FAIL] ${file} — Error: ${msg}`)
      await pool.end()
      process.exit(1)
    }
  }

  console.log('All migrations complete.')
  await pool.end()
  process.exit(0)
}

runMigrations().catch(err => {
  console.error('Migration runner failed:', err)
  process.exit(1)
})
