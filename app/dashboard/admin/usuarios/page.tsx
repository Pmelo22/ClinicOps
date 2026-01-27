import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const metadata = {
  title: 'Gerenciar Usuarios - ClinicOps',
}

export default async function AdminUsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*, clinica:clinicas(*, plano:planos(*))')
    .eq('auth_user_id', user.id)
    .single()

  if (!usuario || usuario.perfil !== 'admin_tenant') {
    redirect('/dashboard')
  }

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .eq('clinica_id', usuario.clinica_id)
    .order('nome')

  const limiteUsuarios = usuario.clinica?.plano?.limite_usuarios || 3
  const totalUsuarios = usuarios?.length || 0
  const podeAdicionar = totalUsuarios < limiteUsuarios

  function getRoleBadge(perfil: string) {
    switch (perfil) {
      case 'admin_tenant':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Administrador</Badge>
      case 'operacional':
        return <Badge variant="secondary">Operacional</Badge>
      default:
        return <Badge variant="outline">{perfil}</Badge>
    }
  }

  return (
    <div>
      <DashboardHeader title="Gerenciar Usuarios" userName={usuario.nome} />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <p className="text-muted-foreground">
              {totalUsuarios} de {limiteUsuarios} usuarios utilizados
            </p>
          </div>
          {podeAdicionar ? (
            <Button asChild>
              <Link href="/dashboard/admin/usuarios/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuario
              </Link>
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Limite de usuarios atingido.{' '}
              <Link href="/dashboard/admin/assinatura" className="text-primary hover:underline">
                Fazer upgrade
              </Link>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios da Clinica</CardTitle>
            <CardDescription>Gerencie o acesso dos usuarios ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {usuarios && usuarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Perfil</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ultimo Acesso</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-foreground">{u.nome}</td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4">{getRoleBadge(u.perfil)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={u.ativo ? 'default' : 'secondary'}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {u.ultimo_acesso
                            ? new Date(u.ultimo_acesso).toLocaleDateString('pt-BR')
                            : 'Nunca acessou'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.id !== usuario.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/admin/usuarios/${u.id}/editar`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {u.ativo ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Desativar
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Ativar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum usuario cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
