// ── FILE: backend/src/services/nvdService.ts ──

import type { CVEResult } from '../types/index'

export async function getCVEsByKeyword(_keyword: string): Promise<CVEResult[]> {
  // TODO: implement in Session 2
  // TODO: Check cve_cache first — return cached results if < 7 days old
  // TODO: Call https://services.nvd.nist.gov/rest/json/cves/2.0
  //       Params: keywordSearch='{keyword} router', resultsPerPage=10
  //       Header: apiKey from NVD_API_KEY env
  // TODO: Rate limit: 700ms delay between calls (5 req/30s no key, 50 with NVD_API_KEY)
  // TODO: Filter to cvssScore >= 6.0 and store in cve_cache
  return []
}
