'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartPulse, Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { forgotPassword } from '@/app/actions/auth'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setEmail(formData.get('email') as string)

    const result = await forgotPassword(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md relative">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <HeartPulse className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">ClinicOps</span>
          </Link>

          <Card className="glass-card border-0 shadow-xl text-center">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Email enviado!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Verifique sua caixa de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="p-4 rounded-xl bg-muted/50 mb-6">
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de recuperacao para <strong className="text-foreground">{email}</strong>. 
                  Verifique tambem sua pasta de spam.
                </p>
              </div>
              <Button asChild className="w-full h-12 rounded-xl">
                <Link href="/auth/login">Voltar ao Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <HeartPulse className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </Link>

        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sem problemas! Digite seu email e enviaremos um link para redefinir sua senha.
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
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl shadow-lg shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Recuperacao'
                )}
              </Button>
            </form>
            
            <Button variant="ghost" asChild className="w-full mt-4 rounded-xl">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
