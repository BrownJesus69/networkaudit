import React, { createContext, useContext, useState, useCallback } from 'react'

interface ScanCountContextValue {
  count: number
  setCount: (n: number) => void
  increment: () => void
}

const ScanCountContext = createContext<ScanCountContextValue>({
  count: 0,
  setCount: () => {},
  increment: () => {},
})

export function ScanCountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => setCount(c => c + 1), [])
  return (
    <ScanCountContext.Provider value={{ count, setCount, increment }}>
      {children}
    </ScanCountContext.Provider>
  )
}

export function useScanCount() {
  return useContext(ScanCountContext)
}
