'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NovoPacientePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    observacoes: '',
  })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function formatCPF(value: string) {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14)
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
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Voce precisa estar logado.')
      setIsLoading(false)
      return
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('clinica_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuario?.clinica_id) {
      setError('Clinica nao encontrada.')
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('pacientes')
      .insert({
        clinica_id: usuario.clinica_id,
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        data_nascimento: formData.data_nascimento,
        email: formData.email || null,
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : null,
        endereco: formData.endereco || null,
        observacoes: formData.observacoes || null,
        ativo: true,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Ja existe um paciente com este CPF.')
      } else {
        setError(insertError.message)
      }
      setIsLoading(false)
      return
    }

    router.push('/dashboard/pacientes')
    router.refresh()
  }

  return (
    <div>
      <DashboardHeader title="Novo Paciente" userName="" />
      
      <div className="p-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/pacientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Cadastrar Paciente</CardTitle>
            <CardDescription>
              Preencha os dados do paciente para cadastra-lo no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do paciente"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleChange('data_nascimento', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', formatPhone(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="endereco">Endereco</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, numero, bairro, cidade"
                    value={formData.endereco}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="observacoes">Observacoes</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informacoes adicionais sobre o paciente"
                    value={formData.observacoes}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Cadastrar Paciente'
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
