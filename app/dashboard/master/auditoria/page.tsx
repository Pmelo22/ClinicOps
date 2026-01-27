import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Auditoria - ClinicOps',
}

export default async function MasterAuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; acao?: string }>
}) {
  const params = await searchParams
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

  let query = supabase
    .from('auditoria')
    .select('*, usuario:usuarios(nome, email), clinica:clinicas(nome)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.acao) {
    query = query.eq('acao', params.acao)
  }

  const { data: logs } = await query

  function getActionBadge(acao: string) {
    switch (acao) {
      case 'INSERT':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Criacao</Badge>
      case 'UPDATE':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Atualizacao</Badge>
      case 'DELETE':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Exclusao</Badge>
      case 'LOGIN':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Login</Badge>
      case 'LOGOUT':
        return <Badge variant="secondary">Logout</Badge>
      default:
        return <Badge variant="outline">{acao}</Badge>
    }
  }

  return (
    <div>
      <DashboardHeader title="Auditoria" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Buscar por usuario ou acao..."
              className="pl-9"
              defaultValue={params.q}
            />
          </form>
          <div className="flex gap-2">
            <Button variant={!params.acao ? 'default' : 'outline'} size="sm" asChild>
              <a href="/dashboard/master/auditoria">Todas</a>
            </Button>
            <Button variant={params.acao === 'INSERT' ? 'default' : 'outline'} size="sm" asChild>
              <a href="/dashboard/master/auditoria?acao=INSERT">Criacoes</a>
            </Button>
            <Button variant={params.acao === 'UPDATE' ? 'default' : 'outline'} size="sm" asChild>
              <a href="/dashboard/master/auditoria?acao=UPDATE">Atualizacoes</a>
            </Button>
            <Button variant={params.acao === 'DELETE' ? 'default' : 'outline'} size="sm" asChild>
              <a href="/dashboard/master/auditoria?acao=DELETE">Exclusoes</a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logs de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clinica</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acao</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tabela</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground">
                          <div>
                            <span>{new Date(log.created_at).toLocaleDateString('pt-BR')}</span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-foreground">{log.usuario?.nome || 'Sistema'}</span>
                            {log.usuario?.email && (
                              <p className="text-xs text-muted-foreground">{log.usuario.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {log.clinica?.nome || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {getActionBadge(log.acao)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {log.tabela_afetada || '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {log.ip_address || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum log de auditoria encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
