import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MoreHorizontal, Eye, Edit, Ban, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Gerenciar Clinicas - ClinicOps',
}

export default async function MasterClinicasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
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
    .from('clinicas')
    .select('*, plano:planos(nome, preco_mensal)')
    .order('created_at', { ascending: false })

  if (params.q) {
    query = query.or(`nome.ilike.%${params.q}%,cnpj.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  }

  if (params.status) {
    query = query.eq('status_assinatura', params.status)
  }

  const { data: clinicas } = await query

  function getStatusBadge(status: string) {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Ativo</Badge>
      case 'trial':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Trial</Badge>
      case 'inativo':
        return <Badge className="bg-muted text-muted-foreground">Inativo</Badge>
      case 'cancelado':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div>
      <DashboardHeader title="Gerenciar Clinicas" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Buscar clinicas..."
              className="pl-9"
              defaultValue={params.q}
            />
          </form>
          <div className="flex gap-2">
            <Button variant={!params.status ? 'default' : 'outline'} size="sm" asChild>
              <Link href="/dashboard/master/clinicas">Todas</Link>
            </Button>
            <Button variant={params.status === 'ativo' ? 'default' : 'outline'} size="sm" asChild>
              <Link href="/dashboard/master/clinicas?status=ativo">Ativas</Link>
            </Button>
            <Button variant={params.status === 'trial' ? 'default' : 'outline'} size="sm" asChild>
              <Link href="/dashboard/master/clinicas?status=trial">Trial</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clinicas ({clinicas?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {clinicas && clinicas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clinica</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CNPJ</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cadastro</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinicas.map((clinica) => (
                      <tr key={clinica.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <Link href={`/dashboard/master/clinicas/${clinica.id}`} className="font-medium text-foreground hover:text-primary">
                              {clinica.nome}
                            </Link>
                            <p className="text-sm text-muted-foreground">{clinica.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {clinica.cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-foreground">{clinica.plano?.nome || 'N/A'}</span>
                            {clinica.plano?.preco_mensal && (
                              <p className="text-xs text-muted-foreground">
                                R$ {clinica.plano.preco_mensal.toLocaleString('pt-BR')}/mes
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(clinica.status_assinatura)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(clinica.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/master/clinicas/${clinica.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/master/clinicas/${clinica.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              {clinica.status_assinatura === 'ativo' ? (
                                <DropdownMenuItem className="text-destructive">
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspender
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-accent">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Ativar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma clinica encontrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
