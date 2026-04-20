import { useState, useCallback, useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import * as Network from 'expo-network'
import type { NetworkInfo, SecurityType } from '../types/index'

function mapSecurity(details: Record<string, unknown> | null): SecurityType {
  const sec = typeof details?.['security'] === 'string' ? details['security'] : ''
  if (sec.includes('WPA3')) return 'WPA3'
  if (sec.includes('WPA2')) return 'WPA2'
  if (sec.includes('WPA')) return 'WPA'
  if (sec.includes('WEP')) return 'WEP'
  if (sec === 'none') return 'NONE'
  return 'UNKNOWN'
}

function deriveGateway(ip: string): string {
  const parts = ip.split('.')
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.1` : '192.168.1.1'
}

export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const state = await NetInfo.fetch()
      let deviceIP = '0.0.0.0'
      try { deviceIP = await Network.getIpAddressAsync() } catch { /* use fallback */ }

      const isConnected = state.type === 'wifi' && state.isConnected === true
      const details = (state.details ?? null) as Record<string, unknown> | null
      const gatewayIP = deviceIP !== '0.0.0.0' ? deriveGateway(deviceIP) : '192.168.1.1'

      setNetworkInfo({
        ssid: (details?.['ssid'] as string | null | undefined) ?? null,
        securityType: mapSecurity(details),
        gatewayIP,
        dnsServers: [gatewayIP],
        deviceIP,
        isConnected,
        bssid: (details?.['bssid'] as string | undefined) ?? undefined,
      })
    } catch { /* silent fail */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refetch() }, [refetch])

  return { networkInfo, loading, refetch }
}
