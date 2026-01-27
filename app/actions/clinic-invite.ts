'use server'

import { createClient } from '@/lib/supabase/server'
import { createClinicForOwner, joinClinicAsEmployee } from '@/lib/supabase/auth'
import type { InviteValidationResult, ClinicInvite } from '@/lib/types/signup'

/**
 * Gera um código de convite único de 8 caracteres
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Criar um novo convite para a clínica
 */
export async function createClinicInvite(data: {
  clinicaId: string
  emailConvidado?: string
  perfil?: string
  diasValidade?: number
}): Promise<{ success: boolean; invite?: ClinicInvite; error?: string }> {
  try {
    const supabase = await createClient()

    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Verificar se usuário tem permissão na clínica
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('perfil, clinica_id')
      .eq('id', user.id)
      .single()

    if (!usuario || usuario.clinica_id !== data.clinicaId) {
      return { success: false, error: 'Sem permissão para esta clínica' }
    }

    if (!['admin_tenant', 'master'].includes(usuario.perfil)) {
      return { success: false, error: 'Apenas administradores podem criar convites' }
    }

    // Gerar código único
    let codigo: string
    let tentativas = 0
    const maxTentativas = 10

    do {
      codigo = generateInviteCode()
      const { data: existing } = await supabase
        .from('convites_clinica')
        .select('id')
        .eq('codigo', codigo)
        .single()

      if (!existing) break
      tentativas++
    } while (tentativas < maxTentativas)

    if (tentativas >= maxTentativas) {
      return { success: false, error: 'Erro ao gerar código. Tente novamente.' }
    }

    // Calcular expiração (default: 7 dias)
    const diasValidade = data.diasValidade || 7
    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + diasValidade)

    // Criar convite
    const { data: invite, error: insertError } = await supabase
      .from('convites_clinica')
      .insert({
        clinica_id: data.clinicaId,
        codigo,
        email_convidado: data.emailConvidado || null,
        perfil: data.perfil || 'user',
        expira_em: expiraEm.toISOString(),
        criado_por: user.id,
      })
      .select('*, clinica:clinicas(id, nome)')
      .single()

    if (insertError) {
      console.error('Erro ao criar convite:', insertError)
      return { success: false, error: 'Erro ao criar convite' }
    }

    return { success: true, invite }
  } catch (error) {
    console.error('Erro em createClinicInvite:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Validar um código de convite
 */
export async function validateInviteCode(codigo: string): Promise<InviteValidationResult> {
  try {
    const supabase = await createClient()

    // Buscar convite
    const { data: invite, error: fetchError } = await supabase
      .from('convites_clinica')
      .select('*, clinica:clinicas(id, nome)')
      .eq('codigo', codigo.toUpperCase())
      .single()

    if (fetchError || !invite) {
      return { valid: false, error: 'Código não encontrado' }
    }

    // Verificar se já foi usado
    if (invite.usado_em) {
      return { valid: false, error: 'Este código já foi utilizado' }
    }

    // Verificar expiração
    if (new Date(invite.expira_em) < new Date()) {
      return { valid: false, error: 'Este código expirou' }
    }

    return { valid: true, invite }
  } catch (error) {
    console.error('Erro em validateInviteCode:', error)
    return { valid: false, error: 'Erro ao validar código' }
  }
}

/**
 * Usar um código de convite para entrar na clínica
 */
export async function useInviteCode(codigo: string): Promise<{
  success: boolean
  clinicaId?: string
  perfil?: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Verificar usuário autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Não autorizado' }
    }

    // Validar código
    const validation = await validateInviteCode(codigo)
    if (!validation.valid || !validation.invite) {
      return { success: false, error: validation.error }
    }

    const invite = validation.invite

    // Verificar se email bate (se especificado)
    if (invite.email_convidado && invite.email_convidado !== user.email) {
      return { success: false, error: 'Este convite foi enviado para outro email' }
    }

    // Verificar se usuário já está em uma clínica
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id, clinica_id')
      .eq('id', user.id)
      .single()

    if (existingUser?.clinica_id) {
      return { success: false, error: 'Você já está vinculado a uma clínica' }
    }

    // Atualizar/criar perfil do usuário
    const userMetadata = user.user_metadata || {}

    if (existingUser) {
      // Atualizar usuário existente
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          clinica_id: invite.clinica_id,
          perfil: invite.perfil,
          ativo: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError)
        return { success: false, error: 'Erro ao vincular à clínica' }
      }
    } else {
      // Criar novo perfil
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: user.id,
          clinica_id: invite.clinica_id,
          nome: userMetadata.nome || userMetadata.full_name || user.email?.split('@')[0] || 'Usuário',
          email: user.email!,
          perfil: invite.perfil,
          ativo: true,
        })

      if (insertError) {
        console.error('Erro ao criar usuário:', insertError)
        return { success: false, error: 'Erro ao criar perfil' }
      }
    }

    // Marcar convite como usado
    const { error: useError } = await supabase
      .from('convites_clinica')
      .update({
        usado_em: new Date().toISOString(),
        usado_por: user.id,
      })
      .eq('id', invite.id)

    if (useError) {
      console.error('Erro ao marcar convite como usado:', useError)
      // Não é crítico, continuar
    }

    return {
      success: true,
      clinicaId: invite.clinica_id,
      perfil: invite.perfil,
    }
  } catch (error) {
    console.error('Erro em useInviteCode:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Listar convites da clínica
 */
export async function listClinicInvites(clinicaId: string): Promise<{
  success: boolean
  invites?: ClinicInvite[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: invites, error: fetchError } = await supabase
      .from('convites_clinica')
      .select('*, clinica:clinicas(id, nome)')
      .eq('clinica_id', clinicaId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      return { success: false, error: 'Erro ao buscar convites' }
    }

    return { success: true, invites }
  } catch (error) {
    console.error('Erro em listClinicInvites:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Revogar um convite
 */
export async function revokeClinicInvite(inviteId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { error: deleteError } = await supabase
      .from('convites_clinica')
      .delete()
      .eq('id', inviteId)

    if (deleteError) {
      return { success: false, error: 'Erro ao revogar convite' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro em revokeClinicInvite:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Verificar se CNPJ já está cadastrado
 */
export async function validateCNPJ(cnpj: string): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Remover formatação
    const cnpjClean = cnpj.replace(/\D/g, '')

    if (cnpjClean.length !== 14) {
      return { valid: false, error: 'CNPJ inválido' }
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('clinicas')
      .select('id')
      .eq('cnpj', cnpjClean)
      .single()

    if (existing) {
      return { valid: false, error: 'Este CNPJ já está cadastrado' }
    }

    return { valid: true }
  } catch (error) {
    console.error('Erro em validateCNPJ:', error)
    return { valid: false, error: 'Erro ao validar CNPJ' }
  }
}

/**
 * Criar clínica com proprietário (Server Action)
 */
export async function createClinicAction(data: {
  nomeClinica: string
  cnpj: string
  telefone?: string
  planoId: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await createClinicForOwner(data)
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar clínica:', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar clínica'
    return { success: false, error: message }
  }
}

/**
 * Entrar em clínica como funcionário (Server Action)
 */
export async function joinClinicAction(data: {
  codigoConvite: string
  telefone?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await joinClinicAsEmployee(data)
    return { success: true }
  } catch (error) {
    console.error('Erro ao entrar na clínica:', error)
    const message = error instanceof Error ? error.message : 'Erro ao entrar na clínica'
    return { success: false, error: message }
  }
}
