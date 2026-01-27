'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Activity, Loader2, Mail } from 'lucide-react'
import type { CreateAccountData, OAuthProvider } from '@/lib/types/signup'

// Google Icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

interface StepCreateAccountProps {
  onSubmit: (_data: CreateAccountData) => Promise<void>
  onOAuthSignIn: (_provider: OAuthProvider) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function StepCreateAccount({
  onSubmit,
  onOAuthSignIn,
  isLoading,
  error
}: StepCreateAccountProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [localError, setLocalError] = useState<string | null>(null)

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    setLocalError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)

    // Validações
    if (!formData.nome.trim()) {
      setLocalError('Nome é obrigatório')
      return
    }

    if (!formData.email.trim()) {
      setLocalError('Email é obrigatório')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('As senhas não conferem')
      return
    }

    await onSubmit({
      nome: formData.nome.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    })
  }

  const displayError = localError || error

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </div>
        <CardTitle className="text-2xl">Crie sua conta</CardTitle>
        <CardDescription>
          Primeiro, vamos criar suas credenciais de acesso
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => onOAuthSignIn('google')}
          disabled={isLoading}
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          Continuar com Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou com email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {displayError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nome">Seu nome completo</Label>
            <Input
              id="nome"
              placeholder="João da Silva"
              value={formData.nome}
              onChange={e => handleChange('nome', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              disabled={isLoading}
              required
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
                onChange={e => handleChange('password', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Criar conta com email
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Ao criar sua conta, você concorda com nossos{' '}
          <a href="/termos" className="text-primary hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
