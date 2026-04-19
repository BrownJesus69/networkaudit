import axios from 'axios'
import { isPrivateIP } from '../utils/network'

export interface IPLocateResult {
  country: string
  org: string
  asn: string
  is_vpn: boolean
  is_proxy: boolean
  is_tor: boolean
}

export async function lookupIP(ip: string): Promise<IPLocateResult | null> {
  if (isPrivateIP(ip)) return null

  try {
    const response = await axios.get<Record<string, unknown>>(
      `https://www.iplocate.io/api/lookup/${ip}`,
      { timeout: 10000 }
    )

    const d = response.data
    if (!d) return null

    return {
      country: (d['country'] as string) ?? '',
      org: (d['org'] as string) ?? '',
      asn: (d['asn'] as string) ?? '',
      is_vpn: (d['is_vpn'] as boolean) ?? false,
      is_proxy: (d['is_proxy'] as boolean) ?? false,
      is_tor: (d['is_tor'] as boolean) ?? false,
    }
  } catch (err) {
    console.error('iplocateService error:', err instanceof Error ? err.message : err)
    return null
  }
}
