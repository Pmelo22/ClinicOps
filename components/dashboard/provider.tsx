'use client'

import { ReactNode } from 'react'
import { DashboardContext, DashboardContextType } from '@/lib/dashboard-context'

export function DashboardProvider({
  children,
  value,
}: {
  children: ReactNode
  value: DashboardContextType
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
