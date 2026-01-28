import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Users, HardDrive, FileText, Check } from 'lucide-react'

export const metadata = {
  title: 'Gerenciar Planos - ClinicOps',
}

export default async function MasterPlanosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!usuario || usuario.perfil !== 'master') {
    redirect('/dashboard')
  }

  const { data: planos } = await supabase
    .from('planos')
    .select('*')
    .order('preco_mensal')

  // Get clinic counts per plan
  const planStats = await Promise.all(
    (planos || []).map(async (plano) => {
      const { count } = await supabase
        .from('clinicas')
        .select('*', { count: 'exact', head: true })
        .eq('plano_id', plano.id)
      return { planoId: plano.id, count: count || 0 }
    })
  )

  const statsMap = planStats.reduce((acc, stat) => {
    acc[stat.planoId] = stat.count
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <DashboardHeader title="Gerenciar Planos" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Configure os planos disponiveis na plataforma
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planos?.map((plano) => (
            <Card key={plano.id} className={!plano.ativo ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plano.nome}</CardTitle>
                  <Badge variant={plano.ativo ? 'default' : 'secondary'}>
                    {plano.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <CardDescription>{plano.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-3xl font-bold text-foreground">
                    R$ {plano.preco_mensal.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-muted-foreground">/mes</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {plano.limite_usuarios === 999 ? 'Usuarios ilimitados' : `Ate ${plano.limite_usuarios} usuarios`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {plano.limite_pacientes === 99999 ? 'Pacientes ilimitados' : `Ate ${plano.limite_pacientes.toLocaleString('pt-BR')} pacientes`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {(plano.limite_armazenamento_mb / 1024).toFixed(0)} GB de armazenamento
                    </span>
                  </div>
                </div>

                {plano.recursos && Object.entries(plano.recursos).length > 0 && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recursos</p>
                    {Object.entries(plano.recursos).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${value ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className={value ? 'text-foreground' : 'text-muted-foreground line-through'}>
                          {key.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {statsMap[plano.id] || 0} clinicas usando este plano
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Plano
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
