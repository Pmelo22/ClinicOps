'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UseEmailVerificationOptions {
  /** Intervalo de polling em ms (default: 3000) */
  pollingInterval?: number
  /** Callback quando email for verificado */
  onVerified?: (_user: User) => void
}

interface UseEmailVerificationReturn {
  /** Se o email está verificado */
  isVerified: boolean
  /** Usuário atual */
  user: User | null
  /** Se está verificando */
  isChecking: boolean
  /** Erro, se houver */
  error: string | null
  /** Reenviar email de confirmação */
  resendEmail: () => Promise<void>
  /** Verificar manualmente */
  checkVerification: () => Promise<boolean>
}

/**
 * Hook para monitorar a verificação de email do usuário
 * Usa polling + onAuthStateChange para detectar confirmação
 */
export function useEmailVerification(
  options: UseEmailVerificationOptions = {}
): UseEmailVerificationReturn {
  const { pollingInterval = 3000, onVerified } = options

  const [user, setUser] = useState<User | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Verificar se email está confirmado
  const checkVerification = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Erro ao verificar usuário:', userError)
        return false
      }

      if (!currentUser) {
        return false
      }

      setUser(currentUser)

      // Verificar se email_confirmed_at está preenchido
      const verified = !!currentUser.email_confirmed_at

      if (verified && !isVerified) {
        setIsVerified(true)
        onVerified?.(currentUser)
      }

      return verified
    } catch (err) {
      console.error('Erro no checkVerification:', err)
      return false
    }
  }, [supabase.auth, isVerified, onVerified])

  // Reenviar email de confirmação
  const resendEmail = useCallback(async () => {
    setError(null)

    if (!user?.email) {
      setError('Email não encontrado')
      return
    }

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (resendError) {
        throw resendError
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reenviar email'
      setError(message)
      throw err
    }
  }, [supabase.auth, user?.email])

  // Setup inicial e listeners
  useEffect(() => {
    let mounted = true
    let pollingTimer: NodeJS.Timeout | null = null

    // Verificação inicial
    async function initialize() {
      setIsChecking(true)
      const verified = await checkVerification()
      
      if (mounted) {
        setIsChecking(false)

        // Se não verificado, iniciar polling
        if (!verified) {
          pollingTimer = setInterval(async () => {
            if (mounted) {
              await checkVerification()
            }
          }, pollingInterval)
        }
      }
    }

    initialize()

    // Listener para mudanças de auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            setUser(session.user)

            const verified = !!session.user.email_confirmed_at
            if (verified && !isVerified) {
              setIsVerified(true)
              onVerified?.(session.user)

              // Parar polling se verificado
              if (pollingTimer) {
                clearInterval(pollingTimer)
                pollingTimer = null
              }
            }
          }
        }
      }
    )

    // Cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
      if (pollingTimer) {
        clearInterval(pollingTimer)
      }
    }
  }, [checkVerification, pollingInterval, supabase.auth, isVerified, onVerified])

  return {
    isVerified,
    user,
    isChecking,
    error,
    resendEmail,
    checkVerification,
  }
}
