// ── FILE: backend/src/services/riskScorer.ts ──

import type { ScanInput, CVEResult, Finding } from '../types/index'

export function scoreNetwork(
  _input: ScanInput,
  _cves: CVEResult[],
  _abuseData: unknown,
  _otxData: unknown,
): { findings: Finding[]; overallScore: number } {
  // TODO: implement in Session 2
  // TODO: Implement all 9 checks from SPEC.md Section 6:
  //   WIFI_OPEN, WIFI_WEP, WIFI_WPA, NET_DEFAULT_GW, DNS_EXTERNAL,
  //   DNS_SINGLE, IP_ABUSE, CVE_FOUND, OTX_THREAT
  // TODO: Score algorithm: base 10.0, deduct per severity:
  //   CRITICAL -2.5 | HIGH -1.5 | MEDIUM -0.8 | LOW -0.3 | INFO -0.1
  //   clamp 0–10, round to 2 decimal places
  return { findings: [], overallScore: 10.0 }
}
