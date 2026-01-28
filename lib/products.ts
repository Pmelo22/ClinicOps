export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  highlighted?: boolean
  limiteUsuarios: number
  limitePacientes: number
  limiteArmazenamentoMb: number
}

export const PLANS: Product[] = [
  {
    id: 'basico',
    name: 'Basico',
    description: 'Ideal para clinicas pequenas iniciando a digitalizacao',
    priceInCents: 9900, // R$ 99,00
    features: [
      'Ate 3 usuarios',
      'Ate 500 pacientes',
      '1GB de armazenamento',
      'Gestao de pacientes',
      'Agendamento basico',
      'Suporte por email',
    ],
    limiteUsuarios: 3,
    limitePacientes: 500,
    limiteArmazenamentoMb: 1024,
  },
  {
    id: 'profissional',
    name: 'Profissional',
    description: 'Para clinicas em crescimento que precisam de mais recursos',
    priceInCents: 24900, // R$ 249,00
    features: [
      'Ate 10 usuarios',
      'Ate 2.000 pacientes',
      '5GB de armazenamento',
      'Todos os recursos do Basico',
      'Relatorios avancados',
      'Integracao com calendario',
      'Suporte prioritario',
    ],
    highlighted: true,
    limiteUsuarios: 10,
    limitePacientes: 2000,
    limiteArmazenamentoMb: 5120,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solucao completa para redes de clinicas e hospitais',
    priceInCents: 49900, // R$ 499,00
    features: [
      'Usuarios ilimitados',
      'Pacientes ilimitados',
      '20GB de armazenamento',
      'Todos os recursos do Profissional',
      'API de integracao',
      'Multi-unidades',
      'Suporte 24/7 dedicado',
      'Treinamento personalizado',
    ],
    limiteUsuarios: 999,
    limitePacientes: 99999,
    limiteArmazenamentoMb: 20480,
  },
]

// Alias for backward compatibility
export const PRODUCTS = PLANS
