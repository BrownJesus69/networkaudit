import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useNetworkScan } from '../hooks/useNetworkScan'
import { SeverityCard } from '../components/SeverityCard'
import { RiskGauge } from '../components/RiskGauge'
import { NetworkInfoPill } from '../components/NetworkInfoPill'
import { SkeletonCard } from '../components/SkeletonCard'

export default function ScanScreen() {
  const { colors, isDark, toggle } = useTheme()
  const { loading, result, networkInfo, error, runScan, loadNetworkInfo } = useNetworkScan()

  useEffect(() => {
    loadNetworkInfo()
  }, [loadNetworkInfo])

  const criticalCount =
    result?.findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length ?? 0

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>NetworkAudit</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Wi-Fi Security Scanner</Text>
        </View>
        <TouchableOpacity onPress={toggle} style={styles.themeBtn}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={runScan} tintColor={colors.textPrimary} />
        }
      >
        <NetworkInfoPill networkInfo={networkInfo} onRefresh={loadNetworkInfo} />

        {Boolean(error) && !networkInfo && (
          <View style={[styles.warningCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="warning-outline" size={20} color="#C17D3C" />
            <Text style={[styles.warningText, { color: colors.textPrimary }]}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: colors.scanButton }, loading && styles.scanBtnDisabled]}
          onPress={runScan}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <>
              <ActivityIndicator color={colors.scanButtonText} size="small" />
              <Text style={[styles.scanBtnText, { color: colors.scanButtonText, marginLeft: 10 }]}>
                Scanning...
              </Text>
            </>
          ) : (
            <Text style={[styles.scanBtnText, { color: colors.scanButtonText }]}>Scan Network</Text>
          )}
        </TouchableOpacity>

        {result != null && (
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>RISK SCORE</Text>
            <RiskGauge score={result.overallScore} />
            <Text style={[styles.findingSummary, { color: colors.textSecondary }]}>
              {result.findings.length} finding{result.findings.length !== 1 ? 's' : ''} ·{' '}
              {criticalCount} require immediate action
            </Text>
          </View>
        )}

        {loading && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
              FINDINGS
            </Text>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {result != null && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
              FINDINGS
            </Text>
            {result.findings.length === 0 ? (
              <View style={[styles.cleanCard, { backgroundColor: '#4CAF7D20', borderColor: '#4CAF7D' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF7D" />
                <Text style={[styles.cleanText, { color: '#4CAF7D', marginLeft: 10 }]}>
                  No issues found. Your network looks secure.
                </Text>
              </View>
            ) : (
              result.findings.map(f => <SeverityCard key={f.id} finding={f} />)
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  appName: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  themeBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 32 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 14, marginLeft: 10 },
  scanBtn: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  scanBtnDisabled: { opacity: 0.7 },
  scanBtnText: { fontSize: 16, fontWeight: '700' },
  scoreCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  findingSummary: { fontSize: 12, marginTop: 8 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  cleanCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14 },
  cleanText: { fontSize: 14, fontWeight: '600', flex: 1 },
})
