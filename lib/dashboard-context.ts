'use client'

import { createContext, useContext } from 'react'

export interface Clinica {
  id: string
  nome: string
  status: 'ativa' | 'inadimplente' | 'suspensa'
  stripe_plan_id?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'operador' | 'admin' | 'master'
  clinica_id: string
  created_at: string
  clinicas: Clinica
}

export interface DashboardContextType {
  usuario: Usuario
  clinicaId: string
}

export const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
