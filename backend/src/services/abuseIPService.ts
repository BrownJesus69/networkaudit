import axios from 'axios'
import { isPrivateIP } from '../utils/network'

export interface AbuseIPResult {
  abuseScore: number
  totalReports: number
  countryCode: string
  isp: string
  usageType: string
}

export async function checkIP(ip: string): Promise<AbuseIPResult | null> {
  if (isPrivateIP(ip)) return null

  const apiKey = process.env['ABUSEIPDB_KEY']
  if (!apiKey) return null

  try {
    const response = await axios.get<{ data: Record<string, unknown> }>(
      'https://api.abuseipdb.com/api/v2/check',
      {
        params: { ipAddress: ip, maxAgeInDays: 90, verbose: true },
        headers: { Key: apiKey, Accept: 'application/json' },
        timeout: 10000,
      }
    )

    const data = response.data?.data
    if (!data) return null

    return {
      abuseScore: data['abuseConfidenceScore'] as number,
      totalReports: data['totalReports'] as number,
      countryCode: data['countryCode'] as string,
      isp: data['isp'] as string,
      usageType: data['usageType'] as string,
    }
  } catch (err) {
    console.error('abuseIPService error:', err instanceof Error ? err.message : err)
    return null
  }
}
