import { useState, useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { postScan } from '../services/api'
import { useScanHistory } from './useScanHistory'
import type { ScanResult, NetworkInfo } from '../types/index'

const OUI_MAP: Record<string, string> = {
  '00:50:f2': 'TP-Link', '00:e0:4c': 'TP-Link', 'f8:1a:67': 'TP-Link',
  '00:26:5a': 'D-Link',  '28:10:7b': 'D-Link',  '00:1b:11': 'D-Link',
  '00:14:6c': 'Netgear', '20:4e:7f': 'Netgear', 'a0:21:b7': 'Netgear',
  '00:50:7f': 'Linksys', '00:1c:10': 'Linksys', '30:85:a9': 'Linksys',
  '00:1a:1e': 'Asus',    'ac:9e:17': 'Asus',    '00:0c:e7': 'Asus',
}

function guessVendor(bssid: string | undefined): string | undefined {
  if (!bssid) return undefined
  const oui = bssid.substring(0, 8).toLowerCase()
  return OUI_MAP[oui]
}

interface ScanState {
  loading: boolean
  result: ScanResult | null
  error: string | null
}

export function useNetworkScan() {
  const [state, setState] = useState<ScanState>({ loading: false, result: null, error: null })
  const { addEntry } = useScanHistory()

  const runScan = useCallback(async (networkInfo: NetworkInfo) => {
    if (!networkInfo.isConnected) {
      setState(s => ({ ...s, error: 'Connect to a Wi-Fi network to scan' }))
      return
    }
    setState({ loading: true, error: null, result: null })
    try {
      const scanInput = {
        securityType: networkInfo.securityType,
        gatewayIP: networkInfo.gatewayIP,
        dnsServers: networkInfo.dnsServers,
        deviceIP: networkInfo.deviceIP,
        ...(networkInfo.ssid != null ? { ssid: networkInfo.ssid } : {}),
        routerVendor: guessVendor(networkInfo.bssid),
      }
      const result = await postScan(scanInput)
      await addEntry({
        id: Date.now().toString(),
        scannedAt: result.scannedAt,
        ssid: networkInfo.ssid,
        overallScore: result.overallScore,
        findings: result.findings,
        networkInfo,
      })
      setState({ loading: false, result, error: null })
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } } | null
      const msg = axiosErr?.response?.data?.error ?? (err instanceof Error ? err.message : 'Network error. Is the backend running?')
      setState({ loading: false, result: null, error: msg })
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [addEntry])

  const reset = useCallback(() => {
    setState({ loading: false, result: null, error: null })
  }, [])

  return { ...state, runScan, reset }
}
