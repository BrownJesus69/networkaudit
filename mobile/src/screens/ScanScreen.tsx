import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useNetworkInfo } from '../hooks/useNetworkInfo'
import { useNetworkScan } from '../hooks/useNetworkScan'
import { SeverityCard } from '../components/SeverityCard'
import { RiskGauge } from '../components/RiskGauge'
import { NetworkInfoPill } from '../components/NetworkInfoPill'
import { SkeletonCard } from '../components/SkeletonCard'
import { EmptyState } from '../components/EmptyState'
import { shareReport } from '../utils/shareReport'
import type { ScanHistoryEntry } from '../types/index'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function ScanScreen() {
  const { colors, isDark, toggle } = useTheme()
  const { networkInfo, loading: netLoading, refetch } = useNetworkInfo()
  const { loading, result, error, runScan, reset } = useNetworkScan()
  const [refreshing, setRefreshing] = useState(false)

  const slideAnim = useRef(new Animated.Value(-30)).current
  const errorOpacity = useRef(new Animated.Value(0)).current
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismissError = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    if (error) {
      slideAnim.setValue(-30)
      errorOpacity.setValue(0)
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(errorOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start()
      dismissTimerRef.current = setTimeout(dismissError, 8000)
    }
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [error, slideAnim, errorOpacity, dismissError])

  const urgentCount = result?.findings.filter(
    f => f.severity === 'CRITICAL' || f.severity === 'HIGH'
  ).length ?? 0

  const isOffline = networkInfo != null && !networkInfo.isConnected

  async function onRefresh() {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  function onSharePress() {
    if (!result || !networkInfo) return
    const entry: ScanHistoryEntry = {
      id: Date.now().toString(),
      scannedAt: result.scannedAt,
      ssid: networkInfo.ssid,
      overallScore: result.overallScore,
      findings: result.findings,
      networkInfo,
    }
    void shareReport(entry)
  }

  function onScanAgain() {
    reset()
    if (networkInfo) runScan(networkInfo)
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>NetworkAudit</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Wi-Fi Security Scanner</Text>
        </View>
        <View style={styles.headerRight}>
          {result != null && (
            <TouchableOpacity onPress={onSharePress} style={styles.headerBtn}>
              <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={toggle} style={styles.headerBtn}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing || netLoading} onRefresh={onRefresh} tintColor={colors.textPrimary} />
        }
      >
        <NetworkInfoPill networkInfo={networkInfo} onRefresh={refetch} />

        {Boolean(error) && (
          <Animated.View
            style={[
              styles.errorCard,
              { backgroundColor: colors.surface, borderColor: '#C0392B' },
              { transform: [{ translateY: slideAnim }], opacity: errorOpacity },
            ]}
          >
            <Ionicons name="warning-outline" size={20} color="#C0392B" />
            <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
            <TouchableOpacity onPress={dismissError} style={styles.errorActionBtn}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
            {networkInfo && (
              <TouchableOpacity
                onPress={() => { dismissError(); runScan(networkInfo) }}
                style={styles.errorActionBtn}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {isOffline ? (
          <View style={[styles.offlineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="warning-outline" size={20} color="#C17D3C" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.offlineTitle, { color: colors.textPrimary }]}>No Wi-Fi Connection</Text>
              <Text style={[styles.offlineSub, { color: colors.textSecondary }]}>
                Connect to a Wi-Fi network to scan
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: colors.scanButton }, loading && styles.scanBtnDisabled]}
            onPress={() => { if (!loading && networkInfo) runScan(networkInfo) }}
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
            <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>RISK SCORE</Text>
              <RiskGauge score={result.overallScore} />
              <Text style={[styles.lastScanned, { color: colors.textSecondary }]}>
                Last scanned: {formatDate(result.scannedAt)}
              </Text>
              <Text style={[styles.findingSummary, { color: colors.textSecondary }]}>
                {result.findings.length} finding{result.findings.length !== 1 ? 's' : ''} · {urgentCount} require immediate action
              </Text>
            </View>

            <View style={[styles.sectionLabelRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionLabelText, { color: colors.textSecondary }]}>FINDINGS</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.textPrimary }]}>
                <Text style={[styles.countBadgeText, { color: colors.card }]}>{result.findings.length}</Text>
              </View>
            </View>

            {result.findings.length === 0 ? (
              <EmptyState
                icon="shield-checkmark-outline"
                title="Network Looks Secure"
                subtitle="No issues detected on this network"
              />
            ) : (
              result.findings.map(f => <SeverityCard key={f.id} finding={f} />)
            )}

            <TouchableOpacity
              style={[styles.scanAgainBtn, { borderColor: colors.textSecondary }]}
              onPress={onScanAgain}
              activeOpacity={0.7}
            >
              <Text style={[styles.scanAgainText, { color: colors.textSecondary }]}>Scan Again</Text>
            </TouchableOpacity>
          </>
        )}

        {result == null && !loading && !isOffline && (
          <EmptyState
            icon="shield-outline"
            title="Ready to Scan"
            subtitle="Tap the button above to analyse your current Wi-Fi network"
          />
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 32 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13 },
  errorActionBtn: { paddingHorizontal: 4 },
  dismissText: { color: '#C0392B', fontSize: 12, fontWeight: '600' },
  retryText: { color: '#4A7FB5', fontSize: 12, fontWeight: '600' },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  offlineTitle: { fontSize: 14, fontWeight: '600' },
  offlineSub: { fontSize: 12, marginTop: 2 },
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
  lastScanned: { fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  findingSummary: { fontSize: 12, marginTop: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  sectionLabelText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  countBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  countBadgeText: { fontSize: 9, fontWeight: '700' },
  scanAgainBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  scanAgainText: { fontSize: 14, fontWeight: '600' },
})
