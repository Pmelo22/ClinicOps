import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Calendar, HardDrive, FileText, TrendingUp, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard - ClinicOps',
}

export default async function AdminDashboardPage() {
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

  if (!usuario || usuario.perfil !== 'admin') {
    redirect('/dashboard')
  }

  // Get usage stats
  const [
    { count: totalUsuarios },
    { count: totalPacientes },
    { count: totalAtendimentos },
    { data: usoRecursos },
  ] = await Promise.all([
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('clinica_id', usuario.clinica_id),
    supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('clinica_id', usuario.clinica_id),
    supabase.from('atendimentos').select('*', { count: 'exact', head: true }).eq('clinica_id', usuario.clinica_id),
    supabase.from('uso_recursos')
      .select('*')
      .eq('clinica_id', usuario.clinica_id)
      .order('mes_referencia', { ascending: false })
      .limit(1)
      .single(),
  ])

  const armazenamentoUsado = usoRecursos?.armazenamento_usado_mb || 0
  // Default limits for now (these should come from clinicas table or planos relation)
  const limiteUsuarios = 10
  const limitePacientes = 500
  const limiteArmazenamento = 1024

  const percentUsuarios = Math.round((totalUsuarios || 0) / limiteUsuarios * 100)
  const percentPacientes = Math.round((totalPacientes || 0) / limitePacientes * 100)
  const percentArmazenamento = Math.round(armazenamentoUsado / limiteArmazenamento * 100)

  return (
    <div>
      <DashboardHeader title="Painel Administrativo" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Usuarios"
            value={`${totalUsuarios || 0} / ${limiteUsuarios}`}
            icon={Users}
            description={`${percentUsuarios}% do limite`}
          />
          <StatsCard
            title="Total de Pacientes"
            value={`${totalPacientes || 0} / ${limitePacientes}`}
            icon={FileText}
            description={`${percentPacientes}% do limite`}
          />
          <StatsCard
            title="Atendimentos (Mes)"
            value={totalAtendimentos || 0}
            icon={Calendar}
            trend={{ value: 8, isPositive: true }}
            description="vs. mes anterior"
          />
          <StatsCard
            title="Armazenamento"
            value={`${armazenamentoUsado} MB`}
            icon={HardDrive}
            description={`de ${limiteArmazenamento} MB`}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Uso do Plano</CardTitle>
              <CardDescription>
                Plano atual: <span className="font-medium text-foreground">{plano?.nome || 'N/A'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usuarios</span>
                  <span className="text-foreground">{totalUsuarios || 0} de {limiteUsuarios}</span>
                </div>
                <Progress value={percentUsuarios} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pacientes</span>
                  <span className="text-foreground">{totalPacientes || 0} de {limitePacientes}</span>
                </div>
                <Progress value={percentPacientes} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Armazenamento</span>
                  <span className="text-foreground">{armazenamentoUsado} MB de {limiteArmazenamento} MB</span>
                </div>
                <Progress value={percentArmazenamento} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informacoes da Clinica</CardTitle>
              <CardDescription>Dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium text-foreground">{clinica?.nome || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium text-foreground">
                  {clinica?.cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{clinica?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status da Assinatura</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  clinica?.status === 'ativo' 
                    ? 'bg-accent/10 text-accent'
                    : clinica?.status === 'trial'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {clinica?.status === 'trial' ? 'Periodo de Teste' : 
                   clinica?.status === 'ativo' ? 'Ativo' : 
                   clinica?.status || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
            <CardDescription>Gerencie sua clinica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/dashboard/admin/usuarios"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Users className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Gerenciar Usuarios</span>
              </a>
              <a
                href="/dashboard/admin/relatorios"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Ver Relatorios</span>
              </a>
              <a
                href="/dashboard/admin/configuracoes"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <HardDrive className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Configuracoes</span>
              </a>
              <a
                href="/dashboard/admin/assinatura"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <FileText className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Assinatura</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
