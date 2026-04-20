import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '../context/ThemeContext'
import { useScanHistory } from '../hooks/useScanHistory'
import { EmptyState } from '../components/EmptyState'
import { scoreColor, SeverityColors } from '../constants/Colors'
import type { ScanHistoryEntry } from '../types/index'
import type { RootStackParamList } from '../types/navigation'

type NavProp = NativeStackNavigationProp<RootStackParamList>

function formatDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
}

function findingSummary(entry: ScanHistoryEntry): string {
  const critical = entry.findings.filter(f => f.severity === 'CRITICAL').length
  const high = entry.findings.filter(f => f.severity === 'HIGH').length
  const parts: string[] = []
  if (critical > 0) parts.push(`${critical} critical`)
  if (high > 0) parts.push(`${high} high`)
  return parts.length > 0 ? parts.join(', ') : 'No issues'
}

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const

function SeverityDots({ entry }: { entry: ScanHistoryEntry }) {
  const present = SEVERITY_ORDER.filter(s => entry.findings.some(f => f.severity === s))
  const shown = present.slice(0, 4)
  const extra = present.length - shown.length
  return (
    <View style={styles.dotsRow}>
      {shown.map(s => (
        <View key={s} style={[styles.dot, { backgroundColor: SeverityColors[s] ?? '#888' }]} />
      ))}
      {extra > 0 && <Text style={styles.dotsExtra}>+{extra}</Text>}
    </View>
  )
}

export default function HistoryScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation<NavProp>()
  const { history, loading, loadHistory, clearHistory } = useScanHistory()

  useEffect(() => { void loadHistory() }, [loadHistory])

  function confirmClear() {
    Alert.alert(
      'Clear History',
      'This will permanently delete all scan records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearHistory },
      ]
    )
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.heading, { color: colors.textPrimary, borderBottomColor: colors.border }]}>
        Scan History
      </Text>

      {loading ? (
        <ActivityIndicator style={styles.spinner} color={colors.textSecondary} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="lock-closed-outline"
          title="No scans yet"
          subtitle="Run your first scan to see results here"
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HistoryDetail', { entry: item })}
              style={[styles.entry, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
                  {formatDate(item.scannedAt)}
                </Text>
                <Text style={[styles.entrySsid, { color: colors.textPrimary }]}>
                  {item.ssid ?? 'Unknown Network'}
                </Text>
                <SeverityDots entry={item} />
                <Text style={[styles.entrySummary, { color: colors.textSecondary }]}>
                  {findingSummary(item)}
                </Text>
              </View>
              <View style={styles.entryRight}>
                <View style={[styles.scoreDot, { backgroundColor: scoreColor(item.overallScore) }]} />
                <Text style={[styles.entryScore, { color: scoreColor(item.overallScore) }]}>
                  {item.overallScore.toFixed(1)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity onPress={confirmClear} style={styles.clearBtn}>
              <Text style={[styles.clearText, { color: colors.textMuted }]}>Clear History</Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heading: { fontSize: 22, fontWeight: '700', padding: 16, borderBottomWidth: 1 },
  spinner: { marginTop: 60 },
  list: { padding: 16, paddingBottom: 32 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  entryDate: { fontSize: 11, marginBottom: 2 },
  entrySsid: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  dotsExtra: { fontSize: 10, color: '#888' },
  entrySummary: { fontSize: 12 },
  entryRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  scoreDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  entryScore: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  clearBtn: { alignItems: 'center', paddingVertical: 16 },
  clearText: { fontSize: 12, fontWeight: '600' },
})
