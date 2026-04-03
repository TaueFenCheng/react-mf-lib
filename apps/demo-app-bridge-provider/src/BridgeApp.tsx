import type { ReactNode } from 'react'

export interface DemoBridgeAppProps {
  title?: string
  userName?: string
  count?: number
  onAction?: () => void
  children?: ReactNode
  [key: string]: unknown
}

export default function BridgeApp({
  title = 'Bridge Remote App',
  userName = 'Guest',
  count = 0,
  onAction,
  children,
}: DemoBridgeAppProps) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h3>{title}</h3>
      <p>Hi, {userName}</p>
      <p>Count from host: {count}</p>
      <button type="button" onClick={onAction}>
        Trigger host action
      </button>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  )
}
