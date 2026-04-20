import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useScanHistory } from '../hooks/useScanHistory'
import { EmptyState } from '../components/EmptyState'
import { scoreColor } from '../constants/Colors'
import type { ScanHistoryEntry } from '../types/index'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
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

export default function HistoryScreen() {
  const { colors } = useTheme()
  const { history, loadHistory, clearHistory } = useScanHistory()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.heading, { color: colors.textPrimary, borderBottomColor: colors.border }]}>
        Scan History
      </Text>
      {history.length === 0 ? (
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
            <View style={[styles.entry, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
                  {formatDate(item.scannedAt)}
                </Text>
                <Text style={[styles.entrySsid, { color: colors.textPrimary }]}>
                  {item.ssid ?? 'Unknown Network'}
                </Text>
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
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear History</Text>
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
  entrySsid: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  entrySummary: { fontSize: 12 },
  entryRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  scoreDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  entryScore: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  clearBtn: { alignItems: 'center', paddingVertical: 16 },
  clearText: { color: '#C0392B', fontSize: 14, fontWeight: '600' },
})
