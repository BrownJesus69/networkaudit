import type { SecurityType } from '../types/index'

type ConnectionType = 'WIFI' | 'HOTSPOT' | 'ETHERNET'

interface ScoreInput {
  securityType: SecurityType
  connectionType: ConnectionType
  ssid?: string
  signalStrength?: number
  dnsServers: string[]
  isCarrierDNS?: boolean
}

interface ScoreOutput {
  score: number
  grade: string
  flags: string[]
}

const TRUSTED_DNS = new Set(['1.1.1.1', '8.8.8.8', '8.8.4.4', '9.9.9.9'])
const PERSONAL_SSID_REGEX = /\b(iphone|android)\b|'s\s+(wifi|wi-fi|network|home|internet|house|router)\b/i

export function computeSecurityScore(input: ScoreInput): ScoreOutput {
  let score = 100
  const flags: string[] = []

  if (input.securityType === 'WEP') {
    score -= 35
    flags.push('WEP encryption is critically insecure and easily cracked')
  }
  if (input.securityType === 'NONE') {
    score -= 40
    flags.push('Network has no encryption — all traffic is visible to nearby devices')
  }

  const untrustedDNS =
    input.dnsServers.length > 0 &&
    !input.dnsServers.every(d => TRUSTED_DNS.has(d)) &&
    input.isCarrierDNS !== true

  if (untrustedDNS) {
    score -= 20
    flags.push('DNS servers are not from a trusted provider')
  }

  if (input.ssid !== undefined && PERSONAL_SSID_REGEX.test(input.ssid)) {
    score -= 10
    flags.push('SSID may expose personal identity')
  }

  if (input.signalStrength !== undefined && input.signalStrength < -80) {
    score -= 15
    flags.push(`Weak signal (${input.signalStrength} dBm) increases interception risk`)
  }

  if (input.connectionType === 'HOTSPOT') {
    score += 5
    if (untrustedDNS) {
      score -= 5
      flags.push('Hotspot is using untrusted DNS')
    }
  }

  score = Math.max(0, Math.min(100, score))

  let grade: string
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 45) grade = 'D'
  else grade = 'F'

  return { score, grade, flags }
}
