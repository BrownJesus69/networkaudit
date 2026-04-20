import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useTheme } from '../context/ThemeContext'
import type { NetworkInfo, SecurityType } from '../types/index'

interface Props {
  networkInfo: NetworkInfo | null
  onRefresh?: () => void
}

const SECURITY_COLORS: Record<SecurityType, string | null> = {
  WPA3: '#4CAF7D',
  WPA2: '#4A7FB5',
  WPA: '#C17D3C',
  WEP: '#C0392B',
  NONE: '#C0392B',
  'WPA2-Enterprise': '#4A7FB5',
  UNKNOWN: null,
}

function SecurityBadge({ type }: { type: SecurityType }) {
  const { colors } = useTheme()
  const bg = SECURITY_COLORS[type]
  if (bg) {
    return (
      <View style={[styles.secBadge, { backgroundColor: bg }]}>
        <Text style={styles.secBadgeText}>{type}</Text>
      </View>
    )
  }
  return (
    <View style={[styles.secBadge, { borderWidth: 1, borderColor: colors.border }]}>
      <Text style={[styles.secBadgeText, { color: colors.textSecondary }]}>{type}</Text>
    </View>
  )
}

function GatewayIP({ ip }: { ip: string }) {
  const { colors } = useTheme()
  const [copied, setCopied] = useState(false)

  async function onPress() {
    await Clipboard.setStringAsync(ip)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <Text style={[styles.gatewayText, { color: colors.textSecondary }]}>
        {copied ? 'Copied!' : ip}
      </Text>
    </TouchableOpacity>
  )
}

export function NetworkInfoPill({ networkInfo, onRefresh }: Props) {
  const { colors } = useTheme()

  if (!networkInfo) {
    return (
      <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.liveBadge, { backgroundColor: '#C0392B' }]}>
          <Text style={styles.liveText}>OFFLINE</Text>
        </View>
        <Text style={[styles.ssid, { color: colors.textSecondary }]}>No Wi-Fi connection</Text>
      </View>
    )
  }

  return (
    <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.topRow}>
          <View style={[styles.liveBadge, { backgroundColor: '#4CAF7D' }]}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={[styles.ssid, { color: colors.textPrimary }]} numberOfLines={1}>
            {networkInfo.ssid ?? 'Unknown Network'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <SecurityBadge type={networkInfo.securityType} />
          <Text style={[styles.detailSep, { color: colors.textMuted }]}> · </Text>
          <GatewayIP ip={networkInfo.gatewayIP} />
        </View>
      </View>
      {onRefresh != null && (
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  liveText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  ssid: { fontSize: 14, fontWeight: '700', flex: 1 },
  secBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  secBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  detailSep: { fontSize: 12 },
  gatewayText: { fontSize: 12 },
  refreshBtn: { padding: 4 },
})
