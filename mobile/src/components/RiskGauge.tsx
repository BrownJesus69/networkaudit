import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { scoreColor } from '../constants/Colors'

interface Props {
  score: number
  animated?: boolean
}

function scoreLabel(score: number): string {
  if (score >= 9.0) return 'Secure'
  if (score >= 7.0) return 'Low Risk'
  if (score >= 5.0) return 'Moderate'
  if (score >= 3.0) return 'High Risk'
  return 'At Risk'
}

export function RiskGauge({ score, animated = true }: Props) {
  const { colors } = useTheme()
  const widthAnim = useRef(new Animated.Value(0)).current
  const color = scoreColor(score)

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: score / 10,
      duration: animated ? 500 : 0,
      useNativeDriver: false,
    }).start()
  }, [score, animated, widthAnim])

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.score, { color }]}>{score.toFixed(1)}</Text>
        <Text style={[styles.outOf, { color: colors.textMuted }]}>/10</Text>
        <Text style={[styles.label, { color }]}>{scoreLabel(score)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surface }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  score: { fontSize: 32, fontWeight: '700' },
  outOf: { fontSize: 16, marginLeft: 4, marginRight: 10 },
  label: { fontSize: 14, fontWeight: '600' },
  track: { height: 7, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 4 },
})
