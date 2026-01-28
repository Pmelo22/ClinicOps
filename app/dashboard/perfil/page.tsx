'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Save, User } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          
          const { data: profileData } = await supabase
            .from('usuarios')
            .select('*, clinicas(*)')
            .eq('auth_id', user.id)
            .single()
          
          if (profileData) {
            setProfile(profileData)
            setFormData({
              nome: profileData.nome || '',
              email: profileData.email || user.email || '',
            })
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: formData.nome,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', user.id)
      
      if (error) throw error
      
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const initials = formData.nome
    ? formData.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informacoes pessoais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto do Perfil</CardTitle>
            <CardDescription>Sua foto de identificacao</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium text-foreground">{formData.nome || 'Usuario'}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.perfil?.replace('_', ' ') || 'Usuario'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informacoes Pessoais</CardTitle>
            <CardDescription>Atualize suas informacoes de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email nao pode ser alterado
                </p>
              </div>

              {profile?.clinicas && (
                <div className="space-y-2">
                  <Label>Clinica</Label>
                  <Input
                    value={profile.clinicas.nome}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
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
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informacoes da Conta</CardTitle>
            <CardDescription>Detalhes da sua conta no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Perfil</dt>
                <dd className="text-lg font-medium text-foreground capitalize">
                  {profile?.perfil?.replace('_', ' ') || '-'}
                </dd>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="text-lg font-medium text-foreground">
                  {profile?.ativo ? 'Ativo' : 'Inativo'}
                </dd>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Membro desde</dt>
                <dd className="text-lg font-medium text-foreground">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                    : '-'}
                </dd>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <dt className="text-sm text-muted-foreground">Ultimo acesso</dt>
                <dd className="text-lg font-medium text-foreground">
                  {profile?.ultimo_acesso 
                    ? new Date(profile.ultimo_acesso).toLocaleDateString('pt-BR')
                    : '-'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
