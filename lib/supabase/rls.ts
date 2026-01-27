/**
 * Row Level Security (RLS) Utilities
 * Funcionalidades para trabalhar com políticas de segurança em nível de linha
 */
import { createClient } from './server'

/**
 * Verificar se o usuário tem acesso a uma clínica
 */
export async function canAccessClinica(clinicaId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('usuarios')
    .select('clinica_id')
    .eq('id', user.id)
    .single()

  if (error) return false
  return data?.clinica_id === clinicaId
}

/**
 * Verificar se o usuário é master
 */
export async function isMasterUser(): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('usuarios')
    .select('perfil')
    .eq('id', user.id)
    .single()

  return data?.perfil === 'master'
}

/**
 * Verificar se o usuário é admin da clínica
 */
export async function isClinicAdmin(clinicaId?: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('usuarios')
    .select('perfil, clinica_id')
    .eq('id', user.id)
    .single()

  if (!data) return false

  const isAdmin = data.perfil === 'admin_tenant' || data.perfil === 'admin'
  const hasAccess = !clinicaId || data.clinica_id === clinicaId

  return isAdmin && hasAccess
}

/**
 * Obter ID da clínica do usuário atual
 */
export async function getUserClinicaId(): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('clinica_id')
    .eq('id', user.id)
    .single()

  return data?.clinica_id || null
}

/**
 * Obter permissões do usuário
 */
export async function getUserPermissions() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios')
    .select('perfil, permissoes')
    .eq('id', user.id)
    .single()

  return {
    role: data?.perfil,
    permissions: data?.permissoes,
  }
}

/**
 * Verificar acesso a recurso
 */
export async function hasAccessToResource(
  table: string,
  resourceId: string,
): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // A verificação real será feita pela RLS do banco
  // Aqui apenas tentamos fazer uma query que respeitará as políticas
  const { data, error } = await supabase
    .from(table as any)
    .select('id')
    .eq('id', resourceId)
    .limit(1)

  return !error && data && data.length > 0
}

