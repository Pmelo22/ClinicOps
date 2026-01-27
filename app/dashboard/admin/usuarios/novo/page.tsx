'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    perfil: 'operacional',
  })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Voce precisa estar logado.')
      setIsLoading(false)
      return
    }

    const { data: adminUser } = await supabase
      .from('usuarios')
      .select('clinica_id, perfil')
      .eq('auth_user_id', user.id)
      .single()

    if (!adminUser?.clinica_id || adminUser.perfil !== 'admin_tenant') {
      setError('Voce nao tem permissao para criar usuarios.')
      setIsLoading(false)
      return
    }

    // Create auth user for the new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          nome: formData.nome,
          perfil: formData.perfil,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    if (!authData.user) {
      setError('Erro ao criar usuario.')
      setIsLoading(false)
      return
    }

    // Create user profile
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: authData.user.id,
        clinica_id: adminUser.clinica_id,
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
        ativo: true,
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard/admin/usuarios')
    router.refresh()
  }

  return (
    <div>
      <DashboardHeader title="Novo Usuario" userName="" />

      <div className="p-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/admin/usuarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Cadastrar Usuario</CardTitle>
            <CardDescription>
              Adicione um novo usuario a sua clinica.
              O usuario recebera um email para confirmar a conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do usuario"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha Temporaria *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    O usuario podera alterar a senha apos o primeiro acesso.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perfil">Perfil *</Label>
                  <Select
                    value={formData.perfil}
                    onValueChange={(value) => handleChange('perfil', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="admin_tenant">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Operacional: acesso a pacientes e atendimentos.
                    Administrador: acesso completo a clinica.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Usuario'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
