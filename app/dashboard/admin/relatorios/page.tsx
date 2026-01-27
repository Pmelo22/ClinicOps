import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, TrendingUp, DollarSign } from 'lucide-react'

export const metadata = {
  title: 'Relatorios - ClinicOps',
}

export default async function AdminRelatoriosPage() {
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

  if (!usuario || usuario.perfil !== 'admin_tenant') {
    redirect('/dashboard')
  }

  // Get stats for reports
  const currentMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7)

  const [
    { count: totalPacientes },
    { count: pacientesMes },
    { count: atendimentosMes },
    { count: atendimentosMesAnterior },
    { data: atendimentosComValor },
  ] = await Promise.all([
    supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('clinica_id', usuario.clinica_id),
    supabase.from('pacientes').select('*', { count: 'exact', head: true })
      .eq('clinica_id', usuario.clinica_id)
      .gte('created_at', `${currentMonth}-01`),
    supabase.from('atendimentos').select('*', { count: 'exact', head: true })
      .eq('clinica_id', usuario.clinica_id)
      .gte('data_atendimento', `${currentMonth}-01`),
    supabase.from('atendimentos').select('*', { count: 'exact', head: true })
      .eq('clinica_id', usuario.clinica_id)
      .gte('data_atendimento', `${lastMonth}-01`)
      .lt('data_atendimento', `${currentMonth}-01`),
    supabase.from('atendimentos')
      .select('valor')
      .eq('clinica_id', usuario.clinica_id)
      .gte('data_atendimento', `${currentMonth}-01`)
      .not('valor', 'is', null),
  ])

  const faturamentoMes = atendimentosComValor?.reduce((sum, a) => sum + (a.valor || 0), 0) || 0
  const crescimentoAtendimentos = atendimentosMesAnterior
    ? Math.round(((atendimentosMes || 0) - atendimentosMesAnterior) / atendimentosMesAnterior * 100)
    : 0

  return (
    <div>
      <DashboardHeader title="Relatorios" userName={usuario.nome} />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalPacientes || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{pacientesMes || 0} novos este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atendimentos (Mes)
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{atendimentosMes || 0}</div>
              <p className={`text-xs ${crescimentoAtendimentos >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {crescimentoAtendimentos >= 0 ? '+' : ''}{crescimentoAtendimentos}% vs. mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento (Mes)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Baseado nos atendimentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Medio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {atendimentosMes
                  ? (faturamentoMes / atendimentosMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Por atendimento
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
              <CardDescription>Visao geral do mes atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Novos Pacientes</span>
                  </div>
                  <span className="font-semibold text-foreground">{pacientesMes || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Atendimentos Realizados</span>
                  </div>
                  <span className="font-semibold text-foreground">{atendimentosMes || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Faturamento Total</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>Baixe relatorios em diferentes formatos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Pacientes (CSV)</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Atendimentos (CSV)</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Financeiro (PDF)</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Relatorio Geral</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
