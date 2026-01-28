'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HeartPulse, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Building2 } from 'lucide-react'
import { joinClinicByCode } from '@/app/actions/auth'

export default function EntrarClinicaPage() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleCodeChange(index: number, value: string) {
    const newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    
    if (newValue.length <= 1) {
      const newCode = [...code]
      newCode[index] = newValue
      setCode(newCode)
      setError(null)

      // Move to next input
      if (newValue && index < 7) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    const newCode = [...code]
    for (let i = 0; i < pastedText.length; i++) {
      newCode[i] = pastedText[i]
    }
    setCode(newCode)
    
    // Focus the last filled input or the next empty one
    const nextEmptyIndex = Math.min(pastedText.length, 7)
    inputRefs.current[nextEmptyIndex]?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const fullCode = code.join('')
    if (fullCode.length !== 8) {
      setError('Digite o codigo completo de 8 caracteres')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('codigo', fullCode)

    const result = await joinClinicByCode(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  const isCodeComplete = code.every(c => c !== '')

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

        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Entrar em uma clinica
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Digite o codigo de convite de 8 caracteres fornecido pelo administrador da clinica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Code input */}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((char, index) => (
                  <div key={index} className="relative">
                    <Input
                      ref={el => { inputRefs.current[index] = el }}
                      type="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 text-center text-lg font-mono font-semibold rounded-xl bg-background/50 uppercase"
                      disabled={isLoading}
                    />
                    {index === 3 && (
                      <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">-</span>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                O codigo e composto por letras e numeros, sem espacos
              </p>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl shadow-lg shadow-primary/25"
                disabled={isLoading || !isCodeComplete}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando codigo...
                  </>
                ) : (
                  <>
                    Entrar na clinica
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Info box */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <h4 className="font-medium text-foreground mb-2 text-sm">Como obter um codigo?</h4>
              <p className="text-sm text-muted-foreground">
                O codigo de convite e gerado pelo administrador da clinica. 
                Se voce nao tem um codigo, entre em contato com o responsavel pela clinica.
              </p>
            </div>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Prefere criar sua propria clinica?{' '}
                <Link href="/onboarding/criar-clinica" className="text-primary hover:underline font-medium">
                  Criar clinica
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
