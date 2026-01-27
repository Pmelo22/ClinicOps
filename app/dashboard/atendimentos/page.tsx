import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Atendimentos - ClinicOps',
}

export default async function AtendimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
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

  let query = supabase
    .from('atendimentos')
    .select('*, paciente:pacientes(nome), usuario:usuarios(nome)')
    .eq('clinica_id', usuario.clinica_id)
    .order('data_atendimento', { ascending: false })

  if (params.q) {
    // For search, we need a different approach since we're searching related tables
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('clinica_id', usuario.clinica_id)
      .ilike('nome', `%${params.q}%`)

    if (pacientes && pacientes.length > 0) {
      const pacienteIds = pacientes.map(p => p.id)
      query = query.in('paciente_id', pacienteIds)
    }
  }

  const { data: atendimentos } = await query

  function getStatusBadge(status: string) {
    switch (status) {
      case 'agendado':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Agendado</Badge>
      case 'em_andamento':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Em Andamento</Badge>
      case 'concluido':
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Concluido</Badge>
      case 'cancelado':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div>
      <DashboardHeader title="Atendimentos" userName={usuario.nome} />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <form className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Buscar por paciente..."
              className="pl-9"
              defaultValue={params.q}
            />
          </form>
          <Button asChild>
            <Link href="/dashboard/atendimentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Atendimento
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {atendimentos && atendimentos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paciente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Procedimento</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Profissional</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atendimentos.map((atendimento) => (
                      <tr key={atendimento.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground">
                          {new Date(atendimento.data_atendimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/pacientes/${atendimento.paciente_id}`} className="font-medium text-foreground hover:text-primary">
                            {atendimento.paciente?.nome || 'N/A'}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{atendimento.tipo_procedimento}</td>
                        <td className="py-3 px-4 text-muted-foreground">{atendimento.usuario?.nome || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(atendimento.status)}
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
                                <Link href={`/dashboard/atendimentos/${atendimento.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/atendimentos/${atendimento.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
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
                <p className="text-muted-foreground mb-4">Nenhum atendimento registrado ainda.</p>
                <Button asChild>
                  <Link href="/dashboard/atendimentos/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Primeiro Atendimento
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
