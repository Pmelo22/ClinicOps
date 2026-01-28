'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Patient {
  id: string
  nome: string
}

export default function NovoAtendimentoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pacientes, setPacientes] = useState<Patient[]>([])

  const [formData, setFormData] = useState({
    paciente_id: '',
    data_atendimento: new Date().toISOString().split('T')[0],
    tipo_procedimento: '',
    descricao: '',
    valor: '',
    status: 'agendado',
  })

  useEffect(() => {
    async function loadPacientes() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('clinica_id')
          .eq('id', user.id)
          .single()

        if (usuario?.clinica_id) {
          const { data } = await supabase
            .from('pacientes')
            .select('id, nome')
            .eq('clinica_id', usuario.clinica_id)
            .eq('ativo', true)
            .order('nome')

          setPacientes(data || [])
        }
      }
    }

    loadPacientes()
  }, [])

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

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, clinica_id')
      .eq('id', user.id)
      .single()

    if (!usuario?.clinica_id) {
      setError('Clinica nao encontrada.')
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('atendimentos')
      .insert({
        clinica_id: usuario.clinica_id,
        paciente_id: formData.paciente_id,
        usuario_id: usuario.id,
        data_atendimento: formData.data_atendimento,
        tipo_procedimento: formData.tipo_procedimento,
        descricao: formData.descricao || null,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        status: formData.status,
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard/atendimentos')
    router.refresh()
  }

  return (
    <div>
      <DashboardHeader title="Novo Atendimento" userName="" />
      
      <div className="p-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/atendimentos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Registrar Atendimento</CardTitle>
            <CardDescription>
              Preencha os dados do atendimento.
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
                  <Label htmlFor="paciente_id">Paciente *</Label>
                  <Select
                    value={formData.paciente_id}
                    onValueChange={(value) => handleChange('paciente_id', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes.map((paciente) => (
                        <SelectItem key={paciente.id} value={paciente.id}>
                          {paciente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pacientes.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum paciente cadastrado.{' '}
                      <Link href="/dashboard/pacientes/novo" className="text-primary hover:underline">
                        Cadastre um paciente primeiro.
                      </Link>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_atendimento">Data *</Label>
                  <Input
                    id="data_atendimento"
                    type="date"
                    value={formData.data_atendimento}
                    onChange={(e) => handleChange('data_atendimento', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tipo_procedimento">Tipo de Procedimento *</Label>
                  <Input
                    id="tipo_procedimento"
                    placeholder="Ex: Consulta, Exame, Procedimento"
                    value={formData.tipo_procedimento}
                    onChange={(e) => handleChange('tipo_procedimento', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => handleChange('valor', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="descricao">Descricao</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Detalhes do atendimento"
                    value={formData.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || !formData.paciente_id}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Registrar Atendimento'
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
