import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { useTheme } from '../context/ThemeContext'
import { NetworkInfoPill } from '../components/NetworkInfoPill'
import { RiskGauge } from '../components/RiskGauge'
import { SeverityCard } from '../components/SeverityCard'
import { EmptyState } from '../components/EmptyState'
import { shareReport } from '../utils/shareReport'
import type { RootStackParamList } from '../types/navigation'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'HistoryDetail'>
type RouteP = RouteProp<RootStackParamList, 'HistoryDetail'>

function formatDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function HistoryDetailScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation<NavProp>()
  const { params } = useRoute<RouteP>()
  const { entry } = params

  const urgentCount = entry.findings.filter(
    f => f.severity === 'CRITICAL' || f.severity === 'HIGH'
  ).length

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerDate, { color: colors.textPrimary }]} numberOfLines={1}>
          {formatDate(entry.scannedAt)}
        </Text>
        <TouchableOpacity onPress={() => void shareReport(entry)} style={styles.headerBtn}>
          <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <NetworkInfoPill networkInfo={entry.networkInfo} />

        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>RISK SCORE</Text>
          <RiskGauge score={entry.overallScore} animated={false} />
          <Text style={[styles.findingSummary, { color: colors.textSecondary }]}>
            {entry.findings.length} finding{entry.findings.length !== 1 ? 's' : ''} · {urgentCount} require immediate action
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
          FINDINGS {entry.findings.length}
        </Text>

        {entry.findings.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title="Network Was Secure"
            subtitle="No issues were detected during this scan"
          />
        ) : (
          entry.findings.map(f => <SeverityCard key={f.id} finding={f} />)
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8, minWidth: 40 },
  headerDate: { flex: 1, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  content: { padding: 16, paddingBottom: 32 },
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
})
