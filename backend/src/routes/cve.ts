// ── FILE: backend/src/routes/cve.ts ──

import { Router } from 'express'
import type { Request, Response } from 'express'
import { cveLimiter } from '../middleware/rateLimit'

const router = Router()

router.get('/:keyword', cveLimiter, async (req: Request<{ keyword: string }>, res: Response): Promise<void> => {
  // TODO: implement in Session 2
  // TODO: call nvdService.getCVEsByKeyword(req.params.keyword)
  void req.params.keyword
  res.json({ cves: [] })
})

export default router
