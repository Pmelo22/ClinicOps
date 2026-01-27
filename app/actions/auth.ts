'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Rate limiting constants
const RATE_LIMIT_DELAY = 1000 // 1 segundo entre requisições
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 segundos entre tentativas

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isRateLimitError(error: any): boolean {
  if (!error) return false
  const message = error.message?.toLowerCase() || ''
  return message.includes('rate') || message.includes('too many') || error.status === 429
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user profile to determine redirect
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('id', user.id)
      .single()

    revalidatePath('/', 'layout')

    // Redirect based on user role
    if (usuario?.perfil === 'master') {
      redirect('/dashboard/master')
    } else if (usuario?.perfil === 'admin') {
      redirect('/dashboard/admin')
    } else {
      redirect('/dashboard')
    }
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const nomeClinica = formData.get('nomeClinica') as string
  const cnpj = formData.get('cnpj') as string
  const planoId = formData.get('planoId') as string || 'basico'

  // Check for existing user
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return { error: 'Este email ja esta cadastrado.' }
  }

  // Retry logic para signup
  let lastError: any = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[SignUp] Tentativa ${attempt}/${MAX_RETRIES} para ${email}`)

      // Get the plan
      const { data: plano, error: planoError } = await supabase
        .from('planos')
        .select('id')
        .eq('nome', planoId.charAt(0).toUpperCase() + planoId.slice(1))
        .single()

      if (planoError) {
        return { error: 'Plano nao encontrado.' }
      }

      if (!plano) {
        return { error: 'Plano nao encontrado.' }
      }

      await sleep(RATE_LIMIT_DELAY)

      // Create auth user with retry
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
          data: {
            nome,
            perfil: 'admin',
          },
        },
      })

      if (authError) {
        lastError = authError
        
        if (isRateLimitError(authError)) {
          console.warn(`[SignUp] Rate limited no auth. Aguardando ${RETRY_DELAY}ms...`)
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY)
            continue
          }
        }
        
        return { error: authError.message }
      }

      if (!authData.user) {
        return { error: 'Erro ao criar usuario.' }
      }

      await sleep(RATE_LIMIT_DELAY)

      // Create clinic
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas')
        .insert({
          nome: nomeClinica,
          cnpj,
          email,
          plano_id: plano.id,
          status: 'trial',
          data_inicio_assinatura: new Date().toISOString(),
          data_fim_trial: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (clinicaError) {
        lastError = clinicaError
        
        if (isRateLimitError(clinicaError)) {
          console.warn(`[SignUp] Rate limited ao criar clínica. Aguardando ${RETRY_DELAY}ms...`)
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY)
            continue
          }
        }
        
        return { error: 'Erro ao criar clinica: ' + clinicaError.message }
      }

      await sleep(RATE_LIMIT_DELAY)

      // Create user profile
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          clinica_id: clinica.id,
          nome,
          email,
          perfil: 'admin',
          ativo: true,
        })

      if (usuarioError) {
        lastError = usuarioError
        
        if (isRateLimitError(usuarioError)) {
          console.warn(`[SignUp] Rate limited ao criar usuário. Aguardando ${RETRY_DELAY}ms...`)
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY)
            continue
          }
        }
        
        return { error: 'Erro ao criar perfil: ' + usuarioError.message }
      }

      await sleep(RATE_LIMIT_DELAY)

      // Initialize resource usage
      const { error: recursoError } = await supabase
        .from('uso_recursos')
        .insert({
          clinica_id: clinica.id,
          mes_referencia: new Date().toISOString().slice(0, 7) + '-01',
          total_usuarios: 1,
          total_pacientes: 0,
          armazenamento_usado_mb: 0,
          total_atendimentos: 0,
        })

      if (recursoError) {
        console.warn('[SignUp] Erro ao inicializar recursos (não crítico):', recursoError)
      }

      console.log('[SignUp] Cadastro concluído com sucesso!')
      revalidatePath('/', 'layout')
      redirect('/auth/cadastro-sucesso')

    } catch (error: any) {
      lastError = error
      console.error(`[SignUp] Erro na tentativa ${attempt}:`, error)
      
      if (!isRateLimitError(error) && attempt === 1) {
        return { error: error.message || 'Erro ao criar conta.' }
      }
      
      if (attempt < MAX_RETRIES && isRateLimitError(error)) {
        console.log(`[SignUp] Tentando novamente após rate limit...`)
        await sleep(RETRY_DELAY)
        continue
      }
    }
  }

  return { error: 'Falha ao criar conta. Por favor, aguarde alguns minutos e tente novamente.' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*, clinica:clinicas(*)')
    .eq('auth_user_id', user.id)
    .single()

  return usuario
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/login')
}
