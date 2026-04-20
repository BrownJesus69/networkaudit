import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import type { NetworkInfo } from '../types/index'

interface Props {
  networkInfo: NetworkInfo | null
  onRefresh?: () => void
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
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          {networkInfo.securityType} · {networkInfo.gatewayIP}
        </Text>
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
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  liveBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  liveText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  ssid: { fontSize: 14, fontWeight: '700', flex: 1 },
  detail: { fontSize: 12 },
  refreshBtn: { padding: 4 },
})
