import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { scanLimiter } from '../middleware/rateLimit'
import { validate } from '../middleware/validate'
import { getCVEsByKeyword } from '../services/nvdService'
import { checkIP as checkAbuseIP } from '../services/abuseIPService'
import { checkIP as checkOTX } from '../services/otxService'
import { lookupIP } from '../services/iplocateService'
import { scoreNetwork } from '../services/riskScorer'
import { computeSecurityScore } from '../services/scoring'
import { insertScanResult } from '../db/queries'
import { sha256Hash } from '../utils/network'
import type { ScanInput, Finding } from '../types/index'

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
  connectionType: z.enum(['WIFI', 'HOTSPOT', 'ETHERNET']).default('WIFI'),
  signalStrength: z.number().min(-120).max(0).optional(),
  isCarrierDNS: z.boolean().optional(),
}).strict()

const SEVERITY_ORDER: Record<Finding['severity'], number> = {
  CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4,
}

router.post('/', scanLimiter, validate(ScanInputSchema), async (req: Request, res: Response): Promise<void> => {
  const input = req.body as ScanInput
  const fingerprint = sha256Hash(input.gatewayIP + input.deviceIP)

  const [cveSettled, abuseSettled, otxSettled] = await Promise.allSettled([
    input.routerVendor ? getCVEsByKeyword(input.routerVendor) : Promise.resolve([]),
    checkAbuseIP(input.gatewayIP),
    checkOTX(input.gatewayIP),
    lookupIP(input.gatewayIP),
  ])

  const cves = cveSettled.status === 'fulfilled' ? cveSettled.value : []
  const abuseData = abuseSettled.status === 'fulfilled' ? abuseSettled.value : null
  const otxData = otxSettled.status === 'fulfilled' ? otxSettled.value : null

  const { findings, overallScore } = scoreNetwork(input, cves, abuseData, otxData)
  const { score, grade, flags } = computeSecurityScore({
    securityType: input.securityType,
    connectionType: input.connectionType ?? 'WIFI',
    ssid: input.ssid,
    signalStrength: input.signalStrength,
    dnsServers: input.dnsServers,
    isCarrierDNS: input.isCarrierDNS,
  })

  const sortedFindings: Finding[] = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  )

  try {
    await insertScanResult({
      deviceFingerprint: fingerprint,
      networkType: 'WIFI',
      securityType: input.securityType,
      gatewayIp: input.gatewayIP,
      dnsServers: input.dnsServers,
      findings: sortedFindings,
      overallScore,
      scannedAt: new Date(),
    })
  } catch (err) {
    console.error('Failed to store scan result:', err instanceof Error ? err.message : err)
  }

  res.json({
    findings: sortedFindings,
    overallScore,
    scannedAt: new Date().toISOString(),
    score,
    grade,
    flags,
    ...(abuseData ? {
      gatewayReputation: {
        abuseScore: abuseData.abuseScore,
        country: abuseData.countryCode,
        isp: abuseData.isp,
      }
    } : {}),
  })
})

export default router
