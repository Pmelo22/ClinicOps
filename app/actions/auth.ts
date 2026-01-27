'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  signInWithEmail,
  signUpWithProfile,
  getCurrentUser,
  signOut as signOutAuth,
  resetPasswordForEmail,
  updatePassword,
} from '@/lib/supabase/auth'
import { isMasterUser, isClinicAdmin } from '@/lib/supabase/rls'

/**
 * Server Action: Login
 * Autentica usuário e redireciona baseado em perfil
 */
export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email e senha são obrigatórios' }
    }

    const { profile } = await signInWithEmail(email, password)

    revalidatePath('/', 'layout')

    // Redirecionar baseado no perfil
    if (profile?.perfil === 'master') {
      redirect('/dashboard/master')
    } else if (profile?.perfil === 'admin') {
      redirect('/dashboard/admin')
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer login'
    return { error: message }
  }
}

/**
 * Server Action: Signup
 * Registra novo usuário com clínica
 */
export async function signup(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nome = formData.get('nome') as string
    const nomeClinica = formData.get('nomeClinica') as string
    const cnpj = formData.get('cnpj') as string
    const planoId = (formData.get('planoId') as string) || 'basico'

    if (!email || !password || !nome || !nomeClinica || !cnpj) {
      return { error: 'Todos os campos são obrigatórios' }
    }

    if (password.length < 6) {
      return { error: 'Senha deve ter pelo menos 6 caracteres' }
    }

    await signUpWithProfile({
      email,
      password,
      nome,
      nomeClinica,
      cnpj,
      planoId,
    })

    revalidatePath('/', 'layout')
    redirect('/auth/cadastro-sucesso')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar'
    return { error: message }
  }
}

/**
 * Server Action: Sign Out
 */
export async function signOut() {
  try {
    await signOutAuth()
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao sair'
    return { error: message }
  }
}

/**
 * Server Action: Get Current User
 */
export async function getSession() {
  try {
    return await getCurrentUser()
  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return null
  }
}

/**
 * Alias para getSession (mantém compatibilidade)
 */
export async function getCurrentUserProfile() {
  return getSession()
}

/**
 * Server Action: Forgot Password
 */
export async function forgotPassword(formData: FormData) {
  try {
    const email = formData.get('email') as string

    if (!email) {
      return { error: 'Email é obrigatório' }
    }

    await resetPasswordForEmail(email)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao solicitar reset'
    return { error: message }
  }
}

/**
 * Server Action: Reset Password
 */
export async function resetPassword(formData: FormData) {
  try {
    const password = formData.get('password') as string

    if (!password || password.length < 6) {
      return { error: 'Senha deve ter pelo menos 6 caracteres' }
    }

    await updatePassword(password)
    revalidatePath('/', 'layout')
    redirect('/auth/login')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao resetar senha'
    return { error: message }
  }
}

/**
 * Server Action: Check if user is master
 */
export async function checkIfMaster(): Promise<boolean> {
  try {
    return await isMasterUser()
  } catch (error) {
    return false
  }
}

/**
 * Server Action: Check if user is clinic admin
 */
export async function checkIfClinicAdmin(clinicaId?: string): Promise<boolean> {
  try {
    return await isClinicAdmin(clinicaId)
  } catch (error) {
    return false
  }
}
