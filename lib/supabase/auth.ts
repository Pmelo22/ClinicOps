/**
 * Supabase Authentication Utilities
 * Centraliza todas as operações de autenticação
 * Suporta fluxo multi-etapas de cadastro
 */
import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'
import type { OAuthProvider } from '@/lib/types/signup'

export type AuthUser = {
  id: string
  email: string
  nome?: string
  perfil?: string
  clinica_id?: string
  ativo?: boolean
}

/**
 * ============================================
 * FLUXO MULTI-ETAPAS: Etapa 1 - Criar conta
 * Apenas cria o usuário no Supabase Auth
 * ============================================
 */
export async function createAccount(data: {
  email: string
  password: string
  nome: string
}) {
  const supabase = await createServerClient()

  // Validações
  if (!data.email || !data.password || !data.nome) {
    throw new Error('Email, senha e nome são obrigatórios')
  }

  if (data.password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres')
  }

  // Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
      data: {
        nome: data.nome,
        // Não definir perfil ainda - será definido após escolher tipo
      },
    },
  })

  if (authError) {
    // Traduzir erros comuns
    if (authError.message.includes('already registered')) {
      throw new Error('Este email já está cadastrado')
    }
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Erro ao criar usuário')
  }

  return {
    user: authData.user,
    needsEmailVerification: !authData.user.email_confirmed_at,
  }
}

/**
 * ============================================
 * FLUXO MULTI-ETAPAS: Etapa 2 - Login OAuth
 * Iniciar login com provedor OAuth (Google, etc)
 * ============================================
 */
export async function signInWithOAuth(provider: OAuthProvider) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthRedirectUrl('/auth/callback'),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * ============================================
 * FLUXO MULTI-ETAPAS: Etapa 3 - Criar clínica (Owner)
 * Cria clínica e vincula usuário como admin
 * ============================================
 */
export async function createClinicForOwner(data: {
  nomeClinica: string
  cnpj: string
  telefone?: string
  planoId: string
}) {
  const supabase = await createServerClient()

  // Verificar usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Verificar se já tem clínica
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id, clinica_id')
    .eq('id', user.id)
    .single()

  if (existingUser?.clinica_id) {
    throw new Error('Você já está vinculado a uma clínica')
  }

  // Validar CNPJ único
  const cnpjClean = data.cnpj.replace(/\D/g, '')
  const { data: existingClinic } = await supabase
    .from('clinicas')
    .select('id')
    .eq('cnpj', cnpjClean)
    .single()

  if (existingClinic) {
    throw new Error('Este CNPJ já está cadastrado')
  }

  // Buscar plano
  const planoNome = data.planoId.charAt(0).toUpperCase() + data.planoId.slice(1)
  const { data: plano } = await supabase
    .from('planos')
    .select('id')
    .eq('nome', planoNome)
    .single()

  // Calcular data fim trial (14 dias)
  const dataFimTrial = new Date()
  dataFimTrial.setDate(dataFimTrial.getDate() + 14)

  // Criar clínica
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinicas')
    .insert({
      nome: data.nomeClinica,
      cnpj: cnpjClean,
      email: user.email,
      telefone: data.telefone || null,
      plano_id: plano?.id || null,
      status: 'ativo',
      data_fim_trial: dataFimTrial.toISOString(),
    })
    .select()
    .single()

  if (clinicaError || !clinica) {
    console.error('Erro ao criar clínica:', clinicaError)
    throw new Error('Erro ao criar clínica')
  }

  // Criar ou atualizar perfil do usuário
  const userMetadata = user.user_metadata || {}
  const nome = userMetadata.nome || userMetadata.full_name || user.email?.split('@')[0] || 'Usuário'

  if (existingUser) {
    // Atualizar usuário existente
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        clinica_id: clinica.id,
        perfil: 'admin',
        ativo: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      // Rollback: deletar clínica
      await supabase.from('clinicas').delete().eq('id', clinica.id)
      throw new Error('Erro ao vincular usuário à clínica')
    }
  } else {
    // Criar novo usuário
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: user.id,
        clinica_id: clinica.id,
        nome,
        email: user.email!,
        perfil: 'admin',
        ativo: true,
      })

    if (insertError) {
      // Rollback: deletar clínica
      await supabase.from('clinicas').delete().eq('id', clinica.id)
      console.error('Erro ao criar usuário:', insertError)
      throw new Error('Erro ao criar perfil de usuário')
    }
  }

  // Inicializar uso de recursos
  const mesReferencia = new Date().toISOString().slice(0, 7) + '-01'
  try {
    await supabase
      .from('uso_recursos')
      .insert({
        clinica_id: clinica.id,
        mes_referencia: mesReferencia,
        total_usuarios: 1,
        total_pacientes: 0,
        armazenamento_usado_mb: 0,
        total_atendimentos: 0,
      })
  } catch (err) {
    console.warn('Erro ao inicializar recursos:', err)
  }

  return { clinica }
}

/**
 * ============================================
 * FLUXO MULTI-ETAPAS: Etapa 4b - Entrar como funcionário
 * Usar código de convite para entrar em clínica existente
 * ============================================
 */
export async function joinClinicAsEmployee(data: {
  codigoConvite: string
  telefone?: string
}) {
  const supabase = await createServerClient()

  // Verificar se usuário está autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Usuário não autenticado')
  }

  // Validar código de convite
  const { data: convite, error: conviteError } = await supabase
    .from('convites_clinica')
    .select('*, clinicas(nome)')
    .eq('codigo', data.codigoConvite.toUpperCase())
    .is('usado_em', null)
    .gte('expira_em', new Date().toISOString())
    .single()

  if (conviteError || !convite) {
    throw new Error('Código de convite inválido ou expirado')
  }

  // Verificar se usuário já existe
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', user.id)
    .single()

  const userMetadata = user.user_metadata || {}
  const nome = userMetadata.nome || userMetadata.full_name || user.email?.split('@')[0] || 'Usuário'

  if (existingUser) {
    // Atualizar usuário existente
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        clinica_id: convite.clinica_id,
        perfil: convite.perfil || 'user',
        telefone: data.telefone || null,
        ativo: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)

    if (updateError) {
      throw new Error('Erro ao vincular usuário à clínica')
    }
  } else {
    // Criar novo usuário
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: user.id,
        clinica_id: convite.clinica_id,
        nome,
        email: user.email!,
        telefone: data.telefone || null,
        perfil: convite.perfil || 'user',
        ativo: true,
      })

    if (insertError) {
      console.error('Erro ao criar usuário:', insertError)
      throw new Error('Erro ao criar perfil de usuário')
    }
  }

  // Marcar convite como usado
  await supabase
    .from('convites_clinica')
    .update({
      usado_em: new Date().toISOString(),
    })
    .eq('codigo', data.codigoConvite.toUpperCase())

  return { success: true }
}

/**
 * ============================================
 * LEGACY: Sign up com criação de perfil completo
 * Mantido para compatibilidade
 * ============================================
 */
export async function signUpWithProfile(userData: {
  email: string
  password: string
  nome: string
  nomeClinica: string
  cnpj: string
  planoId?: string
}) {
  const supabase = await createServerClient()

  // Validações
  if (!userData.email || !userData.password || !userData.nome) {
    throw new Error('Email, senha e nome são obrigatórios')
  }

  if (userData.password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres')
  }

  // Verificar email existente
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', userData.email)
    .limit(1)

  if (existingUser && existingUser.length > 0) {
    throw new Error('Este email já está cadastrado')
  }

  // Obter plano
  const planoNome = (userData.planoId || 'basico').charAt(0).toUpperCase() + 
                    (userData.planoId || 'basico').slice(1)
  
  const { data: plano, error: planoError } = await supabase
    .from('planos')
    .select('id')
    .eq('nome', planoNome)
    .single()

  if (planoError || !plano) {
    throw new Error('Plano não encontrado')
  }

  // Criar usuário Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
      data: {
        nome: userData.nome,
        perfil: 'admin_tenant',
      },
    },
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Erro ao criar usuário')
  }

  // Criar clínica
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinicas')
    .insert({
      nome: userData.nomeClinica,
      cnpj: userData.cnpj.replace(/\D/g, ''),
      email: userData.email,
      plano_id: plano.id,
    })
    .select()
    .single()

  if (clinicaError || !clinica) {
    // Limpar usuário auth se falhar na clínica
    await deleteAuthUser(supabase, authData.user.id)
    throw new Error('Erro ao criar clínica: ' + clinicaError?.message)
  }

  // Criar perfil do usuário
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      clinica_id: clinica.id,
      nome: userData.nome,
      email: userData.email,
      perfil: 'admin',
      ativo: true,
    })

  if (usuarioError) {
    // Limpar dados criados em caso de erro
    await supabase.from('clinicas').delete().eq('id', clinica.id)
    await deleteAuthUser(supabase, authData.user.id)
    throw new Error('Erro ao criar perfil: ' + usuarioError.message)
  }

  // Inicializar uso de recursos
  const mesReferencia = new Date().toISOString().slice(0, 7) + '-01'
  await supabase
    .from('uso_recursos')
    .insert({
      clinica_id: clinica.id,
      mes_referencia: mesReferencia,
      total_usuarios: 1,
      total_pacientes: 0,
      armazenamento_usado_mb: 0,
      total_atendimentos: 0,
    })
    .then(({ error }) => {
      if (error) console.warn('Erro ao inicializar recursos:', error)
    })

  return {
    user: authData.user,
    clinica,
  }
}

/**
 * Login com validação de perfil
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Erro ao fazer login')
  }

  // Buscar perfil do usuário
  const usuario = await getUserProfile(data.user.id)

  return {
    user: data.user,
    profile: usuario,
  }
}

/**
 * Logout
 */
export async function signOut() {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Obter usuário atual
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return getUserProfile(user.id)
}

/**
 * Obter perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<AuthUser | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      id,
      email,
      nome,
      perfil,
      clinica_id,
      ativo,
      clinica:clinicas(id, nome)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil:', error)
    return null
  }

  return data as AuthUser
}

/**
 * Reset password request
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl('/auth/reset-password'),
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Função auxiliar privada
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function deleteAuthUser(_supabase: unknown, _userId: string) {
  try {
    // Nota: Supabase não permite deletar usuários via client
    // Isso deveria ser feito via Admin API
    console.warn('Usuário auth não foi deletado. Requer Admin API')
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
  }
}

/**
 * Obter URL de redirecionamento de autenticação
 */
function getAuthRedirectUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
                  process.env.NEXT_PUBLIC_SITE_URL ||
                  'http://localhost:3000'
  return `${baseUrl}${path}`
}
