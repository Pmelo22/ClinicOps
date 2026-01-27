'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Activity, Loader2, ArrowLeft, Users, CheckCircle2 } from 'lucide-react'
import type { EmployeeFormData, InviteValidationResult } from '@/lib/types/signup'

interface StepEmployeeFormProps {
  onSubmit: (_data: EmployeeFormData) => Promise<void>
  onBack: () => void
  onValidateCode: (_code: string) => Promise<InviteValidationResult>
  isLoading: boolean
  error: string | null
}

export function StepEmployeeForm({
  onSubmit,
  onBack,
  onValidateCode,
  isLoading,
  error
}: StepEmployeeFormProps) {
  const [codigo, setCodigo] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [validatedInvite, setValidatedInvite] = useState<InviteValidationResult | null>(null)

  // Formatar código: apenas letras maiúsculas e números
  function formatCode(value: string) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  }

  async function handleCodeChange(value: string) {
    const formatted = formatCode(value)
    setCodigo(formatted)
    setLocalError(null)
    setValidatedInvite(null)

    // Validar quando tiver 8 caracteres
    if (formatted.length === 8) {
      setValidating(true)
      try {
        const result = await onValidateCode(formatted)
        setValidatedInvite(result)
        if (!result.valid) {
          setLocalError(result.error || 'Código inválido')
        }
      } catch {
        setLocalError('Erro ao validar código')
      } finally {
        setValidating(false)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (codigo.length !== 8) {
      setLocalError('O código deve ter 8 caracteres')
      return
    }

    if (!validatedInvite?.valid) {
      setLocalError('Valide o código antes de continuar')
      return
    }

    await onSubmit({ codigoConvite: codigo })
  }

  const displayError = localError || error
  const isValid = validatedInvite?.valid === true
  const clinicName = validatedInvite?.invite?.clinica?.nome

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ClinicOps</span>
        </div>
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl">Entrar na clínica</CardTitle>
        <CardDescription>
          Digite o código de convite que você recebeu
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {displayError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {displayError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="codigo">Código de convite</Label>
            <div className="relative">
              <Input
                id="codigo"
                placeholder="XXXXXXXX"
                value={codigo}
                onChange={e => handleCodeChange(e.target.value)}
                disabled={isLoading}
                className={`text-center text-2xl tracking-widest font-mono uppercase ${
                  isValid ? 'border-green-500 focus-visible:ring-green-500' : ''
                }`}
                maxLength={8}
              />
              {validating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              O código tem 8 caracteres (letras e números)
            </p>
          </div>

          {isValid && clinicName && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <span className="font-medium">Clínica encontrada:</span>
              </p>
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                {clinicName}
              </p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Onde encontro o código?</p>
            <p>
              O código de convite é gerado pelo proprietário ou administrador da clínica.
              Se você não tem um código, entre em contato com a clínica onde você trabalha.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar na clínica'
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
