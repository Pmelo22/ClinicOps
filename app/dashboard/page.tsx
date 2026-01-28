import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardCharts } from '@/components/dashboard/charts'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - ClinicOps',
}

export default async function DashboardPage() {
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

  // Get stats for the clinic
  const clinicaId = usuario.clinica_id

  // Build all queries
  const pacientesQuery = supabase
    .from('pacientes')
    .select('*', { count: 'exact', head: true })
    .eq('clinica_id', clinicaId)

  const atendimentosTotalQuery = supabase
    .from('atendimentos')
    .select('*', { count: 'exact', head: true })
    .eq('clinica_id', clinicaId)

  const atendimentosHojeQuery = supabase
    .from('atendimentos')
    .select('*', { count: 'exact', head: true })
    .eq('clinica_id', clinicaId)
    .gte('data_atendimento', new Date().toISOString().split('T')[0])

  const recentAppointmentsQuery = supabase
    .from('atendimentos')
    .select('id, tipo, data_atendimento, status, paciente:pacientes(nome)')
    .eq('clinica_id', clinicaId)
    .order('data_atendimento', { ascending: false })
    .limit(5)

  const appointmentsByTypeQuery = supabase
    .from('atendimentos')
    .select('tipo')
    .eq('clinica_id', clinicaId)
    .gte('data_atendimento', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const revenueDataQuery = supabase
    .from('atendimentos')
    .select('data_atendimento, id')
    .eq('clinica_id', clinicaId)
    .gte('data_atendimento', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const [
    pacientesResult,
    atendimentosTotalResult,
    atendimentosHojeResult,
    recentAppointmentsResult,
    appointmentsByTypeResult,
    revenueDataResult,
  ] = await Promise.all([
    pacientesQuery,
    atendimentosTotalQuery,
    atendimentosHojeQuery,
    recentAppointmentsQuery,
    appointmentsByTypeQuery,
    revenueDataQuery,
  ])

  const totalPacientes = pacientesResult.count || 0
  const totalAtendimentos = atendimentosTotalResult.count || 0
  const atendimentosHoje = atendimentosHojeResult.count || 0
  const recentAppointments = recentAppointmentsResult.data || []
  const appointmentsByType = appointmentsByTypeResult.data || []
  const revenueData = revenueDataResult.data || []

  // Process appointments by type
  const appointmentTypeMap = new Map<string, number>()
  appointmentsByType?.forEach((apt: { tipo: string | null }) => {
    const tipo = apt.tipo || 'Sem tipo'
    appointmentTypeMap.set(tipo, (appointmentTypeMap.get(tipo) || 0) + 1)
  })
  const chartAppointmentData = Array.from(appointmentTypeMap).map(([tipo, quantidade]) => ({
    tipo,
    quantidade,
  }))

  // Process revenue data (simplified - count appointments per day)
  const revenueMap = new Map<string, number>()
  revenueData?.forEach((apt: { data_atendimento: string }) => {
    const date = new Date(apt.data_atendimento)
    const dia = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    revenueMap.set(dia, (revenueMap.get(dia) || 0) + 1)
  })
  const chartRevenueData = Array.from(revenueMap)
    .sort((a, b) => new Date(`2024-${a[0]}`).getTime() - new Date(`2024-${b[0]}`).getTime())
    .map(([dia, quantidade]) => ({
      dia,
      valor: quantidade * 150, // Simplified: 150 per appointment
    }))

  console.log('DEBUG - Dashboard Data:', {
    clinicaId,
    totalPacientes,
    totalAtendimentos,
    atendimentosHoje,
    appointmentsByTypeCount: appointmentsByType?.length,
    revenueDataCount: revenueData?.length,
    chartAppointmentData,
    chartRevenueData,
  })

  return (
    <div>
      {/* Calculate days remaining */}
      {(() => {
        const created = new Date(usuario.clinica?.created_at || new Date().toISOString())
        const trialEndDate = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000)
        const today = new Date()
        const millisecondsRemaining = trialEndDate.getTime() - today.getTime()
        const daysLeft = Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24))
        const daysRemaining = Math.max(0, daysLeft)
        
        return (
          <DashboardHeader 
            title="Visão Geral" 
            userName={usuario.nome}
            trialDaysRemaining={daysRemaining}
          />
        )
      })()}
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Pacientes"
            value={totalPacientes || 0}
            icon={Users}
            description="Pacientes cadastrados"
          />
          <StatsCard
            title="Atendimentos Hoje"
            value={atendimentosHoje || 0}
            icon={Calendar}
            description="Agendados para hoje"
          />
          <StatsCard
            title="Total de Atendimentos"
            value={totalAtendimentos || 0}
            icon={FileText}
            description="Realizados"
          />
          <StatsCard
            title="Taxa de Crescimento"
            value="12%"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            description="vs. mes anterior"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos Recentes</CardTitle>
              <CardDescription>Ultimos atendimentos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAppointments && recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-foreground">
                          {appointment.paciente?.nome || 'Paciente'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.tipo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">
                          {new Date(appointment.data_atendimento).toLocaleDateString('pt-BR')}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'concluido' 
                            ? 'bg-accent/10 text-accent' 
                            : appointment.status === 'agendado'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum atendimento registrado ainda.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acoes Rapidas</CardTitle>
              <CardDescription>Acesse as funcoes mais utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/dashboard/pacientes/novo"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Novo Paciente</span>
                </a>
                <a
                  href="/dashboard/atendimentos/novo"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Novo Atendimento</span>
                </a>
                <a
                  href="/dashboard/documentos"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Documentos</span>
                </a>
                <a
                  href="/dashboard/pacientes"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Ver Pacientes</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <DashboardCharts 
          revenueData={chartRevenueData} 
          appointmentData={chartAppointmentData}
        />
      </div>
    </div>
  )
}
