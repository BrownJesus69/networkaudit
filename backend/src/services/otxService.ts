// ── FILE: backend/src/services/otxService.ts ──

export interface OTXResult {
  pulseCount: number
  tags: string[]
}

export async function checkIP(_ip: string): Promise<OTXResult | null> {
  // TODO: implement in Session 2
  // TODO: Skip RFC1918 private IPs — return null immediately
  // TODO: Call https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general
  //       Header: X-OTX-API-KEY: process.env.OTX_API_KEY
  // TODO: Flag if pulseCount > 0
  return null
}
