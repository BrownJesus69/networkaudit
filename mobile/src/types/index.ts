export type SecurityType = 'WEP' | 'WPA' | 'WPA2' | 'WPA2-Enterprise' | 'WPA3' | 'NONE' | 'UNKNOWN'
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

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
  scannedAt: string
  gatewayReputation?: {
    abuseScore: number
    country: string
    isp: string
  }
}

export interface ScanInput {
  securityType: SecurityType
  gatewayIP: string
  dnsServers: string[]
  deviceIP: string
  ssid?: string
  routerVendor?: string
}

export interface NetworkInfo {
  ssid: string | null
  securityType: SecurityType
  gatewayIP: string
  deviceIP: string
  dnsServers: string[]
  isConnected: boolean
  bssid?: string
}

export interface ScanHistoryEntry {
  id: string
  scannedAt: string
  ssid: string | null
  overallScore: number
  findings: Finding[]
  networkInfo: NetworkInfo
}
