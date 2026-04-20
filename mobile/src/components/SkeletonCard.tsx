import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'

export function SkeletonCard() {
  const { colors } = useTheme()
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity }]}>
      <View style={[styles.badge, { backgroundColor: colors.surface }]} />
      <View style={[styles.line, { backgroundColor: colors.surface, width: '70%' }]} />
      <View style={[styles.line, { backgroundColor: colors.surface, width: '90%' }]} />
      <View style={[styles.line, { backgroundColor: colors.surface, width: '55%' }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginVertical: 6 },
  badge: { width: 60, height: 18, borderRadius: 9, marginBottom: 10 },
  line: { height: 10, borderRadius: 5, marginVertical: 4 },
})
