import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = {
  title: 'Configuracoes - ClinicOps',
}

export default async function AdminConfiguracoesPage() {
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

  return (
    <div>
      <DashboardHeader title="Configuracoes" userName={usuario.nome} />
      
      <div className="p-6">
        <Tabs defaultValue="clinica" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clinica">Dados da Clinica</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificacoes</TabsTrigger>
            <TabsTrigger value="integracao">Integracoes</TabsTrigger>
          </TabsList>

          <TabsContent value="clinica">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Clinica</CardTitle>
                <CardDescription>
                  Informacoes cadastrais da clinica (edicao disponivel em breve)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome da Clinica</label>
                    <p className="text-lg font-medium">{usuario.clinicas?.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-lg font-medium capitalize">{usuario.clinicas?.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Notificacoes</CardTitle>
                <CardDescription>
                  Configure as notificacoes do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em breve: configuracoes de notificacoes por email e SMS.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracao">
            <Card>
              <CardHeader>
                <CardTitle>Integracoes</CardTitle>
                <CardDescription>
                  Configure integracoes com outros sistemas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em breve: integracoes com calendarios, sistemas de pagamento e mais.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
