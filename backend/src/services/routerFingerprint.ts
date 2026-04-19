// ── FILE: backend/src/services/routerFingerprint.ts ──

import type { RouterFingerprint } from '../types/index'

export async function matchVendorFromBSSID(_bssid: string): Promise<string | null> {
  // TODO: implement in Session 2
  // TODO: First 3 octets of BSSID = OUI, lookup against known vendor OUIs
  return null
}

export async function getRouterFingerprint(_vendor: string): Promise<RouterFingerprint | null> {
  // TODO: implement in Session 2
  // TODO: Query router_fingerprints table by vendor name (case-insensitive)
  return null
}
