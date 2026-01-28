import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardProvider } from '@/components/dashboard/provider'
import type { UserRole } from '@/lib/types'
import type { Usuario } from '@/lib/dashboard-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, perfil, clinica_id, created_at, clinicas(id, nome, status, stripe_plan_id, stripe_customer_id, stripe_subscription_id, created_at)')
    .eq('id', user.id)
    .single()

  if (!usuario || error) {
    redirect('/auth/login')
  }

  const dashboardData = {
    usuario: usuario as unknown as Usuario,
    clinicaId: usuario.clinica_id,
  }

  return (
    <DashboardProvider value={dashboardData}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar 
          userRole={usuario.perfil as UserRole}
          userName={usuario.nome}
          clinicName={usuario.clinicas?.nome}
        />
        <div className="lg:pl-64">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
