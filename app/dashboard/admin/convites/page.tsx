'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Copy, Check, Loader2, Trash2, Users, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode } from '@/app/actions/auth'

interface InviteCode {
  id: string
  codigo: string
  perfil_atribuido: string
  usos_maximos: number
  usos_atuais: number
  expira_em: string
  ativo: boolean
  created_at: string
}

export default function AdminConvitesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [convites, setConvites] = useState<InviteCode[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [newCode, setNewCode] = useState({
    perfil: 'operador',
    usos_maximos: '10',
    dias_validade: '7',
  })

  useEffect(() => {
    loadData()
  }, [])

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
      .select('nome, clinica_id, perfil')
      .eq('id', user.id)
      .single()

    if (!usuario || usuario.perfil !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUserName(usuario.nome)

    const { data: codes } = await supabase
      .from('codigos_convite')
      .select('*')
      .eq('clinica_id', usuario.clinica_id)
      .order('created_at', { ascending: false })

    setConvites(codes || [])
    setIsLoading(false)
  }

  async function handleCreateCode(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.set('perfil', newCode.perfil)
    formData.set('usos_maximos', newCode.usos_maximos)
    formData.set('dias_validade', newCode.dias_validade)

    const result = await generateInviteCode(formData)

    if (result.error) {
      setError(result.error)
      setIsCreating(false)
      return
    }

    if (result.codigo) {
      setSuccess(`Codigo ${result.codigo} criado com sucesso!`)
      loadData()
    }
    
    setIsCreating(false)
  }

  async function handleDeactivateCode(id: string) {
    const supabase = createClient()
    await supabase
      .from('codigos_convite')
      .update({ ativo: false })
      .eq('id', id)
    
    loadData()
  }

  function copyToClipboard(codigo: string, id: string) {
    navigator.clipboard.writeText(codigo)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function isExpired(expiraEm: string) {
    return new Date(expiraEm) < new Date()
  }

  function getPerfilLabel(perfil: string) {
    return perfil === 'admin' ? 'Administrador' : 'Operador'
  }

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="Codigos de Convite" userName="" />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title="Codigos de Convite" userName={userName} />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create new code */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Gerar Codigo
              </CardTitle>
              <CardDescription>
                Crie um codigo para convidar novos usuarios para sua clinica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCode} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-md bg-accent/10 text-accent text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="perfil">Perfil do Usuario</Label>
                  <Select
                    value={newCode.perfil}
                    onValueChange={(value) => setNewCode({ ...newCode, perfil: value })}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Operador: acesso a pacientes e atendimentos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usos_maximos">Quantidade de Usos</Label>
                  <Input
                    id="usos_maximos"
                    type="number"
                    min="1"
                    max="100"
                    value={newCode.usos_maximos}
                    onChange={(e) => setNewCode({ ...newCode, usos_maximos: e.target.value })}
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dias_validade">Validade (dias)</Label>
                  <Input
                    id="dias_validade"
                    type="number"
                    min="1"
                    max="30"
                    value={newCode.dias_validade}
                    onChange={(e) => setNewCode({ ...newCode, dias_validade: e.target.value })}
                    disabled={isCreating}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Gerar Codigo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing codes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Codigos Ativos
              </CardTitle>
              <CardDescription>
                Compartilhe estes codigos com usuarios que deseja convidar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {convites.length > 0 ? (
                <div className="space-y-4">
                  {convites.map((convite) => {
                    const expired = isExpired(convite.expira_em)
                    const exhausted = convite.usos_atuais >= convite.usos_maximos
                    const inactive = !convite.ativo || expired || exhausted
                    
                    return (
                      <div 
                        key={convite.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          inactive ? 'bg-muted/50 border-border' : 'bg-background border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <code className={`font-mono font-bold ${inactive ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {convite.codigo}
                              </code>
                              <Badge variant={convite.perfil_atribuido === 'admin' ? 'default' : 'secondary'}>
                                {getPerfilLabel(convite.perfil_atribuido)}
                              </Badge>
                              {expired && (
                                <Badge variant="destructive">Expirado</Badge>
                              )}
                              {exhausted && !expired && (
                                <Badge variant="secondary">Esgotado</Badge>
                              )}
                              {!convite.ativo && !expired && !exhausted && (
                                <Badge variant="secondary">Desativado</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {convite.usos_atuais}/{convite.usos_maximos} usos | 
                              Expira em {new Date(convite.expira_em).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!inactive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(convite.codigo, convite.id)}
                              className="bg-transparent"
                            >
                              {copiedId === convite.id ? (
                                <>
                                  <Check className="mr-2 h-4 w-4 text-accent" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copiar
                                </>
                              )}
                            </Button>
                          )}
                          {convite.ativo && !expired && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeactivateCode(convite.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum codigo de convite criado ainda.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crie um codigo ao lado para convidar usuarios para sua clinica.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Gere o codigo</p>
                  <p className="text-sm text-muted-foreground">
                    Escolha o perfil e quantidade de usos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Compartilhe</p>
                  <p className="text-sm text-muted-foreground">
                    Envie o codigo para o usuario convidado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Usuario entra</p>
                  <p className="text-sm text-muted-foreground">
                    Ele cria a conta e usa o codigo para entrar na clinica
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
