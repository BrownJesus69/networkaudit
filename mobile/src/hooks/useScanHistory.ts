import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ScanHistoryEntry } from '../types/index'

const HISTORY_KEY = 'scan_history'
const MAX_ENTRIES = 50

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY)
      const entries: ScanHistoryEntry[] = raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : []
      setHistory(entries)
    } catch {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  const addEntry = useCallback(async (entry: ScanHistoryEntry) => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY)
      const existing: ScanHistoryEntry[] = raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : []
      const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      setHistory(updated)
    } catch (err) {
      console.error('Failed to save scan history:', err)
    }
  }, [])

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }, [])

  return { history, loading, loadHistory, addEntry, clearHistory }
}
