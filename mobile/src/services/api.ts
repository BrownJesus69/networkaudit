import axios from 'axios'
import type { ScanInput, ScanResult } from '../types/index'

const API_BASE = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

if (__DEV__) {
  client.interceptors.request.use(req => {
    console.log(`[API] ${req.method?.toUpperCase() ?? 'REQ'} ${String(req.url)}`)
    return req
  })
  client.interceptors.response.use(
    res => { console.log(`[API] ${res.status}`); return res },
    (err: unknown) => {
      console.error('[API] Error:', err instanceof Error ? err.message : err)
      return Promise.reject(err instanceof Error ? err : new Error(String(err)))
    }
  )
}

export async function postScan(payload: ScanInput): Promise<ScanResult> {
  const { data } = await client.post<ScanResult>('/scan', payload)
  return data
}
