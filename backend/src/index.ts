// ── FILE: backend/src/index.ts ──

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import type { Request, Response, NextFunction } from 'express'
import { testConnection } from './db/index'
import { globalLimiter } from './middleware/rateLimit'
import healthRouter from './routes/health'
import scanRouter from './routes/scan'
import cveRouter from './routes/cve'

const app = express()
const PORT = process.env['PORT'] ?? '3000'

app.use(helmet())
app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(globalLimiter)

app.use('/health', healthRouter)
app.use('/scan', scanRouter)
app.use('/cve', cveRouter)

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const message = err instanceof Error ? err.message : 'An error occurred'
  const stack = err instanceof Error ? err.stack : undefined
  if (process.env['NODE_ENV'] === 'production') {
    res.status(500).json({ error: 'Internal server error' })
  } else {
    res.status(500).json({ error: message, stack })
  }
})

testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`NetworkAudit API running on port ${PORT}`)
    })
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
