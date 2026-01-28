import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'

export const metadata = {
  title: 'Assinaturas - ClinicOps',
}

export default async function AssinaturasPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nome, email, perfil, clinica_id, created_at, clinicas(id, nome, status, stripe_plan_id, stripe_customer_id, stripe_subscription_id, created_at)')
    .eq('id', user.id)
    .single()

  if (!usuario) {
    redirect('/auth/login')
  }

  // Buscar uso de recursos da clínica
  const currentDate = new Date()
  const mesReferencia = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  
  const { data: usoRecursos } = await supabase
    .from('uso_recursos')
    .select('*')
    .eq('clinica_id', usuario.clinica_id)
    .eq('mes_referencia', mesReferencia.toISOString().split('T')[0])
    .single()

  return (
    <div>
      <DashboardHeader 
        title="Assinaturas" 
        userName={usuario.nome || ''} 
      />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <SubscriptionCard
            clinicaId={usuario.clinica_id || ''}
            stripePlanId={usuario.clinicas?.stripe_plan_id}
            stripeCustomerId={usuario.clinicas?.stripe_customer_id}
            stripeSubscriptionId={usuario.clinicas?.stripe_subscription_id}
            clinicaStatus={usuario.clinicas?.status}
            createdAt={usuario.clinicas?.created_at}
            usoRecursos={usoRecursos}
          />
        </div>
      </div>
    </div>
  )
}
