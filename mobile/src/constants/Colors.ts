export interface ThemeColors {
  background: string
  card: string
  surface: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  accentText: string
  scanButton: string
  scanButtonText: string
}

export const LightColors: ThemeColors = {
  background: '#F5F0E8',
  card: '#FFFFFF',
  surface: '#EDE8DF',
  border: '#E0D9CE',
  textPrimary: '#1A1A2E',
  textSecondary: '#9E9589',
  textMuted: '#6B6560',
  accent: '#1A1A2E',
  accentText: '#F5F0E8',
  scanButton: '#1A1A2E',
  scanButtonText: '#F5F0E8',
}

export const DarkColors: ThemeColors = {
  background: '#141414',
  card: '#1C1C1C',
  surface: '#242424',
  border: '#2A2A2A',
  textPrimary: '#EDE8DF',
  textSecondary: '#5A5550',
  textMuted: '#3A3530',
  accent: '#EDE8DF',
  accentText: '#141414',
  scanButton: '#EDE8DF',
  scanButtonText: '#141414',
}

export const SeverityColors: Record<string, string> = {
  CRITICAL: '#C0392B',
  HIGH: '#D4651A',
  MEDIUM: '#C17D3C',
  LOW: '#4CAF7D',
  INFO: '#4A7FB5',
}

export function scoreColor(score: number): string {
  if (score >= 8.0) return '#4CAF7D'
  if (score >= 5.0) return '#C17D3C'
  return '#C0392B'
}
