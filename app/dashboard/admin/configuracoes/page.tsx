'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ClinicData {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
}

export default function AdminConfiguracoesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [clinica, setClinica] = useState<ClinicData | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*, clinica:clinicas(*)')
        .eq('auth_user_id', user.id)
        .single()

      if (!usuario || usuario.perfil !== 'admin_tenant') {
        router.push('/dashboard')
        return
      }

      setUserName(usuario.nome)
      if (usuario.clinica) {
        setClinica({
          id: usuario.clinica.id,
          nome: usuario.clinica.nome,
          cnpj: usuario.clinica.cnpj,
          email: usuario.clinica.email,
          telefone: usuario.clinica.telefone || '',
          endereco: usuario.clinica.endereco || '',
        })
      }
      setIsLoading(false)
    }

    loadData()
  }, [router])

  function handleChange(field: keyof ClinicData, value: string) {
    if (clinica) {
      setClinica({ ...clinica, [field]: value })
    }
  }

  function formatCNPJ(value: string) {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14)
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clinica) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('clinicas')
      .update({
        nome: clinica.nome,
        cnpj: clinica.cnpj.replace(/\D/g, ''),
        email: clinica.email,
        telefone: clinica.telefone ? clinica.telefone.replace(/\D/g, '') : null,
        endereco: clinica.endereco || null,
      })
      .eq('id', clinica.id)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
      return
    }

    setSuccess(true)
    setIsSaving(false)
    router.refresh()
  }

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="Configuracoes" userName="" />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title="Configuracoes" userName={userName} />
      
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
                  Atualize as informacoes cadastrais da sua clinica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 rounded-md bg-accent/10 text-accent text-sm">
                      Dados atualizados com sucesso!
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="nome">Nome da Clinica</Label>
                      <Input
                        id="nome"
                        value={clinica?.nome || ''}
                        onChange={(e) => handleChange('nome', e.target.value)}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={clinica?.cnpj ? formatCNPJ(clinica.cnpj) : ''}
                        onChange={(e) => handleChange('cnpj', e.target.value)}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clinica?.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={clinica?.telefone ? formatPhone(clinica.telefone) : ''}
                        onChange={(e) => handleChange('telefone', formatPhone(e.target.value))}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="endereco">Endereco</Label>
                      <Input
                        id="endereco"
                        value={clinica?.endereco || ''}
                        onChange={(e) => handleChange('endereco', e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alteracoes
                      </>
                    )}
                  </Button>
                </form>
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
