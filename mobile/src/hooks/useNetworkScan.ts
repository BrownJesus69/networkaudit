import { useState, useCallback } from 'react'
import NetInfo from '@react-native-community/netinfo'
import * as Network from 'expo-network'
import { postScan } from '../services/api'
import { useScanHistory } from './useScanHistory'
import type { ScanResult, NetworkInfo } from '../types/index'

function deriveGateway(ip: string): string {
  const parts = ip.split('.')
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.1` : '192.168.1.1'
}

interface ScanState {
  loading: boolean
  result: ScanResult | null
  networkInfo: NetworkInfo | null
  error: string | null
}

export function useNetworkScan() {
  const [state, setState] = useState<ScanState>({ loading: false, result: null, networkInfo: null, error: null })
  const { saveEntry } = useScanHistory()

  const loadNetworkInfo = useCallback(async () => {
    try {
      const netState = await NetInfo.fetch()
      if (netState.type !== 'wifi' || !netState.isConnected) return
      const details = netState.details as { ssid?: string | null; ipAddress?: string | null } | null
      const deviceIP = details?.ipAddress ?? '192.168.1.100'
      let expoIP = deviceIP
      try { expoIP = await Network.getIpAddressAsync() } catch { /* use fallback */ }
      const finalIP = expoIP || deviceIP
      const info: NetworkInfo = {
        ssid: details?.ssid ?? null,
        securityType: 'UNKNOWN',
        gatewayIP: deriveGateway(finalIP),
        deviceIP: finalIP,
        dnsServers: ['8.8.8.8'],
        isConnected: true,
      }
      setState(s => ({ ...s, networkInfo: info }))
    } catch { /* silent fail */ }
  }, [])

  const runScan = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const netState = await NetInfo.fetch()
      if (netState.type !== 'wifi' || !netState.isConnected) {
        setState(s => ({ ...s, loading: false, error: 'Connect to a Wi-Fi network to scan' }))
        return
      }
      const details = netState.details as { ssid?: string | null; ipAddress?: string | null } | null
      const deviceIP = details?.ipAddress ?? '192.168.1.100'
      let expoIP = deviceIP
      try { expoIP = await Network.getIpAddressAsync() } catch { /* use fallback */ }
      const finalIP = expoIP || deviceIP
      const networkInfo: NetworkInfo = {
        ssid: details?.ssid ?? null,
        securityType: 'UNKNOWN',
        gatewayIP: deriveGateway(finalIP),
        deviceIP: finalIP,
        dnsServers: ['8.8.8.8'],
        isConnected: true,
      }
      setState(s => ({ ...s, networkInfo }))
      const result = await postScan({
        securityType: networkInfo.securityType,
        gatewayIP: networkInfo.gatewayIP,
        dnsServers: networkInfo.dnsServers,
        deviceIP: networkInfo.deviceIP,
        ssid: networkInfo.ssid ?? undefined,
      })
      await saveEntry(result, networkInfo)
      setState(s => ({ ...s, loading: false, result }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scan failed. Please try again.'
      setState(s => ({ ...s, loading: false, error: msg }))
    }
  }, [saveEntry])

  return { ...state, runScan, loadNetworkInfo }
}
