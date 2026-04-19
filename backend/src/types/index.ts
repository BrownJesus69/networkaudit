// ── FILE: backend/src/types/index.ts ──

export type SecurityType = 'WEP' | 'WPA' | 'WPA2' | 'WPA2-Enterprise' | 'WPA3' | 'NONE' | 'UNKNOWN'

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export interface ScanInput {
  securityType: SecurityType
  gatewayIP: string
  dnsServers: string[]
  deviceIP: string
  ssid?: string        // never stored in DB
  routerVendor?: string
}

export interface Finding {
  id: string
  title: string
  description: string
  severity: Severity
  cvssScore: number
  remediation: string
  cveIds?: string[]
}

export interface ScanResult {
  findings: Finding[]
  overallScore: number
  scannedAt: string    // ISO string
  gatewayReputation?: {
    abuseScore: number
    country: string
    isp: string
  }
}

export interface CVEResult {
  cveId: string
  cvssScore: number
  cvssVector: string
  description: string
  severity: string
  affectedCpe?: string[]
}

export interface RouterFingerprint {
  vendor: string
  models: string[]
  gatewayIps: string[]
  knownCveIds: string[]
  defaultCreds: { user: string; pass: string }[]
  riskBaseScore: number
}

export interface ScanRecord {
  deviceFingerprint: string   // SHA256(gatewayIP+deviceIP)
  networkType: string
  securityType: SecurityType
  gatewayIp: string
  dnsServers: string[]
  findings: Finding[]
  overallScore: number
  scannedAt: Date
}
