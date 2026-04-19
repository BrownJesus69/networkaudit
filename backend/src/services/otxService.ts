import axios from 'axios'
import { isPrivateIP } from '../utils/network'

export interface OTXResult {
  pulseCount: number
  tags: string[]
}

export async function checkIP(ip: string): Promise<OTXResult | null> {
  if (isPrivateIP(ip)) return null

  const apiKey = process.env['OTX_API_KEY']
  if (!apiKey) return null

  try {
    const response = await axios.get<Record<string, unknown>>(
      `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`,
      {
        headers: { 'X-OTX-API-KEY': apiKey },
        timeout: 10000,
      }
    )

    const pulseInfo = response.data['pulse_info'] as Record<string, unknown> | undefined

    return {
      pulseCount: (pulseInfo?.['count'] as number) ?? 0,
      tags: (response.data['tags'] as string[]) ?? [],
    }
  } catch (err) {
    console.error('otxService error:', err instanceof Error ? err.message : err)
    return null
  }
}
