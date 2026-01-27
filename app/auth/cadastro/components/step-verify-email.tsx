'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Loader2, Mail, CheckCircle2, RefreshCw } from 'lucide-react'

interface StepVerifyEmailProps {
  email: string
  onVerified: () => void
  onResendEmail: () => Promise<void>
  isVerified: boolean
}

export function StepVerifyEmail({
  email,
  onVerified,
  onResendEmail,
  isVerified,
}: StepVerifyEmailProps) {
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  // Cooldown timer para reenvio
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [resendCooldown])

  // Quando verificado, avança automaticamente
  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(onVerified, 1500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isVerified, onVerified])

  async function handleResend() {
    if (resendCooldown > 0 || resending) return
    
    setResending(true)
    try {
      await onResendEmail()
      setResendCooldown(60) // 60 segundos de cooldown
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </div>
        
        {isVerified ? (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              Email verificado!
            </CardTitle>
            <CardDescription>
              Redirecionando para a próxima etapa...
            </CardDescription>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verifique seu email</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {!isVerified && (
          <>
            <div className="text-center">
              <p className="font-medium text-foreground break-all">{email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Aguardando confirmação...</span>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Instruções:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse sua caixa de entrada</li>
                  <li>Procure o email do ClinicOps</li>
                  <li>Clique no link de confirmação</li>
                  <li>Esta página atualizará automaticamente</li>
                </ol>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Não recebeu o email?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reenviar em {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reenviar email
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Verifique também sua pasta de spam ou lixo eletrônico
              </p>
            </div>
          </>
        )}

        {isVerified && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
