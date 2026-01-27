import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Master Dashboard - ClinicOps',
}

export default async function MasterDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!usuario || usuario.perfil !== 'master') {
    redirect('/dashboard')
  }

  // Get platform stats
  const [
    { count: totalClinicas },
    { count: clinicasAtivas },
    { count: clinicasTrial },
    { count: totalUsuarios },
    { data: clinicasRecentes },
  ] = await Promise.all([
    supabase.from('clinicas').select('*', { count: 'exact', head: true }),
    supabase.from('clinicas').select('*', { count: 'exact', head: true }).eq('status_assinatura', 'ativo'),
    supabase.from('clinicas').select('*', { count: 'exact', head: true }).eq('status_assinatura', 'trial'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('clinicas')
      .select('*, plano:planos(nome)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate MRR (Monthly Recurring Revenue)
  const { data: clinicasComPlano } = await supabase
    .from('clinicas')
    .select('plano:planos(preco_mensal)')
    .eq('status_assinatura', 'ativo')

  const mrr = clinicasComPlano?.reduce((sum, c) => sum + (c.plano?.preco_mensal || 0), 0) || 0

  return (
    <div>
      <DashboardHeader title="Painel Master" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Clinicas"
            value={totalClinicas || 0}
            icon={Building2}
            description={`${clinicasAtivas || 0} ativas`}
          />
          <StatsCard
            title="Clinicas em Trial"
            value={clinicasTrial || 0}
            icon={AlertCircle}
            description="Aguardando conversao"
          />
          <StatsCard
            title="Total de Usuarios"
            value={totalUsuarios || 0}
            icon={Users}
            description="Na plataforma"
          />
          <StatsCard
            title="MRR"
            value={`R$ ${mrr.toLocaleString('pt-BR')}`}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            description="Receita mensal recorrente"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Clinicas Recentes</CardTitle>
              <CardDescription>Ultimos cadastros na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {clinicasRecentes && clinicasRecentes.length > 0 ? (
                <div className="space-y-4">
                  {clinicasRecentes.map((clinica) => (
                    <div key={clinica.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <Link href={`/dashboard/master/clinicas/${clinica.id}`} className="font-medium text-foreground hover:text-primary">
                          {clinica.nome}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {clinica.plano?.nome || 'Sem plano'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          clinica.status_assinatura === 'ativo' 
                            ? 'bg-accent/10 text-accent' 
                            : clinica.status_assinatura === 'trial'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {clinica.status_assinatura === 'trial' ? 'Trial' : 
                           clinica.status_assinatura === 'ativo' ? 'Ativo' : 
                           clinica.status_assinatura}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(clinica.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma clinica cadastrada ainda.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acoes Rapidas</CardTitle>
              <CardDescription>Gerencie a plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/dashboard/master/clinicas"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Building2 className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Ver Clinicas</span>
                </Link>
                <Link
                  href="/dashboard/master/planos"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <CreditCard className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Gerenciar Planos</span>
                </Link>
                <Link
                  href="/dashboard/master/auditoria"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <AlertCircle className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Auditoria</span>
                </Link>
                <Link
                  href="/dashboard/master/metricas"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium text-foreground">Metricas</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
