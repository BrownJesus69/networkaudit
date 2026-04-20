import type { ScanHistoryEntry } from './index'

export type RootStackParamList = {
  Tabs: undefined
  HistoryDetail: { entry: ScanHistoryEntry }
}
