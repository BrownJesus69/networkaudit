// ── FILE: backend/src/services/abuseIPService.ts ──

export interface AbuseIPResult {
  abuseScore: number
  totalReports: number
  countryCode: string
  isp: string
  usageType: string
}

export async function checkIP(_ip: string): Promise<AbuseIPResult | null> {
  // TODO: implement in Session 2
  // TODO: Skip RFC1918 private IPs — return null immediately
  //       RFC1918: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
  // TODO: Call https://api.abuseipdb.com/api/v2/check
  //       Params: ipAddress, maxAgeInDays=90, verbose=true
  //       Header: Key: process.env.ABUSEIPDB_KEY
  return null
}
