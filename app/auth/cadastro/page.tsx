'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartPulse, ArrowRight, Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { signup } from '@/app/actions/auth'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <HeartPulse className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-xs font-medium text-foreground mt-2">Criar conta</span>
            </div>
            <div className="w-16 h-0.5 bg-border mx-2 mt-[-20px]" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-xs text-muted-foreground mt-2">Verificar</span>
            </div>
            <div className="w-16 h-0.5 bg-border mx-2 mt-[-20px]" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-xs text-muted-foreground mt-2">Configurar</span>
            </div>
          </div>
        </div>

        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">Crie sua conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Primeiro, vamos criar sua conta pessoal. A configuracao da clinica vem depois.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Voce precisara confirmar este email antes de continuar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimo 6 caracteres"
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="h-12 rounded-xl pr-10 bg-background/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl shadow-lg shadow-primary/25 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Ou cadastre-se com</span>
                </div>
              </div>

              <OAuthButtons />
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3 font-medium">O que voce recebe:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  '14 dias gratis',
                  'Sem cartao',
                  'Cancele quando quiser',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ja tem uma conta?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, voce concorda com nossos{' '}
          <Link href="#" className="underline hover:text-foreground">
            Termos de Servico
          </Link>{' '}
          e{' '}
          <Link href="#" className="underline hover:text-foreground">
            Politica de Privacidade
          </Link>
        </p>
      </div>
    </div>
  )
}
