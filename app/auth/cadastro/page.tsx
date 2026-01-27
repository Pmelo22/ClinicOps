'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS } from '@/lib/products'

export default function CadastroPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planoParam = searchParams.get('plano') || 'profissional'

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomeClinica: '',
    cnpj: '',
    planoId: planoParam,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas nao conferem.')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    // Check for existing user
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (existingUser) {
      setError('Este email ja esta cadastrado.')
      setIsLoading(false)
      return
    }

    // Get the plan
    const planoNome = formData.planoId.charAt(0).toUpperCase() + formData.planoId.slice(1)
    const { data: plano } = await supabase
      .from('planos')
      .select('id')
      .eq('nome', planoNome)
      .single()

    if (!plano) {
      setError('Plano nao encontrado.')
      setIsLoading(false)
      return
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: {
          nome: formData.nome,
          perfil: 'admin_tenant',
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

    // Create clinic
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .insert({
        nome: formData.nomeClinica,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        email: formData.email,
        plano_id: plano.id,
        status_assinatura: 'trial',
        data_fim_trial: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (clinicaError) {
      setError('Erro ao criar clinica: ' + clinicaError.message)
      setIsLoading(false)
      return
    }

    // Create user profile
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: authData.user.id,
        clinica_id: clinica.id,
        nome: formData.nome,
        email: formData.email,
        perfil: 'admin_tenant',
        ativo: true,
      })

    if (usuarioError) {
      setError('Erro ao criar perfil: ' + usuarioError.message)
      setIsLoading(false)
      return
    }

    // Initialize resource usage
    await supabase
      .from('uso_recursos')
      .insert({
        clinica_id: clinica.id,
        mes_referencia: new Date().toISOString().slice(0, 7) + '-01',
        total_usuarios: 1,
        total_pacientes: 0,
        armazenamento_usado_mb: 0,
        total_atendimentos: 0,
      })

    router.push('/auth/cadastro-sucesso')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ClinicOps</span>
          </div>
          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
          <CardDescription>
            Comece seu teste gratuito de 14 dias
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="nome">Seu nome completo</Label>
              <Input
                id="nome"
                placeholder="Joao da Silva"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-medium text-foreground mb-4">Dados da Clinica</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeClinica">Nome da Clinica</Label>
              <Input
                id="nomeClinica"
                placeholder="Clinica Exemplo LTDA"
                value={formData.nomeClinica}
                onChange={(e) => handleChange('nomeClinica', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plano">Plano</Label>
              <Select 
                value={formData.planoId} 
                onValueChange={(value) => handleChange('planoId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {(product.priceInCents / 100).toFixed(0)}/mes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta e Comecar'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Ja tem uma conta?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
