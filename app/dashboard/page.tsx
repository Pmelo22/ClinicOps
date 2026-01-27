import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
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
    .select('*, clinica:clinicas(*)')
    .eq('auth_user_id', user.id)
    .single()

  if (!usuario) {
    redirect('/auth/login')
  }

  // Get stats for the clinic
  const clinicaId = usuario.clinica_id

  const [
    { count: totalPacientes },
    { count: totalAtendimentos },
    { count: atendimentosHoje },
    { data: recentAppointments },
  ] = await Promise.all([
    supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('clinica_id', clinicaId),
    supabase.from('atendimentos').select('*', { count: 'exact', head: true }).eq('clinica_id', clinicaId),
    supabase.from('atendimentos').select('*', { count: 'exact', head: true })
      .eq('clinica_id', clinicaId)
      .gte('data_atendimento', new Date().toISOString().split('T')[0]),
    supabase.from('atendimentos')
      .select('*, paciente:pacientes(nome)')
      .eq('clinica_id', clinicaId)
      .order('data_atendimento', { ascending: false })
      .limit(5),
  ])

  return (
    <div>
      <DashboardHeader title="Visao Geral" userName={usuario.nome} />
      
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
                          {appointment.tipo_procedimento}
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
      </div>
    </div>
  )
}
