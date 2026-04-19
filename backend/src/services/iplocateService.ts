// ── FILE: backend/src/services/iplocateService.ts ──

export interface IPLocateResult {
  country: string
  org: string
  asn: string
  is_vpn: boolean
  is_proxy: boolean
  is_tor: boolean
}

export async function lookupIP(_ip: string): Promise<IPLocateResult | null> {
  // TODO: implement in Session 2
  // TODO: Skip RFC1918 private IPs — return null immediately
  // TODO: Call https://www.iplocate.io/api/lookup/{ip}
  //       No auth required (1000 req/day free)
  return null
}
