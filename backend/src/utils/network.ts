import { createHash } from 'crypto'

const PRIVATE_RANGES = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
]

export function isPrivateIP(ip: string): boolean {
  return PRIVATE_RANGES.some(r => r.test(ip))
}

export function sha256Hash(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/

export function isValidPublicIP(ip: string): boolean {
  return IPV4_REGEX.test(ip) && !isPrivateIP(ip)
}
