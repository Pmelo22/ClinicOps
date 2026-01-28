'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ==========================================
// ETAPA 1: Criar conta (apenas dados pessoais)
// ==========================================
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!nome || !email || !password) {
    return { error: 'Todos os campos sao obrigatorios' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/onboarding`,
      data: {
        nome,
        onboarding_status: 'pending_verification',
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ja esta cadastrado' }
    }
    return { error: error.message }
  }

  if (data.user) {
    redirect('/auth/verificar-email')
  }

  return { error: 'Erro ao criar conta. Tente novamente.' }
}

// ==========================================
// Login
// ==========================================
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email e senha sao obrigatorios' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou senha invalidos' }
    }
    if (error.message.includes('Email not confirmed')) {
      redirect('/auth/verificar-email')
    }
    return { error: error.message }
  }

  if (data.user) {
    const onboardingStatus = data.user.user_metadata?.onboarding_status

    // Se ainda nao verificou email
    if (onboardingStatus === 'pending_verification') {
      redirect('/auth/verificar-email')
    }
    
    // Se verificou mas nao configurou clinica
    if (onboardingStatus === 'pending_clinic') {
      redirect('/onboarding')
    }

    // Verificar se usuario tem perfil na tabela usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('perfil, clinica_id')
      .eq('id', data.user.id)
      .single()

    if (usuarioError || !usuario) {
      // Usuario verificou email mas nao completou onboarding
      await supabase.auth.updateUser({
        data: { onboarding_status: 'pending_clinic' }
      })
      redirect('/onboarding')
    }

    revalidatePath('/', 'layout')
    
    if (usuario.perfil === 'master') {
      redirect('/dashboard/master')
    } else if (usuario.perfil === 'admin') {
      redirect('/dashboard/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return { error: 'Erro ao fazer login' }
}

// ==========================================
// Reenviar email de verificacao
// ==========================================
export async function resendVerificationEmail(email: string) {
  const supabase = await createClient()
  
  if (!email) {
    return { error: 'Email e obrigatorio' }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/onboarding`,
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ==========================================
// ETAPA 2A: Entrar em clinica via codigo
// ==========================================
export async function joinClinicByCode(formData: FormData) {
  const supabase = await createClient()
  
  const codigo = (formData.get('codigo') as string)?.toUpperCase().trim()
  
  if (!codigo) {
    return { error: 'Codigo de convite e obrigatorio' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Usuario nao autenticado' }
  }

  // Buscar codigo de convite
  const { data: convite, error: conviteError } = await supabase
    .from('codigos_convite')
    .select('*, clinicas(nome)')
    .eq('codigo', codigo)
    .eq('ativo', true)
    .gt('expira_em', new Date().toISOString())
    .single()

  if (conviteError || !convite) {
    return { error: 'Codigo invalido ou expirado' }
  }

  if (convite.usos_atuais >= convite.usos_maximos) {
    return { error: 'Este codigo ja atingiu o limite de usos' }
  }

  // Verificar se usuario ja esta em uma clinica
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingUser) {
    return { error: 'Voce ja esta vinculado a uma clinica' }
  }

  // Criar registro do usuario
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      id: user.id,
      clinica_id: convite.clinica_id,
      nome: user.user_metadata?.nome || 'Usuario',
      email: user.email!,
      perfil: convite.perfil_atribuido,
      ativo: true,
    })

  if (usuarioError) {
    return { error: 'Erro ao vincular a clinica: ' + usuarioError.message }
  }

  // Incrementar uso do codigo
  await supabase
    .from('codigos_convite')
    .update({ usos_atuais: convite.usos_atuais + 1 })
    .eq('id', convite.id)

  // Atualizar metadata
  await supabase.auth.updateUser({
    data: { 
      onboarding_status: 'completed',
      clinica_id: convite.clinica_id,
    }
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ==========================================
// ETAPA 2B: Criar nova clinica
// ==========================================
export async function createClinic(formData: FormData) {
  const supabase = await createClient()
  
  const nome = formData.get('nome') as string
  const cnpj = formData.get('cnpj') as string
  const telefone = formData.get('telefone') as string
  const logradouro = formData.get('endereco') as string
  const cidade = formData.get('cidade') as string
  const estado = formData.get('estado') as string
  const cep = formData.get('cep') as string
  const planoNome = formData.get('plano') as string || 'Basico'

  if (!nome || !cnpj) {
    return { error: 'Nome e CNPJ sao obrigatorios' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Usuario nao autenticado' }
  }

  // Verificar se usuario ja esta em uma clinica
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingUser) {
    return { error: 'Voce ja esta vinculado a uma clinica' }
  }

  // Buscar plano
  const { data: plano } = await supabase
    .from('planos')
    .select('id')
    .eq('nome', planoNome)
    .single()

  // Montar endereco como JSONB
  const enderecoObj = {
    logradouro: logradouro || '',
    cidade: cidade || '',
    estado: estado || '',
    cep: cep?.replace(/\D/g, '') || '',
  }

  // Criar clinica
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinicas')
    .insert({
      nome,
      cnpj: cnpj.replace(/\D/g, ''),
      telefone,
      endereco: enderecoObj,
      email: user.email,
      plano_id: plano?.id,
      status: 'trial',
      data_fim_trial: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (clinicaError) {
    if (clinicaError.message.includes('duplicate') || clinicaError.message.includes('unique')) {
      return { error: 'Este CNPJ ja esta cadastrado' }
    }
    return { error: 'Erro ao criar clinica: ' + clinicaError.message }
  }

  // Criar usuario como admin
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      id: user.id,
      clinica_id: clinica.id,
      nome: user.user_metadata?.nome || 'Administrador',
      email: user.email!,
      perfil: 'admin',
      ativo: true,
    })

  if (usuarioError) {
    await supabase.from('clinicas').delete().eq('id', clinica.id)
    return { error: 'Erro ao configurar administrador: ' + usuarioError.message }
  }

  // Inicializar uso de recursos
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

  // Atualizar metadata
  await supabase.auth.updateUser({
    data: { 
      onboarding_status: 'completed',
      clinica_id: clinica.id,
      perfil: 'admin',
    }
  })

  revalidatePath('/dashboard')
  redirect('/dashboard/admin')
}

// ==========================================
// Gerar codigo de convite (para admins)
// ==========================================
export async function generateInviteCode(formData: FormData) {
  const supabase = await createClient()
  
  const perfilAtribuido = formData.get('perfil') as string || 'operador'
  const usosMaximos = parseInt(formData.get('usos_maximos') as string) || 10
  const diasValidade = parseInt(formData.get('dias_validade') as string) || 7

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Usuario nao autenticado' }
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('clinica_id, perfil')
    .eq('id', user.id)
    .single()

  if (!usuario || usuario.perfil !== 'admin') {
    return { error: 'Apenas administradores podem gerar codigos de convite' }
  }

  const codigo = generateUniqueCode()

  const { data: convite, error } = await supabase
    .from('codigos_convite')
    .insert({
      clinica_id: usuario.clinica_id,
      codigo,
      criado_por: user.id,
      perfil_atribuido: perfilAtribuido,
      usos_maximos: usosMaximos,
      expira_em: new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao gerar codigo de convite' }
  }

  return { success: true, codigo: convite.codigo }
}

function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ==========================================
// Outras funcoes
// ==========================================
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
    .eq('id', user.id)
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

// ==========================================
// OAuth - Google Sign In
// ==========================================
export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'Erro ao iniciar login com Google' }
}