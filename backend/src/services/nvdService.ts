import axios from 'axios'
import type { CVEResult } from '../types/index'
import { getCachedCVEs, insertCVECache } from '../db/queries'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getCVEsByKeyword(keyword: string): Promise<CVEResult[]> {
  try {
    const cached = await getCachedCVEs(keyword)
    if (cached.length > 0) return cached

    await sleep(700)

    const params: Record<string, string | number> = {
      keywordSearch: keyword,
      resultsPerPage: 10,
    }
    const headers: Record<string, string> = {}
    const apiKey = process.env['NVD_API_KEY']
    if (apiKey) headers['apiKey'] = apiKey

    const response = await axios.get<Record<string, unknown>>(
      'https://services.nvd.nist.gov/rest/json/cves/2.0',
      { params, headers, timeout: 10000 }
    )

    const vulnerabilities = (response.data['vulnerabilities'] as unknown[]) ?? []
    const results: CVEResult[] = []

    for (const item of vulnerabilities) {
      const rawItem = item as Record<string, unknown>
      const cveRaw = rawItem['cve']
      if (!cveRaw || typeof cveRaw !== 'object') continue
      const cve = cveRaw as Record<string, unknown>

      const id = cve['id'] as string
      const descriptions = (cve['descriptions'] as Array<{ lang: string; value: string }>) ?? []
      const description = descriptions.find(d => d.lang === 'en')?.value ?? ''

      const metrics = cve['metrics'] as Record<string, unknown> | undefined
      const cvssMetrics = (metrics?.['cvssMetricV31'] as Array<Record<string, unknown>>) ?? []
      const primaryMetric = cvssMetrics[0]
      if (!primaryMetric) continue
      const cvssData = primaryMetric['cvssData'] as Record<string, unknown> | undefined
      if (!cvssData) continue

      const cvssScore = cvssData['baseScore'] as number
      if (cvssScore < 6.0) continue

      results.push({
        cveId: id,
        cvssScore,
        cvssVector: (cvssData['vectorString'] as string) ?? '',
        description,
        severity: (cvssData['baseSeverity'] as string) ?? '',
        affectedCpe: [keyword],
      })
    }

    for (const cve of results) {
      await insertCVECache(cve, keyword)
    }

    return results
  } catch (err) {
    console.error('nvdService error:', err instanceof Error ? err.message : err)
    return []
  }
}
