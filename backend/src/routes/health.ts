// ── FILE: backend/src/routes/health.ts ──

import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

export default router
