// Database types for ClinicOps

export type UserRole = 'master' | 'admin' | 'operador'
export type SubscriptionStatus = 'ativo' | 'inativo' | 'trial' | 'cancelado'
export type DocumentType = 'prontuario' | 'exame' | 'receita' | 'atestado' | 'outros'
export type TipoAcaoAuditoria = 'criar' | 'atualizar' | 'excluir' | 'login' | 'logout' | 'visualizar'

export interface Plan {
  id: string
  nome: string
  descricao: string | null
  preco_mensal: number
  limite_usuarios: number
  limite_pacientes: number
  limite_armazenamento_mb: number
  recursos: Record<string, boolean>
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string | null
  endereco: Record<string, string> | null
  plano_id: string
  status: SubscriptionStatus
  data_inicio_assinatura: string | null
  data_fim_trial: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  clinica_id: string | null
  nome: string
  email: string
  perfil: UserRole
  ativo: boolean
  ultimo_acesso: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  clinica_id: string
  nome: string
  cpf: string
  data_nascimento: string
  email: string | null
  telefone: string | null
  endereco: string | null
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinica_id: string
  paciente_id: string
  usuario_id: string
  data_atendimento: string
  tipo: string
  descricao: string | null
  valor: number | null
  status: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  clinica_id: string
  paciente_id: string
  usuario_id: string
  tipo: DocumentType
  nome_arquivo: string
  url_arquivo: string
  tamanho_bytes: number
  created_at: string
}

export interface ResourceUsage {
  id: string
  clinica_id: string
  mes_referencia: string
  total_usuarios: number
  total_pacientes: number
  armazenamento_usado_mb: number
  total_atendimentos: number
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  clinica_id: string | null
  usuario_id: string | null
  acao: string
  tabela_afetada: string | null
  registro_id: string | null
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Extended types with relations
export interface UserWithClinic extends User {
  clinica?: Clinic
}

export interface PatientWithAppointments extends Patient {
  atendimentos?: Appointment[]
}

export interface AppointmentWithDetails extends Appointment {
  paciente?: Patient
  usuario?: User
}

export interface ClinicWithPlan extends Clinic {
  plano?: Plan
}

export interface ClinicStats {
  totalPacientes: number
  totalAtendimentos: number
  totalUsuarios: number
  armazenamentoUsado: number
}
