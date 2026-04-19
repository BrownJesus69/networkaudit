// ── FILE: backend/src/routes/scan.ts ──

import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { scanLimiter } from '../middleware/rateLimit'
import { validate } from '../middleware/validate'

const router = Router()

const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
const ipSchema = z.string().regex(ipv4Regex, 'Invalid IPv4 address')

export const ScanInputSchema = z.object({
  securityType: z.enum(['WEP', 'WPA', 'WPA2', 'WPA2-Enterprise', 'WPA3', 'NONE', 'UNKNOWN']),
  gatewayIP: ipSchema,
  dnsServers: z.array(ipSchema),
  deviceIP: ipSchema,
  ssid: z.string().optional(),
  routerVendor: z.string().optional(),
}).strict()

router.post('/', scanLimiter, validate(ScanInputSchema), async (_req: Request, res: Response): Promise<void> => {
  // TODO: implement in Session 2
  // 1. Parse validated body as ScanInput
  // 2. TODO: call riskScorer.scoreNetwork()
  // 3. TODO: call nvdService.getCVEsByKeyword() if routerVendor present
  // 4. TODO: call abuseIPService.checkIP(gatewayIP)
  // 5. TODO: call otxService.checkIP(gatewayIP)
  // 6. TODO: call iplocateService.lookupIP(gatewayIP)
  // 7. TODO: aggregate findings, compute overallScore
  // 8. TODO: SHA256-anonymize gatewayIP+deviceIP, store in scan_results
  res.json({ findings: [], overallScore: 10.0, scannedAt: new Date().toISOString() })
})

export default router
