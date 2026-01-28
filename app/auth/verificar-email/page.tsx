'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, RefreshCw, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resendVerificationEmail } from '@/app/actions/auth'

export default function VerificarEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // Get user email
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // Email was confirmed, redirect to onboarding
        router.push('/onboarding')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function handleResend() {
    if (!email) return
    
    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    const result = await resendVerificationEmail(email)

    if (result.error) {
      setResendError(result.error)
    } else {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    }
    
    setIsResending(false)
  }

  async function handleCheckVerification() {
    setIsChecking(true)
    
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!error && user?.email_confirmed_at) {
      // Update onboarding status
      await supabase.auth.updateUser({
        data: { onboarding_status: 'pending_clinic' }
      })
      router.push('/onboarding')
    } else {
      setResendError('Email ainda nao foi verificado. Verifique sua caixa de entrada.')
      setTimeout(() => setResendError(null), 5000)
    }
    
    setIsChecking(false)
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo-new.svg" alt="ClinicOps" className="h-12" />
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-primary mt-2">Conta criada</span>
            </div>
            <div className="w-16 h-0.5 bg-primary mx-2 mt-[-20px]" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold animate-pulse">
                2
              </div>
              <span className="text-xs font-medium text-foreground mt-2">Verificar</span>
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
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Verifique seu email</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Enviamos um link de confirmacao para
            </CardDescription>
            {email && (
              <p className="text-foreground font-semibold mt-2 text-lg">{email}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info box */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Proximos passos:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-2 ml-6 list-decimal">
                <li>Abra seu email e procure a mensagem do ClinicOps</li>
                <li>Clique no link de confirmacao</li>
                <li>Voce sera redirecionado automaticamente para continuar o cadastro</li>
              </ol>
            </div>

            {/* Status messages */}
            {resendSuccess && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Email reenviado com sucesso! Verifique sua caixa de entrada.
              </div>
            )}

            {resendError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {resendError}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleCheckVerification}
                className="w-full h-12 rounded-xl shadow-lg shadow-primary/25"
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Ja verifiquei meu email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <Button 
                variant="outline"
                onClick={handleResend}
                disabled={isResending || !email}
                className="w-full h-12 rounded-xl bg-transparent"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar email de verificacao
                  </>
                )}
              </Button>
            </div>

            {/* Help text */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">
                Nao recebeu o email?
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Verifique sua pasta de spam ou lixo eletronico</li>
                <li>Confirme se o email digitado esta correto</li>
                <li>Aguarde alguns minutos e tente novamente</li>
              </ul>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Precisa de ajuda?{' '}
              <Link href="#" className="text-primary hover:underline font-medium">
                Entre em contato
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Email incorreto?{' '}
          <Link href="/auth/cadastro" className="text-primary hover:underline font-medium">
            Voltar e corrigir
          </Link>
        </p>
      </div>
    </div>
  )
}
