import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { SeverityColors } from '../constants/Colors'
import type { Finding } from '../types/index'

interface Props {
  finding: Finding
  expanded?: boolean
}

export function SeverityCard({ finding, expanded: initial = false }: Props) {
  const { colors } = useTheme()
  const [expanded, setExpanded] = useState(initial)
  const expandAnim = useRef(new Animated.Value(initial ? 1 : 0)).current
  const severityColor = SeverityColors[finding.severity] ?? '#888888'
  const remColor = finding.severity === 'LOW' || finding.severity === 'INFO' ? '#4CAF7D' : colors.textSecondary

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start()
  }, [expanded, expandAnim])

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(e => !e)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.accent, { backgroundColor: severityColor }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: severityColor }]}>
            <Text style={styles.badgeText}>{finding.severity}</Text>
          </View>
          <Text style={[styles.cvss, { color: colors.textSecondary }]}>
            CVSS {finding.cvssScore.toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{finding.title}</Text>
        <Text
          style={[styles.desc, { color: colors.textMuted }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {finding.description}
        </Text>
        <Animated.View
          style={{
            maxHeight: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
            overflow: 'hidden',
          }}
        >
          <View style={[styles.remBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.remText, { color: remColor }]}>→ {finding.remediation}</Text>
          </View>
          {finding.cveIds && finding.cveIds.length > 0 && (
            <View style={styles.cveRow}>
              {finding.cveIds.map(id => (
                <View key={id} style={styles.cvePill}>
                  <Text style={styles.cveText}>{id}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
    overflow: 'hidden',
  },
  accent: { width: 6 },
  body: { flex: 1, padding: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '600' },
  cvss: { fontSize: 10 },
  title: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  desc: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  remBox: { borderRadius: 8, padding: 10, marginTop: 8 },
  remText: { fontSize: 11, lineHeight: 16 },
  cveRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cvePill: {
    backgroundColor: '#4A7FB5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  cveText: { color: '#FFFFFF', fontSize: 9 },
})
