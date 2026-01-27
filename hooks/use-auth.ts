'use client'

/**
 * Hook para autenticação
 * Gerencia login, logout, signup e estado de autenticação
 */
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  // Inicializar autenticação
  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setState({
          user,
          loading: false,
          error: null,
        })
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao buscar usuário',
        })
      }
    }

    getUser()

    // Subscrever a mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }))
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao fazer login'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }))
        throw error
      }
    },
    [supabase, router],
  )

  const signUp = useCallback(
    async (email: string, password: string, data?: Record<string, any>) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data,
          },
        })

        if (error) {
          throw error
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao registrar'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }))
        throw error
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await supabase.auth.signOut()
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao sair'
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }))
      throw error
    }
  }, [supabase, router])

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
          throw error
        }

        setState((prev) => ({ ...prev, loading: false }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao resetar senha'
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }))
        throw error
      }
    },
    [supabase],
  )

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!state.user,
  }
}
