import type { ScanInput, CVEResult, Finding, Severity } from '../types/index'
import type { AbuseIPResult } from './abuseIPService'
import type { OTXResult } from './otxService'
import { isPrivateIP } from '../utils/network'

const DEFAULT_GWS = new Set(['192.168.0.1', '192.168.1.1', '10.0.0.1', '192.168.2.1', '192.168.1.254'])

const SEVERITY_DEDUCTIONS: Record<Severity, number> = {
  CRITICAL: 2.5,
  HIGH: 1.5,
  MEDIUM: 0.8,
  LOW: 0.3,
  INFO: 0.1,
}

export function scoreNetwork(
  input: ScanInput,
  cves: CVEResult[],
  abuseData: AbuseIPResult | null,
  otxData: OTXResult | null,
): { findings: Finding[]; overallScore: number } {
  const findings: Finding[] = []
  let seq = 0

  const add = (
    checkId: string,
    title: string,
    description: string,
    severity: Severity,
    cvssScore: number,
    remediation: string,
    cveIds?: string[],
  ) => {
    seq++
    const f: Finding = {
      id: `${checkId}_${String(seq).padStart(3, '0')}`,
      title,
      description,
      severity,
      cvssScore,
      remediation,
    }
    if (cveIds) f.cveIds = cveIds
    findings.push(f)
  }

  // CHECK 1 — WIFI_OPEN
  if (input.securityType === 'NONE') {
    add(
      'WIFI_OPEN',
      'Open Network — No Encryption',
      'All traffic is transmitted in plaintext. Anyone nearby can intercept passwords, messages, and browsing activity.',
      'CRITICAL', 9.8,
      'Enable WPA3 or WPA2-AES on your router immediately.',
    )
  }

  // CHECK 2 — WIFI_WEP
  if (input.securityType === 'WEP') {
    add(
      'WIFI_WEP',
      'WEP Encryption Detected',
      'WEP was deprecated in 2004 and can be cracked in under 2 minutes using freely available tools like Aircrack-ng.',
      'CRITICAL', 9.1,
      'Replace with WPA2-AES or WPA3. WEP cannot be patched.',
    )
  }

  // CHECK 3 — WIFI_WPA
  if (input.securityType === 'WPA') {
    add(
      'WIFI_WPA',
      'WPA (TKIP) — Deprecated Protocol',
      'WPA with TKIP is vulnerable to TKIP MIC attacks and was deprecated by IEEE 802.11 in 2012.',
      'HIGH', 7.5,
      'Upgrade to WPA2-AES or WPA3 in router admin settings.',
    )
  }

  // CHECK 4 — NET_DEFAULT_GW
  if (DEFAULT_GWS.has(input.gatewayIP)) {
    add(
      'NET_DEFAULT_GW',
      'Default Gateway IP Detected',
      `The gateway IP ${input.gatewayIP} is a known factory default. Default configurations are frequently paired with default admin credentials.`,
      'MEDIUM', 5.3,
      'Change your router LAN IP and update admin credentials.',
    )
  }

  // CHECK 5 — DNS_EXTERNAL
  const allDnsPublic = input.dnsServers.length > 0 && input.dnsServers.every(dns => !isPrivateIP(dns))
  if (allDnsPublic) {
    add(
      'DNS_EXTERNAL',
      'External DNS Server In Use',
      `DNS queries are routed to ${input.dnsServers.join(', ')}. These servers may log your browsing activity.`,
      'LOW', 3.1,
      'Use DNS-over-HTTPS with Cloudflare (1.1.1.1) or NextDNS.',
    )
  }

  // CHECK 6 — DNS_SINGLE
  if (input.dnsServers.length === 1) {
    add(
      'DNS_SINGLE',
      'Single DNS Server — No Redundancy',
      'Only one DNS server is configured. A DNS failure would cause a complete internet outage on this network.',
      'INFO', 1.0,
      'Add a secondary DNS server in your router DHCP settings.',
    )
  }

  // CHECK 7 — IP_ABUSE
  if (abuseData !== null && abuseData.abuseScore > 25) {
    add(
      'IP_ABUSE',
      'Gateway IP Has Abuse Reports',
      `IP ${input.gatewayIP} has been reported ${abuseData.totalReports} times for malicious activity (confidence score: ${abuseData.abuseScore}%).`,
      'HIGH', 7.0,
      'Contact your ISP — this IP may be flagged as malicious infrastructure.',
    )
  }

  // CHECK 8 — CVE_FOUND (top 3 by score)
  const topCves = [...cves].sort((a, b) => b.cvssScore - a.cvssScore).slice(0, 3)
  for (const cve of topCves) {
    let severity: Severity
    if (cve.cvssScore >= 9) severity = 'CRITICAL'
    else if (cve.cvssScore >= 7) severity = 'HIGH'
    else if (cve.cvssScore >= 4) severity = 'MEDIUM'
    else severity = 'LOW'

    const desc = cve.description.length > 200
      ? cve.description.slice(0, 197) + '...'
      : cve.description

    add(
      'CVE_FOUND',
      `Known Vulnerability: ${cve.cveId}`,
      desc,
      severity, cve.cvssScore,
      'Apply the latest firmware update from your router manufacturer.',
      [cve.cveId],
    )
  }

  // CHECK 9 — OTX_THREAT
  if (otxData !== null && otxData.pulseCount > 0) {
    add(
      'OTX_THREAT',
      'Gateway IP Found in Threat Intelligence Feed',
      `IP ${input.gatewayIP} appears in ${otxData.pulseCount} AlienVault OTX threat intelligence pulses. This network may be actively monitored or used by malicious actors.`,
      'HIGH', 7.5,
      'Treat this network as hostile. Use a VPN for all traffic.',
    )
  }

  const totalDeduction = findings.reduce((sum, f) => sum + SEVERITY_DEDUCTIONS[f.severity], 0)
  const overallScore = Math.round(Math.max(0, Math.min(10, 10.0 - totalDeduction)) * 100) / 100

  return { findings, overallScore }
}
