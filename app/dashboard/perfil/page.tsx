import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DashboardHeader } from '@/components/dashboard/header'
import { User } from 'lucide-react'

export const metadata = {
  title: 'Meu Perfil - ClinicOps',
}

export default async function ProfilePage() {
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

  if (!usuario) {
    redirect('/auth/login')
  }

  const initials = usuario.nome
    ? usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div>
      <DashboardHeader title="Meu Perfil" userName={usuario.nome || ''} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Foto do Perfil</CardTitle>
                <CardDescription>Sua foto de identificação</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium text-foreground">{usuario.nome || 'Usuário'}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {usuario.perfil?.replace('_', ' ') || 'Usuário'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Suas informações de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={usuario.nome || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={usuario.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Entre em contato com o suporte para alterar dados da conta
                  </p>
                </div>

                {usuario.clinicas && (
                  <div className="space-y-2">
                    <Label>Clínica</Label>
                    <Input
                      value={usuario.clinicas.nome || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button disabled>
                    <User className="mr-2 h-4 w-4" />
                    Editar Perfil (em breve)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Detalhes da sua conta no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <dt className="text-sm text-muted-foreground">Perfil</dt>
                    <dd className="text-lg font-medium text-foreground capitalize">
                      {usuario.perfil?.replace('_', ' ') || '-'}
                    </dd>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd className="text-lg font-medium text-foreground">Ativo</dd>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <dt className="text-sm text-muted-foreground">Membro desde</dt>
                    <dd className="text-lg font-medium text-foreground">
                      {usuario.created_at 
                        ? new Date(usuario.created_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </dd>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <dt className="text-sm text-muted-foreground">Clínica</dt>
                    <dd className="text-lg font-medium text-foreground">
                      {usuario.clinicas?.nome || '-'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
