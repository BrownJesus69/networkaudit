// ── FILE: backend/src/middleware/validate.ts ──

import type { Request, Response, NextFunction, RequestHandler } from 'express'
import type { ZodType } from 'zod'

export function validate(schema: ZodType): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.issues })
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req.body = result.data
    next()
  }
}
