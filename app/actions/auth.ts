'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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
      .eq('auth_user_id', user.id)
      .single()

    revalidatePath('/', 'layout')

    // Redirect based on user role
    if (usuario?.perfil === 'master') {
      redirect('/dashboard/master')
    } else if (usuario?.perfil === 'admin_tenant') {
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

  // Get the plan
  const { data: plano } = await supabase
    .from('planos')
    .select('id')
    .eq('nome', planoId.charAt(0).toUpperCase() + planoId.slice(1))
    .single()

  if (!plano) {
    return { error: 'Plano nao encontrado.' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        nome,
        perfil: 'admin_tenant',
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Erro ao criar usuario.' }
  }

  // Create clinic
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinicas')
    .insert({
      nome: nomeClinica,
      cnpj,
      email,
      plano_id: plano.id,
      status_assinatura: 'trial',
      data_fim_trial: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (clinicaError) {
    return { error: 'Erro ao criar clinica: ' + clinicaError.message }
  }

  // Create user profile
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      auth_user_id: authData.user.id,
      clinica_id: clinica.id,
      nome,
      email,
      perfil: 'admin_tenant',
      ativo: true,
    })

  if (usuarioError) {
    return { error: 'Erro ao criar perfil: ' + usuarioError.message }
  }

  // Initialize resource usage
  await supabase
    .from('uso_recursos')
    .insert({
      clinica_id: clinica.id,
      mes_referencia: new Date().toISOString().slice(0, 7) + '-01',
      total_usuarios: 1,
      total_pacientes: 0,
      armazenamento_usado_mb: 0,
      total_atendimentos: 0,
    })

  redirect('/auth/cadastro-sucesso')
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
