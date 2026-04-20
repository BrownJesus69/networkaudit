import { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ScanHistoryEntry, ScanResult, NetworkInfo } from '../types/index'

const HISTORY_KEY = 'scan_history'
const MAX_ENTRIES = 50

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([])

  const loadHistory = useCallback(async (): Promise<ScanHistoryEntry[]> => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY)
      const entries: ScanHistoryEntry[] = raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : []
      setHistory(entries)
      return entries
    } catch {
      return []
    }
  }, [])

  const saveEntry = useCallback(async (result: ScanResult, networkInfo: NetworkInfo): Promise<void> => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY)
      const existing: ScanHistoryEntry[] = raw ? (JSON.parse(raw) as ScanHistoryEntry[]) : []
      const entry: ScanHistoryEntry = {
        id: Date.now().toString(),
        scannedAt: result.scannedAt,
        ssid: networkInfo.ssid,
        overallScore: result.overallScore,
        findings: result.findings,
        networkInfo,
      }
      const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      setHistory(updated)
    } catch (err) {
      console.error('Failed to save scan history:', err)
    }
  }, [])

  const clearHistory = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }, [])

  return { history, loadHistory, saveEntry, clearHistory }
}
