'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEmailVerification } from '@/hooks/use-email-verification'
import {
  StepCreateAccount,
  StepVerifyEmail,
  StepChooseType,
  StepEmployeeForm,
  StepOwnerForm,
} from './components'
import { validateInviteCode, validateCNPJ, createClinicAction, joinClinicAction } from '@/app/actions/clinic-invite'
import type { SignupStep, CreateAccountData, EmployeeFormData, OwnerFormData, OAuthProvider } from '@/lib/types/signup'

export default function CadastroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Estado do wizard - SEMPRE começa em create-account
  const [step, setStep] = useState<SignupStep>('create-account')
  const [email, setEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Se vier do OAuth callback, carregar dados do usuário
  useEffect(() => {
    async function loadOAuthUser() {
      // Só executa se tiver parâmetro step=choose-type E oauth=true
      if (searchParams.get('step') === 'choose-type' && searchParams.get('oauth') === 'true') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email_confirmed_at) {
          setEmail(user.email || '')
          setUserName(user.user_metadata?.nome || user.user_metadata?.full_name || user.user_metadata?.name || '')
          setStep('choose-type')
        }
      }
    }
    loadOAuthUser()
  }, []) // Executa apenas uma vez no mount

  // Hook de verificação de email
  const { isVerified, resendEmail } = useEmailVerification({
    pollingInterval: 3000,
    onVerified: () => {
      // Avançar para próxima etapa quando verificado
      setStep('choose-type')
    },
  })

  // ============================================
  // Handlers para cada etapa
  // ============================================

  // Etapa 1: Criar conta com email/senha
  const handleCreateAccount = useCallback(async (data: CreateAccountData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nome: data.nome,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado. Faça login.')
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta')
      }

      setEmail(data.email)
      setUserName(data.nome)

      // Verificar se precisa confirmar email
      if (!authData.user.email_confirmed_at) {
        setStep('verify-email')
      } else {
        setStep('choose-type')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  // Etapa 1 alt: Login com OAuth (Google)
  const handleOAuthSignIn = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/cadastro/completar`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (oauthError) {
        throw oauthError
      }
      // Redireciona automaticamente
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar com provedor'
      setError(message)
      setIsLoading(false)
    }
  }, [supabase.auth])

  // Etapa 2: Reenviar email de verificação
  const handleResendEmail = useCallback(async () => {
    try {
      await resendEmail()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reenviar email'
      setError(message)
    }
  }, [resendEmail])

  // Etapa 2: Email verificado, avançar
  const handleEmailVerified = useCallback(() => {
    setStep('choose-type')
  }, [])

  // Etapa 3: Escolher tipo (funcionário ou proprietário)
  const handleChooseType = useCallback((type: 'employee' | 'owner') => {
    if (type === 'employee') {
      setStep('employee-form')
    } else {
      setStep('owner-form')
    }
  }, [])

  // Voltar para escolha de tipo
  const handleBackToChooseType = useCallback(() => {
    setError(null)
    setStep('choose-type')
  }, [])

  // Etapa 4a: Funcionário - Validar código
  const handleValidateCode = useCallback(async (code: string) => {
    return await validateInviteCode(code)
  }, [])

  // Etapa 4a: Funcionário - Usar código e entrar
  const handleEmployeeSubmit = useCallback(async (data: EmployeeFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await joinClinicAction({
        codigoConvite: data.codigoConvite,
        telefone: data.telefone,
      })

      if (!result.success) {
        throw new Error(result.error || 'Erro ao entrar na clínica')
      }

      // Sucesso - redirecionar para dashboard
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao entrar na clínica'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Etapa 4b: Proprietário - Validar CNPJ
  const handleValidateCNPJ = useCallback(async (cnpj: string) => {
    return await validateCNPJ(cnpj)
  }, [])

  // Etapa 4b: Proprietário - Criar clínica
  const handleOwnerSubmit = useCallback(async (data: OwnerFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createClinicAction({
        nomeClinica: data.nomeClinica,
        cnpj: data.cnpj,
        telefone: data.telefone,
        planoId: data.planoId,
      })

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar clínica')
      }

      // Sucesso - redirecionar para dashboard
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar clínica'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // ============================================
  // Renderização
  // ============================================

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Etapa 1: Criar conta */}
      {step === 'create-account' && (
        <StepCreateAccount
          onSubmit={handleCreateAccount}
          onOAuthSignIn={handleOAuthSignIn}
          isLoading={isLoading}
          error={error}
        />
      )}

      {/* Etapa 2: Verificar email */}
      {step === 'verify-email' && (
        <StepVerifyEmail
          email={email}
          onVerified={handleEmailVerified}
          onResendEmail={handleResendEmail}
          isVerified={isVerified}
          isLoading={isLoading}
        />
      )}

      {/* Etapa 3: Escolher tipo */}
      {step === 'choose-type' && (
        <StepChooseType
          onChoose={handleChooseType}
          isLoading={isLoading}
          userName={userName}
        />
      )}

      {/* Etapa 4a: Formulário funcionário */}
      {step === 'employee-form' && (
        <StepEmployeeForm
          onSubmit={handleEmployeeSubmit}
          onBack={handleBackToChooseType}
          onValidateCode={handleValidateCode}
          isLoading={isLoading}
          error={error}
        />
      )}

      {/* Etapa 4b: Formulário proprietário */}
      {step === 'owner-form' && (
        <StepOwnerForm
          onSubmit={handleOwnerSubmit}
          onBack={handleBackToChooseType}
          onValidateCNPJ={handleValidateCNPJ}
          isLoading={isLoading}
          error={error}
        />
      )}

      {/* Link para login */}
      {step === 'create-account' && (
        <p className="mt-6 text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      )}
    </div>
  )
}
