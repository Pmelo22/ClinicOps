/**
 * Tipos para o fluxo de cadastro multi-etapas
 */

// Etapas do cadastro
export type SignupStep =
  | 'create-account'    // Criar conta (email/senha ou OAuth)
  | 'verify-email'      // Aguardar verificação de email
  | 'choose-type'       // Escolher: funcionário ou proprietário
  | 'employee-form'     // Formulário funcionário (código convite)
  | 'owner-form'        // Formulário proprietário (dados clínica)

// Estado do cadastro
export interface SignupState {
  step: SignupStep
  email: string | null
  userId: string | null
  isEmailVerified: boolean
  userType: 'employee' | 'owner' | null
  error: string | null
  isLoading: boolean
}

// Dados para criar conta
export interface CreateAccountData {
  email: string
  password: string
  nome: string
}

// Dados do funcionário (entrada via código)
export interface EmployeeFormData {
  codigoConvite: string
}

// Dados do proprietário (criar clínica)
export interface OwnerFormData {
  nomeClinica: string
  cnpj: string
  telefone?: string
  planoId: string
}

// Convite de clínica
export interface ClinicInvite {
  id: string
  clinica_id: string
  codigo: string
  email_convidado: string | null
  perfil: string
  usado_em: string | null
  usado_por: string | null
  expira_em: string
  criado_por: string
  created_at: string
  clinica?: {
    id: string
    nome: string
  }
}

// Resultado da validação do código
export interface InviteValidationResult {
  valid: boolean
  invite?: ClinicInvite
  error?: string
}

// Resposta do signup
export interface SignupResponse {
  success: boolean
  error?: string
  userId?: string
  needsEmailVerification?: boolean
  redirectTo?: string
}

// Perfis de usuário
export type UserProfile = 'master' | 'admin_tenant' | 'user'

// Configuração de OAuth providers
export type OAuthProvider = 'google' | 'github' | 'azure'
