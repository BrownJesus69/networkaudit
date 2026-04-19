import type { ScanRecord, CVEResult, RouterFingerprint } from '../types/index'
import { pool } from './index'

export async function insertScanResult(record: ScanRecord): Promise<void> {
  await pool.query(
    `INSERT INTO scan_results
       (device_fingerprint, network_type, security_type, gateway_ip, dns_servers, findings, overall_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      record.deviceFingerprint,
      record.networkType,
      record.securityType,
      record.gatewayIp,
      record.dnsServers,
      JSON.stringify(record.findings),
      record.overallScore,
    ]
  )
}

export async function getScansByFingerprint(fingerprint: string): Promise<ScanRecord[]> {
  const result = await pool.query<{
    device_fingerprint: string
    network_type: string
    security_type: string
    gateway_ip: string
    dns_servers: string[]
    findings: unknown
    overall_score: string
    scanned_at: Date
  }>(
    'SELECT * FROM scan_results WHERE device_fingerprint = $1 ORDER BY scanned_at DESC LIMIT 20',
    [fingerprint]
  )
  return result.rows.map(row => ({
    deviceFingerprint: row.device_fingerprint,
    networkType: row.network_type,
    securityType: row.security_type as ScanRecord['securityType'],
    gatewayIp: row.gateway_ip,
    dnsServers: row.dns_servers,
    findings: row.findings as ScanRecord['findings'],
    overallScore: parseFloat(row.overall_score),
    scannedAt: row.scanned_at,
  }))
}

export async function getCachedCVEs(keyword: string): Promise<CVEResult[]> {
  const result = await pool.query<{
    cve_id: string
    cvss_score: string
    cvss_vector: string
    description: string
    severity: string
    affected_cpe: string[]
  }>(
    `SELECT * FROM cve_cache
     WHERE $1 = ANY(affected_cpe) AND fetched_at > NOW() - INTERVAL '7 days'`,
    [keyword]
  )
  return result.rows.map(row => ({
    cveId: row.cve_id,
    cvssScore: parseFloat(row.cvss_score),
    cvssVector: row.cvss_vector,
    description: row.description,
    severity: row.severity,
    affectedCpe: row.affected_cpe,
  }))
}

export async function insertCVECache(cve: CVEResult, keyword: string): Promise<void> {
  await pool.query(
    `INSERT INTO cve_cache (cve_id, cvss_score, cvss_vector, description, severity, affected_cpe)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (cve_id) DO UPDATE SET fetched_at = NOW()`,
    [cve.cveId, cve.cvssScore, cve.cvssVector, cve.description, cve.severity, [keyword]]
  )
}

export async function getRouterByVendor(vendor: string): Promise<RouterFingerprint | null> {
  const result = await pool.query<{
    vendor: string
    model: string
    known_cve_ids: string[]
    default_credentials: { user: string; pass: string }[]
    risk_base_score: string
  }>(
    'SELECT * FROM router_fingerprints WHERE LOWER(vendor) = LOWER($1) LIMIT 1',
    [vendor]
  )
  const row = result.rows[0]
  if (!row) return null
  return {
    vendor: row.vendor,
    models: [row.model],
    gatewayIps: [],
    knownCveIds: row.known_cve_ids ?? [],
    defaultCreds: row.default_credentials ?? [],
    riskBaseScore: parseFloat(row.risk_base_score),
  }
}
