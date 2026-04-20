import React from 'react'
import { View, Text, ScrollView, Linking, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'

const APP_VERSION = '1.0.0'
const BUILD_NUMBER = '1'

const HOW_IT_WORKS = [
  { step: 1, text: 'App collects Wi-Fi metadata (SSID, security type, gateway IP, DNS)' },
  { step: 2, text: 'Metadata sent to NetworkAudit backend — no personal data stored' },
  { step: 3, text: 'Backend cross-references NVD CVE database + threat intel APIs' },
  { step: 4, text: 'CVSS-scored findings returned with remediation steps' },
]

const APIS_USED = [
  { name: 'NVD NIST', url: 'https://nvd.nist.gov/developers/vulnerabilities' },
  { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com' },
  { name: 'AlienVault OTX', url: 'https://otx.alienvault.com' },
  { name: 'iplocate.io', url: 'https://www.iplocate.io' },
  { name: 'ThreatFox', url: 'https://threatfox.abuse.ch' },
]

function openLink(url: string) {
  Linking.openURL(url).catch(() => null)
}

export default function AboutScreen() {
  const { colors } = useTheme()

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* App identity */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.logoWrap, { backgroundColor: colors.surface }]}>
            <Ionicons name="shield-checkmark" size={40} color={colors.textPrimary} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>NetworkAudit</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Know your network. Own your security.
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version {APP_VERSION} · Build {BUILD_NUMBER}
          </Text>
        </View>

        {/* How it works */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How It Works</Text>
          {HOW_IT_WORKS.map(({ step, text }) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: colors.textPrimary }]}>
                <Text style={[styles.stepNum, { color: colors.card }]}>{step}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Open Dataset */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Open Dataset</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            NetworkAudit maintains an open router CVE mapping dataset — a structured reference of consumer
            router vulnerabilities, default credentials, and risk scores for 10 vendors.
          </Text>
          <TouchableOpacity
            onPress={() => openLink('https://github.com/brownjesus/networkaudit')}
            style={styles.linkRow}
          >
            <Ionicons name="logo-github" size={16} color="#4A7FB5" />
            <Text style={styles.linkText}>View on GitHub</Text>
          </TouchableOpacity>
        </View>

        {/* APIs used */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>APIs Used</Text>
          {APIS_USED.map(({ name, url }) => (
            <TouchableOpacity key={name} style={styles.apiRow} onPress={() => openLink(url)}>
              <View style={[styles.apiBullet, { backgroundColor: colors.surface }]} />
              <Text style={[styles.body, { color: colors.textSecondary, flex: 1 }]}>{name}</Text>
              <Ionicons name="open-outline" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF7D" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0, marginLeft: 8 }]}>
              Privacy
            </Text>
          </View>
          <Text style={[styles.body, { color: colors.textSecondary, marginTop: 12 }]}>
            We never store your SSID or personal data. Gateway IPs are SHA256-hashed before storage.
            No user accounts. No tracking. All analysis is based on metadata your device already knows.
          </Text>
        </View>

        {/* Built by */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Built by</Text>
          <TouchableOpacity
            onPress={() => openLink('https://github.com/brownjesus')}
            style={styles.linkRow}
          >
            <Ionicons name="logo-github" size={16} color="#4A7FB5" />
            <Text style={styles.linkText}>@brownjesus</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          NetworkAudit v{APP_VERSION} · Build {BUILD_NUMBER}
        </Text>
        <View style={[styles.mitDivider, { backgroundColor: colors.border }]} />
        <Text style={[styles.mitText, { color: colors.textMuted }]}>MIT Licensed · Open Source</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  appName: { fontSize: 22, fontWeight: '700', alignSelf: 'center' },
  tagline: { fontSize: 13, marginTop: 4, alignSelf: 'center', textAlign: 'center' },
  versionText: { fontSize: 11, marginTop: 6, alignSelf: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  privacyHeader: { flexDirection: 'row', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNum: { fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20 },
  body: { fontSize: 13, lineHeight: 20 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  linkText: { color: '#4A7FB5', fontSize: 14, marginLeft: 6 },
  apiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' },
  apiBullet: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 8, width: '100%' },
  mitDivider: { height: 1, width: '40%', alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  mitText: { fontSize: 11, textAlign: 'center', width: '100%' },
})
